class ApiResponse {
  /**
   * Create a standard API response
   * @param {number} statusCode - HTTP status code
   * @param {any} data - Response data
   * @param {string} message - Optional message
   * @param {boolean} success - Optional override success
   */
  constructor(statusCode, data = null, message = "Success", success = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success !== null ? success : statusCode < 400;
    this.timestamp = new Date().toISOString(); // ✅ helpful in logs
  }

  toJSON() {
    return {
      statusCode: this.statusCode,
      success: this.success,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
    };
  }
}

export { ApiResponse };
