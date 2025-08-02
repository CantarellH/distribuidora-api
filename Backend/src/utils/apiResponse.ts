import { Response } from "express";

export class ApiResponse {
  static success(res: Response, status: number, message: string, data?: any) {
    res.status(status).json({
      success: true,
      message,
      data
    });
  }

  static error(res: Response, error: any) {
    const status = error.statusCode || 500;
    const message = error.message || "Internal server error";
    
    res.status(status).json({
      success: false,
      message,
      errors: error.errors || undefined
    });
  }
}

export const handleValidationErrors = (errors: any[]) => {
  const formattedErrors = errors.map(err => ({
    field: err.property,
    errors: Object.values(err.constraints)
  }));
  
  return {
    statusCode: 400,
    message: "Validation error",
    errors: formattedErrors
  };
};