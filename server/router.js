const url = require("url");

module.exports = class Router {
  constructor() {
    this.routes = [];
  }

  add(method, url, handler) {
    this.routes.push({ method, url, handler });
  }

  resolve(context, request) {
    let path = request.url;
    for (const { method, url, handler } of this.routes) {
      let match = url.exec(path);
      if (!match || request.method != method) continue;
      let urlParts = match.slice(1).map(decodeURIComponent);
      return handler(context, ...urlParts, request);
    }
    return null;
  }
};
