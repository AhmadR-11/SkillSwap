// just log to console instead of real SMS
module.exports = {
    sendSms: async (to, body) => {
      console.log(`[Mock SMS to ${to}]: ${body}`);
      return Promise.resolve();
    }
  };
  