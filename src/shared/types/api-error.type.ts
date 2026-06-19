export interface ApiErrorDetail {
  code: string;
  description: string;
}

/** Matches ASP.NET Core ProblemDetails (RFC 7807) returned by GlobalExceptionHandler / ProblemExtensions */
export interface ApiError {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  /** Present only on 400 ValidationProblemDetails responses: { [fieldOrCode]: string[] } */
  errors?: Record<string, string[]>;
  traceId?: string;
}