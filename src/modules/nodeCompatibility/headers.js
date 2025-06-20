export default `if (typeof globalThis.Headers === 'undefined') {
class Headers {
  constructor(init) {
    this.map = {};

    if (init instanceof Headers) {
        init.forEach((value, name) => {
            this.append(name, value);
        });
    } else if (init) {
        Object.getOwnPropertyNames(init).forEach(name => {
            this.append(name, init[name]);
        });
    }
  }

  append(name, value) {
    name = name.toLowerCase();
    if (this.map[name]) {
        this.map[name].push(value);
    } else {
        this.map[name] = [value];
    }
  }

  delete(name) {
    delete this.map[name.toLowerCase()];
  }

  get(name) {
    name = name.toLowerCase();
    return this.map[name] ? this.map[name][0] : null;
  }

  getAll(name) {
    return this.map[name.toLowerCase()] || [];
  }

  has(name) {
    return this.map.hasOwnProperty(name.toLowerCase());
  }

  set(name, value) {
    this.map[name.toLowerCase()] = [value];
  }
  
  forEach(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(name => {
        this.map[name].forEach(value => {
            callback.call(thisArg, value, name, this);
        });
    });
  }
}
globalThis.Headers = Headers;
}
export default globalThis.Headers;
`
