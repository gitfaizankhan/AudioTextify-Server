class ApiError extends Error {
  /**
   * @param {Object} options
   * @param {number} options.statusCode - HTTP status code (e.g. 400, 404, 500)
   * @param {string} options.message - Human-readable error message
   * @param {string[]} [options.errors] - Array of detailed error messages
   * @param {string} [options.errorCode] - Optional custom app-specific error code
   * @param {boolean} [options.isOperational] - Whether it's an expected operational error
   * @param {string} [options.stack] - Optional custom stack trace
   */
  constructor({
    statusCode,
    message = "Something went wrong",
    errors = [],
    errorCode = "INTERNAL_ERROR",
    isOperational = true,
    stack,
  } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    this.errorCode = errorCode;
    this.success = false;
    this.data = null;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
