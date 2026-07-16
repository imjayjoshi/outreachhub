import { Response } from "express";

export class ApiResponse {
  /**
   * Success response helper.
   */
  public static success(
    res: Response,
    message: string,
    data?: any,
    statusCode = 200,
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data !== undefined ? data : null,
    });
  }

  /**
   * Failure response helper.
   */
  public static failure(
    res: Response,
    message: string,
    error?: any,
    statusCode = 500,
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error !== undefined ? error : null,
    });
  }
}
