const errorHandler = (error, req, res, next) => {
  const message = error.message || "server error";
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({ message: message });
};

module.exports = errorHandler;
