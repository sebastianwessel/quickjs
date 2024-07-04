export default `

// Promisify: converts a callback-based function to a promise-based one
function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
}

// Callbackify: converts a promise-based function to a callback-based one
function callbackify(fn) {
  return function (...args) {
    const cb = args.pop();
    fn(...args)
      .then((result) => cb(null, result))
      .catch((err) => cb(err));
  };
}

// Inherits: implements inheritance
function inherits(ctor, superCtor) {
  if (typeof superCtor !== 'function' && superCtor !== null) {
    throw new TypeError('Super constructor must either be a function or null');
  }

  ctor.super_ = superCtor;
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
  } else {
    ctor.prototype.__proto__ = superCtor.prototype;
  }
}

// Deprecate: marks a method as deprecated
function deprecate(fn, msg) {
  let warned = false;
  function deprecated(...args) {
    if (!warned) {
      console.warn(\`DeprecationWarning: \${msg}\`);
      warned = true;
    }
    return fn.apply(this, args);
  }
  return deprecated;
}

const types = {
    isAnyArrayBuffer(value) {
      return value instanceof ArrayBuffer || value instanceof SharedArrayBuffer;
    },
    isArrayBufferView(value) {
      return ArrayBuffer.isView(value);
    },
    isArgumentsObject(value) {
      return Object.prototype.toString.call(value) === '[object Arguments]';
    },
    isArrayBuffer(value) {
      return value instanceof ArrayBuffer;
    },
    isAsyncFunction(value) {
      return Object.prototype.toString.call(value) === '[object AsyncFunction]';
    },
    isBigInt64Array(value) {
      return value instanceof BigInt64Array;
    },
    isBigUint64Array(value) {
      return value instanceof BigUint64Array;
    },
    isBooleanObject(value) {
      return typeof value === 'object' && typeof value.valueOf() === 'boolean';
    },
    isBoxedPrimitive(value) {
      return ['[object Number]', '[object String]', '[object Boolean]', '[object Symbol]'].includes(Object.prototype.toString.call(value));
    },
    isCryptoKey(value) {
      return typeof CryptoKey !== 'undefined' && value instanceof CryptoKey;
    },
    isDataView(value) {
      return value instanceof DataView;
    },
    isDate(value) {
      return value instanceof Date;
    },
    isExternal(value) {
      return false; // Node.js specific
    },
    isFloat32Array(value) {
      return value instanceof Float32Array;
    },
    isFloat64Array(value) {
      return value instanceof Float64Array;
    },
    isGeneratorFunction(value) {
      return Object.prototype.toString.call(value) === '[object GeneratorFunction]';
    },
    isGeneratorObject(value) {
      return Object.prototype.toString.call(value) === '[object Generator]';
    },
    isInt8Array(value) {
      return value instanceof Int8Array;
    },
    isInt16Array(value) {
      return value instanceof Int16Array;
    },
    isInt32Array(value) {
      return value instanceof Int32Array;
    },
    isKeyObject(value) {
      return false; // Node.js specific
    },
    isMap(value) {
      return value instanceof Map;
    },
    isMapIterator(value) {
      return Object.prototype.toString.call(value) === '[object Map Iterator]';
    },
    isModuleNamespaceObject(value) {
      return Object.prototype.toString.call(value) === '[object Module]';
    },
    isNativeError(value) {
      return value instanceof Error;
    },
    isNumberObject(value) {
      return typeof value === 'object' && typeof value.valueOf() === 'number';
    },
    isPromise(value) {
      return value instanceof Promise;
    },
    isProxy(value) {
      try {
        Proxy.revocable(value, {});
        return true;
      } catch (e) {
        return false;
      }
    },
    isRegExp(value) {
      return value instanceof RegExp;
    },
    isSet(value) {
      return value instanceof Set;
    },
    isSetIterator(value) {
      return Object.prototype.toString.call(value) === '[object Set Iterator]';
    },
    isSharedArrayBuffer(value) {
      return value instanceof SharedArrayBuffer;
    },
    isStringObject(value) {
      return typeof value === 'object' && typeof value.valueOf() === 'string';
    },
    isSymbolObject(value) {
      return typeof value === 'object' && typeof value.valueOf() === 'symbol';
    },
    isTypedArray(value) {
      return ArrayBuffer.isView(value) && !(value instanceof DataView);
    },
    isUint8Array(value) {
      return value instanceof Uint8Array;
    },
    isUint8ClampedArray(value) {
      return value instanceof Uint8ClampedArray;
    },
    isUint16Array(value) {
      return value instanceof Uint16Array;
    },
    isUint32Array(value) {
      return value instanceof Uint32Array;
    },
    isWeakMap(value) {
      return value instanceof WeakMap;
    },
    isWeakSet(value) {
      return value instanceof WeakSet;
    },
  }

const util = {
  promisify,
  callbackify,
  inherits,
  deprecate,
  types
};

export default util;

export { promisify, callbackify, inherits, deprecate, types };


`
