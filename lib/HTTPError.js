class HTTPError extends Error {
  constructor(response, method = 'UNKNOWN-METHOD', text) {
    const maybeAndText = text ? ` and text: ${text}` : '';
    super(`HTTP ${method} ${response.url} failed with status ${response.status} (${response.statusText})${maybeAndText}`);
    this.name = 'HTTPError';
    this.status = response.status;
    this.text = text;
    this.response = response;
  }
}

export default HTTPError;
