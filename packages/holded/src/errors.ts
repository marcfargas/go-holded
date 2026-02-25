/**
 * Base error for all Holded API errors.
 */
export class HoldedError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown,
  ) {
    super(message);
    this.name = 'HoldedError';
  }
}

/**
 * Authentication error — invalid or missing API key.
 */
export class HoldedAuthError extends HoldedError {
  constructor(message: string, response?: unknown) {
    super(message, 401, response);
    this.name = 'HoldedAuthError';
  }
}

/**
 * Rate limit exceeded.
 */
export class HoldedRateLimitError extends HoldedError {
  constructor(
    message: string,
    public readonly retryAfterMs?: number,
    response?: unknown,
  ) {
    super(message, 429, response);
    this.name = 'HoldedRateLimitError';
  }
}

/**
 * Resource not found.
 */
export class HoldedNotFoundError extends HoldedError {
  constructor(message: string, response?: unknown) {
    super(message, 404, response);
    this.name = 'HoldedNotFoundError';
  }
}

/**
 * Configuration error — missing API key, invalid profile, etc.
 */
export class HoldedConfigError extends HoldedError {
  constructor(message: string) {
    super(message);
    this.name = 'HoldedConfigError';
  }
}
