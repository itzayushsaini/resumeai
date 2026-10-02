export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
  status;
}

export const notFound = (what = "Not found") => new HttpError(404, what);
