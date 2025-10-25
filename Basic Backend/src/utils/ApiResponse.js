class ApiResponse {
  constructor(statusCode = 200,data, message="Success") {
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.success = statusCode <400;
  }

  send(res) {
    res.status(this.statusCode).json(this.data);
  }
}
export {ApiResponse};