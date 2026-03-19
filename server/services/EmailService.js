module.exports = {
    sendEmail: async (to, subject, html) => {
      console.log(`[Mock Email to ${to}]: Subject=${subject}\n${html}`);
      return Promise.resolve();
    }
  };
  