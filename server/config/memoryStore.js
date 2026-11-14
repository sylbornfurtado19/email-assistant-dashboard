/**
 * Pure JavaScript In-Memory Mock Store
 * Provides 100% API compatibility with Mongoose models used in this application.
 * Ensures the prototype runs immediately even on machines without a running MongoDB service.
 */

class MockDocument {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = (Date.now() + Math.floor(Math.random() * 1000000)).toString();
    }
    if (!this.createdAt) this.createdAt = new Date();
    if (!this.updatedAt) this.updatedAt = new Date();
  }

  async save() {
    this.updatedAt = new Date();
    return this;
  }

  toObject() {
    return { ...this };
  }

  toJSON() {
    return { ...this };
  }
}

class MockCollection {
  constructor(name) {
    this.name = name;
    this.records = [];
  }

  matchesQuery(doc, query = {}) {
    for (const [key, val] of Object.entries(query)) {
      if (key === '$or' && Array.isArray(val)) {
        const matchesAny = val.some((subQuery) => this.matchesQuery(doc, subQuery));
        if (!matchesAny) return false;
        continue;
      }

      if (key === 'classification' && typeof val === 'object' && val.$in) {
        if (!val.$in.includes(doc.classification)) return false;
        continue;
      }

      if (key === 'extractedEvent' && typeof val === 'object' && val.$ne !== undefined) {
        if (doc.extractedEvent === val.$ne) return false;
        continue;
      }

      if (val instanceof RegExp) {
        const docVal = doc[key] || '';
        if (typeof docVal === 'string' && !val.test(docVal)) return false;
        continue;
      }

      if (key === 'messages.body' && val instanceof RegExp) {
        const match = doc.messages?.some((m) => val.test(m.body));
        if (!match) return false;
        continue;
      }

      if (key === 'messages.senderName' && val instanceof RegExp) {
        const match = doc.messages?.some((m) => val.test(m.senderName));
        if (!match) return false;
        continue;
      }

      if (key === 'messages.senderEmail' && val instanceof RegExp) {
        const match = doc.messages?.some((m) => val.test(m.senderEmail));
        if (!match) return false;
        continue;
      }

      if (doc[key] !== val) {
        return false;
      }
    }
    return true;
  }

  find(query = {}) {
    let results = this.records.filter((doc) => this.matchesQuery(doc, query));
    return {
      sort: (sortObj = {}) => {
        if (sortObj.confidence) {
          return results.sort((a, b) =>
            sortObj.confidence === -1 ? (b.confidence || 0) - (a.confidence || 0) : (a.confidence || 0) - (b.confidence || 0)
          );
        }
        if (sortObj.createdAt === 1 || sortObj.updatedAt === 1) {
          return results.sort((a, b) => new Date(a.createdAt || a.updatedAt) - new Date(b.createdAt || b.updatedAt));
        }
        return results.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      },
      then: (resolve) => resolve(results),
    };
  }

  async findOne(query = {}) {
    return this.records.find((doc) => this.matchesQuery(doc, query)) || null;
  }

  async findById(id) {
    return this.records.find((doc) => doc._id.toString() === id.toString()) || null;
  }

  async countDocuments(query = {}) {
    if (Object.keys(query).length === 0) return this.records.length;
    return this.records.filter((doc) => this.matchesQuery(doc, query)).length;
  }

  async create(data) {
    const doc = new MockDocument(data);
    this.records.unshift(doc);
    return doc;
  }

  async insertMany(docs = []) {
    const created = docs.map((d) => new MockDocument(d));
    this.records.push(...created);
    return created;
  }

  async deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      const count = this.records.length;
      this.records = [];
      return { deletedCount: count };
    }
    const prev = this.records.length;
    this.records = this.records.filter((doc) => !this.matchesQuery(doc, query));
    return { deletedCount: prev - this.records.length };
  }
}

export const inMemoryDB = {
  users: new MockCollection('users'),
  threads: new MockCollection('threads'),
};

