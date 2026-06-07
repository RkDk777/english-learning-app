// Simple Hash-based SPA Router
class Router {
  constructor() {
    this._routes = [];
    this._defaultHandler = null;
  }

  // Called by app init AFTER all routes are registered
  start() {
    // Listen for future hash changes
    window.addEventListener('hashchange', () => this._handle());
    // Handle the current URL immediately
    this._handle();
  }

  on(pattern, handler) {
    if (pattern === '/') {
      this._defaultHandler = handler;
    } else {
      const { regex, keys } = this._parse(pattern);
      this._routes.push({ regex, keys, handler });
    }
    return this;
  }

  navigate(hash) {
    window.location.hash = hash;
  }

  _parse(pattern) {
    const keys = [];
    const regexStr = pattern.replace(/:([^/]+)/g, (_, key) => {
      keys.push(key);
      return '([^/]+)';
    });
    return { keys, regex: new RegExp('^' + regexStr + '$') };
  }

  _handle() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, qs] = hash.split('?');

    // Parse query
    const query = {};
    if (qs) {
      qs.split('&').forEach(function(pair) {
        var parts = pair.split('=');
        query[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
      });
    }

    // Try each route
    for (var i = 0; i < this._routes.length; i++) {
      var route = this._routes[i];
      var match = path.match(route.regex);
      if (match) {
        var params = {};
        route.keys.forEach(function(key, idx) {
          params[key] = match[idx + 1];
        });
        try {
          route.handler({ params: params, query: query, path: path });
        } catch (e) {
          console.error('Route handler error:', e);
          this._showError('页面加载出错', e);
        }
        return;
      }
    }

    // Fallback to default (home) handler
    if (this._defaultHandler) {
      try {
        this._defaultHandler({ params: {}, query: {}, path: '/' });
      } catch (e) {
        console.error('Default handler error:', e);
        this._showError('应用加载失败', e);
      }
    }
  }

  _showError(title, err) {
    var main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML =
      '<div style="text-align:center;padding:60px 20px;font-family:sans-serif;">' +
        '<div style="font-size:4rem;margin-bottom:12px;">&#9888;</div>' +
        '<h2 style="color:#e74c3c;margin-bottom:8px;">' + title + '</h2>' +
        '<p style="color:#666;margin-bottom:4px;">' + (err.message || err || '') + '</p>' +
        (err.stack
          ? '<pre style="text-align:left;max-width:640px;margin:12px auto;font-size:11px;color:#999;background:#f8f8f8;padding:12px;border-radius:6px;overflow:auto;max-height:200px;">' + err.stack + '</pre>'
          : '') +
        '<button onclick="location.reload()" style="margin-top:16px;padding:10px 24px;border-radius:6px;border:none;background:#4A90D9;color:#fff;font-size:14px;cursor:pointer;">&#8635; 刷新页面</button>' +
        '<button onclick="localStorage.clear();location.reload()" style="margin:16px 0 0 8px;padding:10px 24px;border-radius:6px;border:1px solid #ddd;background:#f0f0f0;color:#333;font-size:14px;cursor:pointer;">&#128465; 清除数据</button>' +
      '</div>';
  }
}

export var router = new Router();
