const logger = (req, res, next) => {
  console.log(
    `[current time: ${new Date().toLocaleString()}] ${req.method} ${req.originalUrl} - hello world from middleware`
  );

  next();
};

module.exports = logger;