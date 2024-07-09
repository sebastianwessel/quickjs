export default `
class Buffer extends Uint8Array {
  constructor(arg, encoding) {
      if (typeof arg === 'number') {
          super(arg);
      } else if (typeof arg === 'string') {
          super(Buffer._stringToBytes(arg, encoding));
      } else if (arg instanceof ArrayBuffer) {
          super(new Uint8Array(arg));
      } else if (Array.isArray(arg) || arg instanceof Uint8Array) {
          super(arg);
      } else {
          throw new TypeError('Invalid argument type');
      }
  }

  static from(arg, encoding) {
      if (typeof arg === 'string') {
          return new Buffer(Buffer._stringToBytes(arg, encoding));
      } else if (Array.isArray(arg) || arg instanceof Uint8Array) {
          return new Buffer(arg);
      } else if (arg instanceof ArrayBuffer) {
          return new Buffer(new Uint8Array(arg));
      } else {
          throw new TypeError('Invalid argument type');
      }
  }

  static alloc(size) {
      return new Buffer(size);
  }

  static allocUnsafe(size) {
      return new Buffer(size);
  }

  static concat(buffers, totalLength) {
      if (!Array.isArray(buffers)) {
          throw new TypeError('Argument must be an array of Buffers');
      }
      if (buffers.length === 0) {
          return Buffer.alloc(0);
      }
      if (totalLength === undefined) {
          totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
      }
      const result = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (const buf of buffers) {
          result.set(buf, offset);
          offset += buf.length;
      }
      return result;
  }

  toString(encoding) {
      if (encoding === 'base64') {
          return Buffer._bytesToBase64(this);
      } else {
          return Buffer._bytesToString(this, encoding);
      }
  }

  static _stringToBytes(string, encoding) {
      if (encoding === 'base64') {
          return Buffer._base64ToBytes(string);
      } else {
          return new TextEncoder().encode(string);
      }
  }

  static _bytesToString(bytes, encoding) {
      if (encoding === 'utf8' || encoding === undefined) {
          return new TextDecoder().decode(bytes);
      } else {
          throw new TypeError('Unsupported encoding');
      }
  }

  static _base64ToBytes(base64) {
      const binaryString = atob(base64);
      const length = binaryString.length;
      const bytes = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
  }

  static _bytesToBase64(bytes) {
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
  }
}
export default { Buffer };
`
