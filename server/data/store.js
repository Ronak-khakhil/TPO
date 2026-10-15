import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'db.json');

// Initial schema structure
const defaultData = {
  users: [],
  students: [],
  companies: [],
  drives: [],
  applications: [],
  results: [],
  notifications: [],
  auditLogs: []
};

class Store {
  constructor() {
    this.data = { ...defaultData };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(path.dirname(DATA_FILE))) {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading JSON data store, initializing fresh store:', err.message);
      this.data = { ...defaultData };
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting JSON store:', err.message);
    }
  }

  generateId() {
    return 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }

  // Collection accessors
  collection(name) {
    const self = this;
    const getList = () => {
      if (!self.data[name]) {
        self.data[name] = [];
      }
      return self.data[name];
    };

    return {
      find(filter = {}) {
        const list = getList();
        return list.filter(item => {
          for (const key of Object.keys(filter)) {
            if (Array.isArray(filter[key])) {
              if (!filter[key].includes(item[key])) return false;
            } else if (typeof filter[key] === 'object' && filter[key] !== null) {
              if (filter[key].$in && !filter[key].$in.includes(item[key])) return false;
              if (filter[key].$ne && item[key] === filter[key].$ne) return false;
            } else if (item[key] !== filter[key]) {
              return false;
            }
          }
          return true;
        });
      },

      findOne(filter = {}) {
        return this.find(filter)[0] || null;
      },

      findById(id) {
        const list = getList();
        return list.find(item => item._id === id || item.id === id) || null;
      },

      insert(doc) {
        const list = getList();
        const newDoc = {
          _id: doc._id || self.generateId(),
          ...doc,
          createdAt: doc.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        list.push(newDoc);
        self.save();
        return newDoc;
      },

      update(id, updates) {
        const list = getList();
        const index = list.findIndex(item => item._id === id || item.id === id);
        if (index === -1) return null;
        list[index] = {
          ...list[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        self.save();
        return list[index];
      },

      delete(id) {
        const list = getList();
        const index = list.findIndex(item => item._id === id || item.id === id);
        if (index === -1) return false;
        list.splice(index, 1);
        self.save();
        return true;
      },

      count(filter = {}) {
        return this.find(filter).length;
      },

      clear() {
        const list = getList();
        list.length = 0;
        self.save();
      }
    };
  }
}

export const store = new Store();
