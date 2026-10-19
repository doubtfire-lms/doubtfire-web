/**
 * Readable message for an error from the API, which may arrive as a string, an Error, or an
 * HttpErrorResponse whose body is either `{error: 'message'}` or `{error: {error: 'message'}}`.
 */
export function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error) {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object') {
    const response = error as {error?: unknown; message?: unknown};
    if (typeof response.error === 'string' && response.error) {
      return response.error;
    }
    if (response.error && typeof response.error === 'object') {
      const body = response.error as {error?: unknown};
      if (typeof body.error === 'string' && body.error) {
        return body.error;
      }
    }
    if (typeof response.message === 'string' && response.message) {
      return response.message;
    }
  }
  return fallback;
}
