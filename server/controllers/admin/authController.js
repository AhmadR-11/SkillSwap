// server/controllers/authController.js
const Admin       = require('../../models/Admin');
const Freelancer  = require('../../models/Freelancer');
const Client      = require('../../models/Client');
const { hashPassword, comparePassword } = require('../../utils/hash');
const { signToken } = require('../../utils/jwt');
const passport = require('../../utils/passport')

exports.signupAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await Admin.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await hashPassword(password);
    const admin = await Admin.create({ name, email, password: hashed });
    const token = signToken({ id: admin._id, role: 'admin' }, '8h');
    res.status(201).json({ token, name: admin.name, email: admin.email });
  } catch (err) {
    next(err);
  }
};

exports.loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await comparePassword(password, admin.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: admin._id, role: 'admin' }, '8h');
    res.json({ token, name: admin.name, email: admin.email });
  } catch (err) {
    next(err);
  }
};

exports.signupFreelancer = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (await Freelancer.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await hashPassword(password);
    const freelancer = await Freelancer.create({ name, email, password: hashed });
    const token = signToken({ id: freelancer._id, role: 'freelancer' }, '8h');
    res.status(201).json({ token, name: freelancer.name, email: freelancer.email });
  } catch (err) {
    next(err);
  }
};

exports.loginFreelancer = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const freelancer = await Freelancer.findOne({ email });
    if (!freelancer) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await comparePassword(password, freelancer.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: freelancer._id, role: 'freelancer' }, '8h');
    res.json({ token, name: freelancer.name, email: freelancer.email });
  } catch (err) {
    next(err);
  }
};

exports.signupClient = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (await Client.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await hashPassword(password);

    // generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 60*60*1000; // 1hr

    const client = await Client.create({
      name, email, phone,
      password: hashed,
      verificationCode: code,
      verificationExpires: new Date(expires)
    });

    // In a real app you’d email/SMS this; here we return it
    res.status(201).json({
      message: 'Signup successful—please verify your account',
      clientId: client._id,
      verificationCode: code
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyClient = async (req, res, next) => {
  try {
    const { clientId, code } = req.body;
    const client = await Client.findById(clientId);
    if (!client) return res.status(400).json({ message: 'Invalid client' });
    if (client.verified) 
      return res.status(400).json({ message: 'Already verified' });
    if (client.verificationCode !== code) 
      return res.status(400).json({ message: 'Invalid code' });
    if (client.verificationExpires < Date.now())
      return res.status(400).json({ message: 'Code expired' });

    client.verified = true;
    client.verificationCode = undefined;
    client.verificationExpires = undefined;
    await client.save();

    res.json({ message: 'Verification successful—please log in' });
  } catch (err) {
    next(err);
  }
};

exports.loginClient = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const client = await Client.findOne({ email });
    if (!client) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await comparePassword(password, client.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    if (!client.verified) 
      return res.status(401).json({ message: 'Please verify your account first' });

    const token = signToken({ id: client._id, role: 'client' }, '8h');
    res.json({ token, name: client.name, email: client.email });
  } catch (err) {
    next(err);
  }
};

exports.googleAuthCallback = async(req, res) => {
  try {
    const {id, role} = req.user;
    let user;


    if(role === 'admin'){
      user = await Admin.findById(id);
    }
    else if(role === 'freelancer'){
      user = await Freelancer.findById(id);
    }
    else{
      user = await client.findById(id);
    }


    if(!user){
      return res.redirect(`${process.env.CLIENT_URL}/login?error=User not Found`);
    }

    const token = signToken({id: user._id, role}, '8h');
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}&name=${encodeURIComponent(user.name)}
    &email=${encodeURIComponent(user.email)}&role=${role}`);
  }
  catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=Authentication Failed`);
  }
};