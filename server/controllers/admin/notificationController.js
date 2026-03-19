const Notification        = require('../../models/Notification');
const Template            = require('../../models/NotificationTemplate');
const Preference          = require('../../models/UserPreference');
const User                = require('../../models/Client');       // for email/SMS fields
const Freelancer          = require('../../models/Freelancer');
const Admin               = require('../../models/Admin');        // if exists
const EmailService        = require('../../services/EmailService');
const TwilioService       = require('../../services/TwilioService');
const cron                = require('node-cron');

// CRUD Templates
exports.createTemplate = async (req, res, next) => {
  try {
    const tpl = await Template.create(req.body);
    res.status(201).json(tpl);
  } catch (err) { next(err); }
};
exports.listTemplates = async (_, res, next) => {
  try { res.json(await Template.find()); }
  catch (err) { next(err); }
};
exports.updateTemplate = async (req, res, next) => {
  try {
    const tpl = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(tpl);
  } catch (err) { next(err); }
};
exports.deleteTemplate = async (req, res, next) => {
  try {
    await Template.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
};

// Preferences
exports.getPreferences = async (req, res, next) => {
  try {
    const pref = await Preference.findOne({
      userId: req.user.id,
      role: req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1)
    });
    res.json(pref || {});
  } catch (err) { next(err); }
};
exports.updatePreferences = async (req, res, next) => {
  try {
    const role = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
    let pref = await Preference.findOne({ userId: req.user.id, role });
    if (!pref) pref = new Preference({ userId: req.user.id, role });
    pref.email = !!req.body.email;
    pref.sms   = !!req.body.sms;
    pref.updatedAt = Date.now();
    await pref.save();
    res.json(pref);
  } catch (err) { next(err); }
};

// Send a notification immediately or schedule
exports.scheduleNotification = async (req, res, next) => {
  try {
    const { toUserId, role, templateId, channel, data, sendAt } = req.body;
    const n = await Notification.create({
      toUserId, role, template: templateId, channel, data,
      scheduledFor: new Date(sendAt)
    });
    // schedule via cron if future
    const delay = new Date(sendAt).getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => processNotification(n._id), delay);
    } else {
      processNotification(n._id);
    }
    res.status(202).json(n);
  } catch (err) { next(err); }
};

// internal: processes one notification
async function processNotification(notificationId) {
  const n = await Notification.findById(notificationId).populate('template');
  if (!n) return;
  try {
    // load user contact
    let user = null;
    if (n.role === 'Client') user = await User.findById(n.toUserId);
    if (n.role === 'Freelancer') user = await Freelancer.findById(n.toUserId);
    if (n.role === 'Admin') user = await Admin.findById(n.toUserId);

    // render body with data (simple replace {{key}})
    let body = n.template.body;
    for (const k of Object.keys(n.data || {})) {
      body = body.replaceAll(`{{${k}}}`, n.data[k]);
    }

    if (n.channel === 'email') {
      await EmailService.sendEmail(user.email, n.template.subject, body);
    } else {
      await TwilioService.sendSms(user.phone, body);
    }

    n.status = 'sent';
    n.sentAt = new Date();
  } catch (err) {
    n.status = 'failed';
    n.error  = err.message;
  }
  await n.save();
}

// Scheduled daily job: send all pending for today
cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  const list = await Notification.find({
    status: 'pending',
    scheduledFor: { $lte: today }
  });
  list.forEach(n => processNotification(n._id));
});
