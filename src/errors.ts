export type ApiErrorCode =
  | "ValidationError"
  | "NotFound"
  | "Conflict"
  | "BadRequest"
  | "InternalServerError";


  /*
    This displays different error messages based on the HTTP status code returned by the GitHub API. 
    It uses a custom ApiError class to encapsulate error details and provides a consistent way to handle and display errors in the CLI.
  */

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const Errors = {
  validation: (message: string, details?: unknown) =>
    new ApiError("ValidationError", message, 400, details),
  notFound: (message = "Resource not found") =>
    new ApiError("NotFound", message, 404),
  conflict: (message: string, details?: unknown) =>
    new ApiError("Conflict", message, 409, details),
  badRequest: (message: string, details?: unknown) =>
    new ApiError("BadRequest", message, 400, details),
  internal: (message = "Unexpected server error") =>
    new ApiError("InternalServerError", message, 500),
};
