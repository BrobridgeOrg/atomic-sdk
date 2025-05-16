const events = require('events');

class Atomic extends events.EventEmitter {
  constructor() {
    super();
    this.supports = [];
    this.modules = {};
  }

  hasSupport(support) {
    return this.supports.includes(support);
  }

  addSupport(support) {
    if (!this.hasSupport(support)) {
      this.supports.push(support);
    }
  }

  getModule(name) {
    return this.modules[name];
  }

  registerModule(name, module) {
    if (!this.modules[name]) {
      this.modules[name] = module;
    }
  }
}

module.exports = Atomic;
