export interface ApiError {
  message: string;
  code?: string;
  details?: string;
  source?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success?: boolean;
}

export class CustomError extends Error {
  code?: string;
  details?: string;
  source?: string;

  constructor(message: string, options?: Partial<ApiError>) {
    super(message);
    this.name = 'CustomError';
    this.code = options?.code;
    this.details = options?.details;
    this.source = options?.source;
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof CustomError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
      source: error.source
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack
    };
  }

  return {
    message: 'An unexpected error occurred',
    details: String(error)
  };
}

export function isApiError(response: ApiResponse): response is ApiResponse & { error: ApiError } {
  return response.success === false && !!response.error;
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.success === true && !!response.data;
} 