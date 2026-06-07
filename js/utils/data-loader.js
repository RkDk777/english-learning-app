// JSON data loader with memory cache
// Uses jsDelivr CDN for faster loading in China (GitHub Pages origin)
class DataLoader {
  constructor() {
    this._cache = new Map();
    // Detect if we're on GitHub Pages (no custom domain)
    const isGitHubPages = location.hostname.endsWith('.github.io');
    // jsDelivr mirrors GitHub repos, with CDN nodes in China
    this._basePath = isGitHubPages
      ? 'https://cdn.jsdelivr.net/gh/RkDk777/english-learning-app@master/data'
      : './data';
  }

  async load(path) {
    const key = path;
    if (this._cache.has(key)) {
      return this._cache.get(key);
    }
    try {
      const response = await fetch(`${this._basePath}/${path}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
      }
      const data = await response.json();
      this._cache.set(key, data);
      return data;
    } catch (e) {
      console.error(`DataLoader error: ${e.message}`);
      // Fallback: try local path
      if (this._basePath !== './data') {
        try {
          const fallbackResp = await fetch(`./data/${path}`);
          if (fallbackResp.ok) {
            const data = await fallbackResp.json();
            this._cache.set(key, data);
            return data;
          }
        } catch { /* give up */ }
      }
      throw e;
    }
  }

  async loadVocabulary(grade) {
    return this.load(`vocabulary/${grade}.json`);
  }

  async loadGrammar(level) {
    return this.load(`grammar/${level}.json`);
  }

  async loadReading(level) {
    return this.load(`reading/${level}.json`);
  }

  // Load all vocabulary files at once
  async loadAllVocabulary() {
    const grades = ['grade7', 'grade8', 'grade9', 'grade10', 'grade11', 'grade12'];
    const results = await Promise.all(
      grades.map(g => this.loadVocabulary(g).catch(() => null))
    );
    const map = {};
    grades.forEach((g, i) => { map[g] = results[i]; });
    return map;
  }

  clearCache() {
    this._cache.clear();
  }
}

export const dataLoader = new DataLoader();
