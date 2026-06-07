// JSON data loader with memory cache
class DataLoader {
  constructor() {
    this._cache = new Map();
    this._basePath = './data';
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
