require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\build-helpers\\node_modules\\base64-js\\lib\\b64.js":[function(require,module,exports){
'use strict';

var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

	var PLUS = '+'.charCodeAt(0);
	var SLASH = '/'.charCodeAt(0);
	var NUMBER = '0'.charCodeAt(0);
	var LOWER = 'a'.charCodeAt(0);
	var UPPER = 'A'.charCodeAt(0);
	var PLUS_URL_SAFE = '-'.charCodeAt(0);
	var SLASH_URL_SAFE = '_'.charCodeAt(0);

	function decode(elt) {
		var code = elt.charCodeAt(0);
		if (code === PLUS || code === PLUS_URL_SAFE) return 62; // '+'
		if (code === SLASH || code === SLASH_URL_SAFE) return 63; // '/'
		if (code < NUMBER) return -1; //no match
		if (code < NUMBER + 10) return code - NUMBER + 26 + 26;
		if (code < UPPER + 26) return code - UPPER;
		if (code < LOWER + 26) return code - LOWER + 26;
	}

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4');
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length;
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		var L = 0;

		function push(v) {
			arr[L++] = v;
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = decode(b64.charAt(i)) << 18 | decode(b64.charAt(i + 1)) << 12 | decode(b64.charAt(i + 2)) << 6 | decode(b64.charAt(i + 3));
			push((tmp & 0xFF0000) >> 16);
			push((tmp & 0xFF00) >> 8);
			push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = decode(b64.charAt(i)) << 2 | decode(b64.charAt(i + 1)) >> 4;
			push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = decode(b64.charAt(i)) << 10 | decode(b64.charAt(i + 1)) << 4 | decode(b64.charAt(i + 2)) >> 2;
			push(tmp >> 8 & 0xFF);
			push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
		    extraBytes = uint8.length % 3,
		    // if we have 1 byte left, pad 2 bytes
		output = '',
		    temp,
		    length;

		function encode(num) {
			return lookup.charAt(num);
		}

		function tripletToBase64(num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F);
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += encode(temp >> 2);
				output += encode(temp << 4 & 0x3F);
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
				output += encode(temp >> 10);
				output += encode(temp >> 4 & 0x3F);
				output += encode(temp << 2 & 0x3F);
				output += '=';
				break;
		}

		return output;
	}

	exports.toByteArray = b64ToByteArray;
	exports.fromByteArray = uint8ToBase64;
})(typeof exports === 'undefined' ? undefined.base64js = {} : exports);

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\build-helpers\\node_modules\\buffer\\index.js":[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

'use strict';

var base64 = require('base64-js');
var ieee754 = require('ieee754');
var isArray = require('is-array');

exports.Buffer = Buffer;
exports.SlowBuffer = SlowBuffer;
exports.INSPECT_MAX_BYTES = 50;
Buffer.poolSize = 8192; // not used by this implementation

var rootParent = {};

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  function Bar() {}
  try {
    var arr = new Uint8Array(1);
    arr.foo = function () {
      return 42;
    };
    arr.constructor = Bar;
    return arr.foo() === 42 && // typed array instances can be augmented
    arr.constructor === Bar && // constructor can be set
    typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
    arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
    ;
  } catch (e) {
    return false;
  }
})();

function kMaxLength() {
  return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer(arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1]);
    return new Buffer(arg);
  }

  this.length = 0;
  this.parent = undefined;

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg);
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8');
  }

  // Unusual.
  return fromObject(this, arg);
}

function fromNumber(that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0;
    }
  }
  return that;
}

function fromString(that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8';

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0;
  that = allocate(that, length);

  that.write(string, encoding);
  return that;
}

function fromObject(that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object);

  if (isArray(object)) return fromArray(that, object);

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string');
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object);
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object);
    }
  }

  if (object.length) return fromArrayLike(that, object);

  return fromJsonObject(that, object);
}

function fromBuffer(that, buffer) {
  var length = checked(buffer.length) | 0;
  that = allocate(that, length);
  buffer.copy(that, 0, 0, length);
  return that;
}

function fromArray(that, array) {
  var length = checked(array.length) | 0;
  that = allocate(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that;
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray(that, array) {
  var length = checked(array.length) | 0;
  that = allocate(that, length);
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that;
}

function fromArrayBuffer(that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength;
    that = Buffer._augment(new Uint8Array(array));
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array));
  }
  return that;
}

function fromArrayLike(that, array) {
  var length = checked(array.length) | 0;
  that = allocate(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that;
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject(that, object) {
  var array;
  var length = 0;

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data;
    length = checked(array.length) | 0;
  }
  that = allocate(that, length);

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that;
}

function allocate(that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length));
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length;
    that._isBuffer = true;
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1;
  if (fromPool) that.parent = rootParent;

  return that;
}

function checked(length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + kMaxLength().toString(16) + ' bytes');
  }
  return length | 0;
}

function SlowBuffer(subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding);

  var buf = new Buffer(subject, encoding);
  delete buf.parent;
  return buf;
}

Buffer.isBuffer = function isBuffer(b) {
  return !!(b != null && b._isBuffer);
};

Buffer.compare = function compare(a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers');
  }

  if (a === b) return 0;

  var x = a.length;
  var y = b.length;

  var i = 0;
  var len = Math.min(x, y);
  while (i < len) {
    if (a[i] !== b[i]) break;

    ++i;
  }

  if (i !== len) {
    x = a[i];
    y = b[i];
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
};

Buffer.isEncoding = function isEncoding(encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true;
    default:
      return false;
  }
};

Buffer.concat = function concat(list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.');

  if (list.length === 0) {
    return new Buffer(0);
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; i++) {
      length += list[i].length;
    }
  }

  var buf = new Buffer(length);
  var pos = 0;
  for (i = 0; i < list.length; i++) {
    var item = list[i];
    item.copy(buf, pos);
    pos += item.length;
  }
  return buf;
};

function byteLength(string, encoding) {
  if (typeof string !== 'string') string = '' + string;

  var len = string.length;
  if (len === 0) return 0;

  // Use a for loop to avoid recursion
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len;
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length;
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2;
      case 'hex':
        return len >>> 1;
      case 'base64':
        return base64ToBytes(string).length;
      default:
        if (loweredCase) return utf8ToBytes(string).length; // assume utf8
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined;
Buffer.prototype.parent = undefined;

function slowToString(encoding, start, end) {
  var loweredCase = false;

  start = start | 0;
  end = end === undefined || end === Infinity ? this.length : end | 0;

  if (!encoding) encoding = 'utf8';
  if (start < 0) start = 0;
  if (end > this.length) end = this.length;
  if (end <= start) return '';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end);

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end);

      case 'ascii':
        return asciiSlice(this, start, end);

      case 'binary':
        return binarySlice(this, start, end);

      case 'base64':
        return base64Slice(this, start, end);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

Buffer.prototype.toString = function toString() {
  var length = this.length | 0;
  if (length === 0) return '';
  if (arguments.length === 0) return utf8Slice(this, 0, length);
  return slowToString.apply(this, arguments);
};

Buffer.prototype.equals = function equals(b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
  if (this === b) return true;
  return Buffer.compare(this, b) === 0;
};

Buffer.prototype.inspect = function inspect() {
  var str = '';
  var max = exports.INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>';
};

Buffer.prototype.compare = function compare(b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
  if (this === b) return 0;
  return Buffer.compare(this, b);
};

Buffer.prototype.indexOf = function indexOf(val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff;else if (byteOffset < -0x80000000) byteOffset = -0x80000000;
  byteOffset >>= 0;

  if (this.length === 0) return -1;
  if (byteOffset >= this.length) return -1;

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0);

  if (typeof val === 'string') {
    if (val.length === 0) return -1; // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset);
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset);
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset);
    }
    return arrayIndexOf(this, [val], byteOffset);
  }

  function arrayIndexOf(arr, val, byteOffset) {
    var foundIndex = -1;
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex;
      } else {
        foundIndex = -1;
      }
    }
    return -1;
  }

  throw new TypeError('val must be string, number or Buffer');
};

// `get` is deprecated
Buffer.prototype.get = function get(offset) {
  console.log('.get() is deprecated. Access using array indexes instead.');
  return this.readUInt8(offset);
};

// `set` is deprecated
Buffer.prototype.set = function set(v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.');
  return this.writeUInt8(v, offset);
};

function hexWrite(buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2 !== 0) throw new Error('Invalid hex string');

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) throw new Error('Invalid hex string');
    buf[offset + i] = parsed;
  }
  return i;
}

function utf8Write(buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
}

function asciiWrite(buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length);
}

function binaryWrite(buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length);
}

function base64Write(buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length);
}

function ucs2Write(buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
}

Buffer.prototype.write = function write(string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0
    // Buffer#write(string, encoding)
    ;
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0
    // Buffer#write(string, offset[, length][, encoding])
    ;
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
    // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding;
    encoding = offset;
    offset = length | 0;
    length = swap;
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds');
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length);

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length);

      case 'ascii':
        return asciiWrite(this, string, offset, length);

      case 'binary':
        return binaryWrite(this, string, offset, length);

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length);

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length);

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON() {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  };
};

function base64Slice(buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf);
  } else {
    return base64.fromByteArray(buf.slice(start, end));
  }
}

function utf8Slice(buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break;
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break;
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res);
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray(codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    ;
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
  }
  return res;
}

function asciiSlice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret;
}

function binarySlice(buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret;
}

function hexSlice(buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(buf[i]);
  }
  return out;
}

function utf16leSlice(buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res;
}

Buffer.prototype.slice = function slice(start, end) {
  var len = this.length;
  start = ~ ~start;
  end = end === undefined ? len : ~ ~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end));
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start];
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this;

  return newBuf;
};

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset(offset, ext, length) {
  if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
}

Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val;
};

Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val;
};

Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset];
};

Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | this[offset + 1] << 8;
};

Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] << 8 | this[offset + 1];
};

Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
};

Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};

Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val;
};

Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val;
};

Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return this[offset];
  return (0xff - this[offset] + 1) * -1;
};

Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | this[offset + 1] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | this[offset] << 8;
  return val & 0x8000 ? val | 0xFFFF0000 : val;
};

Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};

Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};

Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return ieee754.read(this, offset, true, 23, 4);
};

Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return ieee754.read(this, offset, false, 23, 4);
};

Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return ieee754.read(this, offset, true, 52, 8);
};

Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return ieee754.read(this, offset, false, 52, 8);
};

function checkInt(buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance');
  if (value > max || value < min) throw new RangeError('value is out of bounds');
  if (offset + ext > buf.length) throw new RangeError('index out of range');
}

Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = value / mul & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = value;
  return offset + 1;
};

function objectWriteUInt16(buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & 0xff << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2;
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2;
};

function objectWriteUInt32(buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4;
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4;
};

Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = value < 0 ? 1 : 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = value < 0 ? 1 : 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul >> 0) - sub & 0xFF;
  }

  return offset + byteLength;
};

Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = value;
  return offset + 1;
};

Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value;
    this[offset + 1] = value >>> 8;
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2;
};

Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 8;
    this[offset + 1] = value;
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2;
};

Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4;
};

Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value;
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4;
};

function checkIEEE754(buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds');
  if (offset + ext > buf.length) throw new RangeError('index out of range');
  if (offset < 0) throw new RangeError('index out of range');
}

function writeFloat(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4;
}

Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert);
};

Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert);
};

function writeDouble(buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8;
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert);
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert);
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy(target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length === 0 || this.length === 0) return 0;

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds');
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds');
  if (end < 0) throw new RangeError('sourceEnd out of bounds');

  // Are we oob?
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart);
  }

  return len;
};

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  if (!value) value = 0;
  if (!start) start = 0;
  if (!end) end = this.length;

  if (end < start) throw new RangeError('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return;
  if (this.length === 0) return;

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds');
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds');

  var i;
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value;
    }
  } else {
    var bytes = utf8ToBytes(value.toString());
    var len = bytes.length;
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len];
    }
  }

  return this;
};

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer() {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return new Buffer(this).buffer;
    } else {
      var buf = new Uint8Array(this.length);
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i];
      }
      return buf.buffer;
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser');
  }
};

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype;

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment(arr) {
  arr.constructor = Buffer;
  arr._isBuffer = true;

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set;

  // deprecated
  arr.get = BP.get;
  arr.set = BP.set;

  arr.write = BP.write;
  arr.toString = BP.toString;
  arr.toLocaleString = BP.toString;
  arr.toJSON = BP.toJSON;
  arr.equals = BP.equals;
  arr.compare = BP.compare;
  arr.indexOf = BP.indexOf;
  arr.copy = BP.copy;
  arr.slice = BP.slice;
  arr.readUIntLE = BP.readUIntLE;
  arr.readUIntBE = BP.readUIntBE;
  arr.readUInt8 = BP.readUInt8;
  arr.readUInt16LE = BP.readUInt16LE;
  arr.readUInt16BE = BP.readUInt16BE;
  arr.readUInt32LE = BP.readUInt32LE;
  arr.readUInt32BE = BP.readUInt32BE;
  arr.readIntLE = BP.readIntLE;
  arr.readIntBE = BP.readIntBE;
  arr.readInt8 = BP.readInt8;
  arr.readInt16LE = BP.readInt16LE;
  arr.readInt16BE = BP.readInt16BE;
  arr.readInt32LE = BP.readInt32LE;
  arr.readInt32BE = BP.readInt32BE;
  arr.readFloatLE = BP.readFloatLE;
  arr.readFloatBE = BP.readFloatBE;
  arr.readDoubleLE = BP.readDoubleLE;
  arr.readDoubleBE = BP.readDoubleBE;
  arr.writeUInt8 = BP.writeUInt8;
  arr.writeUIntLE = BP.writeUIntLE;
  arr.writeUIntBE = BP.writeUIntBE;
  arr.writeUInt16LE = BP.writeUInt16LE;
  arr.writeUInt16BE = BP.writeUInt16BE;
  arr.writeUInt32LE = BP.writeUInt32LE;
  arr.writeUInt32BE = BP.writeUInt32BE;
  arr.writeIntLE = BP.writeIntLE;
  arr.writeIntBE = BP.writeIntBE;
  arr.writeInt8 = BP.writeInt8;
  arr.writeInt16LE = BP.writeInt16LE;
  arr.writeInt16BE = BP.writeInt16BE;
  arr.writeInt32LE = BP.writeInt32LE;
  arr.writeInt32BE = BP.writeInt32BE;
  arr.writeFloatLE = BP.writeFloatLE;
  arr.writeFloatBE = BP.writeFloatBE;
  arr.writeDoubleLE = BP.writeDoubleLE;
  arr.writeDoubleBE = BP.writeDoubleBE;
  arr.fill = BP.fill;
  arr.inspect = BP.inspect;
  arr.toArrayBuffer = BP.toArrayBuffer;

  return arr;
};

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean(str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return '';
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str;
}

function stringtrim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue;
        }

        // valid lead
        leadSurrogate = codePoint;

        continue;
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue;
      }

      // valid surrogate pair
      codePoint = leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00 | 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break;
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break;
      bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break;
      bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break;
      bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
    } else {
      throw new Error('Invalid code point');
    }
  }

  return bytes;
}

function asciiToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray;
}

function utf16leToBytes(str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break;

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray;
}

function base64ToBytes(str) {
  return base64.toByteArray(base64clean(str));
}

function blitBuffer(src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if (i + offset >= dst.length || i >= src.length) break;
    dst[i + offset] = src[i];
  }
  return i;
}

},{"base64-js":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\build-helpers\\node_modules\\base64-js\\lib\\b64.js","ieee754":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\build-helpers\\node_modules\\ieee754\\index.js","is-array":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\build-helpers\\node_modules\\is-array\\index.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\build-helpers\\node_modules\\ieee754\\index.js":[function(require,module,exports){
"use strict";

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & (1 << -nBits) - 1;
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
};

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\build-helpers\\node_modules\\is-array\\index.js":[function(require,module,exports){

/**
 * isArray
 */

'use strict';

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !!val && '[object Array]' == str.call(val);
};

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\chart-communication\\index.js":[function(require,module,exports){
"use strict";

module.exports = require("./src");

},{"./src":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\chart-communication\\src\\index.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\chart-communication\\src\\carrier.js":[function(require,module,exports){
"use strict";

var _debug = false;
var _endpoints = {};
var nextId = 1;

var useragent = require("@visokio/common/src/util/useragent");
var logger = require("@visokio/common/src/util/logger").create("chart-communication@carrier"); //.enable(true);

var checkLinkPresent = function checkLinkPresent(source, target) {

    if (!_endpoints[source]) {
        logger.warn("Cannot send message, there is no source '" + source + "' we cannot tell who is sending the message! Did you create the endpoint in the source " + source + "?");
        return false;
    }

    if (!_endpoints[source][target]) {
        logger.warn("Cannot send message, there is no target '" + target + "' for the given source '" + source + "', nobody is listening! Did you create the endpoint in the target " + target + "?");
        return false;
    }

    return true;
};

// Listen to all the incoming messages and filter them based on the target
// and then call the listeners with the event data. This way we only have an event listener in the window instead of crating
// one per endpoint
window.addEventListener("message", function (event) {

    if (Array === undefined) {
        // On IE10, when the IFRAME is being disposed e.g. on switch view, it can receive a message "dispose"
        // in a weird state where many globals are undefined including Array. This results in a console
        // or debugger error, and can be disregarded:
        if (event.data.type === "dispose") {
            // Ignore
            return;
        } else {
            throw new Error("No Array. Disposed IFRAME?");
        }
    }

    var data = event.data;

    logger.info("postMessage receive in ", window.location.href, data);

    // We ignore errors parsing hte postMessage since messages can come form different sources and may not be JSON,
    // we can tell the if its not valid json is not likely be form us
    // console.error("Error parsing postMessage", data)
    if (!useragent.isModern()) {
        try {
            data = JSON.parse(data);
        } catch (e) {}
    }

    if (!data.omniscope) return; // If the message doesnt have omniscope then its not from us and should be ignored
    if (!_endpoints[data.target]) return;
    if (!_endpoints[data.target][data.source]) return;

    _endpoints[data.target][data.source].emit(data.type, data.message);
});

/**
 * Objec tin charge of keeping track of the different endpoints available and passing the messages between them
 * @type {Object}
 */
module.exports = {

    /**
     * Setter for debug mode. When debug mode is enable the logger methods will log in console, if not they will do nothing.
     * Byd efault it will be false
     * @param  {boolean} value
     * @return {Object}
     */
    debug: function debug(value) {
        _debug = value;
        logger.enable(value);
        return this;
    },

    /**
     * Getter for the actual endpoints object
     * @return {Object.<string, Object>}
     */
    endpoints: function endpoints() {
        return _endpoints;
    },

    /**
     * Register an endpoint for the given source and target in the manager so we can later dispose it, broadcast, send, etc
     * @param  {string} source
     * @param  {string} target
     * @param  {Endpoint} endpoint
     * @return {Object}
     */
    register: function register(source, target, endpoint) {

        if (!_endpoints[source]) _endpoints[source] = {};

        if (_endpoints[source][target]) {
            logger.error("Tried to register suource \"" + source + "\" with target \"" + target + "\" but it already exists in the endpoints registry:", _endpoints);
            throw new Error("Trying to register for source '" + source + "' and target '" + target + "', but there is already one endpoint, you need to dispose first");
        }

        _endpoints[source][target] = endpoint;

        logger.info("Registered endpoint with source \"" + source + "\" and target " + target);

        // If we are in debug mode we add an any listener, we ignore it when we are out of debug.
        // TODO: Do this properly at some point, its for testing so its not critical, but we should remove the listener
        // or soemthing like that
        if (_debug) endpoint.any(function (event) {
            if (!_debug) return;
            logger.info("Message received from '" + target + "' in '" + source + "'", event);
        });

        return this;
    },

    /**
     * Unregister the endpoint for the given source and target if tehre is any. If it canot found any it wont do anything.
     * @param  {string} source
     * @param  {string} target
     * @return {Object}
     */
    unregister: function unregister(source, target) {

        if (!_endpoints[source]) {
            logger.warn("Tried to unregister the endpoints for source \"" + source + "\" and target \"" + target + "\" but cannot find that source in the endpoint list");
            return;
        }
        if (!_endpoints[source][target]) {
            logger.warn("Tried to unregister the endpoints for source \"" + source + "\" and target \"" + target + "\" but cannot find that target for that source in the endpoint list");
            return;
        }

        delete _endpoints[source][target];

        if (!Object.keys(_endpoints[source]).length) delete _endpoints[source];

        logger.info("Unregistered endpoint with source \"" + source + "\" and target \"" + target + "\"");

        return this;
    },

    /**
     * Send a message using the or postMEssage if there is a channel defined or an event emitter if there is none
     * @param  {string} source
     * @param  {string} target
     * @param  {Window=} data
     * @return {Object}
     */
    send: function send(source, target, data, channel) {

        var postData;

        logger.info("Message send from source '" + source + "' to target '" + target + "' with type \"" + data.type + "\" in channel and with the message:", channel, data.message);

        if (channel) {

            postData = { omniscope: true, source: source, target: target, type: data.type, message: data.message };
            if (!useragent.isModern()) postData = JSON.stringify(data);

            if (!channel.postMessage) {
                // Perhaps this is the case on iOS when disposing and the Window object passed
                // as channel doesn't have a postMessage property (yet window global has).
                // I'm assuming this is a disposal scenario a bit like IE's in window.addEventListener above.
                if (data.type === "dispose") {
                    // Ignore
                    return;
                } else {
                    // Unexpected
                    throw new Error("No postMessage on channel");
                }
            }

            channel.postMessage(postData, "*");
        } else {

            if (!checkLinkPresent(target, source)) return this;

            // Old sync approach:
            // endpoints[target][source].emit(data.type, data.message);
            // Async, to match IFRAME based, and to avoid dispatcher invariant errors:
            window.requestAnimationFrame(function () {
                if (!checkLinkPresent(target, source)) return;
                _endpoints[target][source].emit(data.type, data.message);
            });
        }

        return this;
    },

    /**
     * Send a message to all the targets of the specified source
     * @param  {string} source
     * @param  {Object} data
     * @return {Object}
     */
    broadcast: function broadcast(source, type, message) {

        var targets = _endpoints[source];

        if (!targets) {
            logger.warn("Cannot broadcast message type '" + type + "' from '" + source + "', no targets found! Did you register the endpoints first?", type, message);
            return;
        }

        logger.info("Broadcasting for '" + source + "'", type, message);

        Object.keys(targets).forEach(function (key) {
            return targets[key].send(type, message);
        });

        return this;
    },

    generateId: function generateId() {
        return nextId++;
    },

    /**
     * Clear all the endpoitns of the ones for the given source if any is provided
     * @param  {string} id
     * @return {Object}
     */
    clear: function clear(id) {

        var filter = id !== undefined && id !== null;

        logger.info("Disposing " + (filter ? "for '" + id + "'" : "all"));

        _endpoints = Object.keys(_endpoints).reduce(function (sources, source) {

            var targets = Object.keys(_endpoints[source]).reduce(function (targets, target) {
                if (filter && id !== source && id !== target) {
                    targets[target] = _endpoints[source][target];
                } else {
                    _endpoints[source][target].dispose();
                }
                return targets;
            }, {});

            if (Object.keys(targets).length) sources[source] = targets;
            return sources;
        }, {});

        return this;
    }
};

},{"@visokio/common/src/util/logger":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\logger.js","@visokio/common/src/util/useragent":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\useragent.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\chart-communication\\src\\endpoint.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var EventEmitter = require("@visokio/common/src/event/EventEmitter");
var carrier = require("./carrier");

/**
 * Class that extend event emitter with a send method used as the endpoint for the communciation between two components,
 * throught a window channel or throught direct event emitter calls
 */

var Endpoint = (function (_EventEmitter) {

	/**
  * @param  {string} source
  * @param  {string} target
  * @param  {Window=} channel
  */

	function Endpoint(source, target, channel) {
		_classCallCheck(this, Endpoint);

		_get(Object.getPrototypeOf(Endpoint.prototype), "constructor", this).call(this);

		/**
   * Source or orginin of the message
   * @type {string}
   * @private
   */
		this._source = source;

		/**
   * Target or destination for the messages sended throught this endpoint
   * @type {string}
   * @private
   */
		this._target = target;

		/**
   * Channel of communication, representing a window object used for postMessage
   * @type {?Window}
   */
		this._channel = channel;

		// Register itself in the manager
		carrier.register(source, target, this);
	}

	_inherits(Endpoint, _EventEmitter);

	_createClass(Endpoint, [{
		key: "getSource",
		value: function getSource() {
			return this._source;
		}
	}, {
		key: "getTarget",
		value: function getTarget() {
			return this._target;
		}
	}, {
		key: "send",

		/**
   * Send a message of the given type to the target
   * @return {Endpoint}
   */
		value: function send(type, message) {
			carrier.send(this._source, this._target, { "type": type, message: message }, this._channel);
			return this;
		}
	}, {
		key: "dispose",

		/**
   * Dispose the endpoint, removing any kind event listener logic and unregistering form the manager
   */
		value: function dispose() {
			carrier.unregister(this._source, this._target);
			this.removeAllListeners();
		}
	}]);

	return Endpoint;
})(EventEmitter);

module.exports = Endpoint;

},{"./carrier":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\chart-communication\\src\\carrier.js","@visokio/common/src/event/EventEmitter":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\event\\EventEmitter.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\chart-communication\\src\\index.js":[function(require,module,exports){
"use strict";

var carrier = require("./carrier");

var Endpoint = require("./endpoint");

module.exports = {

	/**
  * Get or sets the debug mode that will log into console the message passing between endpoints
  * @param  {boolean} value
  * @return {Object}
  */
	debug: function debug(value) {
		carrier.debug(value);
		return this;
	},

	/**
  * Create and endpoint for communication with a source, target and an optional window as a communication channel.
  * If window is present it will use it to do postMessage, if not it will use eventemitter directly and pass the messages.
  * In both cases the messages will only arrive in the endpoint base don the source and target specified
  * @param  {string} source
  * @param  {string} target
  * @param  {Window=} channel
  * @return {Endpoint}
  */
	endpoint: function endpoint(source, target, channel) {
		return new Endpoint(source, target, channel);
	},

	/**
  * Send a message to all the targets of the given source
  * @param  {string} source
  * @param  {string} type
  * @param  {Object} message
  * @return {Object}
  */
	broadcast: function broadcast(source, type, message) {
		carrier.broadcast(source, type, message);
		return this;
	},

	generateId: function generateId() {
		return carrier.generateId();
	},

	/**
  * Clear all the registered endpoints from the manager or the ones for the specified source
  * @return {Object}
  */
	clear: function clear(source) {
		carrier.clear(source);
		return this;
	}
};

},{"./carrier":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\chart-communication\\src\\carrier.js","./endpoint":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\chart-communication\\src\\endpoint.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\node_modules\\clone\\clone.js":[function(require,module,exports){
(function (Buffer){
'use strict';

var clone = (function () {
  'use strict';

  /**
   * Clones (copies) an Object using deep copying.
   *
   * This function supports circular references by default, but if you are certain
   * there are no circular references in your object, you can save some CPU time
   * by calling clone(obj, false).
   *
   * Caution: if `circular` is false and `parent` contains circular references,
   * your program may enter an infinite loop and crash.
   *
   * @param `parent` - the object to be cloned
   * @param `circular` - set to true if the object to be cloned may contain
   *    circular references. (optional - true by default)
   * @param `depth` - set to a number if the object is only to be cloned to
   *    a particular depth. (optional - defaults to Infinity)
   * @param `prototype` - sets the prototype to be used when cloning an object.
   *    (optional - defaults to parent prototype).
  */
  function clone(parent, circular, depth, prototype) {
    var filter;
    if (typeof circular === 'object') {
      depth = circular.depth;
      prototype = circular.prototype;
      filter = circular.filter;
      circular = circular.circular;
    }
    // maintain two arrays for circular references, where corresponding parents
    // and children have the same index
    var allParents = [];
    var allChildren = [];

    var useBuffer = typeof Buffer != 'undefined';

    if (typeof circular == 'undefined') circular = true;

    if (typeof depth == 'undefined') depth = Infinity;

    // recurse this function so we don't reset allParents and allChildren
    function _clone(parent, depth) {
      // cloning null always returns null
      if (parent === null) return null;

      if (depth == 0) return parent;

      var child;
      var proto;
      if (typeof parent != 'object') {
        return parent;
      }

      if (clone.__isArray(parent)) {
        child = [];
      } else if (clone.__isRegExp(parent)) {
        child = new RegExp(parent.source, __getRegExpFlags(parent));
        if (parent.lastIndex) child.lastIndex = parent.lastIndex;
      } else if (clone.__isDate(parent)) {
        child = new Date(parent.getTime());
      } else if (useBuffer && Buffer.isBuffer(parent)) {
        child = new Buffer(parent.length);
        parent.copy(child);
        return child;
      } else {
        if (typeof prototype == 'undefined') {
          proto = Object.getPrototypeOf(parent);
          child = Object.create(proto);
        } else {
          child = Object.create(prototype);
          proto = prototype;
        }
      }

      if (circular) {
        var index = allParents.indexOf(parent);

        if (index != -1) {
          return allChildren[index];
        }
        allParents.push(parent);
        allChildren.push(child);
      }

      for (var i in parent) {
        var attrs;
        if (proto) {
          attrs = Object.getOwnPropertyDescriptor(proto, i);
        }

        if (attrs && attrs.set == null) {
          continue;
        }
        child[i] = _clone(parent[i], depth - 1);
      }

      return child;
    }

    return _clone(parent, depth);
  }

  /**
   * Simple flat clone using prototype, accepts only objects, usefull for property
   * override on FLAT configuration object (no nested props).
   *
   * USE WITH CAUTION! This may not behave as you wish if you do not know how this
   * works.
   */
  clone.clonePrototype = function clonePrototype(parent) {
    if (parent === null) return null;

    var c = function c() {};
    c.prototype = parent;
    return new c();
  };

  // private utility functions

  function __objToStr(o) {
    return Object.prototype.toString.call(o);
  };
  clone.__objToStr = __objToStr;

  function __isDate(o) {
    return typeof o === 'object' && __objToStr(o) === '[object Date]';
  };
  clone.__isDate = __isDate;

  function __isArray(o) {
    return typeof o === 'object' && __objToStr(o) === '[object Array]';
  };
  clone.__isArray = __isArray;

  function __isRegExp(o) {
    return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
  };
  clone.__isRegExp = __isRegExp;

  function __getRegExpFlags(re) {
    var flags = '';
    if (re.global) flags += 'g';
    if (re.ignoreCase) flags += 'i';
    if (re.multiline) flags += 'm';
    return flags;
  };
  clone.__getRegExpFlags = __getRegExpFlags;

  return clone;
})();

if (typeof module === 'object' && module.exports) {
  module.exports = clone;
}

}).call(this,require("buffer").Buffer)
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1Zpc29raW8vT21uaXNjb3BlQWx0L1ZpZXdzL25vZGVfbW9kdWxlcy9Admlzb2tpby9jb21tb24vbm9kZV9tb2R1bGVzL2Nsb25lL2Nsb25lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLElBQUksS0FBSyxHQUFHLENBQUMsWUFBVztBQUN4QixjQUFZLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JiLFdBQVMsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtBQUNqRCxRQUFJLE1BQU0sQ0FBQztBQUNYLFFBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFO0FBQ2hDLFdBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO0FBQ3ZCLGVBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO0FBQy9CLFlBQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBQ3pCLGNBQVEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFBO0tBQzdCOzs7QUFHRCxRQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDcEIsUUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUVyQixRQUFJLFNBQVMsR0FBRyxPQUFPLE1BQU0sSUFBSSxXQUFXLENBQUM7O0FBRTdDLFFBQUksT0FBTyxRQUFRLElBQUksV0FBVyxFQUNoQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUVsQixRQUFJLE9BQU8sS0FBSyxJQUFJLFdBQVcsRUFDN0IsS0FBSyxHQUFHLFFBQVEsQ0FBQzs7O0FBR25CLGFBQVMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUU7O0FBRTdCLFVBQUksTUFBTSxLQUFLLElBQUksRUFDakIsT0FBTyxJQUFJLENBQUM7O0FBRWQsVUFBSSxLQUFLLElBQUksQ0FBQyxFQUNaLE9BQU8sTUFBTSxDQUFDOztBQUVoQixVQUFJLEtBQUssQ0FBQztBQUNWLFVBQUksS0FBSyxDQUFDO0FBQ1YsVUFBSSxPQUFPLE1BQU0sSUFB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TSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7Q0FDeEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbInZhciBjbG9uZSA9IChmdW5jdGlvbigpIHtcbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDbG9uZXMgKGNvcGllcykgYW4gT2JqZWN0IHVzaW5nIGRlZXAgY29weWluZy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHN1cHBvcnRzIGNpcmN1bGFyIHJlZmVyZW5jZXMgYnkgZGVmYXVsdCwgYnV0IGlmIHlvdSBhcmUgY2VydGFpblxuICogdGhlcmUgYXJlIG5vIGNpcmN1bGFyIHJlZmVyZW5jZXMgaW4geW91ciBvYmplY3QsIHlvdSBjYW4gc2F2ZSBzb21lIENQVSB0aW1lXG4gKiBieSBjYWxsaW5nIGNsb25lKG9iaiwgZmFsc2UpLlxuICpcbiAqIENhdXRpb246IGlmIGBjaXJjdWxhcmAgaXMgZmFsc2UgYW5kIGBwYXJlbnRgIGNvbnRhaW5zIGNpcmN1bGFyIHJlZmVyZW5jZXMsXG4gKiB5b3VyIHByb2dyYW0gbWF5IGVudGVyIGFuIGluZmluaXRlIGxvb3AgYW5kIGNyYXNoLlxuICpcbiAqIEBwYXJhbSBgcGFyZW50YCAtIHRoZSBvYmplY3QgdG8gYmUgY2xvbmVkXG4gKiBAcGFyYW0gYGNpcmN1bGFyYCAtIHNldCB0byB0cnVlIGlmIHRoZSBvYmplY3QgdG8gYmUgY2xvbmVkIG1heSBjb250YWluXG4gKiAgICBjaXJjdWxhciByZWZlcmVuY2VzLiAob3B0aW9uYWwgLSB0cnVlIGJ5IGRlZmF1bHQpXG4gKiBAcGFyYW0gYGRlcHRoYCAtIHNldCB0byBhIG51bWJlciBpZiB0aGUgb2JqZWN0IGlzIG9ubHkgdG8gYmUgY2xvbmVkIHRvXG4gKiAgICBhIHBhcnRpY3VsYXIgZGVwdGguIChvcHRpb25hbCAtIGRlZmF1bHRzIHRvIEluZmluaXR5KVxuICogQHBhcmFtIGBwcm90b3R5cGVgIC0gc2V0cyB0aGUgcHJvdG90eXBlIHRvIGJlIHVzZWQgd2hlbiBjbG9uaW5nIGFuIG9iamVjdC5cbiAqICAgIChvcHRpb25hbCAtIGRlZmF1bHRzIHRvIHBhcmVudCBwcm90b3R5cGUpLlxuKi9cbmZ1bmN0aW9uIGNsb25lKHBhcmVudCwgY2lyY3VsYXIsIGRlcHRoLCBwcm90b3R5cGUpIHtcbiAgdmFyIGZpbHRlcjtcbiAgaWYgKHR5cGVvZiBjaXJjdWxhciA9PT0gJ29iamVjdCcpIHtcbiAgICBkZXB0aCA9IGNpcmN1bGFyLmRlcHRoO1xuICAgIHByb3RvdHlwZSA9IGNpcmN1bGFyLnByb3RvdHlwZTtcbiAgICBmaWx0ZXIgPSBjaXJjdWxhci5maWx0ZXI7XG4gICAgY2lyY3VsYXIgPSBjaXJjdWxhci5jaXJjdWxhclxuICB9XG4gIC8vIG1haW50YWluIHR3byBhcnJheXMgZm9yIGNpcmN1bGFyIHJlZmVyZW5jZXMsIHdoZXJlIGNvcnJlc3BvbmRpbmcgcGFyZW50c1xuICAvLyBhbmQgY2hpbGRyZW4gaGF2ZSB0aGUgc2FtZSBpbmRleFxuICB2YXIgYWxsUGFyZW50cyA9IFtdO1xuICB2YXIgYWxsQ2hpbGRyZW4gPSBbXTtcblxuICB2YXIgdXNlQnVmZmVyID0gdHlwZW9mIEJ1ZmZlciAhPSAndW5kZWZpbmVkJztcblxuICBpZiAodHlwZW9mIGNpcmN1bGFyID09ICd1bmRlZmluZWQnKVxuICAgIGNpcmN1bGFyID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIGRlcHRoID09ICd1bmRlZmluZWQnKVxuICAgIGRlcHRoID0gSW5maW5pdHk7XG5cbiAgLy8gcmVjdXJzZSB0aGlzIGZ1bmN0aW9uIHNvIHdlIGRvbid0IHJlc2V0IGFsbFBhcmVudHMgYW5kIGFsbENoaWxkcmVuXG4gIGZ1bmN0aW9uIF9jbG9uZShwYXJlbnQsIGRlcHRoKSB7XG4gICAgLy8gY2xvbmluZyBudWxsIGFsd2F5cyByZXR1cm5zIG51bGxcbiAgICBpZiAocGFyZW50ID09PSBudWxsKVxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICBpZiAoZGVwdGggPT0gMClcbiAgICAgIHJldHVybiBwYXJlbnQ7XG5cbiAgICB2YXIgY2hpbGQ7XG4gICAgdmFyIHByb3RvO1xuICAgIGlmICh0eXBlb2YgcGFyZW50ICE9ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gcGFyZW50O1xuICAgIH1cblxuICAgIGlmIChjbG9uZS5fX2lzQXJyYXkocGFyZW50KSkge1xuICAgICAgY2hpbGQgPSBbXTtcbiAgICB9IGVsc2UgaWYgKGNsb25lLl9faXNSZWdFeHAocGFyZW50KSkge1xuICAgICAgY2hpbGQgPSBuZXcgUmVnRXhwKHBhcmVudC5zb3VyY2UsIF9fZ2V0UmVnRXhwRmxhZ3MocGFyZW50KSk7XG4gICAgICBpZiAocGFyZW50Lmxhc3RJbmRleCkgY2hpbGQubGFzdEluZGV4ID0gcGFyZW50Lmxhc3RJbmRleDtcbiAgICB9IGVsc2UgaWYgKGNsb25lLl9faXNEYXRlKHBhcmVudCkpIHtcbiAgICAgIGNoaWxkID0gbmV3IERhdGUocGFyZW50LmdldFRpbWUoKSk7XG4gICAgfSBlbHNlIGlmICh1c2VCdWZmZXIgJiYgQnVmZmVyLmlzQnVmZmVyKHBhcmVudCkpIHtcbiAgICAgIGNoaWxkID0gbmV3IEJ1ZmZlcihwYXJlbnQubGVuZ3RoKTtcbiAgICAgIHBhcmVudC5jb3B5KGNoaWxkKTtcbiAgICAgIHJldHVybiBjaGlsZDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBwcm90b3R5cGUgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocGFyZW50KTtcbiAgICAgICAgY2hpbGQgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjaGlsZCA9IE9iamVjdC5jcmVhdGUocHJvdG90eXBlKTtcbiAgICAgICAgcHJvdG8gPSBwcm90b3R5cGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNpcmN1bGFyKSB7XG4gICAgICB2YXIgaW5kZXggPSBhbGxQYXJlbnRzLmluZGV4T2YocGFyZW50KTtcblxuICAgICAgaWYgKGluZGV4ICE9IC0xKSB7XG4gICAgICAgIHJldHVybiBhbGxDaGlsZHJlbltpbmRleF07XG4gICAgICB9XG4gICAgICBhbGxQYXJlbnRzLnB1c2gocGFyZW50KTtcbiAgICAgIGFsbENoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgaW4gcGFyZW50KSB7XG4gICAgICB2YXIgYXR0cnM7XG4gICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgYXR0cnMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHByb3RvLCBpKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGF0dHJzICYmIGF0dHJzLnNldCA9PSBudWxsKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY2hpbGRbaV0gPSBfY2xvbmUocGFyZW50W2ldLCBkZXB0aCAtIDEpO1xuICAgIH1cblxuICAgIHJldHVybiBjaGlsZDtcbiAgfVxuXG4gIHJldHVybiBfY2xvbmUocGFyZW50LCBkZXB0aCk7XG59XG5cbi8qKlxuICogU2ltcGxlIGZsYXQgY2xvbmUgdXNpbmcgcHJvdG90eXBlLCBhY2NlcHRzIG9ubHkgb2JqZWN0cywgdXNlZnVsbCBmb3IgcHJvcGVydHlcbiAqIG92ZXJyaWRlIG9uIEZMQVQgY29uZmlndXJhdGlvbiBvYmplY3QgKG5vIG5lc3RlZCBwcm9wcykuXG4gKlxuICogVVNFIFdJVEggQ0FVVElPTiEgVGhpcyBtYXkgbm90IGJlaGF2ZSBhcyB5b3Ugd2lzaCBpZiB5b3UgZG8gbm90IGtub3cgaG93IHRoaXNcbiAqIHdvcmtzLlxuICovXG5jbG9uZS5jbG9uZVByb3RvdHlwZSA9IGZ1bmN0aW9uIGNsb25lUHJvdG90eXBlKHBhcmVudCkge1xuICBpZiAocGFyZW50ID09PSBudWxsKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHZhciBjID0gZnVuY3Rpb24gKCkge307XG4gIGMucHJvdG90eXBlID0gcGFyZW50O1xuICByZXR1cm4gbmV3IGMoKTtcbn07XG5cbi8vIHByaXZhdGUgdXRpbGl0eSBmdW5jdGlvbnNcblxuZnVuY3Rpb24gX19vYmpUb1N0cihvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59O1xuY2xvbmUuX19vYmpUb1N0ciA9IF9fb2JqVG9TdHI7XG5cbmZ1bmN0aW9uIF9faXNEYXRlKG8pIHtcbiAgcmV0dXJuIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiBfX29ialRvU3RyKG8pID09PSAnW29iamVjdCBEYXRlXSc7XG59O1xuY2xvbmUuX19pc0RhdGUgPSBfX2lzRGF0ZTtcblxuZnVuY3Rpb24gX19pc0FycmF5KG8pIHtcbiAgcmV0dXJuIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiBfX29ialRvU3RyKG8pID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcbmNsb25lLl9faXNBcnJheSA9IF9faXNBcnJheTtcblxuZnVuY3Rpb24gX19pc1JlZ0V4cChvKSB7XG4gIHJldHVybiB0eXBlb2YgbyA9PT0gJ29iamVjdCcgJiYgX19vYmpUb1N0cihvKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59O1xuY2xvbmUuX19pc1JlZ0V4cCA9IF9faXNSZWdFeHA7XG5cbmZ1bmN0aW9uIF9fZ2V0UmVnRXhwRmxhZ3MocmUpIHtcbiAgdmFyIGZsYWdzID0gJyc7XG4gIGlmIChyZS5nbG9iYWwpIGZsYWdzICs9ICdnJztcbiAgaWYgKHJlLmlnbm9yZUNhc2UpIGZsYWdzICs9ICdpJztcbiAgaWYgKHJlLm11bHRpbGluZSkgZmxhZ3MgKz0gJ20nO1xuICByZXR1cm4gZmxhZ3M7XG59O1xuY2xvbmUuX19nZXRSZWdFeHBGbGFncyA9IF9fZ2V0UmVnRXhwRmxhZ3M7XG5cbnJldHVybiBjbG9uZTtcbn0pKCk7XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGNsb25lO1xufVxuIl19
},{"buffer":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\build-helpers\\node_modules\\buffer\\index.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\node_modules\\eventemitter2\\lib\\eventemitter2.js":[function(require,module,exports){
/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
'use strict';

;!(function (undefined) {

  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };
  var defaultMaxListeners = 10;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {

      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);
      conf.maxListeners && (this._events.maxListeners = conf.maxListeners);
      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this.newListener = conf.newListener);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    }
  }

  function EventEmitter(conf) {
    this._events = {};
    this.newListener = false;
    configure.call(this, conf);
  }

  //
  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return [];
    }
    var listeners = [],
        leaf,
        len,
        branch,
        xTree,
        xxTree,
        isolatedBranch,
        endReached,
        typeLength = type.length,
        currentType = type[i],
        nextType = type[i + 1];
    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return [tree];
      }
    }

    if (currentType === '*' || currentType === '**' || tree[currentType]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (currentType === '*') {
        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i + 1));
          }
        }
        return listeners;
      } else if (currentType === '**') {
        endReached = i + 1 === typeLength || i + 2 === typeLength && nextType === '*';
        if (endReached && tree._listeners) {
          // The next element has a _listeners, add it to the handlers.
          listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
        }

        for (branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            if (branch === '*' || branch === '**') {
              if (tree[branch]._listeners && !endReached) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
              }
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            } else if (branch === nextType) {
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i + 2));
            } else {
              // No match on this one, shift into the tree but not in the type array.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
            }
          }
        }
        return listeners;
      }

      listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i + 1));
    }

    xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i + 1);
    }

    xxTree = tree['**'];
    if (xxTree) {
      if (i < typeLength) {
        if (xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength);
        }

        // Build arrays of matching next branches and others.
        for (branch in xxTree) {
          if (branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
            if (branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i + 2);
            } else if (branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i + 1);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, { '**': isolatedBranch }, i + 1);
            }
          }
        }
      } else if (xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength);
      } else if (xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    for (var i = 0, len = type.length; i + 1 < len; i++) {
      if (type[i] === '**' && type[i + 1] === '**') {
        return;
      }
    }

    var tree = this.listenerTree;
    var name = type.shift();

    while (name) {

      if (!tree[name]) {
        tree[name] = {};
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        } else if (typeof tree._listeners === 'function') {
          tree._listeners = [tree._listeners, listener];
        } else if (isArray(tree._listeners)) {

          tree._listeners.push(listener);

          if (!tree._listeners.warned) {

            var m = defaultMaxListeners;

            if (typeof this._events.maxListeners !== 'undefined') {
              m = this._events.maxListeners;
            }

            if (m > 0 && tree._listeners.length > m) {

              tree._listeners.warned = true;
              console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', tree._listeners.length);
              console.trace();
            }
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  }

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function (n) {
    this._events || init.call(this);
    this._events.maxListeners = n;
    if (!this._conf) this._conf = {};
    this._conf.maxListeners = n;
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function (event, fn) {
    this.many(event, 1, fn);
    return this;
  };

  EventEmitter.prototype.many = function (event, ttl, fn) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      fn.apply(this, arguments);
    }

    listener._origin = fn;

    this.on(event, listener);

    return self;
  };

  EventEmitter.prototype.emit = function () {

    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener' && !this.newListener) {
      if (!this._events.newListener) {
        return false;
      }
    }

    // Loop through the *_all* functions and invoke them.
    if (this._all) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        this._all[i].apply(this, args);
      }
    }

    // If there is no 'error' event listener then throw.
    if (type === 'error') {

      if (!this._all && !this._events.error && !(this.wildcard && this.listenerTree.error)) {

        if (arguments[1] instanceof Error) {
          throw arguments[1]; // Unhandled 'error' event
        } else {
          throw new Error('Uncaught, unspecified \'error\' event.');
        }
        return false;
      }
    }

    var handler;

    if (this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      if (arguments.length === 1) {
        handler.call(this);
      } else if (arguments.length > 1) switch (arguments.length) {
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        // slower
        default:
          var l = arguments.length;
          var args = new Array(l - 1);
          for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
          handler.apply(this, args);
      }
      return true;
    } else if (handler) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        this.event = type;
        listeners[i].apply(this, args);
      }
      return listeners.length > 0 || !!this._all;
    } else {
      return !!this._all;
    }
  };

  EventEmitter.prototype.on = function (type, listener) {

    if (typeof type === 'function') {
      this.onAny(type);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if (this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    } else if (typeof this._events[type] === 'function') {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    } else if (isArray(this._events[type])) {
      // If we've already got an array, just append.
      this._events[type].push(listener);

      // Check for listener leak
      if (!this._events[type].warned) {

        var m = defaultMaxListeners;

        if (typeof this._events.maxListeners !== 'undefined') {
          m = this._events.maxListeners;
        }

        if (m > 0 && this._events[type].length > m) {

          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
          console.trace();
        }
      }
    }
    return this;
  };

  EventEmitter.prototype.onAny = function (fn) {

    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if (!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    this._all.push(fn);
    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype.off = function (type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,
        leafs = [];

    if (this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
    } else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({ _listeners: handlers });
    }

    for (var iLeaf = 0; iLeaf < leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener || handlers[i].listener && handlers[i].listener === listener || handlers[i]._origin && handlers[i]._origin === listener) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if (this.wildcard) {
          leaf._listeners.splice(position, 1);
        } else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if (this.wildcard) {
            delete leaf._listeners;
          } else {
            delete this._events[type];
          }
        }
        return this;
      } else if (handlers === listener || handlers.listener && handlers.listener === listener || handlers._origin && handlers._origin === listener) {
        if (this.wildcard) {
          delete leaf._listeners;
        } else {
          delete this._events[type];
        }
      }
    }

    return this;
  };

  EventEmitter.prototype.offAny = function (fn) {
    var i = 0,
        l = 0,
        fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for (i = 0, l = fns.length; i < l; i++) {
        if (fn === fns[i]) {
          fns.splice(i, 1);
          return this;
        }
      }
    } else {
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function (type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if (this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      for (var iLeaf = 0; iLeaf < leafs.length; iLeaf++) {
        var leaf = leafs[iLeaf];
        leaf._listeners = null;
      }
    } else {
      if (!this._events[type]) return this;
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function (type) {
    if (this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.listenersAny = function () {

    if (this._all) {
      return this._all;
    } else {
      return [];
    }
  };

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function () {
      return EventEmitter;
    });
  } else if (typeof exports === 'object') {
    // CommonJS
    exports.EventEmitter2 = EventEmitter;
  } else {
    // Browser global.
    window.EventEmitter2 = EventEmitter;
  }
})();

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\MappingsField.js":[function(require,module,exports){

/**
 * Describes a single field (column) in the AutoQueryResults data, for mappings purposes.
 */
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MappingsField =

/**
 * @param {MappingsHelper} mappings
 * @param {number} index
 * @param {string} key
 * @param {number} keySeq
 * @param {Object} option (Measure|Grouping)
 */
function MappingsField(mappings, index, key, keySeq, option) {
  _classCallCheck(this, MappingsField);

  /**
   * The option key stored in context.options.items and defined in manifest.options.items.
   * @type {string}
   */
  this.key = key;

  /**
   * The sequence number for the same key, or which 'tier' of the option key this column represents,
   * typically zero unless there are multiple items configured for a 'list' type key.
   * @type {number}
   */
  this.keySeq = keySeq;

  /**
   * The column index in the output data
   * @type {number}
   */
  this.index = index;

  /**
   * The schema object for this output column
   * @type {Object} a a SchemaField
   */
  var schemaField = mappings.schema.fields[this.index]; // no longer exposed, redundant (see below)

  /**
   * The name of the field in the output query, typically debug purposes only
   * @type {string}
   */
  this.name = schemaField.name;

  /**
   * The data type of the output field, which may differ from the source field e.g. certain aggregation functions
   * can return numbers for text fields.
   * TEXT, NUMBER, DATE, RANGE_NUMBER, RANGE_DATE
   * From SchemaField.type.
   * @type {string}
   */
  this.type = schemaField.type;

  /**
   * The measure or grouping that created this output column.
   * @type {Object} a Measure or Grouping
   */
  this.option = option;
};

module.exports = MappingsField;

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\MappingsHelper.js":[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MappingsField = require("./MappingsField");
var MappingsKey = require("./MappingsKey");
var autoQueryBuilding = require("./autoQueryBuilding");

/**
 * End user helper presented as omniscope.view.mappings() for interpreting auto query results.
 */

var MappingsHelper =

// PENDING: halfway through reorganising, need to have keys always and have not mix field with fields pattern

function MappingsHelper(context) {
    var _this = this;

    _classCallCheck(this, MappingsHelper);

    /**
     * The schema returned in AutoQueryResult.data.schema which should always apply to both data and shadowData
     * (if present).
     * @type {Object} a SchemaFieldsQueryOutput
     */
    this.schema = context.result.data.schema;

    /**
     * The number of columns in the output data
     * @type {Number}
     */
    this.width = this.schema.fields.length;

    /**
     * @type {Object.<string, MappingsKey>} a map of string key to MappingsKey helper object for that option key,
     * including those not present as fields in the result (for options not configured).
     */
    this.keys = {};

    /**
     * Array respective to columns in result data, containing the MappingsField helper object for that column.
     * @type {Array.<MappingsField>}
     */
    this.fields = new Array(this.width);

    // Go through all auto-query options defined in the manifest, even if not currently configured...
    Object.keys(context.manifest.options.items).forEach(function (key) {
        if (!autoQueryBuilding.includeOptionInAutoQuery(context, key)) return;

        var optionDef = context.manifest.options.items[key];

        var mk = new MappingsKey(key, optionDef);
        _this.keys[key] = mk;

        // Get the option value(s):
        var options = context.options.items[key]; // null/undefined if not currently configured
        if (Array.isArray(options) && options.length === 0) options = null; // treat empty array as per unconfigured

        if (options) {
            // This option has been configured and will have one or more fields in the reuslt.

            var indexes = context.result.mappings[key];
            if (!optionDef.list) indexes = [indexes];

            indexes.forEach(function (index, keySeq) {
                var option = options;
                if (optionDef.list) option = option[keySeq];

                var f = new MappingsField(_this, index, key, keySeq, option);
                _this.fields[index] = f;
                mk.fields.push(f);
            });

            if (!optionDef.list) {
                mk.field = mk.fields[0]; // single field
            }
        }
    });
};

module.exports = MappingsHelper;

},{"./MappingsField":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\MappingsField.js","./MappingsKey":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\MappingsKey.js","./autoQueryBuilding":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\autoQueryBuilding.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\MappingsKey.js":[function(require,module,exports){

/**
 * Describes an option key and the field(s) it maps to.
 * There is always a MappingsKey for every option, even if the option hasn't been configured.
 */
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MappingsKey =

/**
 * @param {MappingsHelper} mappings
 * @param {string} key
 * @param {Object} the OptionDefinition from the manifest
 */
function MappingsKey(key, optionDef) {
  _classCallCheck(this, MappingsKey);

  /**
   * The option key stored in context.options.items and defined in manifest.options.items.
   * @type {string}
   */
  this.key = key;

  /**
   * @type {Object} the OptionDefinition from the manifest
   */
  this.optionDef = optionDef;

  /**
   * Non-null array of MappingsField(s) corresponding to this key.
   * Empty if this option isn't configured by the user.
   * @type {Array.<MappingsField>}
   */
  this.fields = [];

  /**
   * The single MappingsField, or null if the option is a list, or not configured by the user.
   * @type {null}
   */
  this.field = null;
};

module.exports = MappingsKey;

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\autoQueryBuilding.js":[function(require,module,exports){
"use strict";

var clone = require("@visokio/common/src/util/clone");

module.exports = {

    includeOptionInAutoQuery: function includeOptionInAutoQuery(context, key /*: string*/) {
        // Skip special auto-pane properties never used in auto-query, even when not auto-paning:
        if (key === "paneX" || key === "paneY") return false;

        var def = context.manifest.options.items[key]; // OptionDefinition
        if (def.type !== "GROUPING" && def.type !== "MEASURE") return false; // not a query-driving option
        return true;
    },

    /**
     * Builds the SimpleQuery for auto-query, and simultaneously builds the AutoQueryResults.mappings object
     * describing how column indexes map.
     *
     * We take all the options that are GROUPING type, and add these as groupings, which become the first series of columns
     * in the query result.
     * We then take all the options that are MEASURE type, and add these as measures, which become the subsequent series
     * of columns in the query result.
     * Options are ordered alphabetically by their key string, for consistency cross-browser.
     * Where an option is a list type, this produces an array of groupings or measures, so we map to an array of indexes
     * (which may often be length 1 if the user only chose a single item in the list).
     *
     * @param  {Object} context a ViewApiContext
     * @param {Object} query An empty SimpleQuery object to populate with measures and groupings
     * @param {Object} mappings An empty object to put the mappings (String option key mapping to index or array of indices)
     */
    buildAutoQuery: function buildAutoQuery(context, query, mappings) {
        var _this = this;

        // In case the caller doesn't care about either:
        query = query || {};
        mappings = mappings || {};

        // Start with empty measures & groupings
        query.measures = [];
        query.groupings = [];

        // These two hold the temporary mappings with relative indexes
        var measureMappings = {}; // Map of key to (Integer|Array.<Integer>)
        var groupingMappings = {}; // Map of key to (Integer|Array.<Integer>)

        var nextId = 1; // for unique field names

        // Sort in natural String order. It's not in the spec, and you don't need it (we have mappings),
        // but it makes behaviour consistent.
        Object.keys(context.options.items).sort().forEach(function (key) {
            if (!_this.includeOptionInAutoQuery(context, key)) return;

            var val = context.options.items[key]; // either a Measure or Grouping, or array thereof (depending on def.list)
            if (!val) return; // Optional option, with explicit null. Not sure if this arises, but skip.

            var def = context.manifest.options.items[key]; // OptionDefinition

            var queryDestinationArray = def.type === "GROUPING" ? query.groupings : query.measures;
            var tempMappings = def.type === "GROUPING" ? groupingMappings : measureMappings;

            /**
             * Clones and mutates the Grouping or Measure to have a unique name in this query
             * @param opt
             */
            var giveName = function giveName(opt) {
                opt = clone(opt);
                if (def.type === "MEASURE") {
                    // Options has plain Measure, query API requires TableMeasure (with name property added)
                    // So we need to update the type before adding name:
                    opt["@visokiotype"] = "QueryApi.TableMeasure";
                }
                opt.name = "_" + nextId++ + // unique name, and also add the following for debug:
                "_" + key + (opt.name ? "_" + opt.name : "");
                return opt;
            };

            if (def.list) {
                if (val.length === 0) return; // Don't create meaningless keys

                // val is an array of groupings or measures.
                tempMappings[key] = [];
                val.forEach(function (oneVal) {
                    var index = queryDestinationArray.length;
                    tempMappings[key].push(index);
                    queryDestinationArray.push(giveName(oneVal));
                });
            } else {
                // We have a single grouping or measure, modelled without an enclosing array
                var index = queryDestinationArray.length;
                tempMappings[key] = index;
                queryDestinationArray.push(giveName(val));
            }
        });

        // TODO: sort by some default order, perhaps configurable in manifest, and/or user sorts

        // Make index mappings absolute, and combine. Grouping columns always come before Measure columns.
        // So Grouping mappings are already valid:
        Object.keys(groupingMappings).forEach(function (key) {
            var indexOrIndexes = groupingMappings[key];
            mappings[key] = indexOrIndexes; // whether array or single index, just copy (already absolute)
        });
        var offset = query.groupings.length;
        Object.keys(measureMappings).forEach(function (key) {
            var indexOrIndexes = measureMappings[key];
            if (Array.isArray(indexOrIndexes)) {
                indexOrIndexes.forEach(function (val, i) {
                    indexOrIndexes[i] += offset;
                });
            } else {
                indexOrIndexes += offset;
            }
            mappings[key] = indexOrIndexes;
        });
    }

};

},{"@visokio/common/src/util/clone":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\clone.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\data.js":[function(require,module,exports){
"use strict";

var filters = require("./filters");

/**
 * Default value if ViewApiManifest.dataLimit is undefined. Number of rows to limit query to.
 * If it takes effect a watermark is shown.
 * Should match bean default.
 */
var DEFAULT_DATA_LIMIT = 10000;

/**
 * Check if two object change, currently just a JSON.stringify check between them
 * @private
 * @param  {Object} a
 * @param  {Object} b
 * @return {boolean}
 */
function changed(a, b) {
    return JSON.stringify(a) !== JSON.stringify(b);
}

module.exports = {

    /**
     * Truncate a records array if needed, it will return true for truncated data and false if it is not.
     * @param  {Object} records Array of records (rows)
     * @param  {number} limit    Number of max rows
     * @return {boolean}
     */
    truncateRecords: function truncateRecords(_ref) {
        var records = _ref.records;
        var limit = _ref.limit;

        if (!records) {
            // No data to truncate
            return false;
        }
        if (limit && records.length > limit) {
            records = records.slice(0, limit);
            return true;
        }
        return false;
    },

    getData: function getData(context) {
        return context.result.data;
    },

    getShadowData: function getShadowData(context) {
        return context.result.shadowData;
    },

    /**
     * Updathe the context instance with the schema
     * @param {Object} context
     * @param {Object} response
     */
    setSchema: function setSchema(_ref2) {
        var context = _ref2.context;
        var schema = _ref2.schema;

        // Transform the api response:
        //      [{field: "string", type: "string"}]
        // into :
        //      {"field": { field: "stirng", type: "string" }}
        //
        // For easier use
        var result = schema.reduce(function (result, item) {
            result[item.name] = item;
            return result;
        }, {});

        context.result.schema = result;
        return this;
    },

    /**
     * Check if between the previous and the current context something change that affects the query api,
     * probalby resulting on a new query  beiung executed
     * @param {Object} previous
     * @param {Object} current
     * @return {boolean}
     */
    queryParamsOrBrushingChange: function queryParamsOrBrushingChange(previous, current) {

        return changed(filters.getFilter(previous), filters.getFilter(current)) || changed(previous.options, current.options) || changed(filters.getShadowFilter(previous), filters.getShadowFilter(current));
    },

    getLimit: function getLimit(context) {

        var dataLimit = context.manifest.dataLimit,
            limit = DEFAULT_DATA_LIMIT;

        if (dataLimit === null) limit = 0;

        if (dataLimit !== undefined) {
            limit = dataLimit;
        }

        return limit;
    }
};

},{"./filters":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\filters.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\filters.js":[function(require,module,exports){
"use strict";

var clone = require("clone");

module.exports = {

    getFilter: function getFilter(context) {
        return context.dataConfig.filter ? clone(context.dataConfig.filter) : null;
    },

    getShadowFilter: function getShadowFilter(context) {
        return context.dataConfig.shadowFilter ? clone(context.dataConfig.shadowFilter) : null;
    }

};

},{"clone":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\node_modules\\clone\\clone.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\index.js":[function(require,module,exports){
"use strict";

module.exports = {

    filters: require("./filters"),
    data: require("./data"),
    queries: require("./queries"),
    MappingsHelper: require("./MappingsHelper"),
    autoQueryBuilding: require("./autoQueryBuilding"),

    hasShadow: function hasShadow(context) {
        return !!this.filters.getShadowFilter(context);
    }
};

},{"./MappingsHelper":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\MappingsHelper.js","./autoQueryBuilding":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\autoQueryBuilding.js","./data":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\data.js","./filters":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\filters.js","./queries":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\queries.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\onerror.js":[function(require,module,exports){

/**
 * Helper for registering the window.onerror handler for both IFRAME pane cells for non-native views, and the
 * embedded browser for swing jxbrowser embedded view container.
 */
"use strict";

module.exports = {

    /**
     * @param {function({message: string, internal: *})} handler A function that is called when an error occurs.
     * The single argument is an object {message, internal} as per Container API error object spec.
     */
    register: function register(handler) {

        // NB. using addEventListener results in an event that isn't as well defined as using onerror.
        window.onerror = function (errorMessage, url, lineNumber, colNumber, err) {

            try {
                // Create an error object as specified by the Container API.
                // This is  { message, internal}  corresponding to the two arguments to omniscope.view.error(),
                // and becomes event.data when emitted by container, or is the payload when sent via cometd.
                var payload = {
                    message: errorMessage,
                    internal: {
                        errorMessage: errorMessage, url: url, lineNumber: lineNumber, colNumber: colNumber // regular arguments
                    }
                };
                if (err) {
                    // a browser that gives us an Error object here
                    // Add all possible vendor props as extra props:
                    payload.internal.err = {
                        message: err.message,
                        fileName: err.fileName,
                        lineNumber: err.lineNumber,
                        columnNumber: err.columnNumber,
                        name: err.name,
                        description: err.description,
                        number: err.number,
                        stack: err.stack
                    };
                }
                handler(payload);
            } catch (crazy) {
                // Don't let errors with error handler cause further problems!
                console.log("Error with error handler:"); // nb. console.log(multiple,arguments) doesn't work in jxbrowser
                console.log(crazy);
            }

            // and allow browser to handle original error also (don't return true)
        };
    }
};

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\queries.js":[function(require,module,exports){
"use strict";

var autoQueryBuilding = require("./autoQueryBuilding");

/**
 * Wrap a value in an array if is not one already. If its not an array it will return an empty one
 * @param  {*} value
 * @return {Array}
 */
function wrap(value) {
    if (!value) return [];
    return value.constructor !== Array ? [value] : value;
}

module.exports = {

    /**
     * Builds the SimpleQuery needed for auto-query.
     * Takes all groupings and measures from the options in the context.
     * @param  {Object} context a ViewApiContext
     * @param  {Object=} filter a Filter; if not supplied the view's current filters are used.
     * @return {Object} a SimpleQuery
     */
    table: function table(context, filter) {

        var dataConfig = context.dataConfig;

        filter = filter || dataConfig.filter;

        var query = {
            filter: filter || null
        };

        autoQueryBuilding.buildAutoQuery(context, query, null); // don't care about mappings

        return query;
    },

    /**
     * Builds the mappings corresponding to #table().
     * This maps the option key name to the index or array of indexes representing the column(s) in the query result.
     * @param  {Object} context a ViewApiContext
     * @return {Object} a map of key to number or array of numbers.
     */
    tableMappings: function tableMappings(context) {
        var mappings = {};
        autoQueryBuilding.buildAutoQuery(context, null, mappings); // don't care about query
        return mappings;
    },

    /**
     * Builds the GridQueryInput needed for auto-paning and optionally auto-query (as cell queries).
     * @param  {Object} context a ViewApiContext
     * @param  {boolean} autoQuery True to populate the cell queries with the SimpleQuery(s) needed for autoquery
     * @return {Object} a GridQueryInput
     */
    grid: function grid(context, autoQuery) {

        var result,
            dataConfig = context.dataConfig,
            options = context.options,
            items,
            paneFilter,
            axes = [];

        if (!options || !options.items) throw new Error("No options defined for the view");

        items = options.items;

        axes.push({ groupings: items.paneY ? wrap(items.paneY) : [] });
        axes.push({ groupings: items.paneX ? wrap(items.paneX) : [] });

        paneFilter = dataConfig.shadowFilter || dataConfig.filter;

        result = {
            input: paneFilter ? { filter: paneFilter } : null,
            axes: axes,
            cellQueries: {}
        };

        if (autoQuery) {

            result.cellQueries.query = this.table(context, dataConfig.filter);
            if (dataConfig.shadowFilter) {
                result.cellQueries.shadowQuery = this.table(context, dataConfig.shadowFilter);
            }
        }

        return result;
    }
};

},{"./autoQueryBuilding":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\autoQueryBuilding.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\event\\EventEmitter.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventEmitter2 = require("eventemitter2").EventEmitter2;

var EventEmitter = (function () {
    function EventEmitter() {
        _classCallCheck(this, EventEmitter);

        this._emitter = new EventEmitter2({
            wildcards: true,
            delimiter: ".",
            maxListeners: 10
        });
    }

    _createClass(EventEmitter, [{
        key: "on",

        // Note: some of these methods must not change since they are part of the public API and
        // exposed via subclass Api.js (seen as omniscope.view) and documented in /Views/docs/api/js/view.js

        // DOCUMENTED IN /Views/docs/api/js/view.js
        value: function on(types, listener) {
            var _this = this;

            (types.constructor === Array ? types : [types]).forEach(function (type) {
                _this._emitter.on(type, listener);
            });
            return this;
        }
    }, {
        key: "once",

        // DOCUMENTED IN /Views/docs/api/js/view.js
        value: function once(type, listener) {
            this._emitter.once(type, listener);
            return this;
        }
    }, {
        key: "any",
        value: function any(listener) {
            this._emitter.onAny(listener);
            return this;
        }
    }, {
        key: "off",

        // DOCUMENTED IN /Views/docs/api/js/view.js
        value: function off(types, listener) {
            var _this2 = this;

            (types.constructor === Array ? types : [types]).forEach(function (type) {
                return _this2._emitter.off(type, listener);
            });
            return this;
        }
    }, {
        key: "redispatch",
        value: function redispatch(types, target) {
            var _this3 = this;

            (types.constructor === Array ? types : [types]).forEach(function (type) {
                return _this3.on(type, function (event) {
                    return target.emit(event.type, event.data);
                });
            });
            return this;
        }
    }, {
        key: "none",
        value: function none(listener) {
            this._emitter.offAny(listener);
            return this;
        }
    }, {
        key: "maxListeners",
        value: function maxListeners(number) {
            this._emitter.maxListeners(number);
            return this;
        }
    }, {
        key: "removeAllListeners",
        value: function removeAllListeners(event) {
            this._emitter.removeAllListeners(event);
            return this;
        }
    }, {
        key: "emit",
        value: function emit(type, data) {
            if (data instanceof Error) {
                this._emitter.emit(type, data);
            } else {
                this._emitter.emit(type, { type: type, target: this, data: data });
            }
            return this;
        }
    }]);

    return EventEmitter;
})();

module.exports = EventEmitter;

},{"eventemitter2":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\node_modules\\eventemitter2\\lib\\eventemitter2.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\clone.js":[function(require,module,exports){
"use strict";

module.exports = require("clone");

},{"clone":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\node_modules\\clone\\clone.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\dom.js":[function(require,module,exports){
"use strict";

module.exports = {

    getStyle: function getStyle(element, prop) {

        var result = "";

        if (element.currentStyle) {
            result = element.currentStyle[prop];
        } else if (window.getComputedStyle) {
            result = document.defaultView.getComputedStyle(element, null).getPropertyValue(prop);
        }

        var valueList = result.split(" ").map(function (value) {
            return value.indexOf("px") ? +value.replace("px", "") : value;
        });

        return valueList.length <= 1 ? valueList[0] : valueList;
    },

    getPadding: function getPadding(element) {

        return [this.getStyle(element, "padding-top"), this.getStyle(element, "padding-right"), this.getStyle(element, "padding-bottom"), this.getStyle(element, "padding-left")];
    },

    /**
     * Render the given string as html anbd return it as an array if the template produces
     * a list of element or as a single one is the template has one root element
     * @param  {string} template
     * @return {HTMLElement}
     */
    render: function render(template) {

        var dummy = document.createElement("div");
        dummy.innerHTML = template;

        return dummy.children.length > 1 ? dummy.children : dummy.children[0];
    }
};

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\events.js":[function(require,module,exports){

/**
 * Normalize the given wheel event so all the we got the same object no matter what browser we use
 * TODO: Replace empty object with custom or mouse event and remove IE < 9 checks since we dont support them
 * (make sure it doenst actually handle other browsers)
 * @param  {MouseEvent} event
 * @return {Object}
 */
"use strict";

function normalize(event) {

    var deltaX = "deltaX" in event ? event.deltaX :
    // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
    "wheelDeltaX" in event ? -event.wheelDeltaX : 0;

    var deltaY = "deltaY" in event ? event.deltaY :
    // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
    "wheelDeltaY" in event ? -event.wheelDeltaY :
    // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
    "wheelDelta" in event ? -event.wheelDelta : 0;

    return {
        target: event.target,
        currentTarget: event.currentTarget,
        originalEvent: event,
        deltaX: deltaX,
        deltaY: deltaY,
        deltaZ: null,
        preventDefault: event.preventDefault,
        stopPropagation: event.stopPropagation
    };
}

module.exports = {

    /**
     * Attach an event listener to the wheel in a croxxbrowser way
     * @param {ELement} element
     * @param {Function} handler
     * @param {boolean} capture
     * @param {Object} context
     */
    addWheelListener: function addWheelListener(element, handler, capture, context) {
        var _this = this;

        var type = "onwheel" in document ? "wheel" : "mousewheel";
        element.addEventListener(type, function (event) {
            return handler.call(context || _this, normalize(event));
        }, capture);
    },

    /**
     * Remove all the mouse wheel listeners form the given element
     * @param  {HTMLElement} element
     */
    removeWheelListeners: function removeWheelListeners(element) {
        element.onwheel = null;
        element.onmousewheel = null;
    }
};

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\logger.js":[function(require,module,exports){


/**
 * Basic logger class that will log messages in teh console if its enabled, if not it will do nothing. Used
 * for debugging purpouses in some projects like tha communicaton and the paning
 */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logger = (function () {

  /**
   * @param  {satring} name Name of the logger
   * @param  {boolean} enabled
   */

  function Logger(name) {
    _classCallCheck(this, Logger);

    /**
     * Name that will be appended in the logs of the console
     * @type {string}
     * @private
     */
    this._name = name;

    /**
     * If true the logger will show the messages in teh console
     * @type {boolean}
     * @private
     */
    this._enabled = false;
  }

  _createClass(Logger, [{
    key: "enable",

    /**
     * If true enable the logger so it logs the messages in the console
     * @param  {boolean} value
     * @return {Logger}
     */
    value: function enable(value) {
      this._enabled = value;
      return this;
    }
  }, {
    key: "log",

    /**
     * Equivalent to console.log
     * @param  {*} args  Same parameters as console.log can receive
     * @return {Logger}
     */
    value: function log() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (this._enabled) console.log.apply(console, [this._name + " :"].concat(args));
      return this;
    }
  }, {
    key: "info",

    /**
     * Equivalent to console.info
     * @param  {*} args  Same parameters as console.info can receive
     * @return {Logger}
     */
    value: function info() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      if (this._enabled) console.info.apply(console, [this._name + " :"].concat(args));
      return this;
    }
  }, {
    key: "warn",

    /**
     * Equivalent to console.warn
     * @param  {*} args  Same parameters as console.warn can receive
     * @return {Logger}
     */
    value: function warn() {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      if (this._enabled) console.warn.apply(console, [this._name + " :"].concat(args));
      return this;
    }
  }, {
    key: "error",

    /**
     * Equivalent to console.error
     * @param  {*} args  Same parameters as console.error can receive
     * @return {Logger}
     */
    value: function error() {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      if (this._enabled) console.error.apply(console, [this._name + " :"].concat(args));
      return this;
    }
  }]);

  return Logger;
})();

module.exports = {

  /**
   * Create a new logger with the given name
   * @param  {string} name
   * @return {Logger}
   */
  create: function create(name) {
    return new Logger(name);
  }
};

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\url.js":[function(require,module,exports){
"use strict";

module.exports = {
    parse: function parse() {
        if (!window || !window.location || !window.location.search) return {};
        return window.location.search.replace(/^\?/, "").split("&").reduce(function (o, paramAndValue) {
            var arr = paramAndValue.split("=");
            o[arr[0]] = arr[1];
            return o;
        }, {});
    }
};

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\useragent.js":[function(require,module,exports){
"use strict";

var _isIOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
var _isAndroid = /Android/g.test(navigator.userAgent);

module.exports = {
    isIOS: function isIOS() {
        return _isIOS;
    },
    isAndroid: function isAndroid() {
        return _isAndroid;
    },
    // Curttin the mustard : http://responsivenews.co.uk/post/18948466399/cutting-the-mustard
    isModern: function isModern() {
        return "visibilityState" in document; // IE10+
    }
};

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\xhr\\Request.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var EventEmitter = require("../event/EventEmitter");

// List of the possible status of the request
var STATUS = {
    NEW: "new",
    SENT: "sent",
    LOADED: "loaded",
    ERROR: "error"
};

/**
 * Class used to make ajax requests to the server
 */

var Request = (function (_EventEmitter) {

    /**
     * @param {string} url   Full url to the queyr api endpoint with version and method
     * @param {Object} data  Data to be send in the request, iut can be an JSON object, a FormData, etc.
     */

    function Request(_ref) {
        var url = _ref.url;
        var method = _ref.method;
        var data = _ref.data;
        var respContentType = _ref.respContentType;
        var contentType = _ref.contentType;

        _classCallCheck(this, Request);

        _get(Object.getPrototypeOf(Request.prototype), "constructor", this).call(this);

        /**
         * Url used for the call
         * @private
         * @type {string}
         */
        this._url = url;

        /**
         * Method used in the ajax call, by default GET
         * @private
         * @type {string}
         */
        this._method = method || "GET";

        /**
         * Object with the options for the call
         * @private
         * @type {Object}
         */
        this._data = data || "";

        /**
         * Status of the request, new when you create the Request instance,
         * sent when you execute the request, loaded when it loads or error when somethign
         * fails
         * @type {string}
         * @private
         */
        this._status = STATUS.NEW;

        /**
         * Type of the response, JSON by default. Can also be string for no parsing.
         * @type {string}
         * @private
         */
        this._type = respContentType || "json";

        /**
         * Content type header to use
         * @type {string}
         * @private
         */
        this._contentType = contentType || "";

        /**
         * Response for the request
         * @type {Object}
         * @private
         */
        this._response = null;

        /**
         * Error object that descirbes the problem with the request
         * @type {Object}
         * @private
         */
        this._error = null;

        /**
         * XMLHttpRequest object used to make the request to the server
         * @private
         * @type {XMLHttpRequest}
         */
        this._xhr = new XMLHttpRequest();

        // Add listeners for both the load and the error events
        this._xhr.addEventListener("load", this._loadHandler.bind(this));
        this._xhr.addEventListener("upload", this._uploadHandler.bind(this));
        this._xhr.addEventListener("error", this._errorHandler.bind(this));
    }

    _inherits(Request, _EventEmitter);

    _createClass(Request, [{
        key: "_internalErrorMessage",

        /**
         * Internal error message to be used in the Omniscope reporting logic. It is
         * formatted in a way that looks more or less good in the Omniscope Mobile
         * reporting dialog.
         * @param {number} code Code for the error, usually an http status code
         * @param {string} text Text response form the query or the error message in case of an exception
         * @return {string}
         */
        value: function _internalErrorMessage(code, text, contentType) {
            if (contentType === "application/json; charset=UTF-8") {
                // This is exactly what we expect from our server
                try {
                    text = JSON.stringify(JSON.parse(text), null, 2);
                } catch (e) {
                    console.log(e);
                }
            }
            return "\n\n" + ("Url:\n" + this._url + "\n\n") + ("Data:\n" + JSON.stringify(this._data, null, 2) + "\n\n") + ("Response:\n(" + code + ")\n" + text + " \n");
        }
    }, {
        key: "_errorHandler",

        /**
         * Handlers error reported by the xhr object by emiting and error event in the this object followed
         * by a finally one.
         * If that error is not handled it will throw and exception as defined in the EventEmitter itself
         * @private
         * @param {Event} event
         */
        value: function _errorHandler(event) {

            console.error("Request error", this._internalErrorMessage(-1, event.message, null));

            this._status = STATUS.ERROR;
            this._error = {
                message: "Error making a request to the server",
                details: this._internalErrorMessage(-1, event.message, null),
                event: event,
                xhr: this._xhr
            };

            this.emit("error", this._error);
            this.emit("end", {});
        }
    }, {
        key: "_uploadHandler",

        /**
         * Handles the upload event form the xhr object that will be dispatched while
         * the browser is sending the data. Mostly usefull to track file uploads
         */
        value: function _uploadHandler(event) {
            this.emit("upload", {
                loaded: event.loaded,
                total: event.total,
                original: event
            });
        }
    }, {
        key: "_loadHandler",

        /**
         * Handles the load of the xhr object by parsing the response as JSON and emiting a load event followed by a
         * finally one. If the server return a status code that is not 200 we will emit and error event.
         * In the same way if we cannot parse the response as JSON an error event will the emitted.
         * @private
         * @param {Event} event
         */
        value: function _loadHandler(event) {

            var xhr = event.target,
                response;

            if (xhr.status !== 200) {

                console.error("Error response", this._internalErrorMessage(xhr.status, xhr.responseText, xhr.getResponseHeader("Content-Type")));

                this._status = STATUS.ERROR;
                this._error = {
                    message: "Error making request to the query api",
                    details: this._internalErrorMessage(xhr.status, xhr.responseText, xhr.getResponseHeader("Content-Type")),
                    event: event
                    //xhr: xhr // we longer include xhr
                };

                this.emit("error", this._error);
            } else {

                try {

                    if (this._type.toLowerCase() === "json") {
                        response = JSON.parse(xhr.responseText);
                    } else {
                        response = xhr.responseText;
                    }
                } catch (e) {

                    console.error("Error parsing response", this._internalErrorMessage(xhr.status, xhr.responseText, null));

                    this._status = STATUS.ERROR;
                    this._error = {
                        message: "Error parsing query api response",
                        details: this._internalErrorMessage(xhr.status, xhr.responseText, xhr.getResponseHeader("Content-Type")),
                        //xhr: xhr, // we longer include xhr
                        error: e
                    };

                    this.emit("error", this._error);
                }

                if (response) {
                    this._status = STATUS.LOADED;
                    this._response = response;
                    this.emit("load", response);
                }
            }

            this.emit("end", {}); // we longer include xhr
        }
    }, {
        key: "_prepareData",

        /**
         * Prepare the data to send bydoing the neccesary transformations, like
         * stringify the json...
         * @param {Object} data
         * @return {string|Object}
         */
        value: function _prepareData(data) {

            if (this._method.toLowerCase() === "get") {
                return "";
            }

            if (data && (data.constructor === Object || Array.isArray(data))) {
                return JSON.stringify(data);
            }

            return data;
        }
    }, {
        key: "_prepareUrl",

        /**
         * Prepare the url with the specified data if the method is get
         * @param {string} url
         * @return {string}
         */
        value: function _prepareUrl(url) {
            var _this = this;

            var params = "";

            if (this._method.toLowerCase() === "get" && this._data && this._data.constructor === Object) {

                params = Object.keys(this._data).map(function (key) {
                    return key + "=" + _this._data[key];
                }).join("&");
            }

            return url + (params ? "?" + params : "");
        }
    }, {
        key: "cancel",

        /**
         * Cancel the current xhr request and emit a cancel event.
         * @return {Request}
         */
        value: function cancel() {
            if (!this._xhr) return this; // disposed
            this._xhr.abort();
            this.emit("cancel", {}); // we longer include xhr
            return this;
        }
    }, {
        key: "dispose",

        /**
         * Dispose this object by removing the event listeners, canceling the request if
         * it is taking place and removing the reference to the xhr object
         */
        value: function dispose() {
            this._xhr.removeEventListener("load", this._loadHandler.bind(this));
            this._xhr.removeEventListener("upload", this._uploadHandler.bind(this));
            this._xhr.removeEventListener("error", this._errorHandler.bind(this));

            // If we dispose while the request is taking place we cancel it.
            if (this._status === STATUS.SENT) {
                this.cancel();
            }

            this._xhr = null;
        }
    }, {
        key: "execute",

        /**
         * Open the xhr object with the query url and POST method, send the options as JSON and then
         * emit an xecute mehtod
         * @return {Request}
         */
        value: function execute() {

            this._xhr.open(this._method, this._prepareUrl(this._url));

            if (this._contentType) {
                //Content-Type	application/json; charset=UTF-8
                this._xhr.setRequestHeader("Content-Type", this._contentType + "; charset=UTF-8");
            }

            this._xhr.send(this._prepareData(this._data));

            this._status = STATUS.SENT;
            this.emit("execute", {}); // we longer include xhr

            return this;
        }
    }, {
        key: "on",
        value: function on(type) {

            // If we want to listen for load or error but the status is already loaded or error
            if (type.indexOf("load") && this._status === STATUS.LOADED) {
                this.emit("load", this._response); // we longer include xhr
            }

            if (type.indexOf("error") && this._status === STATUS.ERROR) {
                this.emit("error", this._error);
            }

            if (type.indexOf("end") && (this._status === STATUS.ERROR || this._status === STATUS.LOADED)) {
                this.emit("end", {}); // we longer include xhr
            }

            _get(Object.getPrototypeOf(Request.prototype), "on", this).apply(this, arguments);
            return this;
        }
    }, {
        key: "status",

        /**
         * Return the current status of the request
         * @return {string}
         */
        get: function get() {
            return this._status;
        }
    }]);

    return Request;
})(EventEmitter);

module.exports = Request;

},{"../event/EventEmitter":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\event\\EventEmitter.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\index.js":[function(require,module,exports){
"use strict";

module.exports = require("./src");

},{"./src":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\index.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\Paning.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var EventEmitter = require("@visokio/common/src/event/EventEmitter");
var events = require("@visokio/common/src/util/events");
var clone = require("@visokio/common/src/util/clone");
var comm = require("@visokio/chart-communication");
var logger = require("@visokio/common/src/util/logger");
var dom = require("@visokio/common/src/util/dom");

var grid = require("./gridBuilder");
var panes = require("./layout/panes");
var contextUtil = require("@visokio/common/src/context");
var watermark = require("./util/watermark");

var paneCell = require("./cell");

/**
 * Class that represents the paning grid. Its the responsable of loading the view itself per pane and pass the messages
 * to it as well as expose the methods needed to interact with the view form outside, for exmaple when you get a message
 * form the public api and you want to send it to the pane itself like update, r esize, etc.
 */

var Paning = (function (_EventEmitter) {

	/**
  *
  * @param  {HTMLELement} parent
  * @param  {Object} context
     * @param  {Function} renderer
     * @param  {boolean} ignoreHeaders
  */

	function Paning(parent, context, renderer, ignoreHeaders) {
		_classCallCheck(this, Paning);

		_get(Object.getPrototypeOf(Paning.prototype), "constructor", this).call(this);

		/**
   * Logger used to debug the paning, disabled by default, to enable pass true here or do this._logger.enable(true)
   * @type {Logger}
   * @private
   */
		this._logger = logger.create("paning@Paning"); //.enable(true);

		/**
   * Id of the view
   * @type {number}
   * @private
   */
		this._id = comm.generateId() + "_" + context.viewInstanceId + "-paning-grid";

		/**
   * HTML element that acts as the parent of the paning grid
   * @type {HTMLElement}]
   * @private
   */
		this._parent = parent;

		/**
   * Current context loaded for the view
   * @type {Object}
   * @private
   */
		this._context = clone(context);

		/**
   * Funciton that will be use dot render each pane
   * @type {Function}
   * @private"
   */
		this._renderer = renderer;

		/**
   * List of the different saections of the "grid", "body", "rowHeaders",
   * "colHeaders" and the "grid" itself
   * @type {Object}
   * @private"
   */
		this._sections = null;

		/**
   * Description of the size of the panes and the total area for them
   * @type {Object}
   * @private
   */
		this._paneSize = null;

		/**
   * True if this._paneSize is valid. False if waiting for size to be retrieved.
   * @type {boolean}
   * @private
   */
		this._paneSizeValid = false;

		/**
   * Current col of the paning grid
   * @type {number}
   * @private
   */
		this._col = 0;

		/**
   * Current row of the paning grid
   * @type {number}
   * @private
   */
		this._row = 0;

		/**
   * List of panes used in the grid
   * @type {Array.<PaneCell>}
   */
		this._panes = [];

		/**
   * Header or headers (depending on the settings) for the paning grid rows
   * @type {Array.<HTMLElement>}
   * @private
   */
		this._rowHeaders = [];

		/**
   * Header or headers (depending on the settings) for the paning grid cols
   * @type {Array.<HTMLElement>}
   * @private
   */
		this._colHeaders = [];

		/**
   * Timer used to debounce the loading of the panes when the grid is scrolled
   * @type {number}
   * @private
   */
		this._scrollTimer = 0;

		this._headerPanes = null;
		this._bodyPanes = null;

		this._scrollHandler = null;

		this._ignoreHeaders = ignoreHeaders;

		this._axes = null;

		/**
   * For controlling sequencing of requests, passed through when data is requested and returned.
   * @type {number}
   * @private
   */
		this._curNeedSizeId = 0;

		/**
   * For controlling sequencing of requests, passed through when data is requested and returned.
   * @type {number}
   * @private
   */
		this._curNeedDataId = 0;

		/**
   * Set to true when loadBodyData has run in non-paning mode.
   * Cleared when it runs in paning mode.
   * Allows dirty quick-fix optimisations to occur that prevent reload, while allowing the
   * same view to be reconfigured for paning and to update properly.
   * @type {boolean}
   * @private
   */
		this._lastLoadBodyDataWasNonPaningMode = false;

		this._logger.info("Panning created");

		// DO the initial load of the opaning grid based on the setitngs form the context
		this._loadGrid(this._context);
	}

	_inherits(Paning, _EventEmitter);

	_createClass(Paning, [{
		key: "_isNonPaningMode",

		/**
   * @return {boolean} True if auto pane is off. I.e. not paning, and not enabled in manifest.
   * @private
   */
		value: function _isNonPaningMode() {
			if (this._ignoreHeaders) return true;

			// Also allow the case of a singleton pane when auto-pane is enabled but paning isn't configured in X/Y
			// to be optimised without reload
			// (Dirty fix until we have React driven paning)

			// TODO: we are referring to paning options, but this is intended to be configurable as a library in future
			// There are other places in this file which refer to paneX/paneY - this should be the responsibility
			// of the container, instead of referring to them here.

			if (this._context.options.items.paneX && this._context.options.items.paneX.length > 0) return false;
			if (this._context.options.items.paneY && this._context.options.items.paneY.length > 0) return false;
			return true;
		}
	}, {
		key: "_newNeedSizeId",
		value: function _newNeedSizeId() {
			this._curNeedSizeId++;
			this._newNeedDataId(); // ensure all existing data requests are discarded.
		}
	}, {
		key: "_newNeedDataId",
		value: function _newNeedDataId() {
			this._curNeedDataId++;
		}
	}, {
		key: "_updateColAndRow",
		value: function _updateColAndRow(col, row) {
			this._col = Math.max(0, Math.min(col, this._paneSize.total.cols - this._paneSize.viewport.cols));
			this._row = Math.max(0, Math.min(row, this._paneSize.total.rows - this._paneSize.viewport.rows));
			this._newNeedDataId();
		}
	}, {
		key: "_updateScroll",

		/**
   * Update the scroll for the headers base don the scroll of the body and update the current row and col values that represents
   * the start row and col.
   */
		value: function _updateScroll() {
			if (!this._paneSizeValid) return; // still waiting for size

			var scrollTop = this._sections.body.scrollTop,
			    scrollLeft = this._sections.body.scrollLeft;

			this._updateColAndRow(Math.floor(scrollLeft / this._paneSize.size.width), Math.floor(scrollTop / this._paneSize.size.height));

			// synchronize the scroll between the body and the headers
			this._sections.rowHeaders.forEach(function (header) {
				return header.scrollTop = scrollTop;
			});
			this._sections.colHeaders.forEach(function (header) {
				return header.scrollLeft = scrollLeft;
			});

			window.clearTimeout(this._scrollTimer);

			// Defer the building of the panes so we dont kill the scroll
			// TODO: Instead of fully rebuild the panes just reuase dhtem and move htme
			this._scrollTimer = window.setTimeout(this._buildPanes.bind(this), 100);
		}
	}, {
		key: "_resetScroll",
		value: function _resetScroll() {
			this._sections.body.scrollTop = 0;
			this._sections.body.scrollLeft = 0;

			// We may not have the pane size yet if the resize happens before we manage to get the size of the grid
			if (this._paneSizeValid) this._updateScroll();
		}
	}, {
		key: "_loadGrid",

		/**
   * Load the basic grid for the given context options. If the axes info is provided it will also apply the total size
   * to both the headers and the body
   * @private
   * @param  {Object} context
   * @param  {Object} axes
   */
		value: function _loadGrid(context, axes) {
			var _this = this;

			if (this._isNonPaningMode() && this._paneSize && this._paneSize.total.cols === 1 && this._paneSize.total.rows === 1) {
				var rect = this._sections.body.getBoundingClientRect();
				var old = this._paneSize.viewport;
				if (rect.width === old.width && rect.height === old.height) {
					// ... and the size of the viewport hasn't changed...
					// Singleton pane cell, and grid has already been fully loaded. Avoid unnecessary reloads.
					// Dirty stop gap until we have proper React driven paning.
					this._logger.log("Skipping loadGrid");
					return;
				}

				// Last single pane mode was a different size, so:
				this._lastLoadBodyDataWasNonPaningMode = false; // force full rebuild
			}

			this._logger.info("Loading a new grid with context and axes:", context, axes);

			if (this._sections) {

				events.removeWheelListeners(this._sections.body);
				this._sections.body.removeEventListener("scroll", this._scrollHandler);

				// TODO: Remvoe event listeners, etc, form previous grid
				this._parent.innerHTML = "";
			}

			// Build the html for the different secitons of the grid, headers, body and corners and loaded in the parent
			this._sections = grid.build(context, this._ignoreHeaders, this._isNonPaningMode());
			this._parent.appendChild(this._sections.grid);

			// If we already have the axes data apply the size to the inner list of the sections (teh total size for the
			// body and headers basically)
			if (!axes) return; // ?

			this._logger.info("Setting the size for the grid for axes:", axes);

			// Creat the inner lsits with the full size of the headers and body
			this._paneSize = panes.size(this._sections.body.getBoundingClientRect(), this._context, axes);
			this._paneSizeValid = true;

			if (this._paneSize.total.cols !== this._paneSize.viewport.cols || this._paneSize.total.rows !== this._paneSize.viewport.rows) {

				// Listen to the wheel events and do the scroll by hand to prevent desynchronization
				// in mac and also to sync the scroll between the headers or the body
				events.addWheelListener(this._sections.body, function (event) {
					event.originalEvent.preventDefault();

					_this._sections.body.scrollLeft += event.deltaX;
					_this._sections.body.scrollTop += event.deltaY;
				});

				this._scrollHandler = this._updateScroll.bind(this);

				// Sync the headers and the body when the user drags the scrollbars
				this._sections.body.addEventListener("scroll", this._scrollHandler);
			}

			if (this._paneSize.total.cols === this._paneSize.viewport.cols) this._sections.body.classList.add("panning-body-single-col");
			if (this._paneSize.total.rows === this._paneSize.viewport.rows) this._sections.body.classList.add("panning-body-single-row");

			// Create the inner lists with the full size of the headers and body
			// TODO DO the load grid only the first itme and then do this when the size changes
			grid.resize(this._context, this._sections, this._paneSize);
		}
	}, {
		key: "_populateHeaderPanes",

		/**
   * Populate the given header panes with the axe data provided
   * @private
   * @param  {Array.<HTMLElement>} panes
   * @param  {Object} axe
   */
		value: function _populateHeaderPanes(panes, axe) {
			var _this2 = this;

			panes.forEach(function (pane, i) {
				var div = dom.render("<div class=\"label\"></div>");
				var headers = axe.headers[i];
				headers = headers.map(function (val) {
					return _this2._formatHeader(val);
				});
				div.textContent = headers.join(", ");
				pane.appendChild(div);
			});
		}
	}, {
		key: "_formatHeader",

		/**
   * Formats a single header cell value as returned from grid axis headers (i.e. as per TableQueryOutput cells)
   * @param {Object|string|number|Date} header
   * @private
   */
		value: function _formatHeader(header) {
			if (header === null || header === undefined) {
				return "(no value)";
			}
			if (typeof header !== "object") {
				// It's a primitive number or text (TODO: format numbers)
				return header;
			}
			// It's an object
			if (header.lower) {
				// Histogram bucket
				return this._formatHeader(header.lower + " to " + header.upper);
			}
			throw new Error("Unrecognised header cell value: " + JSON.stringify(header));
		}
	}, {
		key: "_loadHeadersData",

		/**
   * Load the given data in the header panes
   * @private
   * @param  {Object} data
   */
		value: function _loadHeadersData(data) {
			if (!this._ignoreHeaders && this._context.options.items.paneY) this._populateHeaderPanes(this._headerPanes.rows, data.axes[0]);
			if (!this._ignoreHeaders && this._context.options.items.paneX) this._populateHeaderPanes(this._headerPanes.cols, data.axes[1]);
		}
	}, {
		key: "_loadBodyData",
		value: function _loadBodyData(_ref) {
			var _this3 = this;

			var gridQueryOutput = _ref.gridQueryOutput;
			var cellQueryMappings = _ref.cellQueryMappings;

			Object.keys(this._bodyPanes).forEach(function (row) {
				Object.keys(_this3._bodyPanes[row]).forEach(function (col) {

					var bodyPane = _this3._bodyPanes[row][col];
					bodyPane.innerHTML = "";

					bodyPane.classList.remove("paning-body-pane-empty");

					var obj = _this3._createPaneContext(bodyPane, gridQueryOutput, cellQueryMappings, row, col);
					if (!obj) return;
					var context = obj.context;
					var truncated = obj.truncated;

					// Creat the pane and wire the communication with the grid
					_this3._panes.push(paneCell.create({
						parent: bodyPane,
						parentId: _this3._id,
						id: _this3._id + "_" + comm.generateId() + "_pane-" + row + "-" + col,
						context: context,
						renderer: _this3._renderer
					}).redispatch(["whitespaceClick", "error"], _this3).on("busy", function () {
						_this3.emit("busy", _this3._panes.some(function (pane) {
							return pane.getBusy();
						}));
					}).on("update", function (e) {

						var selections = _this3._panes.filter(function (pane) {
							return pane.getContext().viewSelection;
						});
						_this3._context.viewSelection = null;
						if (selections.length) {

							_this3._context.viewSelection = selections.reduce(function (selection, pane) {

								var context = pane.getContext();

								selection.filters.push({
									type: "AND",
									filters: [context.dataConfig.filter, context.viewSelection]
								});
								return selection;
							}, {
								type: "OR",
								filters: []
							});
						}

						if (e.data.devicesView) {
							// Assume this is a no-paning devices view, propagate up:
							_this3._context.devicesView = e.data.devicesView;
						}

						_this3.emit("update", _this3._context);
					}));

					_this3._updatePaneTruncatedWatermark(bodyPane, truncated);
				});
			});
			this._lastLoadBodyDataWasNonPaningMode = this._isNonPaningMode();
		}
	}, {
		key: "_extractPaneCellDataAndHandleEmpty",

		/**
   * Returns the pane cell data to be given to the pane's cell queries result.
   *
   * Also updates CSS class for the bodyPane for whether the cell is a special case of an empty cell
   * (no data at intersection).
   *
   * Returns null if the cell is empty (no data).
   *
   * @private
   */
		value: function _extractPaneCellDataAndHandleEmpty(bodyPane, gridQueryOutput, row, col) {
			var paneCellData = null; // The object in the pane grid, typically a bunch of query results by key

			// If not doing auto-query, cells may not even be supplied; we might only have headers (grid query impl dependent)
			if (gridQueryOutput.cells) {
				if (gridQueryOutput.cells.length === 0 || gridQueryOutput.cells[0].length === 0) {
					// This happens when there is no data, and because paning is not configured,
					// we don't bother to do a "size" request and assume it is 1x1,
					// but when we get the data response, it is in fact 0x0.
					if (this._isNonPaningMode()) {
						// Non-paning mode. Behave as if paning isn't present, and pass this state through to
						// the pane cell which must be created.
						// Fake up the result of a zero-record cell query:
						var fake = {
							query: []
						};
						if (this._context.dataConfig.shadowFilter) {
							// brushing is active
							fake.shadowQuery = [];
						}
						bodyPane.classList.remove("paning-body-pane-empty");
						return fake;
					}
					bodyPane.classList.add("paning-body-pane-empty");
					return null; // Don't render anything in this cell
				}

				paneCellData = gridQueryOutput.cells[row - this._row][col - this._col];

				if (!paneCellData) {
					// We have auto-query, but there is no data in this pane cell.
					// Note, if we aren't doing auto-query, there is no way of telling if the cell is empty
					// of data. The cells (intersection of row/column filters) are only evaluated if we
					// have cell queries.
					if (this._isNonPaningMode()) bodyPane.classList.remove("paning-body-pane-empty");else bodyPane.classList.add("paning-body-pane-empty");
					return null; // Don't render anything in this cell
				}
			}

			return paneCellData;
		}
	}, {
		key: "_updatePaneTruncatedWatermark",
		value: function _updatePaneTruncatedWatermark(bodyPane, truncated) {
			watermark.toggle(bodyPane, truncated ? contextUtil.data.getLimit(this._context) : 0);
		}
	}, {
		key: "_createPaneContext",

		/**
   * @return {?{context, truncated}} ViewApiContext, or null
   * @private
   */
		value: function _createPaneContext(bodyPane, gridQueryOutput, cellQueryMappings, row, col) {
			var _this4 = this;

			var paneCellData = this._extractPaneCellDataAndHandleEmpty(bodyPane, gridQueryOutput, row, col);
			if (paneCellData === null) return null; // empty of data

			// Clone the context and put the data in
			var context = clone(this._context);

			if (!this._isNonPaningMode()) {
				// I.e. paning is enabled. Add stuff that is only needed when paning is configured:
				// Pane coords, and pane-specific filters.

				// TODO: what is this for? It is NOT the view instance ID!  Wrong.
				context.viewInstanceId += "-view-" + row + "-" + col;

				context.pane = { x: col, y: row }; // AutoPaneCell

				// Re-link filters to per-pane, with global as base:
				var paneXFilter = this._createAxisFilter(gridQueryOutput.axes[1], col - this._col, context.options.items.paneX);
				var paneYFilter = this._createAxisFilter(gridQueryOutput.axes[0], row - this._row, context.options.items.paneY);
				context.dataConfig.baseFilter = context.dataConfig.filter;
				context.dataConfig.filter = { type: "AND", filters: [paneXFilter, paneYFilter] };

				if (context.dataConfig.baseFilter) context.dataConfig.filter.filters.push(context.dataConfig.baseFilter);

				if (context.dataConfig.shadowFilter) {
					context.dataConfig.baseShadowFilter = context.dataConfig.shadowFilter;
					context.dataConfig.shadowFilter = { type: "AND", filters: [paneXFilter, paneYFilter] };
					if (context.dataConfig.baseFilter) context.dataConfig.shadowFilter.filters.push(context.dataConfig.baseShadowFilter);
				}
			}

			var truncated = false;

			if (paneCellData) {
				// i.e. if we have auto query (via autoQuery=true in manifest, or via 3rd party use of paning
				// specifying autoQuery=true in call to omniscope.view.querying.grid()):

				/**
     * @param gridQueryOutput The result of the grid query including meta schema for each key
     * @param paneCellData The cell data for the pane containing a "records" array for each key
     * @param cellQueryKey The key ("query" or "shadowQuery").
     * @returns {Object} a TableQueryOutput reconstituted from the grid query, or null if the key wasn't present.
     */
				var createTableQueryOutput = function createTableQueryOutput(gridQueryOutput, paneCellData, cellQueryKey) {
					var records = paneCellData[cellQueryKey]; // array of [y][x] raw data for a table query
					if (!records) return null;

					var schema = gridQueryOutput.cellQueriesSchema[cellQueryKey]; // a SchemaFieldsQueryOutput
					if (!schema) throw new Error("Data but no schema"); // no cell queries meta

					// Apply auto limit from manifest (default 10,000):
					var limit = contextUtil.data.getLimit(_this4._context);
					if (contextUtil.data.truncateRecords({ records: records, limit: limit })) truncated = true;

					return { schema: schema, records: records }; // a TableQueryOutput
				};

				context.result = { // AutoQueryResult
					data: createTableQueryOutput(gridQueryOutput, paneCellData, "query"), // should not be null ever
					shadowData: createTableQueryOutput(gridQueryOutput, paneCellData, "shadowQuery"), // null when not brushing
					mappings: cellQueryMappings
				};
			} // else, not auto querying. Do not define context.result.

			return { context: context, truncated: truncated };
		}
	}, {
		key: "_createAxisFilter",

		/**
   *
   * @param {Object} axisResult - a GridAxisOutput from query API
   * @param index The index within the pane grid, relative to the query origin (flattened grid of multiple tiers), i.e. column or row in result
   * @param {Array.<Object>} opts Array of Grouping objects respective to grid tiers in this axis
   * @private
   */
		value: function _createAxisFilter(axisResult, index, opts) {
			var data = axisResult.headers[index]; // an array of all the headers for this row/column, each respective to options
			var filter = {
				type: "AND",
				filters: []
			};
			if (!opts) {
				// This is the "All" column/row, when no paning in this axis is configured.
				return filter; // "All" filter
			}
			if (!Array.isArray(opts)) opts = [opts]; // e.g. if paneX isn't configured as a list
			for (var tier = 0; tier < data.length; tier++) {
				filter.filters.push({
					type: "FIELD_VALUE",
					inputField: opts[tier].inputField,
					operator: "=",
					value: data[tier]
				});
			}
			return filter;
		}
	}, {
		key: "loadData",

		/**
   * Method that we invoke when we want to feed data for the panes to the grid. Basically it should revceive the result
   * of a grid query and it will distribute the data in the panes
   * @param  {Object} data
   * @return {Paning}
   */
		value: function loadData(_ref2) {
			var gridQueryOutput = _ref2.gridQueryOutput;
			var cellQueryMappings = _ref2.cellQueryMappings;
			var id = _ref2.id;

			if (id !== this._curNeedDataId) {
				// console.log("skip old data");
				return;
			}

			this._logger.log("Loading grid  with data:", gridQueryOutput);

			if (this._isNonPaningMode() && this._lastLoadBodyDataWasNonPaningMode) {
				// Not auto-paning.
				// And the single 'pane' has already been created.
				// Disable all paning mojo, and instead just pass to nested pane.
				// This is a dirty stop gap until we have React driven paning, to stop the reloads.
				// From _loadBodyData above:
				var row = 0,
				    col = 0;
				var bodyPane = this._bodyPanes[row][col];
				var obj = this._createPaneContext(bodyPane, gridQueryOutput, cellQueryMappings, row, col);
				if (!obj) return;
				var context = obj.context;
				var truncated = obj.truncated;

				this._panes[0].update(context);
				this._updatePaneTruncatedWatermark(bodyPane, truncated);
				return;
			}

			// Clear previous endpoints before creating new ones for the new panes
			this._clearPanes();

			this._loadHeadersData(gridQueryOutput);
			this._loadBodyData({ gridQueryOutput: gridQueryOutput, cellQueryMappings: cellQueryMappings });

			return this;
		}
	}, {
		key: "_buildPanes",

		/**
   * Build the panes for the given range
   */
		value: function _buildPanes() {
			var _this5 = this;

			if (!this._paneSizeValid) return; // still waiting for size

			var range;

			// TODO: Change the range logic and make it so it adds a margin around the viewport so you can see more than the current page
			range = {
				x: { start: this._col, length: Math.min(this._paneSize.viewport.cols + 1, this._paneSize.total.cols - this._col) },
				y: { start: this._row, length: Math.min(this._paneSize.viewport.rows + 1, this._paneSize.total.rows - this._row) }
			};

			this._headerPanes = grid.headers(range, this._paneSize);

			this._sections.rowHeaders.forEach(function (header) {
				header.firstChild.innerHTML = "";
				_this5._headerPanes.rows.forEach(function (row) {
					return header.firstChild.appendChild(row);
				});
			});

			this._sections.colHeaders.forEach(function (header) {
				header.firstChild.innerHTML = "";
				_this5._headerPanes.cols.forEach(function (col) {
					return header.firstChild.appendChild(col);
				});
			});

			this._bodyPanes = grid.body(range, this._paneSize);

			// Clear the body
			this._clearPanes();
			this._sections.body.firstChild.innerHTML = "";

			// Append the body panes to the body
			Object.keys(this._bodyPanes).forEach(function (row) {
				Object.keys(_this5._bodyPanes[row]).forEach(function (col) {
					_this5._sections.body.firstChild.appendChild(_this5._bodyPanes[row][col]);
				});
			});

			// After a resize we will need new data
			this.emit("need-data", { context: this._context, range: range, id: this._curNeedDataId });
		}
	}, {
		key: "setSize",

		/**
   * Set the size of the pane. The data should be the result of a grid size query
   * @param  {Object} data
   * @return {Paning}
   */
		value: function setSize(_ref3) {
			var data = _ref3.data;
			var id = _ref3.id;

			if (id !== this._curNeedSizeId) {
				console.log("skip old size");
				return;
			}

			this._axes = data.axes;

			this._logger.info("Receive new size data", data);

			// TODO; Do this only if the context options for the panes change
			this._loadGrid(this._context, this._axes);

			// We reset the scroll position when we resize  since the pane size change. That will trigger a rebuild of the
			// panes and will emit the need-data event itself
			this._resetScroll();

			return this;
		}
	}, {
		key: "_clearPanes",

		/**
   * Clear the enpoints by first broadcasting a dispose message and then calling the dispose event in them and clearing
   * the paning grid list
   */
		value: function _clearPanes() {
			comm.broadcast(this._id, "dispose"); // Send dispose to all the panes with broadcast
			comm.clear(this._id);

			this._panes.forEach(function (pane) {
				return pane.dispose();
			});
			this._panes = [];
		}
	}, {
		key: "update",

		/**
   * Update the context for the paning grid. Right now it will always request new size and data.
   * TODO: Make it so it will only request the data is it needs to, thats if the filters change, the pane options, etc.
   * @param  {Object} context
   * @return {Paning}
   */
		value: function update(context) {

			this._logger.info("Received new context", context);

			this._context = context; // shouldn't need to clone at the top level

			if (this._isNonPaningMode() && this._lastLoadBodyDataWasNonPaningMode) {
				// Not auto-paning. And paning disabled in manifest. This instance of Paning will never pane.
				// Disable all paning mojo, and instead just pass to nested pane.
				// This is a dirty stop gap until we have React driven paning, to stop the reloads.
				this.emit("need-data", {
					context: this._context,
					range: { x: { start: 0, length: 1 }, y: { start: 0, length: 1 } },
					id: this._curNeedDataId
				});
				return;
			}

			// Clear all the previous endpoints of this grid, as we got a new context we are going to rebuild!
			// TODO; Do this only when we need to rebuild, so for specific settings instead of always
			this._clearPanes();

			this._newNeedSizeId(); // will cancel existing data requests too
			this._paneSizeValid = false; // disable new data requests until updated size received
			return this.emit("need-size", { context: this._context, id: this._curNeedSizeId });
		}
	}, {
		key: "start",

		/**
   * Triggers the initial need-size
   */
		value: function start() {
			this._newNeedSizeId();
			return this.emit("need-size", { context: this._context, id: this._curNeedSizeId });
		}
	}, {
		key: "resize",

		/**
   * Handler for the resize event for the cusotm view. It should be invoked when the viewport for the view changes
   * and it will calculate the new viewport for the paning grid and update it accordingly
   * @param {DOMRect} size
   * @return {Paning}
   */
		value: function resize(size) {
			// Right now we rebuild every time. Inf uture we can broadcast instead of calling per pane since
			// we dont send any size we jsut notify that a size change happened
			// comm.broadcast(this._id, "resize");

			// TODO; Do this only if the context options for the panes change
			this._loadGrid(this._context, this._axes);

			// We reset the scroll position when we resize  since the pane size change. That will trigger a rebuild of the
			// panes and will emit the need-data event itself
			this._resetScroll();
			return this;
		}
	}, {
		key: "dispose",

		/**
   * Dispose the paning grid by disposing all the active endpoints and removing all the listeners
   * @return {Paning}
   */
		value: function dispose() {
			this._clearPanes();
			this.removeAllListeners();
			return this;
		}
	}]);

	return Paning;
})(EventEmitter);

module.exports = Paning;

},{"./cell":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\cell\\index.js","./gridBuilder":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\gridBuilder.js","./layout/panes":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\layout\\panes.js","./util/watermark":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\util\\watermark.js","@visokio/chart-communication":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\chart-communication\\index.js","@visokio/common/src/context":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\index.js","@visokio/common/src/event/EventEmitter":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\event\\EventEmitter.js","@visokio/common/src/util/clone":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\clone.js","@visokio/common/src/util/dom":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\dom.js","@visokio/common/src/util/events":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\events.js","@visokio/common/src/util/logger":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\logger.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\cell\\PaneCell.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var EventEmitter = require("@visokio/common/src/event/EventEmitter");

var comm = require("@visokio/chart-communication");
var dom = require("@visokio/common/src/util/dom");
var api = require("@visokio/public-api/src");

var PaneCell = (function (_EventEmitter) {
    function PaneCell(_ref) {
        var parent = _ref.parent;
        var parentId = _ref.parentId;
        var id = _ref.id;
        var context = _ref.context;
        var renderer = _ref.renderer;

        _classCallCheck(this, PaneCell);

        _get(Object.getPrototypeOf(PaneCell.prototype), "constructor", this).call(this);

        this._element = dom.render("<div class=\"nested\"></div>"); // our own element so watermark is not affected by us
        this._parentId = parentId;
        this._id = id;
        this._context = context;
        this._renderer = renderer;

        /**
         * Populated by _createEndpoint, which is called indirectly in constructor for vanilla PaneCell
         * but is called upon load event for PaneIFrameCell.
         * @type {?Endpoint}
         * @private
         */
        this._endpoint = null;

        this._busy = true;

        this._render(parent);
    }

    _inherits(PaneCell, _EventEmitter);

    _createClass(PaneCell, [{
        key: "_createEndpoint",

        /**
         * Create the endpoint for the given parentid, id and channel. If the channel is null
         * it will be a native endpoint, if not an iframe window is expected to create
         * a psotMessage based one.
         * @param  {string} parentId
         * @param  {string} id
         * @param  {Window=} channel
         */
        value: function _createEndpoint(parentId, id, channel) {
            var _this = this;

            this._endpoint = comm.endpoint(parentId, id, channel).on("update", this._updateSelection.bind(this)).on("busy", function (event) {
                return _this._busy = event.data;
            }).redispatch(["update", "whitespaceClick", "error", "busy"], this).send("update", this._context);
        }
    }, {
        key: "_updateSelection",
        value: function _updateSelection(event) {
            this._context.viewSelection = event.data.viewSelection;
        }
    }, {
        key: "_render",
        value: function _render(parent) {

            parent.appendChild(this._element);

            try {
                this._renderer(api.build(comm.endpoint(this._id, this._parentId), this._element));
            } catch (e) {
                console.log("Error in native chart renderer", e);
                comm.clear(this._id);
                throw e;
            }

            this._createEndpoint(this._parentId, this._id);
        }
    }, {
        key: "getContext",
        value: function getContext() {
            return this._context;
        }
    }, {
        key: "getSelection",
        value: function getSelection() {
            return this._selection;
        }
    }, {
        key: "getBusy",
        value: function getBusy() {
            return this._busy;
        }
    }, {
        key: "update",
        value: function update(context) {
            this._context = context;
            this._endpoint.send("update", this._context);
        }
    }, {
        key: "dispose",
        value: function dispose() {

            comm.clear(this._id);

            if (this._element && this._element.parentNode) this._element.parentNode.removeChild(this._element);

            this._element = null;

            this.removeAllListeners();
        }
    }]);

    return PaneCell;
})(EventEmitter);

module.exports = PaneCell;

},{"@visokio/chart-communication":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\chart-communication\\index.js","@visokio/common/src/event/EventEmitter":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\event\\EventEmitter.js","@visokio/common/src/util/dom":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\dom.js","@visokio/public-api/src":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\index.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\cell\\PaneIFrameCell.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var PaneCell = require("./PaneCell");

var dom = require("@visokio/common/src/util/dom");

/**
 * Get the iframe template and render it with the specified source and if
 * TODO: Add more stuff to the template when is needed, maybe loaders or something similar for panning iframes,
 * all the html needed to not interact with the iframe logic specifically.
 * @param {string} url
 * @param {string} id
 * @param {boolean} sandbox
 * @return {HTMLIFrameElement}
 */
var renderIFrame = function renderIFrame(url, id, paneId, sandbox) {

    return dom.render("\n        <iframe\n            class=\"iframe-chart\"\n            scrolling=\"no\"\n            " + (sandbox ? "sandbox=\"allow-scripts\"" : "") + "\n            src=\"" + url + "?source=" + id + "&target=" + paneId + "\"\n        ></iframe>\n    ");
};

var PaneIFrameCell = (function (_PaneCell) {
    function PaneIFrameCell() {
        var _this = this;

        _classCallCheck(this, PaneIFrameCell);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        _get(Object.getPrototypeOf(PaneIFrameCell.prototype), "constructor", this).apply(this, args);

        /**
         * IFrame used to render load the custom view
         * @type {HTMLIFrameElement}
         * @private
         */
        this._iframe = renderIFrame(this._context.baseUrl, this._parentId, this._id, this._context.manifest.sandbox);

        this._iframe.addEventListener("load", function (event) {
            return _this._createEndpoint(_this._parentId, _this._id, event.target.contentWindow);
        });
        this._element.appendChild(this._iframe);
    }

    _inherits(PaneIFrameCell, _PaneCell);

    _createClass(PaneIFrameCell, [{
        key: "_render",
        value: function _render(parent) {
            parent.appendChild(this._element);
        }
    }, {
        key: "dispose",
        value: function dispose() {
            if (this._iframe) {
                this._iframe.onload = null;
                if (this._iframe.parentNode) this._iframe.parentNode.removeChild(this._iframe);
            }

            this._iframe = null;
            _get(Object.getPrototypeOf(PaneIFrameCell.prototype), "dispose", this).call(this);
        }
    }]);

    return PaneIFrameCell;
})(PaneCell);

module.exports = PaneIFrameCell;

},{"./PaneCell":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\cell\\PaneCell.js","@visokio/common/src/util/dom":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\dom.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\cell\\index.js":[function(require,module,exports){
"use strict";

var PaneCell = require("./PaneCell");
var PaneIFrameCell = require("./PaneIFrameCell");

module.exports = {
				create: function create(_ref) {
								var parentId = _ref.parentId;
								var id = _ref.id;
								var parent = _ref.parent;
								var context = _ref.context;
								var renderer = _ref.renderer;

								if (context.manifest.isNative) {
												return new PaneCell({ parentId: parentId, id: id, parent: parent, context: context, renderer: renderer });
								} else {
												return new PaneIFrameCell({ parentId: parentId, id: id, parent: parent, context: context, renderer: renderer });
								}
				}
};

},{"./PaneCell":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\cell\\PaneCell.js","./PaneIFrameCell":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\cell\\PaneIFrameCell.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\gridBuilder.js":[function(require,module,exports){
"use strict";

var dom = require("@visokio/common/src/util/dom");
var area = require("./layout/area");

function translateStyle(key, value) {

    switch (key) {

        case "width":
        case "height":
        case "top":
        case "right":
        case "bottom":
        case "left":
            return key + ": " + (typeof value === "number" ? value + "px" : value);

        case "transform":
            return "-ms-transform: " + value + "; -webkit-transform: " + value + "; transform: " + value;
    }

    return key + ": " + value;
}

function objectToStyle(list) {
    return Object.keys(list).map(function (key) {
        return translateStyle(key, list[key]);
    }).join(";");
}

function rowsHeaderList(context, panes) {
    return dom.render("\n        <div class=\"paning-header-list\" style=\"height: " + panes.total.height + "px\"></div>\n    ");
}

function colsHeaderList(context, panes) {
    return dom.render("\n        <div class=\"paning-header-list\" style=\"width: " + panes.total.width + "px\"></div>\n    ");
}

function bodyList(context, panes) {

    var style = {
        width: panes.total.width,
        height: panes.total.height
    };

    return dom.render("\n        <div class=\"panning-body-list\" style=\"" + objectToStyle(style) + "\"></div>\n    ");
}

function array(size) {
    return Array.apply(null, Array(size));
}

module.exports = {

    /**
     * @param {Object} context ViewApiContext
     * @param {boolean} ignoreHeaders True when paning is not possible because auto-paning is disabled in the manifest.
     * @param {boolean} nonPaningMode True when paning is not currently configured (and implicitly a singleton pane).
     * False when paning is configured (but there might still be a singleton pane due to filtering).
     */
    build: function build(context, ignoreHeaders, nonPaningMode) {

        var areas = area.grid(context, ignoreHeaders),
            body,
            rowHeaders = [],
            colHeaders = [],
            corners = [],
            grid;

        // Adjust one pixel to the left to avoid double broders and align problems with the header borders
        areas.body.left = areas.body.left - 1;

        rowHeaders = Object.keys(areas.headers).filter(function (position) {
            return position === "left" || position === "right";
        }).map(function (position) {
            return dom.render("<div class=\"paning-header paning-header-rows position-" + position + "\"\n                    style=\"" + objectToStyle(areas.headers[position]) + "\"></div>");
        });

        colHeaders = Object.keys(areas.headers).filter(function (position) {
            return position === "top" || position === "bottom";
        }).map(function (position) {
            return dom.render("<div class=\"paning-header paning-header-cols position-" + position + "\"\n                    style=\"" + objectToStyle(areas.headers[position]) + "\"></div>");
        });

        corners = Object.keys(areas.corners).map(function (position) {
            return dom.render("<div class=\"paning-corner position-" + position + "\"\n                    style=\"" + objectToStyle(areas.corners[position]) + "\"></div>");
        });

        body = dom.render("<div class=\"paning-body\" style=\"" + objectToStyle(areas.body) + "\"></div>");

        grid = dom.render("<div class=\"paning-grid " + (nonPaningMode ? "paning-grid-not-paning" : "") + "\"></div>");

        rowHeaders.forEach(function (header) {
            return grid.appendChild(header);
        });
        colHeaders.forEach(function (header) {
            return grid.appendChild(header);
        });
        corners.forEach(function (corner) {
            return grid.appendChild(corner);
        });

        grid.appendChild(body);

        return {
            grid: grid,
            rowHeaders: rowHeaders,
            colHeaders: colHeaders,
            body: body
        };
    },

    /**
     * Resize the body and headers by putting the list with the total size inside
     * @param {Object} sections
     * @param {Object} panesSize
     */
    resize: function resize(context, sections, panesSize) {

        sections.body = sections.grid.querySelector(".paning-body");

        // Lod the container for both the rows and the cools, the panes themselves will be loaded when we got the data
        sections.rowHeaders.forEach(function (header) {
            header.innerHTML = "";header.appendChild(rowsHeaderList(context, panesSize));
        });
        sections.colHeaders.forEach(function (header) {
            header.innerHTML = "";header.appendChild(colsHeaderList(context, panesSize));
        });

        // Load the container with the full size to the body
        sections.body.innerHTML = "";
        sections.body.appendChild(bodyList(context, panesSize));

        // SIze of the scrollbar
        var scrollBarSize = sections.body.offsetWidth - sections.body.clientWidth;

        sections.rowHeaders.forEach(function (header) {
            return header.firstChild.style.paddingBottom = scrollBarSize + "px";
        });
        sections.colHeaders.forEach(function (header) {
            return header.firstChild.style.paddingRight = scrollBarSize + "px";
        });
    },

    headers: function headers(range, panes) {

        var rows, cols, position;

        // TODO; Apply prefixes when needed

        rows = array(range.y.length).map(function (pane, i) {

            position = i + range.y.start;

            return dom.render("\n                    <div class=\"paning-header-pane paning-header-row-pane\"\n                        data-row=\"" + position + "\"\n                        style=\"height: " + panes.size.height + "px;transform: translateY(" + panes.size.height * position + "px)\"\n                        >\n                    </div>\n                ");
        });

        cols = array(range.x.length).map(function (pane, i) {

            position = i + range.x.start;

            return dom.render("\n                    <div class=\"paning-header-pane paning-header-col-pane\"\n                        data-col=\"" + position + "\"\n                        style=\"width: " + panes.size.width + "px;transform: translateX(" + panes.size.width * position + "px)\"\n                        >\n                    </div>\n                ");
        });

        return {
            rows: rows,
            cols: cols
        };
    },

    body: function body(range, panes) {

        var style = {},
            col,
            row;

        return array(range.y.length).reduce(function (rows, item, i) {

            row = i + range.y.start;

            rows[row] = array(range.x.length).reduce(function (cols, item, j) {

                col = j + range.x.start;

                style = {
                    width: panes.size.width,
                    height: panes.size.height,
                    transform: "translate(" + panes.size.width * col + "px, " + panes.size.height * row + "px)"
                };

                cols[col] = dom.render("\n                    <div class=\"paning-body-pane\"\n                        data-row=\"" + row + "\"\n                        data-col=\"" + col + "\"\n                        style=\"" + objectToStyle(style) + "\"\n                        >\n                    </div>\n                ");

                return cols;
            }, {});

            return rows;
        }, {});
    }
};

},{"./layout/area":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\layout\\area.js","@visokio/common/src/util/dom":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\dom.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\index.js":[function(require,module,exports){
"use strict";

var Paning = require("./Paning");

module.exports = {

	/**
  * Method that create the paning componet used to apply paning to a view
  * @param  {HTMLElement} parent
  * @param  {Object} context
  * @param  {Function=} renderer If defined the panign will use the NativeLoader, if not it will use the IFrameLoader
  * @return {Object}
  */
	create: function create(parent, context, renderer, ignoreHeaders) {
		return new Paning(parent, context, renderer, ignoreHeaders);
	}
};

},{"./Paning":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\Paning.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\layout\\area.js":[function(require,module,exports){

// var context = {
// 	pane: {
// 		cell: undefined,
// 		options: {

// 			// HEader settings, including visibility and size
// 			header: {
// 				top: {
// 					size: 50, // Only height since widht is defined by the pane
// 					show: "always"
// 				},
// 				left: {
// 					size: 120, // Only width since height is defined by the pane
// 					show: "always"
// 				}
// 			},

// 			// Pane settngs, size and max number of panes per grid
// 			panes: {
// 				size: {
// 					width: 50,
// 					height: 50
// 				},
// 				max: 100
// 			},

// 			// If true expand the grid if its smaller than the viewport
// 			expand: true
// 		}
// 	}
// };

// Helpers used to calculate the areas of the paning grid, with headers, etc.
"use strict";

module.exports = {

	/**
  * Based on the given context return an object with the headers, corners and body size and position in the grid
  * TODO: Add logic to use bounding rect of the parent element to define the headers size and adapt them,
  * supporting relative measures (like percentages, min/max ranges, etc)
  * @param {object} context
  * @param {boolean} ignoreHeaders
  * @return {object}
  */
	grid: function grid(context, ignoreHeaders) {

		var paneOpts = context.options.pane,
		    topHeader = 0,
		    bottomHeader = 0,
		    leftHeader = 0,
		    rightHeader = 0,
		    result = {
			headers: {},
			corners: {},
			body: {}
		};

		if (!ignoreHeaders) {
			if (paneOpts.headerHeight && context.options.items.paneX) {
				var xp = paneOpts.xHeaderPlacement;
				if (xp === "TOP") topHeader = paneOpts.headerHeight;
				if (xp === "BOTTOM") bottomHeader = paneOpts.headerHeight;
			}
			if (paneOpts.headerWidth && context.options.items.paneY) {
				var yp = paneOpts.yHeaderPlacement;
				if (yp === "LEFT") leftHeader = paneOpts.headerWidth;
				if (yp === "RIGHT") rightHeader = paneOpts.headerWidth;
			}
		}

		if (topHeader) {

			result.headers.top = {
				top: 0,
				left: leftHeader,
				right: rightHeader,
				height: topHeader
			};
		}

		if (rightHeader) {

			result.headers.right = {
				right: 0,
				top: topHeader,
				bottom: bottomHeader,
				width: rightHeader
			};
		}

		if (bottomHeader) {

			result.headers.bottom = {
				bottom: 0,
				left: leftHeader,
				right: rightHeader,
				height: bottomHeader
			};
		}

		if (leftHeader) {

			result.headers.left = {
				left: 0,
				top: topHeader,
				bottom: bottomHeader,
				width: leftHeader
			};
		}

		if (topHeader && leftHeader) {
			result.corners.topleft = {
				top: 0,
				left: 0,
				height: topHeader,
				width: leftHeader
			};
		}

		if (topHeader && rightHeader) {
			result.corners.topright = {
				top: 0,
				right: 0,
				height: topHeader,
				width: rightHeader
			};
		}

		if (bottomHeader && leftHeader) {
			result.corners.bottomleft = {
				bottom: 0,
				left: 0,
				height: bottomHeader,
				width: leftHeader
			};
		}

		if (bottomHeader && rightHeader) {
			result.corners.bottomright = {
				bottom: 0,
				right: 0,
				height: bottomHeader,
				width: rightHeader
			};
		}

		result.body = {
			top: topHeader,
			right: rightHeader,
			bottom: bottomHeader,
			left: leftHeader
		};

		return result;
	}
};

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\layout\\panes.js":[function(require,module,exports){

// Helpers used to calculate the layout of the panes in the body of the paning grid,
// generate diffs, etc.
"use strict";

module.exports = {

	/**
  * Get the size for the individual panes plus the total amount of rows and cols and the total size of the panes
  * @param  {DOMRect} bounds
  * @param  {Object} context
  * @param  {Object} axes
  * @return {Object}
  */
	size: function size(bounds, context, axes) {

		var paneSize = {
			width: context.options.pane.paneWidth,
			height: context.options.pane.paneHeight
		},
		    maxCells = context.manifest.pane ? context.manifest.pane.maxCells : 20 /*legacy manifest?*/
		,
		    reduction,
		    rows,
		    cols,
		    width,
		    height,
		    totalRows = 1,
		    totalCols = 1;

		// Get the total rows and cols depending on the axes and the context options
		totalCols = axes[1].size;
		totalRows = axes[0].size;

		// First we calculat ethe rows adn cols that we can show in the available bounds
		// We floor to make sure that we fit a fixed number of panes in the grid
		rows = Math.min(Math.floor(bounds.height / paneSize.height), totalRows);
		cols = Math.min(Math.floor(bounds.width / paneSize.width), totalCols);

		// Adjust the panes to not be more than the max amount
		if (rows * cols > maxCells) {
			reduction = Math.sqrt(maxCells) / Math.sqrt(rows * cols);

			// Limit columns first:
			cols = cols * reduction;

			// Round down and at least 1:
			cols = Math.max(1, Math.floor(cols));

			// Derive rows from cols, aiming for maxCells, but no greater than original rows:
			rows = Math.min(rows, Math.max(1, Math.floor(maxCells / cols)));

			// This is imperfect, e.g. for 115x51, you get 15x6 where 16x6 would be a better fit.
			// Final assertion:
			if (rows * cols > maxCells) throw new Error("Cannot meet maxCells requirement: " + cols + "x" + rows);
		}

		// Get the target width and height of the viewport
		width = cols * paneSize.width;
		height = rows * paneSize.height;

		// If the resulting width is smaller than the available bounds the we need to expand
		// TODO: Put the expand to fill the viewport asd a setting in the pane options section of the context
		if (width < bounds.width) {
			paneSize.width += (bounds.width - width) / cols;
			width = bounds.width;
		}

		// If the resulting width is smaller than the available bounds the we need to expand
		// TODO: Put the expand to fill the viewport asd a setting in the pane options section of the context
		if (height < bounds.height) {
			paneSize.height += (bounds.height - height) / rows;
			height = bounds.height;
		}

		return {
			size: {
				width: paneSize.width,
				height: paneSize.height
			},
			viewport: {
				// The precise pixel size of the viewport:
				width: bounds.width,
				height: bounds.height,
				// The number of rows and columns that straddle the viewport:
				cols: cols,
				rows: rows
			},
			total: {
				rows: totalRows,
				cols: totalCols,
				width: totalCols * paneSize.width,
				height: totalRows * paneSize.height
			}
		};
	},

	/**
  * Get the diff between two pane layouts, with the information about things that we need ot update,
  * things to add and things to remove
  * @param  {Object} previous
  * @param  {Object} current
  * @return {Object}
  */
	diff: function diff(previous, current) {}
};

},{}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\src\\util\\watermark.js":[function(require,module,exports){
"use strict";

var dom = require("@visokio/common/src/util/dom");

var CSS_CLASS = "view-watermark";
var CSS_CLASS_ITEM = "view-watermark-item";

//TODO: Right now the watermark will capture the mosue events in IE10 and IE9 since
// we are using pointer-events:none from css to prevent that behaviour. We will need to
// find a way of replicating that and somehow pass the event to the iframe.

module.exports = {

    /**
     * Create a watermark qith the given information and append it to the fiven parent
     * @param  {HTMLElement} parent
     * @param  {Object} info Tha info can be text, details (used for title) and icon (font-awesome name)
     */
    create: function create(parent, info) {

        var container = parent.querySelector("." + CSS_CLASS);

        if (!container) {
            container = dom.render("<div class=\"" + CSS_CLASS + "\" title=\"\"></div>");
            parent.appendChild(container);
        }

        var message = info.id ? container.querySelector("[data-id=" + info.id + "]") : null;

        if (!message) {
            message = dom.render("<div class=\"" + CSS_CLASS_ITEM + "\"><i class=\"\"></i></div>");
            container.appendChild(message);
        } else {
            message.innerHTML = "<i class=\"\"></i>";
        }

        message.setAttribute("data-id", info.id);
        message.children[0].className = info.icon ? "fa " + info.icon : "";
        message.appendChild(document.createTextNode(info.text));
    },

    /**
     * Remove the watermark if any form the specified parent
     * @param  {HTMLElement} parent
     */
    remove: function remove(parent, id) {

        var container = parent.querySelector("." + CSS_CLASS),
            message;

        if (!container) return;

        if (id) {

            message = container.querySelector("[data-id=" + id + "]");
            if (message) message.parentNode.removeChild(message);
        } else {
            container.parentNode.removeChild(container);
        }
    },

    toggle: function toggle(parent, limit) {

        if (limit) {

            this.create(parent, {
                id: "data-truncation",
                text: "Data has been truncated to meet the capabilities of this view (max " + limit + " visual elements)",
                icon: "fa-exclamation-triangle"
            });
        } else {

            this.remove(parent, "data-truncation");
        }
    },

    EVENT: {
        SHOW: "watermark.show",
        HIDE: "watermark.hide"
    }
};

},{"@visokio/common/src/util/dom":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\dom.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\api\\Api.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var EventEmitter = require("@visokio/common/src/event/EventEmitter");
var contextUtil = require("@visokio/common/src/context");
var query = require("@visokio/query-api");
var clone = require("@visokio/common/src/util/clone");
var onerror = require("@visokio/common/src/context/onerror");

/**
 * Base class that represents the public api before adding auto-paning and auto-querying
 */

var Api = (function (_EventEmitter) {

    /**
     * @param {Endpoint} endpoint
     * @param {Element} parent
     */

    function Api(endpoint, parent) {
        var _this = this;

        _classCallCheck(this, Api);

        _get(Object.getPrototypeOf(Api.prototype), "constructor", this).call(this);

        /**
         * Busy state of the view
         * @type {boolean}
         * @private
         */
        this._busy = false;

        /**
         * Context object
         * @type {Object}
         * @private
         */
        this._context = null;

        /**
         * Parent element used to render the custom view contents
         * @type {HTMLElement}
         * @private
         */
        this._parent = parent;

        /**
         * Object wiht the mappings for the data in the context
         * @type {MappingsHelper}
         * @private
         */
        this._mappings = {};

        /**
         * Communication API endpoint used to communicate with
         * view.
         * @type {Endpoint}
         * @private
         */
        this._endpoint = endpoint;

        // Update the context and mappings as soona s we receive a new one
        this._endpoint.on("update", function (event) {
            _this._context = event.data;
            _this._mappings = _this._context.result && _this._context.result.data ? new contextUtil.MappingsHelper(_this._context) : {};
        });

        // The first time instead of load emit an update, the next ones will produce a regular update event
        this._endpoint.once("update", function (event) {

            // TODO: Revisit the error handling logic to handle sandbox properly

            if (!event.data.manifest.isNative) {
                // Only do the error listener for non-native views, which are loaded inside their own IFRAME.
                // The native ones are handled by mobile's own window.onerror handler.
                // Embedded views have a window.onerror handler set separately (using the same onerror.js helper).
                onerror.register(function (errObj) {
                    _this.error(errObj.message, errObj.internal);
                });
            }

            _this.emit("load", event.data);
            _this._endpoint.redispatch(["update"], _this);
        });

        // Redispatch resize only if we have a context, in the case of no context we dont need to trigger it since the
        // view is not even initialise
        this._endpoint.on("resize", function (size) {
            if (_this._context) _this.emit("resize", size);
        });
        // (in theory we shouldn't have a resize event when we don't have context? But we do... async messaging issue)

        // Redispatch the dispose and resize before setting our listeners since the api dont need to do anything with
        // them before the use rhandle them. We do dispose but we wait for the user to dispose its own things
        this._endpoint.redispatch(["dispose"], this);

        // When we got a dispose, after the user diod whatever they want now we can dispose the endpoint and remove all our listeners.
        this._endpoint.on("dispose", function () {
            _this._endpoint.dispose();_this.removeAllListeners();
        });

        this.queries = {

            /**
             * Helper that creates an empty starter query input object.
             * @returns {Object} a SimpleQuery configured to filter but otherwise empty, ready to have
             * measures and groupings added.
             */
            empty: function empty() {
                return {
                    filter: clone(_this.context().dataConfig.filter)
                };
            },

            /**
             * Helper that creates a table query with the same effect as per manifest.autoQuery=true.
             * @returns {Object} a SimpleQuery fully configured as per groupings and measures from user options
             */
            table: function table() {
                // Automatically uses dataConfig.filter (caller can change after)
                return clone(contextUtil.queries.table(_this.context()));
            },

            /**
             * Helper that creates a grid query with the same effect as per manifest.autoPane=true.
             * @param {boolean} autoQuery If true, include cell queries 'query' and 'shadowQuery' as per
             * manifest.autoQuery=true. If false, don't include any cell queries.
             * @returns {Object} a GridQueryInput fully configured as per user options
             */
            grid: function grid(autoQuery) {
                // Automatically uses dataConfig.filter/shadowFilter (caller can change after)
                return clone(contextUtil.queries.grid(_this.context(), autoQuery));
            }
        };

        /**
         * Updates the context object with the given selection
         * @param {Object} vaue
         * @return {View}
         */
        this.selection.clear = function () {
            this.context().viewSelection = null;return this;
        };
    }

    _inherits(Api, _EventEmitter);

    _createClass(Api, [{
        key: "queryBuilder",

        /**
         * Helper that creates a query builder pre-configured to use the view's query endpoint.
         * DOCUMENTED IN /Views/docs/api/js/view.js
         */
        value: function queryBuilder() {
            return query.builder(this.endpoint());
        }
    }, {
        key: "selection",

        /**
         * Updates the context object with the given selection
         * TODO: remove, unnecessary
         * @param {Object} vaue
         * @return {View}
         */
        value: function selection(value) {

            if (value !== undefined) {
                this.context().viewSelection = value;
                return this;
            }

            return this.context().viewSelection;
        }
    }, {
        key: "parent",

        /**
         * Sets or get the parent element where to render the contents of the custom view
         * UNDOCUMENTED as it is only required for native views.
         * @return {HTMLElement}
         */
        value: function parent(newParent) {
            if (newParent === undefined) return this._parent;
            if (newParent === null) throw new Error("Invalid parent");
            if (this._parent !== newParent && this._parent) throw new Error("Cannot redefine parent");
            this._parent = newParent;
            return this;
        }
    }, {
        key: "context",

        /**
         * Return the context object
         * DOCUMENTED IN /Views/docs/api/js/view.js
         * @return {Object}
         */
        value: function context() {
            if (!this._context) throw new Error("Context not yet available. You must wait for 'load' event first.");
            return this._context;
        }
    }, {
        key: "filter",

        /**
         * Returns the active filter object
         * TODO: remove, unnecessary
         * @return {Object}
         */
        value: function filter() {
            return contextUtil.filters.getFilter(this.context());
        }
    }, {
        key: "shadowFilter",

        /**
         * Return the context object
         * TODO: remove, unnecessary
         * @return {Object}
         */
        value: function shadowFilter() {
            return contextUtil.filters.getShadowFilter(this.context());
        }
    }, {
        key: "hasShadow",

        /**
         * Provides information wheather the shadow should be applied to view
         * TODO: remove, unnecessary
         * @returns {boolean}
         */
        value: function hasShadow() {
            return !!contextUtil.filters.getShadowFilter(this.context());
        }
    }, {
        key: "mappings",

        /**
         * Return the mappings for the data of the project
         * @return {MappingsHelper}
         */
        value: function mappings() {
            return this._mappings;
        }
    }, {
        key: "data",

        /**
         * Return the data from the context
         * TODO: remove, unnecessary, unsafe
         * @return {Object}
         */
        value: function data() {
            return this.context().result ? this.context().result.data : {};
        }
    }, {
        key: "shadowData",

        /**
         * Return the data form the context
         * TODO: remove, unnecessary, unsafe
         * @return {Object}
         */
        value: function shadowData() {
            return this.context().result ? this.context().result.shadowData : {};
        }
    }, {
        key: "schema",

        /**
         * Return the data form the context
         * TODO: remove, wrong
         * @return {Object}
         */
        value: function schema() {
            return this.context().result ? this.context().result.schema : [];
        }
    }, {
        key: "busy",

        /**
         * Sets or gets the busy state of the custom view.
         * DOCUMENTED IN /Views/docs/api/js/view.js
         * @param  {boolean} value
         * @return {View}
         */
        value: function busy(isBusy) {

            if (isBusy === undefined) return this._busy;

            this._busy = isBusy;
            this._endpoint.send("busy", isBusy);
            return this;
        }
    }, {
        key: "endpoint",

        /**
         * Return the current query API endpoint for the custom view
         * DOCUMENTED IN /Views/docs/api/js/view.js
         * TODO: remove, unclear, unnecessary
         * @return {string}
         */
        value: function endpoint() {
            return this.context().dataConfig.queryApiEndpoint;
        }
    }, {
        key: "error",

        /**
         * Send an error message to the container
         * DOCUMENTED IN /Views/docs/api/js/view.js
         * @param {string} message
         * @param {Object} internal
         * @return {View}
         */
        value: function error(message, internal) {
            this._endpoint.send("error", { message: message, internal: internal });
            return this;
        }
    }, {
        key: "updated",

        /**
         * Send an updated message to the container. This should be done after the context change is
         * modified, for example when you update the selection
         * DOCUMENTED IN /Views/docs/api/js/view.js
         * @return {View}
        */
        value: function updated() {
            this._endpoint.send("update", this.context());
            return this;
        }
    }, {
        key: "whitespaceClick",

        /**
         * Send a whitespace message to the container.
         * DOCUMENTED IN /Views/docs/api/js/view.js
         * @return {View}
         */
        value: function whitespaceClick() {
            this._endpoint.send("whitespaceClick", {});
            return this;
        }
    }]);

    return Api;
})(EventEmitter);

module.exports = Api;

},{"@visokio/common/src/context":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\index.js","@visokio/common/src/context/onerror":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\context\\onerror.js","@visokio/common/src/event/EventEmitter":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\event\\EventEmitter.js","@visokio/common/src/util/clone":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\clone.js","@visokio/query-api":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\query-api\\index.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\api\\index.js":[function(require,module,exports){
"use strict";

var Api = require("./Api");

module.exports = {

	create: function create(endpoint, parent) {

		return new Api(endpoint, parent);
	}
};

},{"./Api":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\api\\Api.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\index.js":[function(require,module,exports){
"use strict";

var endpointUtil = require("./util/endpoint");

module.exports = {

	/**
  * @param  {Endpoint} endpoint
  * @param  {Element=} parent
  * @return {Object}
  */
	build: function build(endpoint, parent) {

		var result = {};

		if (!endpoint) endpoint = endpointUtil["default"]();
		if (endpoint) {
			// These require an endpoint
			result.view = require("./api/index.js").create(endpoint, parent);
			result.tools = require("./tools").create(endpoint);
		}

		// These don't
		result.query = require("@visokio/query-api");
		result.paning = require("@visokio/paning");

		return result;
	}
};

},{"./api/index.js":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\api\\index.js","./tools":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\tools\\index.js","./util/endpoint":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\util\\endpoint.js","@visokio/paning":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\paning\\index.js","@visokio/query-api":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\query-api\\index.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\tools\\Watermark.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Watermark = (function () {
	function Watermark(endpoint) {
		_classCallCheck(this, Watermark);

		this._endpoint = endpoint || require("../util/endpoint").endpoint;
	}

	_createClass(Watermark, [{
		key: "show",
		value: function show(info) {
			this._endpoint.send("watermark.show", info);
		}
	}, {
		key: "hide",
		value: function hide(id) {
			this._endpoint.send("watermark.hide", id);
		}
	}]);

	return Watermark;
})();

module.exports = Watermark;

},{"../util/endpoint":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\util\\endpoint.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\tools\\index.js":[function(require,module,exports){
"use strict";

var Watermark = require("./Watermark");

module.exports = {
	create: function create(endpoint) {
		return {
			watermark: new Watermark(endpoint)
		};
	}
};

},{"./Watermark":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\tools\\Watermark.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\util\\endpoint.js":[function(require,module,exports){

// THIs is only used when dealing with iframe communication, the native one is done by requiring the api factory method module
// and setting an enpoint previously created by the loader

"use strict";

var comm = require("@visokio/chart-communication");
var query = require("@visokio/common/src/util/url").parse();

module.exports = {

    "default": function _default() {

        if (!query.source || !query.target) {
            // This is now permitted, so you can use the omniscope.js library outside of a view,
            // e.g. for query building.
            console.log("Unable to create communication channel in \"" + window.location.href + "\" with view for the source \"" + query.source + "\" and target \"" + query.target + "\"");
            return null;
        }

        return comm.endpoint(query.target, query.source, window.parent);
    }
};

},{"@visokio/chart-communication":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\chart-communication\\index.js","@visokio/common/src/util/url":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\url.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\query-api\\index.js":[function(require,module,exports){

"use strict";

module.exports = require("./src");

},{"./src":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\query-api\\src\\index.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\query-api\\src\\index.js":[function(require,module,exports){

"use strict";

var QueryBuilder = require("./query/QueryBuilder");

module.exports = {
    builder: function builder(endpoint, translateOptions) {
        if (!endpoint) throw new Error("Endpoint not defined, did you access omniscope.view.endpoint() before load/update happen?");
        return new QueryBuilder(endpoint, translateOptions);
    }
};

},{"./query/QueryBuilder":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\query-api\\src\\query\\QueryBuilder.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\query-api\\src\\query\\QueryBuilder.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var QueuedQueryRequest = require("./QueuedQueryRequest");
var clone = require("@visokio/common/src/util/clone");

// Version of the Query API to use when we make the calls to the endpoint
var QUERY_API_VERSION = "1";

/**
 * Object used to create query objects that can make request to the query api
 */

var QueryBuilder = (function () {

	/**
  * @constructor
  * @param {string} endpoint Url of the endpoint minus the version, the /vX.X/ will be injected.
  *                          For example "http://localhost:41121/mobile/api"
  */

	function QueryBuilder(endpoint) {
		_classCallCheck(this, QueryBuilder);

		/**
   * Query API endpoint
   * @private
   * @type {string}
   */
		this._endpoint = endpoint;

		/**
   * Base url used for the calls, compose with the endpoint and the version
   * @private
   * @type {string}
   */
		this._baseUrl = this._endpoint + "/v" + QUERY_API_VERSION + "/";
	}

	_createClass(QueryBuilder, [{
		key: "_request",

		/**
   * Create a new query object with the specified method and query
   * @private
   * @param {string} url 		Url of the endpoint, this._baseUrl, including the method.
   *                       	For example "http://localhost/api/v1/table"
   * @param {object} query 	Query API input object (see Query API docs).
   *                          For example {"fields": ["Product_name"]}
   * @param {object} filters 	Optional filters, will be inserted into the query PENDING get rid of this
   */
		value: function _request(url, query, filters) {

			var params = clone(query);

			// We need to filter since a filter: null would return and error
			if (filters) {
				params.filter = filters;
			}

			// Call the api in a queue instead of doing it directly
			// so we dont make too many request in parallel and kill the server
			return new QueuedQueryRequest({
				url: url,
				method: "POST",
				data: params
			});
		}
	}, {
		key: "_table",

		/**
   * Table api query (see Query API docs).
   * @private
   * @param {Object} query
   * @param {Object} filters
   */
		value: function _table(query, filters) {
			return this._request(this._baseUrl + "table", query, filters);
		}
	}, {
		key: "_grid",

		/**
   * Grid size and data api query (see Query API docs).
   * @private
   * @param {Object} query
   */
		value: function _grid(query, filters) {
			return this._request(this._baseUrl + "grid", query, filters);
		}
	}, {
		key: "_gridSize",

		/**
   * Grid size api query (see Query API docs).
   * @private
   * @param {Object} query
   */
		value: function _gridSize(query, filters) {
			return this._request(this._baseUrl + "grid/size", query, filters);
		}
	}, {
		key: "_gridData",

		/**
   * Grid data api query (see Query API docs).
   * @private
   * @param {Object} query
   */
		value: function _gridData(query, filters) {
			return this._request(this._baseUrl + "grid/data", query, filters);
		}
	}, {
		key: "_schemaFields",

		/**
  * Grid data api query (see Query API docs).
  * @private
  */
		value: function _schemaFields() {
			// PENDING: update, now deprecated, instead we have new schema(query) > object
			return this._request(this._baseUrl + "schema/fields", {});
		}
	}, {
		key: "_batch",

		/**
   * Batch api query (see Query API docs).
   * @private
   * @param {Object} queries The object containing a batch of keyed queries, or an array containing the batch of queries.
   */
		value: function _batch(query, filters) {
			return this._request(this._baseUrl + "batch", query);
		}
	}, {
		key: "endpoint",
		value: function endpoint() {
			return this._endpoint;
		}
	}, {
		key: "table",

		/**
   * Getter that returns the method that make the default table query. It has properties mapped
   * to all the different operations that you can do in the table api.
   * @return {Function}
   */
		get: function get() {

			var method = this._table.bind(this);

			return method;
		}
	}, {
		key: "grid",

		/**
   * Getter that returns the method that make the default grid query. It has properties mapped
   * to all the different operations that you can do in the grid api. For example you can do ".grid()" or
   * ".grid.size()"
   * @return {Function}
   */
		get: function get() {

			var method = this._grid.bind(this);
			method.size = this._gridSize.bind(this);
			method.data = this._gridData.bind(this);

			return method;
		}
	}, {
		key: "schema",

		/**
  * Getter that returns the method that make the default grid query. It has properties mapped
  * to all the different operations that you can do in the grid api. For example you can do ".grid()" or
  * ".grid.size()"
  * @return {Function}
  */
		get: function get() {

			var method = this._schemaFields.bind(this);
			method.fields = this._schemaFields.bind(this);

			return method;
		}
	}, {
		key: "batch",

		/**
   * Getter that returns the method that makes the batch query.
   * @return {Function}
   */
		get: function get() {
			return this._batch.bind(this);
		}
	}]);

	return QueryBuilder;
})();

module.exports = QueryBuilder;

},{"./QueuedQueryRequest":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\query-api\\src\\query\\QueuedQueryRequest.js","@visokio/common/src/util/clone":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\util\\clone.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\query-api\\src\\query\\QueuedQueryRequest.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var queue = require("../util/queue");
var Request = require("@visokio/common/src/xhr/Request");

/**
 * Class that represent a queues query call
 */

var QueuedQueryRequest = (function (_Request) {

  /**
   * @param {string} url
   * @param {object} query
   * @param {string} origin
   */

  function QueuedQueryRequest(_ref) {
    var url = _ref.url;
    var method = _ref.method;
    var data = _ref.data;
    var respContentType = _ref.respContentType;
    var contentType = _ref.contentType;
    var origin = _ref.origin;

    _classCallCheck(this, QueuedQueryRequest);

    _get(Object.getPrototypeOf(QueuedQueryRequest.prototype), "constructor", this).call(this, { url: url, method: method, data: data, respContentType: respContentType, contentType: contentType });

    /**
     * Origin of the query. Used to create different queues TODO implement this and make QueuedQuery in fact
     * a common util QueuedRequest.
     *
     * @type {string}
     */
    this._origin = origin;
  }

  _inherits(QueuedQueryRequest, _Request);

  _createClass(QueuedQueryRequest, [{
    key: "execute",

    /**
     * Execute the query by adding it to the queue isntaead of doing it directly
     * @return {QueuedQuery}
     */
    value: function execute() {

      // We build and object with the instance so the queue can listen to its events
      // and the original execute mehtod of the query
      queue.add({
        instance: this,
        execute: _get(Object.getPrototypeOf(QueuedQueryRequest.prototype), "execute", this).bind(this)
      });

      this.emit("queue", { xhr: this._xhr });

      return this;
    }
  }]);

  return QueuedQueryRequest;
})(Request);

module.exports = QueuedQueryRequest;

},{"../util/queue":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\query-api\\src\\util\\queue.js","@visokio/common/src/xhr/Request":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\common\\src\\xhr\\Request.js"}],"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\query-api\\src\\util\\queue.js":[function(require,module,exports){
/**
* Number of queries we can run in parallel when we do a queued query.
* @type {number}
*/
"use strict";

var PARALELL_QUERIES = 1;

/**
* List of pending queries
* @type {Array}
*/
var queue = [];

/**
 * List of currently executign queries
 * @type {Array}
 */
var executing = [];

/**
 * Method that checks if we should execute a pending query
 */
function check() {

    if (executing.length >= PARALELL_QUERIES || !queue.length) {
        return;
    }

    var item = queue.splice(0, 1)[0];

    item.instance.on("end", (function () {

        var position = executing.indexOf(this);
        executing.splice(position, 1);

        check();
    }).bind(item));

    item.execute();
}

module.exports = {

    /**
     * Add a object with the query instance and execute method as an item to the queue
     * @param {Object} query Query like object with the instance and the execute method:
     *                       {instance: Query, execute: function(){}}
     */
    add: function add(item) {
        queue.push(item);
        check();
    },

    /**
     * Clear the pending queue. If cancel is true also cancelall the currently executing queries
     * @param  {boolean} cancel
     */
    clear: function clear(cancel) {
        queue = [];

        if (cancel) {
            executing.forEach(function (item) {
                item.instance.cancel();
            });
        }
    }
};

},{}],"omniscope-view-api":[function(require,module,exports){
"use strict";

window.omniscope = require("./src").build();

module.exports = window.omniscope.view;

},{"./src":"C:\\Visokio\\OmniscopeAlt\\Views\\node_modules\\@visokio\\public-api\\src\\index.js"}]},{},["omniscope-view-api"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9Admlzb2tpby9idWlsZC1oZWxwZXJzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vYnVpbGQtaGVscGVycy9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vYnVpbGQtaGVscGVycy9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL2J1aWxkLWhlbHBlcnMvbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vYnVpbGQtaGVscGVycy9ub2RlX21vZHVsZXMvaXMtYXJyYXkvaW5kZXguanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vY2hhcnQtY29tbXVuaWNhdGlvbi9pbmRleC5qcyIsIkM6L1Zpc29raW8vT21uaXNjb3BlQWx0L1ZpZXdzL25vZGVfbW9kdWxlcy9Admlzb2tpby9jaGFydC1jb21tdW5pY2F0aW9uL3NyYy9jYXJyaWVyLmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL2NoYXJ0LWNvbW11bmljYXRpb24vc3JjL2VuZHBvaW50LmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL2NoYXJ0LWNvbW11bmljYXRpb24vc3JjL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL0B2aXNva2lvL2NvbW1vbi9ub2RlX21vZHVsZXMvY2xvbmUvY2xvbmUuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vY29tbW9uL25vZGVfbW9kdWxlcy9ldmVudGVtaXR0ZXIyL2xpYi9ldmVudGVtaXR0ZXIyLmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL2NvbW1vbi9zcmMvY29udGV4dC9NYXBwaW5nc0ZpZWxkLmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL2NvbW1vbi9zcmMvY29udGV4dC9NYXBwaW5nc0hlbHBlci5qcyIsIkM6L1Zpc29raW8vT21uaXNjb3BlQWx0L1ZpZXdzL25vZGVfbW9kdWxlcy9Admlzb2tpby9jb21tb24vc3JjL2NvbnRleHQvTWFwcGluZ3NLZXkuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vY29tbW9uL3NyYy9jb250ZXh0L2F1dG9RdWVyeUJ1aWxkaW5nLmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL2NvbW1vbi9zcmMvY29udGV4dC9kYXRhLmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL2NvbW1vbi9zcmMvY29udGV4dC9maWx0ZXJzLmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL2NvbW1vbi9zcmMvY29udGV4dC9pbmRleC5qcyIsIkM6L1Zpc29raW8vT21uaXNjb3BlQWx0L1ZpZXdzL25vZGVfbW9kdWxlcy9Admlzb2tpby9jb21tb24vc3JjL2NvbnRleHQvb25lcnJvci5qcyIsIkM6L1Zpc29raW8vT21uaXNjb3BlQWx0L1ZpZXdzL25vZGVfbW9kdWxlcy9Admlzb2tpby9jb21tb24vc3JjL2NvbnRleHQvcXVlcmllcy5qcyIsIkM6L1Zpc29raW8vT21uaXNjb3BlQWx0L1ZpZXdzL25vZGVfbW9kdWxlcy9Admlzb2tpby9jb21tb24vc3JjL2V2ZW50L0V2ZW50RW1pdHRlci5qcyIsIkM6L1Zpc29raW8vT21uaXNjb3BlQWx0L1ZpZXdzL25vZGVfbW9kdWxlcy9Admlzb2tpby9jb21tb24vc3JjL3V0aWwvY2xvbmUuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vY29tbW9uL3NyYy91dGlsL2RvbS5qcyIsIkM6L1Zpc29raW8vT21uaXNjb3BlQWx0L1ZpZXdzL25vZGVfbW9kdWxlcy9Admlzb2tpby9jb21tb24vc3JjL3V0aWwvZXZlbnRzLmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL2NvbW1vbi9zcmMvdXRpbC9sb2dnZXIuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vY29tbW9uL3NyYy91dGlsL3VybC5qcyIsIkM6L1Zpc29raW8vT21uaXNjb3BlQWx0L1ZpZXdzL25vZGVfbW9kdWxlcy9Admlzb2tpby9jb21tb24vc3JjL3V0aWwvdXNlcmFnZW50LmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL2NvbW1vbi9zcmMveGhyL1JlcXVlc3QuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vcGFuaW5nL2luZGV4LmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL3BhbmluZy9zcmMvUGFuaW5nLmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL3BhbmluZy9zcmMvY2VsbC9QYW5lQ2VsbC5qcyIsIkM6L1Zpc29raW8vT21uaXNjb3BlQWx0L1ZpZXdzL25vZGVfbW9kdWxlcy9Admlzb2tpby9wYW5pbmcvc3JjL2NlbGwvUGFuZUlGcmFtZUNlbGwuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vcGFuaW5nL3NyYy9jZWxsL2luZGV4LmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL3BhbmluZy9zcmMvZ3JpZEJ1aWxkZXIuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vcGFuaW5nL3NyYy9pbmRleC5qcyIsIkM6L1Zpc29raW8vT21uaXNjb3BlQWx0L1ZpZXdzL25vZGVfbW9kdWxlcy9Admlzb2tpby9wYW5pbmcvc3JjL2xheW91dC9hcmVhLmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL3BhbmluZy9zcmMvbGF5b3V0L3BhbmVzLmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL3BhbmluZy9zcmMvdXRpbC93YXRlcm1hcmsuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vcHVibGljLWFwaS9zcmMvYXBpL0FwaS5qcyIsIkM6L1Zpc29raW8vT21uaXNjb3BlQWx0L1ZpZXdzL25vZGVfbW9kdWxlcy9Admlzb2tpby9wdWJsaWMtYXBpL3NyYy9hcGkvaW5kZXguanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vcHVibGljLWFwaS9zcmMvaW5kZXguanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vcHVibGljLWFwaS9zcmMvdG9vbHMvV2F0ZXJtYXJrLmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL3B1YmxpYy1hcGkvc3JjL3Rvb2xzL2luZGV4LmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL3B1YmxpYy1hcGkvc3JjL3V0aWwvZW5kcG9pbnQuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vcXVlcnktYXBpL2luZGV4LmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL3F1ZXJ5LWFwaS9zcmMvaW5kZXguanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vcXVlcnktYXBpL3NyYy9xdWVyeS9RdWVyeUJ1aWxkZXIuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vcXVlcnktYXBpL3NyYy9xdWVyeS9RdWV1ZWRRdWVyeVJlcXVlc3QuanMiLCJDOi9WaXNva2lvL09tbmlzY29wZUFsdC9WaWV3cy9ub2RlX21vZHVsZXMvQHZpc29raW8vcXVlcnktYXBpL3NyYy91dGlsL3F1ZXVlLmpzIiwiQzovVmlzb2tpby9PbW5pc2NvcGVBbHQvVmlld3Mvbm9kZV9tb2R1bGVzL0B2aXNva2lvL3B1YmxpYy1hcGkvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQUksTUFBTSxHQUFHLGtFQUFrRSxDQUFDOztBQUVoRixDQUFDLEFBQUMsQ0FBQSxVQUFVLE9BQU8sRUFBRTtBQUNwQixhQUFZLENBQUM7O0FBRVosS0FBSSxHQUFHLEdBQUcsQUFBQyxPQUFPLFVBQVUsS0FBSyxXQUFXLEdBQ3hDLFVBQVUsR0FDVixLQUFLLENBQUE7O0FBRVYsS0FBSSxJQUFJLEdBQUssR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM5QixLQUFJLEtBQUssR0FBSSxHQUFHLENBQUMsVUFBVSxDQUFD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SSxDQUFDLE1BQU0sQ0FBQyxDQUFBOztBQUUzRCxNQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDdEIsTUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFBO0FBQ1gsTUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ1QsU0FBTyxFQUFFLENBQUMsR0FBRyxVQUFVLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQSxBQUFDLEVBQUU7QUFDekMsT0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFBO0dBQzlCO0FBQ0QsS0FBRyxJQUFJLElBQUksQ0FBQTs7QUFFWCxNQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQTs7QUFFbEQsU0FBTyxHQUFHLENBQUE7Q0FDWCxDQUFBOztBQUVELE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsU0FBUyxDQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFO0FBQzdFLFFBQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0FBQ25CLFlBQVUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFBO0FBQzNCLE1BQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBOztBQUUzRCxNQUFJLENBQUMsR0FBRyxVQUFVLENBQUE7QUFDbEIsTUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFBO0FBQ1gsTUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQzVCLFNBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFBLEFBQUMsRUFBRTtBQUM5QixPQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQTtHQUNoQztBQUNELEtBQUcsSUFBSSxJQUFJLENBQUE7O0FBRVgsTUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUE7O0FBRWxELFNBQU8sR0FBRyxDQUFBO0NBQ1gsQ0FBQTs7QUFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxTQUFTLFFBQVEsQ0FBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQy9ELE1BQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2xELE1BQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFBLEFBQUMsRUFBRSxPQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqRCxTQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQztDQUN4QyxDQUFBOztBQUVELE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFNBQVMsV0FBVyxDQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7QUFDckUsTUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDbEQsTUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxBQUFDLENBQUE7QUFDaEQsU0FBTyxBQUFDLEdBQUcsR0FBRyxNQUFNLEdBQUksR0FBRyxHQUFHLFVBQVUsR0FBRyxHQUFHLENBQUE7Q0FDL0MsQ0FBQTs7QUFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxTQUFTLFdBQVcsQ0FBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQ3JFLE1BQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2xELE1BQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQUFBQyxDQUFBO0FBQ2hELFNBQU8sQUFBQyxHQUFHLEdBQUcsTUFBTSxHQUFJLEdBQUcsR0FBRyxVQUFVLEdBQUcsR0FBRyxDQUFBO0NBQy9DLENBQUE7O0FBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsU0FBUyxXQUFXLENBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtBQUNyRSxNQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFbEQsU0FBTyxBQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEFBQUMsR0FDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEFBQUMsR0FDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEFBQUMsQ0FBQTtDQUMzQixDQUFBOztBQUVELE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFNBQVMsV0FBVyxDQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7QUFDckUsTUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7O0FBRWxELFNBQU8sQUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQUFBQyxHQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQUFBQyxHQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxBQUFDLENBQUE7Q0FDckIsQ0FBQTs7QUFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxTQUFTLFdBQVcsQ0FBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQ3JFLE1BQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2xELFNBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7Q0FDL0MsQ0FBQTs7QUFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxTQUFTLFdBQVcsQ0FBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQ3JFLE1BQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2xELFNBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7Q0FDaEQsQ0FBQTs7QUFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxTQUFTLFlBQVksQ0FBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQ3ZFLE1BQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2xELFNBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7Q0FDL0MsQ0FBQTs7QUFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxTQUFTLFlBQVksQ0FBRSxNQUFNLEVBQUUsUUFBUSxFQUFFO0FBQ3ZFLE1BQUksQ0FBQyxRQUFRLEVB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QUFLLENBQUE7QUFDZCxRQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQTtBQUNuQixNQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQTs7QUFFM0MsWUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUE7R0FDN0Q7O0FBRUQsTUFBSSxDQUFDLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQTtBQUN0QixNQUFJLEdBQUcsR0FBRyxDQUFDLENBQUE7QUFDWCxNQUFJLEdBQUcsR0FBRyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDM0IsTUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFBO0FBQy9CLFNBQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUEsQUFBQyxFQUFFO0FBQ2pDLFFBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxBQUFDLEtBQUssR0FBRyxHQUFHLElBQUssQ0FBQyxDQUFBLEdBQUksR0FBRyxHQUFHLElBQUksQ0FBQTtHQUNyRDs7QUFFRCxTQUFPLE1BQU0sR0FBRyxVQUFVLENBQUE7Q0FDM0IsQ0FBQTs7QUFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxTQUFTLFNBQVMsQ0FBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRTtBQUN4RSxPQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUE7QUFDZCxRQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQTtBQUNuQixNQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDNUQsTUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUMxRCxNQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFBO0FBQ3ZDLE1BQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUE7QUFDcEIsU0FBTyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0NBQ2xCLENBQUE7O0FBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsU0FBUyxZQUFZLENBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7QUFDOUUsT0FBSyxHQUFHLENBQUMsS0FBSyxDQUFBO0FBQ2QsUUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUE7QUFDbkIsTUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2hFLE1BQUksTUFBTSxDQUFDLG1CQUFtQixFQUFFO0FBQzlCLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUE7QUFDcEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBSSxLQUFLLEtBQUssQ0FBQyxBQUFDLENBQUE7R0FDakMsTUFBTTtBQUNMLHFCQUFpQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFBO0dBQzdDO0FBQ0QsU0FBTyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0NBQ2xCLENBQUE7O0FBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsU0FBUyxZQUFZLENBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7QUFDOUUsT0FBSyxHQUFHLENBQUMsS0FBSyxDQUFBO0FBQ2QsUUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUE7QUFDbkIsTUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2hFLE1BQUksTUFBTSxDQUFDLG1CQUFtQixFQUFFO0FBQzlCLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBSSxLQUFLLEtBQUssQ0FBQyxBQUFDLENBQUE7QUFDNUIsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUE7R0FDekIsTUFBTTtBQUNMLHFCQUFpQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFBO0dBQzlDO0FBQ0QsU0FBTyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0NBQ2xCLENBQUE7O0FBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsU0FBUyxZQUFZLENBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7QUFDOUUsT0FBSyxHQUFHLENBQUMsS0FBSyxDQUFBO0FBQ2QsUUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUE7QUFDbkIsTUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ3hFLE1BQUksTUFBTSxDQUFDLG1CQUFtQixFQUFFO0FBQzlCLFFBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUE7QUFDcEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBSSxLQUFLLEtBQUssQ0FBQyxBQUFDLENBQUE7QUFDaEMsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBSSxLQUFLLEtBQUssRUFBRSxBQUFDLENBQUE7QUFDakMsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBSSxLQUFLLEtBQUssRUFB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LEdBQUcsQ0FBQyxDQUFDLENBQUE7O0FBRTFCLEdBQUMsSUFBSSxDQUFDLENBQUE7O0FBRU4sR0FBQyxHQUFHLENBQUMsR0FBSSxDQUFDLENBQUMsSUFBSyxDQUFDLEtBQUssQ0FBQyxHQUFJLENBQUMsQUFBQyxDQUFBO0FBQzdCLEdBQUMsS0FBTSxDQUFDLEtBQUssQUFBQyxDQUFBO0FBQ2QsT0FBSyxJQUFJLElBQUksQ0FBQTtBQUNiLFNBQU8sS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsRUFBRSxFQUFFOztBQUUxRSxHQUFDLEdBQUcsQ0FBQyxHQUFJLENBQUMsQ0FBQyxJQUFLLENBQUMsS0FBSyxDQUFDLEdBQUksQ0FBQyxBQUFDLENBQUE7QUFDN0IsR0FBQyxLQUFNLENBQUMsS0FBSyxBQUFDLENBQUE7QUFDZCxPQUFLLElBQUksSUFBSSxDQUFBO0FBQ2IsU0FBTyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFLEVBQUU7O0FBRTFFLE1BQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNYLEtBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFBO0dBQ2QsTUFBTSxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7QUFDckIsV0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQSxHQUFJLFFBQVEsQUFBQyxDQUFBO0dBQzNDLE1BQU07QUFDTCxLQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO0FBQ3pCLEtBQUMsR0FBRyxDQUFDLEdB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LFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQzthQUMxQixDQUFDLENBQUM7U0FDTjtLQUNKO0NBQ0osQ0FBQzs7Ozs7QUNqRUYsTUFBTSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRTVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG4iLCIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnaXMtYXJyYXknKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gU2xvd0J1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxudmFyIHJvb3RQYXJlbnQgPSB7fVxuXG4vKipcbiAqIElmIGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGA6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChtb3N0IGNvbXBhdGlibGUsIGV2ZW4gSUU2KVxuICpcbiAqIEJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0eXBlZCBhcnJheXMgYXJlIElFIDEwKywgRmlyZWZveCA0KywgQ2hyb21lIDcrLCBTYWZhcmkgNS4xKyxcbiAqIE9wZXJhIDExLjYrLCBpT1MgNC4yKy5cbiAqXG4gKiBEdWUgdG8gdmFyaW91cyBicm93c2VyIGJ1Z3MsIHNvbWV0aW1lcyB0aGUgT2JqZWN0IGltcGxlbWVudGF0aW9uIHdpbGwgYmUgdXNlZCBldmVuXG4gKiB3aGVuIHRoZSBicm93c2VyIHN1cHBvcnRzIHR5cGVkIGFycmF5cy5cbiAqXG4gKiBOb3RlOlxuICpcbiAqICAgLSBGaXJlZm94IDQtMjkgbGFja3Mgc3VwcG9ydCBmb3IgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsXG4gKiAgICAgU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzguXG4gKlxuICogICAtIFNhZmFyaSA1LTcgbGFja3Mgc3VwcG9ydCBmb3IgY2hhbmdpbmcgdGhlIGBPYmplY3QucHJvdG90eXBlLmNvbnN0cnVjdG9yYCBwcm9wZXJ0eVxuICogICAgIG9uIG9iamVjdHMuXG4gKlxuICogICAtIENocm9tZSA5LTEwIGlzIG1pc3NpbmcgdGhlIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24uXG4gKlxuICogICAtIElFMTAgaGFzIGEgYnJva2VuIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhcnJheXMgb2ZcbiAqICAgICBpbmNvcnJlY3QgbGVuZ3RoIGluIHNvbWUgc2l0dWF0aW9ucy5cblxuICogV2UgZGV0ZWN0IHRoZXNlIGJ1Z2d5IGJyb3dzZXJzIGFuZCBzZXQgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYCB0byBgZmFsc2VgIHNvIHRoZXlcbiAqIGdldCB0aGUgT2JqZWN0IGltcGxlbWVudGF0aW9uLCB3aGljaCBpcyBzbG93ZXIgYnV0IGJlaGF2ZXMgY29ycmVjdGx5LlxuICovXG5CdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCA9IChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEJhciAoKSB7fVxuICB0cnkge1xuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheSgxKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgYXJyLmNvbnN0cnVjdG9yID0gQmFyXG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDIgJiYgLy8gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWRcbiAgICAgICAgYXJyLmNvbnN0cnVjdG9yID09PSBCYXIgJiYgLy8gY29uc3RydWN0b3IgY2FuIGJlIHNldFxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nICYmIC8vIGNocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICAgICAgICBhcnIuc3ViYXJyYXkoMSwgMSkuYnl0ZUxlbmd0aCA9PT0gMCAvLyBpZTEwIGhhcyBicm9rZW4gYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuZnVuY3Rpb24ga01heExlbmd0aCAoKSB7XG4gIHJldHVybiBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVFxuICAgID8gMHg3ZmZmZmZmZlxuICAgIDogMHgzZmZmZmZmZlxufVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChhcmcpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICAvLyBBdm9pZCBnb2luZyB0aHJvdWdoIGFuIEFyZ3VtZW50c0FkYXB0b3JUcmFtcG9saW5lIGluIHRoZSBjb21tb24gY2FzZS5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHJldHVybiBuZXcgQnVmZmVyKGFyZywgYXJndW1lbnRzWzFdKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKGFyZylcbiAgfVxuXG4gIHRoaXMubGVuZ3RoID0gMFxuICB0aGlzLnBhcmVudCA9IHVuZGVmaW5lZFxuXG4gIC8vIENvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gZnJvbU51bWJlcih0aGlzLCBhcmcpXG4gIH1cblxuICAvLyBTbGlnaHRseSBsZXNzIGNvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh0aGlzLCBhcmcsIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogJ3V0ZjgnKVxuICB9XG5cbiAgLy8gVW51c3VhbC5cbiAgcmV0dXJuIGZyb21PYmplY3QodGhpcywgYXJnKVxufVxuXG5mdW5jdGlvbiBmcm9tTnVtYmVyICh0aGF0LCBsZW5ndGgpIHtcbiAgdGhhdCA9IGFsbG9jYXRlKHRoYXQsIGxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChsZW5ndGgpIHwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoYXRbaV0gPSAwXG4gICAgfVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHRoYXQsIHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIC8vIEFzc3VtcHRpb246IGJ5dGVMZW5ndGgoKSByZXR1cm4gdmFsdWUgaXMgYWx3YXlzIDwga01heExlbmd0aC5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHRoYXQgPSBhbGxvY2F0ZSh0aGF0LCBsZW5ndGgpXG5cbiAgdGhhdC53cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tT2JqZWN0ICh0aGF0LCBvYmplY3QpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihvYmplY3QpKSByZXR1cm4gZnJvbUJ1ZmZlcih0aGF0LCBvYmplY3QpXG5cbiAgaWYgKGlzQXJyYXkob2JqZWN0KSkgcmV0dXJuIGZyb21BcnJheSh0aGF0LCBvYmplY3QpXG5cbiAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbXVzdCBzdGFydCB3aXRoIG51bWJlciwgYnVmZmVyLCBhcnJheSBvciBzdHJpbmcnKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAob2JqZWN0LmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICByZXR1cm4gZnJvbVR5cGVkQXJyYXkodGhhdCwgb2JqZWN0KVxuICAgIH1cbiAgICBpZiAob2JqZWN0IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodGhhdCwgb2JqZWN0KVxuICAgIH1cbiAgfVxuXG4gIGlmIChvYmplY3QubGVuZ3RoKSByZXR1cm4gZnJvbUFycmF5TGlrZSh0aGF0LCBvYmplY3QpXG5cbiAgcmV0dXJuIGZyb21Kc29uT2JqZWN0KHRoYXQsIG9iamVjdClcbn1cblxuZnVuY3Rpb24gZnJvbUJ1ZmZlciAodGhhdCwgYnVmZmVyKSB7XG4gIHZhciBsZW5ndGggPSBjaGVja2VkKGJ1ZmZlci5sZW5ndGgpIHwgMFxuICB0aGF0ID0gYWxsb2NhdGUodGhhdCwgbGVuZ3RoKVxuICBidWZmZXIuY29weSh0aGF0LCAwLCAwLCBsZW5ndGgpXG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheSAodGhhdCwgYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdGhhdCA9IGFsbG9jYXRlKHRoYXQsIGxlbmd0aClcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIHRoYXRbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbi8vIER1cGxpY2F0ZSBvZiBmcm9tQXJyYXkoKSB0byBrZWVwIGZyb21BcnJheSgpIG1vbm9tb3JwaGljLlxuZnVuY3Rpb24gZnJvbVR5cGVkQXJyYXkgKHRoYXQsIGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHRoYXQgPSBhbGxvY2F0ZSh0aGF0LCBsZW5ndGgpXG4gIC8vIFRydW5jYXRpbmcgdGhlIGVsZW1lbnRzIGlzIHByb2JhYmx5IG5vdCB3aGF0IHBlb3BsZSBleHBlY3QgZnJvbSB0eXBlZFxuICAvLyBhcnJheXMgd2l0aCBCWVRFU19QRVJfRUxFTUVOVCA+IDEgYnV0IGl0J3MgY29tcGF0aWJsZSB3aXRoIHRoZSBiZWhhdmlvclxuICAvLyBvZiB0aGUgb2xkIEJ1ZmZlciBjb25zdHJ1Y3Rvci5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIHRoYXRbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAodGhhdCwgYXJyYXkpIHtcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UsIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYXJyYXkuYnl0ZUxlbmd0aFxuICAgIHRoYXQgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkoYXJyYXkpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gYW4gb2JqZWN0IGluc3RhbmNlIG9mIHRoZSBCdWZmZXIgY2xhc3NcbiAgICB0aGF0ID0gZnJvbVR5cGVkQXJyYXkodGhhdCwgbmV3IFVpbnQ4QXJyYXkoYXJyYXkpKVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKHRoYXQsIGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHRoYXQgPSBhbGxvY2F0ZSh0aGF0LCBsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICB0aGF0W2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG4vLyBEZXNlcmlhbGl6ZSB7IHR5cGU6ICdCdWZmZXInLCBkYXRhOiBbMSwyLDMsLi4uXSB9IGludG8gYSBCdWZmZXIgb2JqZWN0LlxuLy8gUmV0dXJucyBhIHplcm8tbGVuZ3RoIGJ1ZmZlciBmb3IgaW5wdXRzIHRoYXQgZG9uJ3QgY29uZm9ybSB0byB0aGUgc3BlYy5cbmZ1bmN0aW9uIGZyb21Kc29uT2JqZWN0ICh0aGF0LCBvYmplY3QpIHtcbiAgdmFyIGFycmF5XG4gIHZhciBsZW5ndGggPSAwXG5cbiAgaWYgKG9iamVjdC50eXBlID09PSAnQnVmZmVyJyAmJiBpc0FycmF5KG9iamVjdC5kYXRhKSkge1xuICAgIGFycmF5ID0gb2JqZWN0LmRhdGFcbiAgICBsZW5ndGggPSBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIH1cbiAgdGhhdCA9IGFsbG9jYXRlKHRoYXQsIGxlbmd0aClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgdGhhdFtpXSA9IGFycmF5W2ldICYgMjU1XG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gYWxsb2NhdGUgKHRoYXQsIGxlbmd0aCkge1xuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSwgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICB0aGF0ID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBhbiBvYmplY3QgaW5zdGFuY2Ugb2YgdGhlIEJ1ZmZlciBjbGFzc1xuICAgIHRoYXQubGVuZ3RoID0gbGVuZ3RoXG4gICAgdGhhdC5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgZnJvbVBvb2wgPSBsZW5ndGggIT09IDAgJiYgbGVuZ3RoIDw9IEJ1ZmZlci5wb29sU2l6ZSA+Pj4gMVxuICBpZiAoZnJvbVBvb2wpIHRoYXQucGFyZW50ID0gcm9vdFBhcmVudFxuXG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBrTWF4TGVuZ3RoYCBoZXJlIGJlY2F1c2UgdGhhdCBmYWlscyB3aGVuXG4gIC8vIGxlbmd0aCBpcyBOYU4gKHdoaWNoIGlzIG90aGVyd2lzZSBjb2VyY2VkIHRvIHplcm8uKVxuICBpZiAobGVuZ3RoID49IGtNYXhMZW5ndGgoKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIGFsbG9jYXRlIEJ1ZmZlciBsYXJnZXIgdGhhbiBtYXhpbXVtICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdzaXplOiAweCcgKyBrTWF4TGVuZ3RoKCkudG9TdHJpbmcoMTYpICsgJyBieXRlcycpXG4gIH1cbiAgcmV0dXJuIGxlbmd0aCB8IDBcbn1cblxuZnVuY3Rpb24gU2xvd0J1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNsb3dCdWZmZXIpKSByZXR1cm4gbmV3IFNsb3dCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcpXG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGRlbGV0ZSBidWYucGFyZW50XG4gIHJldHVybiBidWZcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuICEhKGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChhLCBiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGEpIHx8ICFCdWZmZXIuaXNCdWZmZXIoYikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgbXVzdCBiZSBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChhID09PSBiKSByZXR1cm4gMFxuXG4gIHZhciB4ID0gYS5sZW5ndGhcbiAgdmFyIHkgPSBiLmxlbmd0aFxuXG4gIHZhciBpID0gMFxuICB2YXIgbGVuID0gTWF0aC5taW4oeCwgeSlcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkgYnJlYWtcblxuICAgICsraVxuICB9XG5cbiAgaWYgKGkgIT09IGxlbikge1xuICAgIHggPSBhW2ldXG4gICAgeSA9IGJbaV1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiBpc0VuY29kaW5nIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghaXNBcnJheShsaXN0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcignbGlzdCBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcihsZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHN0cmluZyA9ICcnICsgc3RyaW5nXG5cbiAgdmFyIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBVc2UgYSBmb3IgbG9vcCB0byBhdm9pZCByZWN1cnNpb25cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAvLyBEZXByZWNhdGVkXG4gICAgICBjYXNlICdyYXcnOlxuICAgICAgY2FzZSAncmF3cyc6XG4gICAgICAgIHJldHVybiBsZW5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG4vLyBwcmUtc2V0IGZvciB2YWx1ZXMgdGhhdCBtYXkgZXhpc3QgaW4gdGhlIGZ1dHVyZVxuQnVmZmVyLnByb3RvdHlwZS5sZW5ndGggPSB1bmRlZmluZWRcbkJ1ZmZlci5wcm90b3R5cGUucGFyZW50ID0gdW5kZWZpbmVkXG5cbmZ1bmN0aW9uIHNsb3dUb1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICBzdGFydCA9IHN0YXJ0IHwgMFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPT09IEluZmluaXR5ID8gdGhpcy5sZW5ndGggOiBlbmQgfCAwXG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcbiAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKGVuZCA8PSBzdGFydCkgcmV0dXJuICcnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gYmluYXJ5U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aCB8IDBcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLm1hdGNoKC8uezJ9L2cpLmpvaW4oJyAnKVxuICAgIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiAwXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQpIHtcbiAgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICBieXRlT2Zmc2V0ID4+PSAwXG5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcbiAgaWYgKGJ5dGVPZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVybiAtMVxuXG4gIC8vIE5lZ2F0aXZlIG9mZnNldHMgc3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwKSBieXRlT2Zmc2V0ID0gTWF0aC5tYXgodGhpcy5sZW5ndGggKyBieXRlT2Zmc2V0LCAwKVxuXG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSByZXR1cm4gLTEgLy8gc3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcgYWx3YXlzIGZhaWxzXG4gICAgcmV0dXJuIFN0cmluZy5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKHRoaXMsIHZhbCwgYnl0ZU9mZnNldClcbiAgfVxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbCkpIHtcbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldClcbiAgfVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCh0aGlzLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YodGhpcywgWyB2YWwgXSwgYnl0ZU9mZnNldClcbiAgfVxuXG4gIGZ1bmN0aW9uIGFycmF5SW5kZXhPZiAoYXJyLCB2YWwsIGJ5dGVPZmZzZXQpIHtcbiAgICB2YXIgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yICh2YXIgaSA9IDA7IGJ5dGVPZmZzZXQgKyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYXJyW2J5dGVPZmZzZXQgKyBpXSA9PT0gdmFsW2ZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4XSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbC5sZW5ndGgpIHJldHVybiBieXRlT2Zmc2V0ICsgZm91bmRJbmRleFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm91bmRJbmRleCA9IC0xXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuLy8gYGdldGAgaXMgZGVwcmVjYXRlZFxuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQgKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgaXMgZGVwcmVjYXRlZFxuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQgKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKHN0ckxlbiAlIDIgIT09IDApIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBpZiAoaXNOYU4ocGFyc2VkKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB1Y3MyV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgb2Zmc2V0WywgbGVuZ3RoXVssIGVuY29kaW5nXSlcbiAgfSBlbHNlIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggfCAwXG4gICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCkgZW5jb2RpbmcgPSAndXRmOCdcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgLy8gbGVnYWN5IHdyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKSAtIHJlbW92ZSBpbiB2MC4xM1xuICB9IGVsc2Uge1xuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aCB8IDBcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignYXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGJpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgdmFyIHJlcyA9IFtdXG5cbiAgdmFyIGkgPSBzdGFydFxuICB3aGlsZSAoaSA8IGVuZCkge1xuICAgIHZhciBmaXJzdEJ5dGUgPSBidWZbaV1cbiAgICB2YXIgY29kZVBvaW50ID0gbnVsbFxuICAgIHZhciBieXRlc1BlclNlcXVlbmNlID0gKGZpcnN0Qnl0ZSA+IDB4RUYpID8gNFxuICAgICAgOiAoZmlyc3RCeXRlID4gMHhERikgPyAzXG4gICAgICA6IChmaXJzdEJ5dGUgPiAweEJGKSA/IDJcbiAgICAgIDogMVxuXG4gICAgaWYgKGkgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgdmFyIHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludFxuXG4gICAgICBzd2l0Y2ggKGJ5dGVzUGVyU2VxdWVuY2UpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChmaXJzdEJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSBmaXJzdEJ5dGVcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHgxRikgPDwgMHg2IHwgKHNlY29uZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4QyB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKHRoaXJkQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0ZGICYmICh0ZW1wQ29kZVBvaW50IDwgMHhEODAwIHx8IHRlbXBDb2RlUG9pbnQgPiAweERGRkYpKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGZvdXJ0aEJ5dGUgPSBidWZbaSArIDNdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwICYmIChmb3VydGhCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweDEyIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweEMgfCAodGhpcmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKGZvdXJ0aEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweEZGRkYgJiYgdGVtcENvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhGRkZEXG4gICAgICBieXRlc1BlclNlcXVlbmNlID0gMVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG4gICAgICAvLyBlbmNvZGUgdG8gdXRmMTYgKHN1cnJvZ2F0ZSBwYWlyIGRhbmNlKVxuICAgICAgY29kZVBvaW50IC09IDB4MTAwMDBcbiAgICAgIHJlcy5wdXNoKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMClcbiAgICAgIGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGXG4gICAgfVxuXG4gICAgcmVzLnB1c2goY29kZVBvaW50KVxuICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZUNvZGVQb2ludHNBcnJheShyZXMpXG59XG5cbi8vIEJhc2VkIG9uIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyNzQ3MjcyLzY4MDc0MiwgdGhlIGJyb3dzZXIgd2l0aFxuLy8gdGhlIGxvd2VzdCBsaW1pdCBpcyBDaHJvbWUsIHdpdGggMHgxMDAwMCBhcmdzLlxuLy8gV2UgZ28gMSBtYWduaXR1ZGUgbGVzcywgZm9yIHNhZmV0eVxudmFyIE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICB2YXIgbGVuID0gY29kZVBvaW50cy5sZW5ndGhcbiAgaWYgKGxlbiA8PSBNQVhfQVJHVU1FTlRTX0xFTkdUSCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVBvaW50cykgLy8gYXZvaWQgZXh0cmEgc2xpY2UoKVxuICB9XG5cbiAgLy8gRGVjb2RlIGluIGNodW5rcyB0byBhdm9pZCBcImNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLlxuICB2YXIgcmVzID0gJydcbiAgdmFyIGkgPSAwXG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoXG4gICAgICBTdHJpbmcsXG4gICAgICBjb2RlUG9pbnRzLnNsaWNlKGksIGkgKz0gTUFYX0FSR1VNRU5UU19MRU5HVEgpXG4gICAgKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0gJiAweDdGKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2kgKyAxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICB2YXIgbmV3QnVmXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIG5ld0J1ZiA9IEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9XG5cbiAgaWYgKG5ld0J1Zi5sZW5ndGgpIG5ld0J1Zi5wYXJlbnQgPSB0aGlzLnBhcmVudCB8fCB0aGlzXG5cbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludExFID0gZnVuY3Rpb24gcmVhZFVJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF1cbiAgdmFyIG11bCA9IDFcbiAgd2hpbGUgKGJ5dGVMZW5ndGggPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiByZWFkVUludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKCh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSkgK1xuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gKiAweDEwMDAwMDApXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50TEUgPSBmdW5jdGlvbiByZWFkSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkUgPSBmdW5jdGlvbiByZWFkSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgaSA9IGJ5dGVMZW5ndGhcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIGlmICghKHRoaXNbb2Zmc2V0XSAmIDB4ODApKSByZXR1cm4gKHRoaXNbb2Zmc2V0XSlcbiAgcmV0dXJuICgoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTEpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiByZWFkSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gcmVhZEludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgMV0gfCAodGhpc1tvZmZzZXRdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0pIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSA8PCAyNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdExFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gcmVhZERvdWJsZUxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiByZWFkRG91YmxlQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdidWZmZXIgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3ZhbHVlIGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpLCAwKVxuXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpLCAwKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gdmFsdWVcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gdmFsdWVcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEUgPSBmdW5jdGlvbiB3cml0ZUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gMFxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gdmFsdWUgPCAwID8gMSA6IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludEJFID0gZnVuY3Rpb24gd3JpdGVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGggLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSB2YWx1ZSA8IDAgPyAxIDogMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSB2YWx1ZVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gdmFsdWVcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCd2YWx1ZSBpcyBvdXQgb2YgYm91bmRzJylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAob2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gd3JpdGVGbG9hdExFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG4gIHZhciBpXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2UgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gYXNjZW5kaW5nIGNvcHkgZnJvbSBzdGFydFxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRTdGFydClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmIChlbmQgPCBzdGFydCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDAgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzW2ldID0gdmFsdWVcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGJ5dGVzID0gdXRmOFRvQnl0ZXModmFsdWUudG9TdHJpbmcoKSlcbiAgICB2YXIgbGVuID0gYnl0ZXMubGVuZ3RoXG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpc1tpXSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gdG9BcnJheUJ1ZmZlciAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gX2F1Z21lbnQgKGFycikge1xuICBhcnIuY29uc3RydWN0b3IgPSBCdWZmZXJcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IHNldCBtZXRob2QgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWRcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuZXF1YWxzID0gQlAuZXF1YWxzXG4gIGFyci5jb21wYXJlID0gQlAuY29tcGFyZVxuICBhcnIuaW5kZXhPZiA9IEJQLmluZGV4T2ZcbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludExFID0gQlAucmVhZFVJbnRMRVxuICBhcnIucmVhZFVJbnRCRSA9IEJQLnJlYWRVSW50QkVcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50TEUgPSBCUC5yZWFkSW50TEVcbiAgYXJyLnJlYWRJbnRCRSA9IEJQLnJlYWRJbnRCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnRMRSA9IEJQLndyaXRlVUludExFXG4gIGFyci53cml0ZVVJbnRCRSA9IEJQLndyaXRlVUludEJFXG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnRMRSA9IEJQLndyaXRlSW50TEVcbiAgYXJyLndyaXRlSW50QkUgPSBCUC53cml0ZUludEJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxudmFyIElOVkFMSURfQkFTRTY0X1JFID0gL1teK1xcLzAtOUEtWmEtei1fXS9nXG5cbmZ1bmN0aW9uIGJhc2U2NGNsZWFuIChzdHIpIHtcbiAgLy8gTm9kZSBzdHJpcHMgb3V0IGludmFsaWQgY2hhcmFjdGVycyBsaWtlIFxcbiBhbmQgXFx0IGZyb20gdGhlIHN0cmluZywgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHN0ciA9IHN0cmluZ3RyaW0oc3RyKS5yZXBsYWNlKElOVkFMSURfQkFTRTY0X1JFLCAnJylcbiAgLy8gTm9kZSBjb252ZXJ0cyBzdHJpbmdzIHdpdGggbGVuZ3RoIDwgMiB0byAnJ1xuICBpZiAoc3RyLmxlbmd0aCA8IDIpIHJldHVybiAnJ1xuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgdmFyIGNvZGVQb2ludFxuICB2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgdmFyIGJ5dGVzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICghbGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMiBsZWFkcyBpbiBhIHJvd1xuICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgY29kZVBvaW50ID0gbGVhZFN1cnJvZ2F0ZSAtIDB4RDgwMCA8PCAxMCB8IGNvZGVQb2ludCAtIDB4REMwMCB8IDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIsIHVuaXRzKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG5cbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShiYXNlNjRjbGVhbihzdHIpKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuIiwiZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG4iLCJcbi8qKlxuICogaXNBcnJheVxuICovXG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuLyoqXG4gKiB0b1N0cmluZ1xuICovXG5cbnZhciBzdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFdoZXRoZXIgb3Igbm90IHRoZSBnaXZlbiBgdmFsYFxuICogaXMgYW4gYXJyYXkuXG4gKlxuICogZXhhbXBsZTpcbiAqXG4gKiAgICAgICAgaXNBcnJheShbXSk7XG4gKiAgICAgICAgLy8gPiB0cnVlXG4gKiAgICAgICAgaXNBcnJheShhcmd1bWVudHMpO1xuICogICAgICAgIC8vID4gZmFsc2VcbiAqICAgICAgICBpc0FycmF5KCcnKTtcbiAqICAgICAgICAvLyA+IGZhbHNlXG4gKlxuICogQHBhcmFtIHttaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheSB8fCBmdW5jdGlvbiAodmFsKSB7XG4gIHJldHVybiAhISB2YWwgJiYgJ1tvYmplY3QgQXJyYXldJyA9PSBzdHIuY2FsbCh2YWwpO1xufTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9zcmNcIik7XG4iLCJcbnZhciBkZWJ1ZyA9IGZhbHNlO1xudmFyIGVuZHBvaW50cyA9IHt9O1xudmFyIG5leHRJZCA9IDE7XG5cbnZhciB1c2VyYWdlbnQgPSByZXF1aXJlKFwiQHZpc29raW8vY29tbW9uL3NyYy91dGlsL3VzZXJhZ2VudFwiKTtcbnZhciBsb2dnZXIgPSByZXF1aXJlKFwiQHZpc29raW8vY29tbW9uL3NyYy91dGlsL2xvZ2dlclwiKS5jcmVhdGUoXCJjaGFydC1jb21tdW5pY2F0aW9uQGNhcnJpZXJcIik7Ly8uZW5hYmxlKHRydWUpO1xuXG52YXIgY2hlY2tMaW5rUHJlc2VudCA9IGZ1bmN0aW9uKHNvdXJjZSwgdGFyZ2V0KSB7XG5cbiAgICBpZiAoIWVuZHBvaW50c1tzb3VyY2VdKSB7XG4gICAgICAgIGxvZ2dlci53YXJuKGBDYW5ub3Qgc2VuZCBtZXNzYWdlLCB0aGVyZSBpcyBubyBzb3VyY2UgJyR7c291cmNlfScgd2UgY2Fubm90IHRlbGwgd2hvIGlzIHNlbmRpbmcgdGhlIG1lc3NhZ2UhIERpZCB5b3UgY3JlYXRlIHRoZSBlbmRwb2ludCBpbiB0aGUgc291cmNlICR7c291cmNlfT9gKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghZW5kcG9pbnRzW3NvdXJjZV1bdGFyZ2V0XSkge1xuICAgICAgICBsb2dnZXIud2FybihgQ2Fubm90IHNlbmQgbWVzc2FnZSwgdGhlcmUgaXMgbm8gdGFyZ2V0ICcke3RhcmdldH0nIGZvciB0aGUgZ2l2ZW4gc291cmNlICcke3NvdXJjZX0nLCBub2JvZHkgaXMgbGlzdGVuaW5nISBEaWQgeW91IGNyZWF0ZSB0aGUgZW5kcG9pbnQgaW4gdGhlIHRhcmdldCAke3RhcmdldH0/YCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8vIExpc3RlbiB0byBhbGwgdGhlIGluY29taW5nIG1lc3NhZ2VzIGFuZCBmaWx0ZXIgdGhlbSBiYXNlZCBvbiB0aGUgdGFyZ2V0XG4vLyBhbmQgdGhlbiBjYWxsIHRoZSBsaXN0ZW5lcnMgd2l0aCB0aGUgZXZlbnQgZGF0YS4gVGhpcyB3YXkgd2Ugb25seSBoYXZlIGFuIGV2ZW50IGxpc3RlbmVyIGluIHRoZSB3aW5kb3cgaW5zdGVhZCBvZiBjcmF0aW5nXG4vLyBvbmUgcGVyIGVuZHBvaW50XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZXZlbnQgPT4ge1xuXG4gICAgaWYgKEFycmF5PT09dW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIE9uIElFMTAsIHdoZW4gdGhlIElGUkFNRSBpcyBiZWluZyBkaXNwb3NlZCBlLmcuIG9uIHN3aXRjaCB2aWV3LCBpdCBjYW4gcmVjZWl2ZSBhIG1lc3NhZ2UgXCJkaXNwb3NlXCJcbiAgICAgICAgLy8gaW4gYSB3ZWlyZCBzdGF0ZSB3aGVyZSBtYW55IGdsb2JhbHMgYXJlIHVuZGVmaW5lZCBpbmNsdWRpbmcgQXJyYXkuIFRoaXMgcmVzdWx0cyBpbiBhIGNvbnNvbGVcbiAgICAgICAgLy8gb3IgZGVidWdnZXIgZXJyb3IsIGFuZCBjYW4gYmUgZGlzcmVnYXJkZWQ6XG4gICAgICAgIGlmIChldmVudC5kYXRhLnR5cGU9PT1cImRpc3Bvc2VcIikge1xuICAgICAgICAgICAgLy8gSWdub3JlXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBBcnJheS4gRGlzcG9zZWQgSUZSQU1FP1wiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBkYXRhID0gZXZlbnQuZGF0YTtcblxuICAgIGxvZ2dlci5pbmZvKGBwb3N0TWVzc2FnZSByZWNlaXZlIGluIGAsIHdpbmRvdy5sb2NhdGlvbi5ocmVmLCBkYXRhKTtcblxuICAgIC8vIFdlIGlnbm9yZSBlcnJvcnMgcGFyc2luZyBodGUgcG9zdE1lc3NhZ2Ugc2luY2UgbWVzc2FnZXMgY2FuIGNvbWUgZm9ybSBkaWZmZXJlbnQgc291cmNlcyBhbmQgbWF5IG5vdCBiZSBKU09OLFxuICAgIC8vIHdlIGNhbiB0ZWxsIHRoZSBpZiBpdHMgbm90IHZhbGlkIGpzb24gaXMgbm90IGxpa2VseSBiZSBmb3JtIHVzXG4gICAgLy8gY29uc29sZS5lcnJvcihcIkVycm9yIHBhcnNpbmcgcG9zdE1lc3NhZ2VcIiwgZGF0YSlcbiAgICBpZiAoIXVzZXJhZ2VudC5pc01vZGVybigpKSB7XG4gICAgICAgIHRyeSB7IGRhdGEgPSBKU09OLnBhcnNlKGRhdGEpOyB9IGNhdGNoKGUpIHsgfVxuICAgIH1cblxuXHRpZiAoIWRhdGEub21uaXNjb3BlKSByZXR1cm47IC8vIElmIHRoZSBtZXNzYWdlIGRvZXNudCBoYXZlIG9tbmlzY29wZSB0aGVuIGl0cyBub3QgZnJvbSB1cyBhbmQgc2hvdWxkIGJlIGlnbm9yZWRcbiAgICBpZiAoIWVuZHBvaW50c1tkYXRhLnRhcmdldF0pIHJldHVybjtcbiAgICBpZiAoIWVuZHBvaW50c1tkYXRhLnRhcmdldF1bZGF0YS5zb3VyY2VdKSByZXR1cm47XG5cbiAgICBlbmRwb2ludHNbZGF0YS50YXJnZXRdW2RhdGEuc291cmNlXS5lbWl0KGRhdGEudHlwZSwgZGF0YS5tZXNzYWdlKTtcbn0pO1xuXG4vKipcbiAqIE9iamVjIHRpbiBjaGFyZ2Ugb2Yga2VlcGluZyB0cmFjayBvZiB0aGUgZGlmZmVyZW50IGVuZHBvaW50cyBhdmFpbGFibGUgYW5kIHBhc3NpbmcgdGhlIG1lc3NhZ2VzIGJldHdlZW4gdGhlbVxuICogQHR5cGUge09iamVjdH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICAvKipcbiAgICAgKiBTZXR0ZXIgZm9yIGRlYnVnIG1vZGUuIFdoZW4gZGVidWcgbW9kZSBpcyBlbmFibGUgdGhlIGxvZ2dlciBtZXRob2RzIHdpbGwgbG9nIGluIGNvbnNvbGUsIGlmIG5vdCB0aGV5IHdpbGwgZG8gbm90aGluZy5cbiAgICAgKiBCeWQgZWZhdWx0IGl0IHdpbGwgYmUgZmFsc2VcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWJ1Zyh2YWx1ZSkge1xuICAgICAgICBkZWJ1ZyA9IHZhbHVlO1xuICAgICAgICBsb2dnZXIuZW5hYmxlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldHRlciBmb3IgdGhlIGFjdHVhbCBlbmRwb2ludHMgb2JqZWN0XG4gICAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIE9iamVjdD59XG4gICAgICovXG4gICAgZW5kcG9pbnRzKCkge1xuICAgICAgICByZXR1cm4gZW5kcG9pbnRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBhbiBlbmRwb2ludCBmb3IgdGhlIGdpdmVuIHNvdXJjZSBhbmQgdGFyZ2V0IGluIHRoZSBtYW5hZ2VyIHNvIHdlIGNhbiBsYXRlciBkaXNwb3NlIGl0LCBicm9hZGNhc3QsIHNlbmQsIGV0Y1xuICAgICAqIEBwYXJhbSAge3N0cmluZ30gc291cmNlXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSB0YXJnZXRcbiAgICAgKiBAcGFyYW0gIHtFbmRwb2ludH0gZW5kcG9pbnRcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgcmVnaXN0ZXIoc291cmNlLCB0YXJnZXQsIGVuZHBvaW50KSB7XG5cbiAgICAgICAgaWYgKCFlbmRwb2ludHNbc291cmNlXSkgZW5kcG9pbnRzW3NvdXJjZV0gPSB7fTtcblxuICAgICAgICBpZiAoZW5kcG9pbnRzW3NvdXJjZV1bdGFyZ2V0XSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBUcmllZCB0byByZWdpc3RlciBzdW91cmNlIFwiJHtzb3VyY2V9XCIgd2l0aCB0YXJnZXQgXCIke3RhcmdldH1cIiBidXQgaXQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGVuZHBvaW50cyByZWdpc3RyeTpgLCBlbmRwb2ludHMpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUcnlpbmcgdG8gcmVnaXN0ZXIgZm9yIHNvdXJjZSAnJHtzb3VyY2V9JyBhbmQgdGFyZ2V0ICcke3RhcmdldH0nLCBidXQgdGhlcmUgaXMgYWxyZWFkeSBvbmUgZW5kcG9pbnQsIHlvdSBuZWVkIHRvIGRpc3Bvc2UgZmlyc3RgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVuZHBvaW50c1tzb3VyY2VdW3RhcmdldF0gPSBlbmRwb2ludDtcblxuICAgICAgICBsb2dnZXIuaW5mbyhgUmVnaXN0ZXJlZCBlbmRwb2ludCB3aXRoIHNvdXJjZSBcIiR7c291cmNlfVwiIGFuZCB0YXJnZXQgJHt0YXJnZXR9YCk7XG5cbiAgICAgICAgLy8gSWYgd2UgYXJlIGluIGRlYnVnIG1vZGUgd2UgYWRkIGFuIGFueSBsaXN0ZW5lciwgd2UgaWdub3JlIGl0IHdoZW4gd2UgYXJlIG91dCBvZiBkZWJ1Zy5cbiAgICAgICAgLy8gVE9ETzogRG8gdGhpcyBwcm9wZXJseSBhdCBzb21lIHBvaW50LCBpdHMgZm9yIHRlc3Rpbmcgc28gaXRzIG5vdCBjcml0aWNhbCwgYnV0IHdlIHNob3VsZCByZW1vdmUgdGhlIGxpc3RlbmVyXG4gICAgICAgIC8vIG9yIHNvZW10aGluZyBsaWtlIHRoYXRcbiAgICAgICAgaWYgKGRlYnVnKSBlbmRwb2ludC5hbnkoZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKCFkZWJ1ZykgcmV0dXJuO1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYE1lc3NhZ2UgcmVjZWl2ZWQgZnJvbSAnJHt0YXJnZXR9JyBpbiAnJHtzb3VyY2V9J2AsIGV2ZW50KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVucmVnaXN0ZXIgdGhlIGVuZHBvaW50IGZvciB0aGUgZ2l2ZW4gc291cmNlIGFuZCB0YXJnZXQgaWYgdGVocmUgaXMgYW55LiBJZiBpdCBjYW5vdCBmb3VuZCBhbnkgaXQgd29udCBkbyBhbnl0aGluZy5cbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHNvdXJjZVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gdGFyZ2V0XG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHVucmVnaXN0ZXIoc291cmNlLCB0YXJnZXQpIHtcblxuICAgICAgICBpZiAoIWVuZHBvaW50c1tzb3VyY2VdKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihgVHJpZWQgdG8gdW5yZWdpc3RlciB0aGUgZW5kcG9pbnRzIGZvciBzb3VyY2UgXCIke3NvdXJjZX1cIiBhbmQgdGFyZ2V0IFwiJHt0YXJnZXR9XCIgYnV0IGNhbm5vdCBmaW5kIHRoYXQgc291cmNlIGluIHRoZSBlbmRwb2ludCBsaXN0YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbmRwb2ludHNbc291cmNlXVt0YXJnZXRdKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihgVHJpZWQgdG8gdW5yZWdpc3RlciB0aGUgZW5kcG9pbnRzIGZvciBzb3VyY2UgXCIke3NvdXJjZX1cIiBhbmQgdGFyZ2V0IFwiJHt0YXJnZXR9XCIgYnV0IGNhbm5vdCBmaW5kIHRoYXQgdGFyZ2V0IGZvciB0aGF0IHNvdXJjZSBpbiB0aGUgZW5kcG9pbnQgbGlzdGApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cblxuICAgICAgICBkZWxldGUgZW5kcG9pbnRzW3NvdXJjZV1bdGFyZ2V0XTtcblxuICAgICAgICBpZiAoIU9iamVjdC5rZXlzKGVuZHBvaW50c1tzb3VyY2VdKS5sZW5ndGgpIGRlbGV0ZSBlbmRwb2ludHNbc291cmNlXTtcblxuICAgICAgICBsb2dnZXIuaW5mbyhgVW5yZWdpc3RlcmVkIGVuZHBvaW50IHdpdGggc291cmNlIFwiJHtzb3VyY2V9XCIgYW5kIHRhcmdldCBcIiR7dGFyZ2V0fVwiYCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNlbmQgYSBtZXNzYWdlIHVzaW5nIHRoZSBvciBwb3N0TUVzc2FnZSBpZiB0aGVyZSBpcyBhIGNoYW5uZWwgZGVmaW5lZCBvciBhbiBldmVudCBlbWl0dGVyIGlmIHRoZXJlIGlzIG5vbmVcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHNvdXJjZVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gdGFyZ2V0XG4gICAgICogQHBhcmFtICB7V2luZG93PX0gZGF0YVxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBzZW5kKHNvdXJjZSwgdGFyZ2V0LCBkYXRhLCBjaGFubmVsKSB7XG5cbiAgICAgICAgdmFyIHBvc3REYXRhO1xuXG4gICAgICAgIGxvZ2dlci5pbmZvKGBNZXNzYWdlIHNlbmQgZnJvbSBzb3VyY2UgJyR7c291cmNlfScgdG8gdGFyZ2V0ICcke3RhcmdldH0nIHdpdGggdHlwZSBcIiR7ZGF0YS50eXBlfVwiIGluIGNoYW5uZWwgYW5kIHdpdGggdGhlIG1lc3NhZ2U6YCwgY2hhbm5lbCwgZGF0YS5tZXNzYWdlKTtcblxuICAgICAgICBpZiAoY2hhbm5lbCkge1xuXG4gICAgICAgICAgICBwb3N0RGF0YSA9IHsgb21uaXNjb3BlOiB0cnVlLCBzb3VyY2UsIHRhcmdldCwgdHlwZTogZGF0YS50eXBlLCBtZXNzYWdlOiBkYXRhLm1lc3NhZ2UgfTtcbiAgICBcdFx0aWYgKCF1c2VyYWdlbnQuaXNNb2Rlcm4oKSkgcG9zdERhdGEgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcblxuICAgICAgICAgICAgaWYgKCFjaGFubmVsLnBvc3RNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgLy8gUGVyaGFwcyB0aGlzIGlzIHRoZSBjYXNlIG9uIGlPUyB3aGVuIGRpc3Bvc2luZyBhbmQgdGhlIFdpbmRvdyBvYmplY3QgcGFzc2VkXG4gICAgICAgICAgICAgICAgLy8gYXMgY2hhbm5lbCBkb2Vzbid0IGhhdmUgYSBwb3N0TWVzc2FnZSBwcm9wZXJ0eSAoeWV0IHdpbmRvdyBnbG9iYWwgaGFzKS5cbiAgICAgICAgICAgICAgICAvLyBJJ20gYXNzdW1pbmcgdGhpcyBpcyBhIGRpc3Bvc2FsIHNjZW5hcmlvIGEgYml0IGxpa2UgSUUncyBpbiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBhYm92ZS5cbiAgICAgICAgICAgICAgICBpZiAoZGF0YS50eXBlPT09XCJkaXNwb3NlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWdub3JlXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBVbmV4cGVjdGVkXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHBvc3RNZXNzYWdlIG9uIGNoYW5uZWxcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgXHRcdGNoYW5uZWwucG9zdE1lc3NhZ2UocG9zdERhdGEsIFwiKlwiKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBpZiAoIWNoZWNrTGlua1ByZXNlbnQodGFyZ2V0LCBzb3VyY2UpKSByZXR1cm4gdGhpcztcblxuICAgICAgICAgICAgLy8gT2xkIHN5bmMgYXBwcm9hY2g6XG4gICAgICAgICAgICAvLyBlbmRwb2ludHNbdGFyZ2V0XVtzb3VyY2VdLmVtaXQoZGF0YS50eXBlLCBkYXRhLm1lc3NhZ2UpO1xuICAgICAgICAgICAgLy8gQXN5bmMsIHRvIG1hdGNoIElGUkFNRSBiYXNlZCwgYW5kIHRvIGF2b2lkIGRpc3BhdGNoZXIgaW52YXJpYW50IGVycm9yczpcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghY2hlY2tMaW5rUHJlc2VudCh0YXJnZXQsIHNvdXJjZSkpIHJldHVybjtcbiAgICAgICAgICAgICAgICBlbmRwb2ludHNbdGFyZ2V0XVtzb3VyY2VdLmVtaXQoZGF0YS50eXBlLCBkYXRhLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhIG1lc3NhZ2UgdG8gYWxsIHRoZSB0YXJnZXRzIG9mIHRoZSBzcGVjaWZpZWQgc291cmNlXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBzb3VyY2VcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGFcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgYnJvYWRjYXN0KHNvdXJjZSwgdHlwZSwgbWVzc2FnZSkge1xuXG4gICAgICAgIHZhciB0YXJnZXRzID0gZW5kcG9pbnRzW3NvdXJjZV07XG5cbiAgICAgICAgaWYgKCF0YXJnZXRzKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihgQ2Fubm90IGJyb2FkY2FzdCBtZXNzYWdlIHR5cGUgJyR7dHlwZX0nIGZyb20gJyR7c291cmNlfScsIG5vIHRhcmdldHMgZm91bmQhIERpZCB5b3UgcmVnaXN0ZXIgdGhlIGVuZHBvaW50cyBmaXJzdD9gLCB0eXBlLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ2dlci5pbmZvKGBCcm9hZGNhc3RpbmcgZm9yICcke3NvdXJjZX0nYCwgdHlwZSwgbWVzc2FnZSk7XG5cbiAgICAgICAgT2JqZWN0LmtleXModGFyZ2V0cykuZm9yRWFjaChrZXkgPT4gdGFyZ2V0c1trZXldLnNlbmQodHlwZSwgbWVzc2FnZSkpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBnZW5lcmF0ZUlkKCkge1xuICAgICAgICByZXR1cm4gbmV4dElkKys7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsZWFyIGFsbCB0aGUgZW5kcG9pdG5zIG9mIHRoZSBvbmVzIGZvciB0aGUgZ2l2ZW4gc291cmNlIGlmIGFueSBpcyBwcm92aWRlZFxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gaWRcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgY2xlYXIoaWQpIHtcblxuICAgICAgICB2YXIgZmlsdGVyID0gaWQhPT11bmRlZmluZWQgJiYgaWQhPT1udWxsO1xuXG4gICAgICAgIGxvZ2dlci5pbmZvKGBEaXNwb3NpbmcgJHtmaWx0ZXIgPyBgZm9yICcke2lkfSdgIDogXCJhbGxcIn1gKTtcblxuICAgICAgICBlbmRwb2ludHMgPSBPYmplY3Qua2V5cyhlbmRwb2ludHMpLnJlZHVjZSgoc291cmNlcywgc291cmNlKSA9PiB7XG5cbiAgICAgICAgICAgIHZhciB0YXJnZXRzID0gT2JqZWN0LmtleXMoZW5kcG9pbnRzW3NvdXJjZV0pLnJlZHVjZSgodGFyZ2V0cywgdGFyZ2V0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlciAmJiBpZCE9PXNvdXJjZSAmJiBpZCE9PXRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRzW3RhcmdldF0gPSBlbmRwb2ludHNbc291cmNlXVt0YXJnZXRdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZHBvaW50c1tzb3VyY2VdW3RhcmdldF0uZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0cztcbiAgICAgICAgICAgIH0sIHt9KTtcblxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRhcmdldHMpLmxlbmd0aCkgc291cmNlc1tzb3VyY2VdID0gdGFyZ2V0cztcbiAgICAgICAgICAgIHJldHVybiBzb3VyY2VzO1xuICAgICAgICB9LCB7fSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufTtcbiIsIlxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoXCJAdmlzb2tpby9jb21tb24vc3JjL2V2ZW50L0V2ZW50RW1pdHRlclwiKTtcbnZhciBjYXJyaWVyID0gcmVxdWlyZShcIi4vY2FycmllclwiKTtcblxuLyoqXG4gKiBDbGFzcyB0aGF0IGV4dGVuZCBldmVudCBlbWl0dGVyIHdpdGggYSBzZW5kIG1ldGhvZCB1c2VkIGFzIHRoZSBlbmRwb2ludCBmb3IgdGhlIGNvbW11bmNpYXRpb24gYmV0d2VlbiB0d28gY29tcG9uZW50cyxcbiAqIHRocm91Z2h0IGEgd2luZG93IGNoYW5uZWwgb3IgdGhyb3VnaHQgZGlyZWN0IGV2ZW50IGVtaXR0ZXIgY2FsbHNcbiAqL1xuY2xhc3MgRW5kcG9pbnQgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG5cdC8qKlxuXHQgKiBAcGFyYW0gIHtzdHJpbmd9IHNvdXJjZVxuXHQgKiBAcGFyYW0gIHtzdHJpbmd9IHRhcmdldFxuXHQgKiBAcGFyYW0gIHtXaW5kb3c9fSBjaGFubmVsXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihzb3VyY2UsIHRhcmdldCwgY2hhbm5lbCkge1xuXHRcdHN1cGVyKCk7XG5cblx0XHQvKipcblx0XHQgKiBTb3VyY2Ugb3Igb3JnaW5pbiBvZiB0aGUgbWVzc2FnZVxuXHRcdCAqIEB0eXBlIHtzdHJpbmd9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHR0aGlzLl9zb3VyY2UgPSBzb3VyY2U7XG5cblx0XHQvKipcblx0XHQgKiBUYXJnZXQgb3IgZGVzdGluYXRpb24gZm9yIHRoZSBtZXNzYWdlcyBzZW5kZWQgdGhyb3VnaHQgdGhpcyBlbmRwb2ludFxuXHRcdCAqIEB0eXBlIHtzdHJpbmd9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHR0aGlzLl90YXJnZXQgPSB0YXJnZXQ7XG5cblx0XHQvKipcblx0XHQgKiBDaGFubmVsIG9mIGNvbW11bmljYXRpb24sIHJlcHJlc2VudGluZyBhIHdpbmRvdyBvYmplY3QgdXNlZCBmb3IgcG9zdE1lc3NhZ2Vcblx0XHQgKiBAdHlwZSB7P1dpbmRvd31cblx0XHQgKi9cblx0XHR0aGlzLl9jaGFubmVsID0gY2hhbm5lbDtcblxuXHRcdC8vIFJlZ2lzdGVyIGl0c2VsZiBpbiB0aGUgbWFuYWdlclxuXHRcdGNhcnJpZXIucmVnaXN0ZXIoc291cmNlLCB0YXJnZXQsIHRoaXMpO1xuXHR9XG5cblx0Z2V0U291cmNlKCkge1xuXHRcdHJldHVybiB0aGlzLl9zb3VyY2U7XG5cdH1cblxuXHRnZXRUYXJnZXQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3RhcmdldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZW5kIGEgbWVzc2FnZSBvZiB0aGUgZ2l2ZW4gdHlwZSB0byB0aGUgdGFyZ2V0XG5cdCAqIEByZXR1cm4ge0VuZHBvaW50fVxuXHQgKi9cblx0c2VuZCh0eXBlLCBtZXNzYWdlKSB7XG5cdFx0Y2Fycmllci5zZW5kKHRoaXMuX3NvdXJjZSwgdGhpcy5fdGFyZ2V0LCB7XCJ0eXBlXCI6IHR5cGUsIG1lc3NhZ2V9LCB0aGlzLl9jaGFubmVsKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNwb3NlIHRoZSBlbmRwb2ludCwgcmVtb3ZpbmcgYW55IGtpbmQgZXZlbnQgbGlzdGVuZXIgbG9naWMgYW5kIHVucmVnaXN0ZXJpbmcgZm9ybSB0aGUgbWFuYWdlclxuXHQgKi9cblx0ZGlzcG9zZSgpIHtcblx0XHRjYXJyaWVyLnVucmVnaXN0ZXIodGhpcy5fc291cmNlLCB0aGlzLl90YXJnZXQpO1xuXHRcdHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbmRwb2ludDtcbiIsIlxudmFyIGNhcnJpZXIgPSByZXF1aXJlKFwiLi9jYXJyaWVyXCIpO1xuXG52YXIgRW5kcG9pbnQgPSByZXF1aXJlKFwiLi9lbmRwb2ludFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0LyoqXG5cdCAqIEdldCBvciBzZXRzIHRoZSBkZWJ1ZyBtb2RlIHRoYXQgd2lsbCBsb2cgaW50byBjb25zb2xlIHRoZSBtZXNzYWdlIHBhc3NpbmcgYmV0d2VlbiBlbmRwb2ludHNcblx0ICogQHBhcmFtICB7Ym9vbGVhbn0gdmFsdWVcblx0ICogQHJldHVybiB7T2JqZWN0fVxuXHQgKi9cblx0ZGVidWcodmFsdWUpIHtcblx0XHRjYXJyaWVyLmRlYnVnKHZhbHVlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIGFuZCBlbmRwb2ludCBmb3IgY29tbXVuaWNhdGlvbiB3aXRoIGEgc291cmNlLCB0YXJnZXQgYW5kIGFuIG9wdGlvbmFsIHdpbmRvdyBhcyBhIGNvbW11bmljYXRpb24gY2hhbm5lbC5cblx0ICogSWYgd2luZG93IGlzIHByZXNlbnQgaXQgd2lsbCB1c2UgaXQgdG8gZG8gcG9zdE1lc3NhZ2UsIGlmIG5vdCBpdCB3aWxsIHVzZSBldmVudGVtaXR0ZXIgZGlyZWN0bHkgYW5kIHBhc3MgdGhlIG1lc3NhZ2VzLlxuXHQgKiBJbiBib3RoIGNhc2VzIHRoZSBtZXNzYWdlcyB3aWxsIG9ubHkgYXJyaXZlIGluIHRoZSBlbmRwb2ludCBiYXNlIGRvbiB0aGUgc291cmNlIGFuZCB0YXJnZXQgc3BlY2lmaWVkXG5cdCAqIEBwYXJhbSAge3N0cmluZ30gc291cmNlXG5cdCAqIEBwYXJhbSAge3N0cmluZ30gdGFyZ2V0XG5cdCAqIEBwYXJhbSAge1dpbmRvdz19IGNoYW5uZWxcblx0ICogQHJldHVybiB7RW5kcG9pbnR9XG5cdCAqL1xuXHRlbmRwb2ludChzb3VyY2UsIHRhcmdldCwgY2hhbm5lbCkge1xuXHRcdHJldHVybiBuZXcgRW5kcG9pbnQoc291cmNlLCB0YXJnZXQsIGNoYW5uZWwpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTZW5kIGEgbWVzc2FnZSB0byBhbGwgdGhlIHRhcmdldHMgb2YgdGhlIGdpdmVuIHNvdXJjZVxuXHQgKiBAcGFyYW0gIHtzdHJpbmd9IHNvdXJjZVxuXHQgKiBAcGFyYW0gIHtzdHJpbmd9IHR5cGVcblx0ICogQHBhcmFtICB7T2JqZWN0fSBtZXNzYWdlXG5cdCAqIEByZXR1cm4ge09iamVjdH1cblx0ICovXG5cdGJyb2FkY2FzdChzb3VyY2UsIHR5cGUsIG1lc3NhZ2UpIHtcblx0XHRjYXJyaWVyLmJyb2FkY2FzdChzb3VyY2UsIHR5cGUsIG1lc3NhZ2UpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGdlbmVyYXRlSWQoKSB7XG5cdFx0cmV0dXJuIGNhcnJpZXIuZ2VuZXJhdGVJZCgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDbGVhciBhbGwgdGhlIHJlZ2lzdGVyZWQgZW5kcG9pbnRzIGZyb20gdGhlIG1hbmFnZXIgb3IgdGhlIG9uZXMgZm9yIHRoZSBzcGVjaWZpZWQgc291cmNlXG5cdCAqIEByZXR1cm4ge09iamVjdH1cblx0ICovXG5cdGNsZWFyKHNvdXJjZSkge1xuXHRcdGNhcnJpZXIuY2xlYXIoc291cmNlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufTtcbiIsIihmdW5jdGlvbiAoQnVmZmVyKXtcbid1c2Ugc3RyaWN0JztcblxudmFyIGNsb25lID0gKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBDbG9uZXMgKGNvcGllcykgYW4gT2JqZWN0IHVzaW5nIGRlZXAgY29weWluZy5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBzdXBwb3J0cyBjaXJjdWxhciByZWZlcmVuY2VzIGJ5IGRlZmF1bHQsIGJ1dCBpZiB5b3UgYXJlIGNlcnRhaW5cbiAgICogdGhlcmUgYXJlIG5vIGNpcmN1bGFyIHJlZmVyZW5jZXMgaW4geW91ciBvYmplY3QsIHlvdSBjYW4gc2F2ZSBzb21lIENQVSB0aW1lXG4gICAqIGJ5IGNhbGxpbmcgY2xvbmUob2JqLCBmYWxzZSkuXG4gICAqXG4gICAqIENhdXRpb246IGlmIGBjaXJjdWxhcmAgaXMgZmFsc2UgYW5kIGBwYXJlbnRgIGNvbnRhaW5zIGNpcmN1bGFyIHJlZmVyZW5jZXMsXG4gICAqIHlvdXIgcHJvZ3JhbSBtYXkgZW50ZXIgYW4gaW5maW5pdGUgbG9vcCBhbmQgY3Jhc2guXG4gICAqXG4gICAqIEBwYXJhbSBgcGFyZW50YCAtIHRoZSBvYmplY3QgdG8gYmUgY2xvbmVkXG4gICAqIEBwYXJhbSBgY2lyY3VsYXJgIC0gc2V0IHRvIHRydWUgaWYgdGhlIG9iamVjdCB0byBiZSBjbG9uZWQgbWF5IGNvbnRhaW5cbiAgICogICAgY2lyY3VsYXIgcmVmZXJlbmNlcy4gKG9wdGlvbmFsIC0gdHJ1ZSBieSBkZWZhdWx0KVxuICAgKiBAcGFyYW0gYGRlcHRoYCAtIHNldCB0byBhIG51bWJlciBpZiB0aGUgb2JqZWN0IGlzIG9ubHkgdG8gYmUgY2xvbmVkIHRvXG4gICAqICAgIGEgcGFydGljdWxhciBkZXB0aC4gKG9wdGlvbmFsIC0gZGVmYXVsdHMgdG8gSW5maW5pdHkpXG4gICAqIEBwYXJhbSBgcHJvdG90eXBlYCAtIHNldHMgdGhlIHByb3RvdHlwZSB0byBiZSB1c2VkIHdoZW4gY2xvbmluZyBhbiBvYmplY3QuXG4gICAqICAgIChvcHRpb25hbCAtIGRlZmF1bHRzIHRvIHBhcmVudCBwcm90b3R5cGUpLlxuICAqL1xuICBmdW5jdGlvbiBjbG9uZShwYXJlbnQsIGNpcmN1bGFyLCBkZXB0aCwgcHJvdG90eXBlKSB7XG4gICAgdmFyIGZpbHRlcjtcbiAgICBpZiAodHlwZW9mIGNpcmN1bGFyID09PSAnb2JqZWN0Jykge1xuICAgICAgZGVwdGggPSBjaXJjdWxhci5kZXB0aDtcbiAgICAgIHByb3RvdHlwZSA9IGNpcmN1bGFyLnByb3RvdHlwZTtcbiAgICAgIGZpbHRlciA9IGNpcmN1bGFyLmZpbHRlcjtcbiAgICAgIGNpcmN1bGFyID0gY2lyY3VsYXIuY2lyY3VsYXI7XG4gICAgfVxuICAgIC8vIG1haW50YWluIHR3byBhcnJheXMgZm9yIGNpcmN1bGFyIHJlZmVyZW5jZXMsIHdoZXJlIGNvcnJlc3BvbmRpbmcgcGFyZW50c1xuICAgIC8vIGFuZCBjaGlsZHJlbiBoYXZlIHRoZSBzYW1lIGluZGV4XG4gICAgdmFyIGFsbFBhcmVudHMgPSBbXTtcbiAgICB2YXIgYWxsQ2hpbGRyZW4gPSBbXTtcblxuICAgIHZhciB1c2VCdWZmZXIgPSB0eXBlb2YgQnVmZmVyICE9ICd1bmRlZmluZWQnO1xuXG4gICAgaWYgKHR5cGVvZiBjaXJjdWxhciA9PSAndW5kZWZpbmVkJykgY2lyY3VsYXIgPSB0cnVlO1xuXG4gICAgaWYgKHR5cGVvZiBkZXB0aCA9PSAndW5kZWZpbmVkJykgZGVwdGggPSBJbmZpbml0eTtcblxuICAgIC8vIHJlY3Vyc2UgdGhpcyBmdW5jdGlvbiBzbyB3ZSBkb24ndCByZXNldCBhbGxQYXJlbnRzIGFuZCBhbGxDaGlsZHJlblxuICAgIGZ1bmN0aW9uIF9jbG9uZShwYXJlbnQsIGRlcHRoKSB7XG4gICAgICAvLyBjbG9uaW5nIG51bGwgYWx3YXlzIHJldHVybnMgbnVsbFxuICAgICAgaWYgKHBhcmVudCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIGlmIChkZXB0aCA9PSAwKSByZXR1cm4gcGFyZW50O1xuXG4gICAgICB2YXIgY2hpbGQ7XG4gICAgICB2YXIgcHJvdG87XG4gICAgICBpZiAodHlwZW9mIHBhcmVudCAhPSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gcGFyZW50O1xuICAgICAgfVxuXG4gICAgICBpZiAoY2xvbmUuX19pc0FycmF5KHBhcmVudCkpIHtcbiAgICAgICAgY2hpbGQgPSBbXTtcbiAgICAgIH0gZWxzZSBpZiAoY2xvbmUuX19pc1JlZ0V4cChwYXJlbnQpKSB7XG4gICAgICAgIGNoaWxkID0gbmV3IFJlZ0V4cChwYXJlbnQuc291cmNlLCBfX2dldFJlZ0V4cEZsYWdzKHBhcmVudCkpO1xuICAgICAgICBpZiAocGFyZW50Lmxhc3RJbmRleCkgY2hpbGQubGFzdEluZGV4ID0gcGFyZW50Lmxhc3RJbmRleDtcbiAgICAgIH0gZWxzZSBpZiAoY2xvbmUuX19pc0RhdGUocGFyZW50KSkge1xuICAgICAgICBjaGlsZCA9IG5ldyBEYXRlKHBhcmVudC5nZXRUaW1lKCkpO1xuICAgICAgfSBlbHNlIGlmICh1c2VCdWZmZXIgJiYgQnVmZmVyLmlzQnVmZmVyKHBhcmVudCkpIHtcbiAgICAgICAgY2hpbGQgPSBuZXcgQnVmZmVyKHBhcmVudC5sZW5ndGgpO1xuICAgICAgICBwYXJlbnQuY29weShjaGlsZCk7XG4gICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvdG90eXBlID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocGFyZW50KTtcbiAgICAgICAgICBjaGlsZCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNoaWxkID0gT2JqZWN0LmNyZWF0ZShwcm90b3R5cGUpO1xuICAgICAgICAgIHByb3RvID0gcHJvdG90eXBlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjaXJjdWxhcikge1xuICAgICAgICB2YXIgaW5kZXggPSBhbGxQYXJlbnRzLmluZGV4T2YocGFyZW50KTtcblxuICAgICAgICBpZiAoaW5kZXggIT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gYWxsQ2hpbGRyZW5baW5kZXhdO1xuICAgICAgICB9XG4gICAgICAgIGFsbFBhcmVudHMucHVzaChwYXJlbnQpO1xuICAgICAgICBhbGxDaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSBpbiBwYXJlbnQpIHtcbiAgICAgICAgdmFyIGF0dHJzO1xuICAgICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgICBhdHRycyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG8sIGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGF0dHJzICYmIGF0dHJzLnNldCA9PSBudWxsKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRbaV0gPSBfY2xvbmUocGFyZW50W2ldLCBkZXB0aCAtIDEpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9jbG9uZShwYXJlbnQsIGRlcHRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaW1wbGUgZmxhdCBjbG9uZSB1c2luZyBwcm90b3R5cGUsIGFjY2VwdHMgb25seSBvYmplY3RzLCB1c2VmdWxsIGZvciBwcm9wZXJ0eVxuICAgKiBvdmVycmlkZSBvbiBGTEFUIGNvbmZpZ3VyYXRpb24gb2JqZWN0IChubyBuZXN0ZWQgcHJvcHMpLlxuICAgKlxuICAgKiBVU0UgV0lUSCBDQVVUSU9OISBUaGlzIG1heSBub3QgYmVoYXZlIGFzIHlvdSB3aXNoIGlmIHlvdSBkbyBub3Qga25vdyBob3cgdGhpc1xuICAgKiB3b3Jrcy5cbiAgICovXG4gIGNsb25lLmNsb25lUHJvdG90eXBlID0gZnVuY3Rpb24gY2xvbmVQcm90b3R5cGUocGFyZW50KSB7XG4gICAgaWYgKHBhcmVudCA9PT0gbnVsbCkgcmV0dXJuIG51bGw7XG5cbiAgICB2YXIgYyA9IGZ1bmN0aW9uIGMoKSB7fTtcbiAgICBjLnByb3RvdHlwZSA9IHBhcmVudDtcbiAgICByZXR1cm4gbmV3IGMoKTtcbiAgfTtcblxuICAvLyBwcml2YXRlIHV0aWxpdHkgZnVuY3Rpb25zXG5cbiAgZnVuY3Rpb24gX19vYmpUb1N0cihvKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbiAgfTtcbiAgY2xvbmUuX19vYmpUb1N0ciA9IF9fb2JqVG9TdHI7XG5cbiAgZnVuY3Rpb24gX19pc0RhdGUobykge1xuICAgIHJldHVybiB0eXBlb2YgbyA9PT0gJ29iamVjdCcgJiYgX19vYmpUb1N0cihvKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xuICB9O1xuICBjbG9uZS5fX2lzRGF0ZSA9IF9faXNEYXRlO1xuXG4gIGZ1bmN0aW9uIF9faXNBcnJheShvKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiBfX29ialRvU3RyKG8pID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuICBjbG9uZS5fX2lzQXJyYXkgPSBfX2lzQXJyYXk7XG5cbiAgZnVuY3Rpb24gX19pc1JlZ0V4cChvKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvID09PSAnb2JqZWN0JyAmJiBfX29ialRvU3RyKG8pID09PSAnW29iamVjdCBSZWdFeHBdJztcbiAgfTtcbiAgY2xvbmUuX19pc1JlZ0V4cCA9IF9faXNSZWdFeHA7XG5cbiAgZnVuY3Rpb24gX19nZXRSZWdFeHBGbGFncyhyZSkge1xuICAgIHZhciBmbGFncyA9ICcnO1xuICAgIGlmIChyZS5nbG9iYWwpIGZsYWdzICs9ICdnJztcbiAgICBpZiAocmUuaWdub3JlQ2FzZSkgZmxhZ3MgKz0gJ2knO1xuICAgIGlmIChyZS5tdWx0aWxpbmUpIGZsYWdzICs9ICdtJztcbiAgICByZXR1cm4gZmxhZ3M7XG4gIH07XG4gIGNsb25lLl9fZ2V0UmVnRXhwRmxhZ3MgPSBfX2dldFJlZ0V4cEZsYWdzO1xuXG4gIHJldHVybiBjbG9uZTtcbn0pKCk7XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICBtb2R1bGUuZXhwb3J0cyA9IGNsb25lO1xufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIpXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJa002TDFacGMyOXJhVzh2VDIxdWFYTmpiM0JsUVd4MEwxWnBaWGR6TDI1dlpHVmZiVzlrZFd4bGN5OUFkbWx6YjJ0cGJ5OWpiMjF0YjI0dmJtOWtaVjl0YjJSMWJHVnpMMk5zYjI1bEwyTnNiMjVsTG1weklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN096dEJRVUZCTEVsQlFVa3NTMEZCU3l4SFFVRkhMRU5CUVVNc1dVRkJWenRCUVVONFFpeGpRVUZaTEVOQlFVTTdPenM3T3pzN096czdPenM3T3pzN096czdPMEZCYjBKaUxGZEJRVk1zUzBGQlN5eERRVUZETEUxQlFVMHNSVUZCUlN4UlFVRlJMRVZCUVVVc1MwRkJTeXhGUVVGRkxGTkJRVk1zUlVGQlJUdEJRVU5xUkN4UlFVRkpMRTFCUVUwc1EwRkJRenRCUVVOWUxGRkJRVWtzVDBGQlR5eFJRVUZSTEV0QlFVc3NVVUZCVVN4RlFVRkZPMEZCUTJoRExGZEJRVXNzUjBGQlJ5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRPMEZCUTNaQ0xHVkJRVk1zUjBGQlJ5eFJRVUZSTEVOQlFVTXNVMEZCVXl4RFFVRkRPMEZCUXk5Q0xGbEJRVTBzUjBGQlJ5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RFFVRkRPMEZCUTNwQ0xHTkJRVkVzUjBGQlJ5eFJRVUZSTEVOQlFVTXNVVUZCVVN4RFFVRkJPMHRCUXpkQ096czdRVUZIUkN4UlFVRkpMRlZCUVZVc1IwRkJSeXhGUVVGRkxFTkJRVU03UVVGRGNFSXNVVUZCU1N4WFFVRlhMRWRCUVVjc1JVRkJSU3hEUVVGRE96dEJRVVZ5UWl4UlFVRkpMRk5CUVZNc1IwRkJSeXhQUVVGUExFMUJRVTBzU1VGQlNTeFhRVUZYTEVOQlFVTTdPMEZCUlRkRExGRkJRVWtzVDBGQlR5eFJRVUZSTEVsQlFVa3NWMEZCVnl4RlFVTm9ReXhSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZET3p0QlFVVnNRaXhSUVVGSkxFOUJRVThzUzBGQlN5eEpRVUZKTEZkQlFWY3NSVUZETjBJc1MwRkJTeXhIUVVGSExGRkJRVkVzUTBGQlF6czdPMEZCUjI1Q0xHRkJRVk1zVFVGQlRTeERRVUZETEUxQlFVMHNSVUZCUlN4TFFVRkxMRVZCUVVVN08wRkJSVGRDTEZWQlFVa3NUVUZCVFN4TFFVRkxMRWxCUVVrc1JVRkRha0lzVDBGQlR5eEpRVUZKTEVOQlFVTTdPMEZCUldRc1ZVRkJTU3hMUVVGTExFbEJRVWtzUTBGQlF5eEZRVU5hTEU5QlFVOHNUVUZCVFN4RFFVRkRPenRCUVVWb1FpeFZRVUZKTEV0QlFVc3NRMEZCUXp0QlFVTldMRlZCUVVrc1MwRkJTeXhEUVVGRE8wRkJRMVlzVlVGQlNTeFBRVUZQTEUxQlFVMHNTVUZCU1N4UlFVRlJMRVZCUVVVN1FVRkROMElzWlVGQlR5eE5RVUZOTEVOQlFVTTdUMEZEWmpzN1FVRkZSQ3hWUVVGSkxFdEJRVXNzUTBGQlF5eFRRVUZUTEVOQlFVTXNUVUZCVFN4RFFVRkRMRVZCUVVVN1FVRkRNMElzWVVGQlN5eEhRVUZITEVWQlFVVXNRMEZCUXp0UFFVTmFMRTFCUVUwc1NVRkJTU3hMUVVGTExFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXl4RlFVRkZPMEZCUTI1RExHRkJRVXNzUjBGQlJ5eEpRVUZKTEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hGUVVGRkxHZENRVUZuUWl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRE5VUXNXVUZCU1N4TlFVRk5MRU5CUVVNc1UwRkJVeXhGUVVGRkxFdEJRVXNzUTBGQlF5eFRRVUZUTEVkQlFVY3NUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJRenRQUVVNeFJDeE5RVUZOTEVsQlFVa3NTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zUlVGQlJUdEJRVU5xUXl4aFFVRkxMRWRCUVVjc1NVRkJTU3hKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEU5QlFVOHNSVUZCUlN4RFFVRkRMRU5CUVVNN1QwRkRjRU1zVFVGQlRTeEpRVUZKTEZOQlFWTXNTVUZCU1N4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExFMUJRVTBzUTBGQlF5eEZRVUZGTzBGQlF5OURMR0ZCUVVzc1IwRkJSeXhKUVVGSkxFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1FVRkRiRU1zWTBGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRCUVVOdVFpeGxRVUZQTEV0QlFVc3NRMEZCUXp0UFFVTmtMRTFCUVUwN1FVRkRUQ3haUVVGSkxFOUJRVThzVTBGQlV5eEpRVUZKTEZkQlFWY3NSVUZCUlR0QlFVTnVReXhsUVVGTExFZEJRVWNzVFVGQlRTeERRVUZETEdOQlFXTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRCUVVOMFF5eGxRVUZMTEVkQlFVY3NUVUZCVFN4RFFVRkRMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFRRVU01UWl4TlFVTkpPMEZCUTBnc1pVRkJTeXhIUVVGSExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN1FVRkRha01zWlVGQlN5eEhRVUZITEZOQlFWTXNRMEZCUXp0VFFVTnVRanRQUVVOR096dEJRVVZFTEZWQlFVa3NVVUZCVVN4RlFVRkZPMEZCUTFvc1dVRkJTU3hMUVVGTExFZEJRVWNzVlVGQlZTeERRVUZETEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenM3UVVGRmRrTXNXVUZCU1N4TFFVRkxMRWxCUVVrc1EwRkJReXhEUVVGRExFVkJRVVU3UVVGRFppeHBRa0ZCVHl4WFFVRlhMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03VTBGRE0wSTdRVUZEUkN4clFrRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0QlFVTjRRaXh0UWtGQlZ5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRQUVVONlFqczdRVUZGUkN4WFFVRkxMRWxCUVVrc1EwRkJReXhKUVVGSkxFMUJRVTBzUlVGQlJUdEJRVU53UWl4WlFVRkpMRXRCUVVzc1EwRkJRenRCUVVOV0xGbEJRVWtzUzBGQlN5eEZRVUZGTzBGQlExUXNaVUZCU3l4SFFVRkhMRTFCUVUwc1EwRkJReXgzUWtGQmQwSXNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03VTBGRGJrUTdPMEZCUlVRc1dVRkJTU3hMUVVGTExFbEJRVWtzUzBGQlN5eERRVUZETEVkQlFVY3NTVUZCU1N4SlFVRkpMRVZCUVVVN1FVRkRPVUlzYlVKQlFWTTdVMEZEVmp0QlFVTkVMR0ZCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXp0UFFVTjZRenM3UVVGRlJDeGhRVUZQTEV0QlFVc3NRMEZCUXp0TFFVTmtPenRCUVVWRUxGZEJRVThzVFVGQlRTeERRVUZETEUxQlFVMHNSVUZCUlN4TFFVRkxMRU5CUVVNc1EwRkJRenRIUVVNNVFqczdPenM3T3pzN08wRkJVMFFzVDBGQlN5eERRVUZETEdOQlFXTXNSMEZCUnl4VFFVRlRMR05CUVdNc1EwRkJReXhOUVVGTkxFVkJRVVU3UVVGRGNrUXNVVUZCU1N4TlFVRk5MRXRCUVVzc1NVRkJTU3hGUVVOcVFpeFBRVUZQTEVsQlFVa3NRMEZCUXpzN1FVRkZaQ3hSUVVGSkxFTkJRVU1zUjBGQlJ5eFRRVUZLTEVOQlFVTXNSMEZCWlN4RlFVRkZMRU5CUVVNN1FVRkRka0lzUzBGQlF5eERRVUZETEZOQlFWTXNSMEZCUnl4TlFVRk5MRU5CUVVNN1FVRkRja0lzVjBGQlR5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRPMGRCUTJoQ0xFTkJRVU03T3pzN1FVRkpSaXhYUVVGVExGVkJRVlVzUTBGQlF5eERRVUZETEVWQlFVVTdRVUZEY2tJc1YwRkJUeXhOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UjBGRE1VTXNRMEZCUXp0QlFVTkdMRTlCUVVzc1EwRkJReXhWUVVGVkxFZEJRVWNzVlVGQlZTeERRVUZET3p0QlFVVTVRaXhYUVVGVExGRkJRVkVzUTBGQlF5eERRVUZETEVWQlFVVTdRVUZEYmtJc1YwRkJUeXhQUVVGUExFTkJRVU1zUzBGQlN5eFJRVUZSTEVsQlFVa3NWVUZCVlN4RFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExHVkJRV1VzUTBGQlF6dEhRVU51UlN4RFFVRkRPMEZCUTBZc1QwRkJTeXhEUVVGRExGRkJRVkVzUjBGQlJ5eFJRVUZSTEVOQlFVTTdPMEZCUlRGQ0xGZEJRVk1zVTBGQlV5eERRVUZETEVOQlFVTXNSVUZCUlR0QlFVTndRaXhYUVVGUExFOUJRVThzUTBGQlF5eExRVUZMTEZGQlFWRXNTVUZCU1N4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzWjBKQlFXZENMRU5CUVVNN1IwRkRjRVVzUTBGQlF6dEJRVU5HTEU5QlFVc3NRMEZCUXl4VFFVRlRMRWRCUVVjc1UwRkJVeXhEUVVGRE96dEJRVVUxUWl4WFFVRlRMRlZCUVZVc1EwRkJReXhEUVVGRExFVkJRVVU3UVVGRGNrSXNWMEZCVHl4UFFVRlBMRU5CUVVNc1MwRkJTeXhSUVVGUkxFbEJRVWtzVlVGQlZTeERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMR2xDUVVGcFFpeERRVUZETzBkQlEzSkZMRU5CUVVNN1FVRkRSaXhQUVVGTExFTkJRVU1zVlVGQlZTeEhRVUZITEZWQlFWVXNRMEZCUXpzN1FVRkZPVUlzVjBGQlV5eG5Ra0ZCWjBJc1EwRkJReXhGUVVGRkxFVkJRVVU3UVVGRE5VSXNVVUZCU1N4TFFVRkxMRWRCUVVjc1JVRkJSU3hEUVVGRE8wRkJRMllzVVVGQlNTeEZRVUZGTEVOQlFVTXNUVUZCVFN4RlFVRkZMRXRCUVVzc1NVRkJTU3hIUVVGSExFTkJRVU03UVVGRE5VSXNVVUZCU1N4RlFVRkZMRU5CUVVNc1ZVRkJWU3hGUVVGRkxFdEJRVXNzU1VGQlNTeEhRVUZITEVOQlFVTTdRVUZEYUVNc1VVRkJTU3hGUVVGRkxFTkJRVU1zVTBGQlV5eEZRVUZGTEV0QlFVc3NTVUZCU1N4SFFVRkhMRU5CUVVNN1FVRkRMMElzVjBGQlR5eExRVUZMTEVOQlFVTTdSMEZEWkN4RFFVRkRPMEZCUTBZc1QwRkJTeXhEUVVGRExHZENRVUZuUWl4SFFVRkhMR2RDUVVGblFpeERRVUZET3p0QlFVVXhReXhUUVVGUExFdEJRVXNzUTBGQlF6dERRVU5hTEVOQlFVRXNSVUZCUnl4RFFVRkRPenRCUVVWTUxFbEJRVWtzVDBGQlR5eE5RVUZOTEV0QlFVc3NVVUZCVVN4SlFVRkpMRTFCUVUwc1EwRkJReXhQUVVGUExFVkJRVVU3UVVGRGFFUXNVVUZCVFN4RFFVRkRMRTlCUVU4c1IwRkJSeXhMUVVGTExFTkJRVU03UTBGRGVFSWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSW5aaGNpQmpiRzl1WlNBOUlDaG1kVzVqZEdsdmJpZ3BJSHRjYmlkMWMyVWdjM1J5YVdOMEp6dGNibHh1THlvcVhHNGdLaUJEYkc5dVpYTWdLR052Y0dsbGN5a2dZVzRnVDJKcVpXTjBJSFZ6YVc1bklHUmxaWEFnWTI5d2VXbHVaeTVjYmlBcVhHNGdLaUJVYUdseklHWjFibU4wYVc5dUlITjFjSEJ2Y25SeklHTnBjbU4xYkdGeUlISmxabVZ5Wlc1alpYTWdZbmtnWkdWbVlYVnNkQ3dnWW5WMElHbG1JSGx2ZFNCaGNtVWdZMlZ5ZEdGcGJseHVJQ29nZEdobGNtVWdZWEpsSUc1dklHTnBjbU4xYkdGeUlISmxabVZ5Wlc1alpYTWdhVzRnZVc5MWNpQnZZbXBsWTNRc0lIbHZkU0JqWVc0Z2MyRjJaU0J6YjIxbElFTlFWU0IwYVcxbFhHNGdLaUJpZVNCallXeHNhVzVuSUdOc2IyNWxLRzlpYWl3Z1ptRnNjMlVwTGx4dUlDcGNiaUFxSUVOaGRYUnBiMjQ2SUdsbUlHQmphWEpqZFd4aGNtQWdhWE1nWm1Gc2MyVWdZVzVrSUdCd1lYSmxiblJnSUdOdmJuUmhhVzV6SUdOcGNtTjFiR0Z5SUhKbFptVnlaVzVqWlhNc1hHNGdLaUI1YjNWeUlIQnliMmR5WVcwZ2JXRjVJR1Z1ZEdWeUlHRnVJR2x1Wm1sdWFYUmxJR3h2YjNBZ1lXNWtJR055WVhOb0xseHVJQ3BjYmlBcUlFQndZWEpoYlNCZ2NHRnlaVzUwWUNBdElIUm9aU0J2WW1wbFkzUWdkRzhnWW1VZ1kyeHZibVZrWEc0Z0tpQkFjR0Z5WVcwZ1lHTnBjbU4xYkdGeVlDQXRJSE5sZENCMGJ5QjBjblZsSUdsbUlIUm9aU0J2WW1wbFkzUWdkRzhnWW1VZ1kyeHZibVZrSUcxaGVTQmpiMjUwWVdsdVhHNGdLaUFnSUNCamFYSmpkV3hoY2lCeVpXWmxjbVZ1WTJWekxpQW9iM0IwYVc5dVlXd2dMU0IwY25WbElHSjVJR1JsWm1GMWJIUXBYRzRnS2lCQWNHRnlZVzBnWUdSbGNIUm9ZQ0F0SUhObGRDQjBieUJoSUc1MWJXSmxjaUJwWmlCMGFHVWdiMkpxWldOMElHbHpJRzl1YkhrZ2RHOGdZbVVnWTJ4dmJtVmtJSFJ2WEc0Z0tpQWdJQ0JoSUhCaGNuUnBZM1ZzWVhJZ1pHVndkR2d1SUNodmNIUnBiMjVoYkNBdElHUmxabUYxYkhSeklIUnZJRWx1Wm1sdWFYUjVLVnh1SUNvZ1FIQmhjbUZ0SUdCd2NtOTBiM1I1Y0dWZ0lDMGdjMlYwY3lCMGFHVWdjSEp2ZEc5MGVYQmxJSFJ2SUdKbElIVnpaV1FnZDJobGJpQmpiRzl1YVc1bklHRnVJRzlpYW1WamRDNWNiaUFxSUNBZ0lDaHZjSFJwYjI1aGJDQXRJR1JsWm1GMWJIUnpJSFJ2SUhCaGNtVnVkQ0J3Y205MGIzUjVjR1VwTGx4dUtpOWNibVoxYm1OMGFXOXVJR05zYjI1bEtIQmhjbVZ1ZEN3Z1kybHlZM1ZzWVhJc0lHUmxjSFJvTENCd2NtOTBiM1I1Y0dVcElIdGNiaUFnZG1GeUlHWnBiSFJsY2p0Y2JpQWdhV1lnS0hSNWNHVnZaaUJqYVhKamRXeGhjaUE5UFQwZ0oyOWlhbVZqZENjcElIdGNiaUFnSUNCa1pYQjBhQ0E5SUdOcGNtTjFiR0Z5TG1SbGNIUm9PMXh1SUNBZ0lIQnliM1J2ZEhsd1pTQTlJR05wY21OMWJHRnlMbkJ5YjNSdmRIbHdaVHRjYmlBZ0lDQm1hV3gwWlhJZ1BTQmphWEpqZFd4aGNpNW1hV3gwWlhJN1hHNGdJQ0FnWTJseVkzVnNZWElnUFNCamFYSmpkV3hoY2k1amFYSmpkV3hoY2x4dUlDQjlYRzRnSUM4dklHMWhhVzUwWVdsdUlIUjNieUJoY25KaGVYTWdabTl5SUdOcGNtTjFiR0Z5SUhKbFptVnlaVzVqWlhNc0lIZG9aWEpsSUdOdmNuSmxjM0J2Ym1ScGJtY2djR0Z5Wlc1MGMxeHVJQ0F2THlCaGJtUWdZMmhwYkdSeVpXNGdhR0YyWlNCMGFHVWdjMkZ0WlNCcGJtUmxlRnh1SUNCMllYSWdZV3hzVUdGeVpXNTBjeUE5SUZ0ZE8xeHVJQ0IyWVhJZ1lXeHNRMmhwYkdSeVpXNGdQU0JiWFR0Y2JseHVJQ0IyWVhJZ2RYTmxRblZtWm1WeUlEMGdkSGx3Wlc5bUlFSjFabVpsY2lBaFBTQW5kVzVrWldacGJtVmtKenRjYmx4dUlDQnBaaUFvZEhsd1pXOW1JR05wY21OMWJHRnlJRDA5SUNkMWJtUmxabWx1WldRbktWeHVJQ0FnSUdOcGNtTjFiR0Z5SUQwZ2RISjFaVHRjYmx4dUlDQnBaaUFvZEhsd1pXOW1JR1JsY0hSb0lEMDlJQ2QxYm1SbFptbHVaV1FuS1Z4dUlDQWdJR1JsY0hSb0lEMGdTVzVtYVc1cGRIazdYRzVjYmlBZ0x5OGdjbVZqZFhKelpTQjBhR2x6SUdaMWJtTjBhVzl1SUhOdklIZGxJR1J2YmlkMElISmxjMlYwSUdGc2JGQmhjbVZ1ZEhNZ1lXNWtJR0ZzYkVOb2FXeGtjbVZ1WEc0Z0lHWjFibU4wYVc5dUlGOWpiRzl1WlNod1lYSmxiblFzSUdSbGNIUm9LU0I3WEc0Z0lDQWdMeThnWTJ4dmJtbHVaeUJ1ZFd4c0lHRnNkMkY1Y3lCeVpYUjFjbTV6SUc1MWJHeGNiaUFnSUNCcFppQW9jR0Z5Wlc1MElEMDlQU0J1ZFd4c0tWeHVJQ0FnSUNBZ2NtVjBkWEp1SUc1MWJHdzdYRzVjYmlBZ0lDQnBaaUFvWkdWd2RHZ2dQVDBnTUNsY2JpQWdJQ0FnSUhKbGRIVnliaUJ3WVhKbGJuUTdYRzVjYmlBZ0lDQjJZWElnWTJocGJHUTdYRzRnSUNBZ2RtRnlJSEJ5YjNSdk8xeHVJQ0FnSUdsbUlDaDBlWEJsYjJZZ2NHRnlaVzUwSUNFOUlDZHZZbXBsWTNRbktTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z2NHRnlaVzUwTzF4dUlDQWdJSDFjYmx4dUlDQWdJR2xtSUNoamJHOXVaUzVmWDJselFYSnlZWGtvY0dGeVpXNTBLU2tnZTF4dUlDQWdJQ0FnWTJocGJHUWdQU0JiWFR0Y2JpQWdJQ0I5SUdWc2MyVWdhV1lnS0dOc2IyNWxMbDlmYVhOU1pXZEZlSEFvY0dGeVpXNTBLU2tnZTF4dUlDQWdJQ0FnWTJocGJHUWdQU0J1WlhjZ1VtVm5SWGh3S0hCaGNtVnVkQzV6YjNWeVkyVXNJRjlmWjJWMFVtVm5SWGh3Um14aFozTW9jR0Z5Wlc1MEtTazdYRzRnSUNBZ0lDQnBaaUFvY0dGeVpXNTBMbXhoYzNSSmJtUmxlQ2tnWTJocGJHUXViR0Z6ZEVsdVpHVjRJRDBnY0dGeVpXNTBMbXhoYzNSSmJtUmxlRHRjYmlBZ0lDQjlJR1ZzYzJVZ2FXWWdLR05zYjI1bExsOWZhWE5FWVhSbEtIQmhjbVZ1ZENrcElIdGNiaUFnSUNBZ0lHTm9hV3hrSUQwZ2JtVjNJRVJoZEdVb2NHRnlaVzUwTG1kbGRGUnBiV1VvS1NrN1hHNGdJQ0FnZlNCbGJITmxJR2xtSUNoMWMyVkNkV1ptWlhJZ0ppWWdRblZtWm1WeUxtbHpRblZtWm1WeUtIQmhjbVZ1ZENrcElIdGNiaUFnSUNBZ0lHTm9hV3hrSUQwZ2JtVjNJRUoxWm1abGNpaHdZWEpsYm5RdWJHVnVaM1JvS1R0Y2JpQWdJQ0FnSUhCaGNtVnVkQzVqYjNCNUtHTm9hV3hrS1R0Y2JpQWdJQ0FnSUhKbGRIVnliaUJqYUdsc1pEdGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnYVdZZ0tIUjVjR1Z2WmlCd2NtOTBiM1I1Y0dVZ1BUMGdKM1Z1WkdWbWFXNWxaQ2NwSUh0Y2JpQWdJQ0FnSUNBZ2NISnZkRzhnUFNCUFltcGxZM1F1WjJWMFVISnZkRzkwZVhCbFQyWW9jR0Z5Wlc1MEtUdGNiaUFnSUNBZ0lDQWdZMmhwYkdRZ1BTQlBZbXBsWTNRdVkzSmxZWFJsS0hCeWIzUnZLVHRjYmlBZ0lDQWdJSDFjYmlBZ0lDQWdJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQmphR2xzWkNBOUlFOWlhbVZqZEM1amNtVmhkR1VvY0hKdmRHOTBlWEJsS1R0Y2JpQWdJQ0FnSUNBZ2NISnZkRzhnUFNCd2NtOTBiM1I1Y0dVN1hHNGdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dVhHNGdJQ0FnYVdZZ0tHTnBjbU4xYkdGeUtTQjdYRzRnSUNBZ0lDQjJZWElnYVc1a1pYZ2dQU0JoYkd4UVlYSmxiblJ6TG1sdVpHVjRUMllvY0dGeVpXNTBLVHRjYmx4dUlDQWdJQ0FnYVdZZ0tHbHVaR1Y0SUNFOUlDMHhLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJoYkd4RGFHbHNaSEpsYmx0cGJtUmxlRjA3WEc0Z0lDQWdJQ0I5WEc0Z0lDQWdJQ0JoYkd4UVlYSmxiblJ6TG5CMWMyZ29jR0Z5Wlc1MEtUdGNiaUFnSUNBZ0lHRnNiRU5vYVd4a2NtVnVMbkIxYzJnb1kyaHBiR1FwTzF4dUlDQWdJSDFjYmx4dUlDQWdJR1p2Y2lBb2RtRnlJR2tnYVc0Z2NHRnlaVzUwS1NCN1hHNGdJQ0FnSUNCMllYSWdZWFIwY25NN1hHNGdJQ0FnSUNCcFppQW9jSEp2ZEc4cElIdGNiaUFnSUNBZ0lDQWdZWFIwY25NZ1BTQlBZbXBsWTNRdVoyVjBUM2R1VUhKdmNHVnlkSGxFWlhOamNtbHdkRzl5S0hCeWIzUnZMQ0JwS1R0Y2JpQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ2FXWWdLR0YwZEhKeklDWW1JR0YwZEhKekxuTmxkQ0E5UFNCdWRXeHNLU0I3WEc0Z0lDQWdJQ0FnSUdOdmJuUnBiblZsTzF4dUlDQWdJQ0FnZlZ4dUlDQWdJQ0FnWTJocGJHUmJhVjBnUFNCZlkyeHZibVVvY0dGeVpXNTBXMmxkTENCa1pYQjBhQ0F0SURFcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUhKbGRIVnliaUJqYUdsc1pEdGNiaUFnZlZ4dVhHNGdJSEpsZEhWeWJpQmZZMnh2Ym1Vb2NHRnlaVzUwTENCa1pYQjBhQ2s3WEc1OVhHNWNiaThxS2x4dUlDb2dVMmx0Y0d4bElHWnNZWFFnWTJ4dmJtVWdkWE5wYm1jZ2NISnZkRzkwZVhCbExDQmhZMk5sY0hSeklHOXViSGtnYjJKcVpXTjBjeXdnZFhObFpuVnNiQ0JtYjNJZ2NISnZjR1Z5ZEhsY2JpQXFJRzkyWlhKeWFXUmxJRzl1SUVaTVFWUWdZMjl1Wm1sbmRYSmhkR2x2YmlCdlltcGxZM1FnS0c1dklHNWxjM1JsWkNCd2NtOXdjeWt1WEc0Z0tseHVJQ29nVlZORklGZEpWRWdnUTBGVlZFbFBUaUVnVkdocGN5QnRZWGtnYm05MElHSmxhR0YyWlNCaGN5QjViM1VnZDJsemFDQnBaaUI1YjNVZ1pHOGdibTkwSUd0dWIzY2dhRzkzSUhSb2FYTmNiaUFxSUhkdmNtdHpMbHh1SUNvdlhHNWpiRzl1WlM1amJHOXVaVkJ5YjNSdmRIbHdaU0E5SUdaMWJtTjBhVzl1SUdOc2IyNWxVSEp2ZEc5MGVYQmxLSEJoY21WdWRDa2dlMXh1SUNCcFppQW9jR0Z5Wlc1MElEMDlQU0J1ZFd4c0tWeHVJQ0FnSUhKbGRIVnliaUJ1ZFd4c08xeHVYRzRnSUhaaGNpQmpJRDBnWm5WdVkzUnBiMjRnS0NrZ2UzMDdYRzRnSUdNdWNISnZkRzkwZVhCbElEMGdjR0Z5Wlc1ME8xeHVJQ0J5WlhSMWNtNGdibVYzSUdNb0tUdGNibjA3WEc1Y2JpOHZJSEJ5YVhaaGRHVWdkWFJwYkdsMGVTQm1kVzVqZEdsdmJuTmNibHh1Wm5WdVkzUnBiMjRnWDE5dlltcFViMU4wY2lodktTQjdYRzRnSUhKbGRIVnliaUJQWW1wbFkzUXVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5MbU5oYkd3b2J5azdYRzU5TzF4dVkyeHZibVV1WDE5dlltcFViMU4wY2lBOUlGOWZiMkpxVkc5VGRISTdYRzVjYm1aMWJtTjBhVzl1SUY5ZmFYTkVZWFJsS0c4cElIdGNiaUFnY21WMGRYSnVJSFI1Y0dWdlppQnZJRDA5UFNBbmIySnFaV04wSnlBbUppQmZYMjlpYWxSdlUzUnlLRzhwSUQwOVBTQW5XMjlpYW1WamRDQkVZWFJsWFNjN1hHNTlPMXh1WTJ4dmJtVXVYMTlwYzBSaGRHVWdQU0JmWDJselJHRjBaVHRjYmx4dVpuVnVZM1JwYjI0Z1gxOXBjMEZ5Y21GNUtHOHBJSHRjYmlBZ2NtVjBkWEp1SUhSNWNHVnZaaUJ2SUQwOVBTQW5iMkpxWldOMEp5QW1KaUJmWDI5aWFsUnZVM1J5S0c4cElEMDlQU0FuVzI5aWFtVmpkQ0JCY25KaGVWMG5PMXh1ZlR0Y2JtTnNiMjVsTGw5ZmFYTkJjbkpoZVNBOUlGOWZhWE5CY25KaGVUdGNibHh1Wm5WdVkzUnBiMjRnWDE5cGMxSmxaMFY0Y0NodktTQjdYRzRnSUhKbGRIVnliaUIwZVhCbGIyWWdieUE5UFQwZ0oyOWlhbVZqZENjZ0ppWWdYMTl2WW1wVWIxTjBjaWh2S1NBOVBUMGdKMXR2WW1wbFkzUWdVbVZuUlhod1hTYzdYRzU5TzF4dVkyeHZibVV1WDE5cGMxSmxaMFY0Y0NBOUlGOWZhWE5TWldkRmVIQTdYRzVjYm1aMWJtTjBhVzl1SUY5ZloyVjBVbVZuUlhod1JteGhaM01vY21VcElIdGNiaUFnZG1GeUlHWnNZV2R6SUQwZ0p5YzdYRzRnSUdsbUlDaHlaUzVuYkc5aVlXd3BJR1pzWVdkeklDczlJQ2RuSnp0Y2JpQWdhV1lnS0hKbExtbG5ibTl5WlVOaGMyVXBJR1pzWVdkeklDczlJQ2RwSnp0Y2JpQWdhV1lnS0hKbExtMTFiSFJwYkdsdVpTa2dabXhoWjNNZ0t6MGdKMjBuTzF4dUlDQnlaWFIxY200Z1pteGhaM003WEc1OU8xeHVZMnh2Ym1VdVgxOW5aWFJTWldkRmVIQkdiR0ZuY3lBOUlGOWZaMlYwVW1WblJYaHdSbXhoWjNNN1hHNWNibkpsZEhWeWJpQmpiRzl1WlR0Y2JuMHBLQ2s3WEc1Y2JtbG1JQ2gwZVhCbGIyWWdiVzlrZFd4bElEMDlQU0FuYjJKcVpXTjBKeUFtSmlCdGIyUjFiR1V1Wlhod2IzSjBjeWtnZTF4dUlDQnRiMlIxYkdVdVpYaHdiM0owY3lBOUlHTnNiMjVsTzF4dWZWeHVJbDE5IiwiLyohXG4gKiBFdmVudEVtaXR0ZXIyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vaGlqMW54L0V2ZW50RW1pdHRlcjJcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTMgaGlqMW54XG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cbjshZnVuY3Rpb24odW5kZWZpbmVkKSB7XG5cbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5ID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uIF9pc0FycmF5KG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xuICB9O1xuICB2YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgaWYgKHRoaXMuX2NvbmYpIHtcbiAgICAgIGNvbmZpZ3VyZS5jYWxsKHRoaXMsIHRoaXMuX2NvbmYpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbmZpZ3VyZShjb25mKSB7XG4gICAgaWYgKGNvbmYpIHtcblxuICAgICAgdGhpcy5fY29uZiA9IGNvbmY7XG5cbiAgICAgIGNvbmYuZGVsaW1pdGVyICYmICh0aGlzLmRlbGltaXRlciA9IGNvbmYuZGVsaW1pdGVyKTtcbiAgICAgIGNvbmYubWF4TGlzdGVuZXJzICYmICh0aGlzLl9ldmVudHMubWF4TGlzdGVuZXJzID0gY29uZi5tYXhMaXN0ZW5lcnMpO1xuICAgICAgY29uZi53aWxkY2FyZCAmJiAodGhpcy53aWxkY2FyZCA9IGNvbmYud2lsZGNhcmQpO1xuICAgICAgY29uZi5uZXdMaXN0ZW5lciAmJiAodGhpcy5uZXdMaXN0ZW5lciA9IGNvbmYubmV3TGlzdGVuZXIpO1xuXG4gICAgICBpZiAodGhpcy53aWxkY2FyZCkge1xuICAgICAgICB0aGlzLmxpc3RlbmVyVHJlZSA9IHt9O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIEV2ZW50RW1pdHRlcihjb25mKSB7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgdGhpcy5uZXdMaXN0ZW5lciA9IGZhbHNlO1xuICAgIGNvbmZpZ3VyZS5jYWxsKHRoaXMsIGNvbmYpO1xuICB9XG5cbiAgLy9cbiAgLy8gQXR0ZW50aW9uLCBmdW5jdGlvbiByZXR1cm4gdHlwZSBub3cgaXMgYXJyYXksIGFsd2F5cyAhXG4gIC8vIEl0IGhhcyB6ZXJvIGVsZW1lbnRzIGlmIG5vIGFueSBtYXRjaGVzIGZvdW5kIGFuZCBvbmUgb3IgbW9yZVxuICAvLyBlbGVtZW50cyAobGVhZnMpIGlmIHRoZXJlIGFyZSBtYXRjaGVzXG4gIC8vXG4gIGZ1bmN0aW9uIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZSwgaSkge1xuICAgIGlmICghdHJlZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICB2YXIgbGlzdGVuZXJzPVtdLCBsZWFmLCBsZW4sIGJyYW5jaCwgeFRyZWUsIHh4VHJlZSwgaXNvbGF0ZWRCcmFuY2gsIGVuZFJlYWNoZWQsXG4gICAgICAgIHR5cGVMZW5ndGggPSB0eXBlLmxlbmd0aCwgY3VycmVudFR5cGUgPSB0eXBlW2ldLCBuZXh0VHlwZSA9IHR5cGVbaSsxXTtcbiAgICBpZiAoaSA9PT0gdHlwZUxlbmd0aCAmJiB0cmVlLl9saXN0ZW5lcnMpIHtcbiAgICAgIC8vXG4gICAgICAvLyBJZiBhdCB0aGUgZW5kIG9mIHRoZSBldmVudChzKSBsaXN0IGFuZCB0aGUgdHJlZSBoYXMgbGlzdGVuZXJzXG4gICAgICAvLyBpbnZva2UgdGhvc2UgbGlzdGVuZXJzLlxuICAgICAgLy9cbiAgICAgIGlmICh0eXBlb2YgdHJlZS5fbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGhhbmRsZXJzICYmIGhhbmRsZXJzLnB1c2godHJlZS5fbGlzdGVuZXJzKTtcbiAgICAgICAgcmV0dXJuIFt0cmVlXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGVhZiA9IDAsIGxlbiA9IHRyZWUuX2xpc3RlbmVycy5sZW5ndGg7IGxlYWYgPCBsZW47IGxlYWYrKykge1xuICAgICAgICAgIGhhbmRsZXJzICYmIGhhbmRsZXJzLnB1c2godHJlZS5fbGlzdGVuZXJzW2xlYWZdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW3RyZWVdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICgoY3VycmVudFR5cGUgPT09ICcqJyB8fCBjdXJyZW50VHlwZSA9PT0gJyoqJykgfHwgdHJlZVtjdXJyZW50VHlwZV0pIHtcbiAgICAgIC8vXG4gICAgICAvLyBJZiB0aGUgZXZlbnQgZW1pdHRlZCBpcyAnKicgYXQgdGhpcyBwYXJ0XG4gICAgICAvLyBvciB0aGVyZSBpcyBhIGNvbmNyZXRlIG1hdGNoIGF0IHRoaXMgcGF0Y2hcbiAgICAgIC8vXG4gICAgICBpZiAoY3VycmVudFR5cGUgPT09ICcqJykge1xuICAgICAgICBmb3IgKGJyYW5jaCBpbiB0cmVlKSB7XG4gICAgICAgICAgaWYgKGJyYW5jaCAhPT0gJ19saXN0ZW5lcnMnICYmIHRyZWUuaGFzT3duUHJvcGVydHkoYnJhbmNoKSkge1xuICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSsxKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gICAgICB9IGVsc2UgaWYoY3VycmVudFR5cGUgPT09ICcqKicpIHtcbiAgICAgICAgZW5kUmVhY2hlZCA9IChpKzEgPT09IHR5cGVMZW5ndGggfHwgKGkrMiA9PT0gdHlwZUxlbmd0aCAmJiBuZXh0VHlwZSA9PT0gJyonKSk7XG4gICAgICAgIGlmKGVuZFJlYWNoZWQgJiYgdHJlZS5fbGlzdGVuZXJzKSB7XG4gICAgICAgICAgLy8gVGhlIG5leHQgZWxlbWVudCBoYXMgYSBfbGlzdGVuZXJzLCBhZGQgaXQgdG8gdGhlIGhhbmRsZXJzLlxuICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlLCB0eXBlTGVuZ3RoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGJyYW5jaCBpbiB0cmVlKSB7XG4gICAgICAgICAgaWYgKGJyYW5jaCAhPT0gJ19saXN0ZW5lcnMnICYmIHRyZWUuaGFzT3duUHJvcGVydHkoYnJhbmNoKSkge1xuICAgICAgICAgICAgaWYoYnJhbmNoID09PSAnKicgfHwgYnJhbmNoID09PSAnKionKSB7XG4gICAgICAgICAgICAgIGlmKHRyZWVbYnJhbmNoXS5fbGlzdGVuZXJzICYmICFlbmRSZWFjaGVkKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgdHlwZUxlbmd0aCkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIGkpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZihicmFuY2ggPT09IG5leHRUeXBlKSB7XG4gICAgICAgICAgICAgIGxpc3RlbmVycyA9IGxpc3RlbmVycy5jb25jYXQoc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB0cmVlW2JyYW5jaF0sIGkrMikpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gTm8gbWF0Y2ggb24gdGhpcyBvbmUsIHNoaWZ0IGludG8gdGhlIHRyZWUgYnV0IG5vdCBpbiB0aGUgdHlwZSBhcnJheS5cbiAgICAgICAgICAgICAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLmNvbmNhdChzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHRyZWVbYnJhbmNoXSwgaSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGlzdGVuZXJzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuY29uY2F0KHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgdHJlZVtjdXJyZW50VHlwZV0sIGkrMSkpO1xuICAgIH1cblxuICAgIHhUcmVlID0gdHJlZVsnKiddO1xuICAgIGlmICh4VHJlZSkge1xuICAgICAgLy9cbiAgICAgIC8vIElmIHRoZSBsaXN0ZW5lciB0cmVlIHdpbGwgYWxsb3cgYW55IG1hdGNoIGZvciB0aGlzIHBhcnQsXG4gICAgICAvLyB0aGVuIHJlY3Vyc2l2ZWx5IGV4cGxvcmUgYWxsIGJyYW5jaGVzIG9mIHRoZSB0cmVlXG4gICAgICAvL1xuICAgICAgc2VhcmNoTGlzdGVuZXJUcmVlKGhhbmRsZXJzLCB0eXBlLCB4VHJlZSwgaSsxKTtcbiAgICB9XG5cbiAgICB4eFRyZWUgPSB0cmVlWycqKiddO1xuICAgIGlmKHh4VHJlZSkge1xuICAgICAgaWYoaSA8IHR5cGVMZW5ndGgpIHtcbiAgICAgICAgaWYoeHhUcmVlLl9saXN0ZW5lcnMpIHtcbiAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGEgbGlzdGVuZXIgb24gYSAnKionLCBpdCB3aWxsIGNhdGNoIGFsbCwgc28gYWRkIGl0cyBoYW5kbGVyLlxuICAgICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlLCB0eXBlTGVuZ3RoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJ1aWxkIGFycmF5cyBvZiBtYXRjaGluZyBuZXh0IGJyYW5jaGVzIGFuZCBvdGhlcnMuXG4gICAgICAgIGZvcihicmFuY2ggaW4geHhUcmVlKSB7XG4gICAgICAgICAgaWYoYnJhbmNoICE9PSAnX2xpc3RlbmVycycgJiYgeHhUcmVlLmhhc093blByb3BlcnR5KGJyYW5jaCkpIHtcbiAgICAgICAgICAgIGlmKGJyYW5jaCA9PT0gbmV4dFR5cGUpIHtcbiAgICAgICAgICAgICAgLy8gV2Uga25vdyB0aGUgbmV4dCBlbGVtZW50IHdpbGwgbWF0Y2gsIHNvIGp1bXAgdHdpY2UuXG4gICAgICAgICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlW2JyYW5jaF0sIGkrMik7XG4gICAgICAgICAgICB9IGVsc2UgaWYoYnJhbmNoID09PSBjdXJyZW50VHlwZSkge1xuICAgICAgICAgICAgICAvLyBDdXJyZW50IG5vZGUgbWF0Y2hlcywgbW92ZSBpbnRvIHRoZSB0cmVlLlxuICAgICAgICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHh4VHJlZVticmFuY2hdLCBpKzEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaXNvbGF0ZWRCcmFuY2ggPSB7fTtcbiAgICAgICAgICAgICAgaXNvbGF0ZWRCcmFuY2hbYnJhbmNoXSA9IHh4VHJlZVticmFuY2hdO1xuICAgICAgICAgICAgICBzZWFyY2hMaXN0ZW5lclRyZWUoaGFuZGxlcnMsIHR5cGUsIHsgJyoqJzogaXNvbGF0ZWRCcmFuY2ggfSwgaSsxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZih4eFRyZWUuX2xpc3RlbmVycykge1xuICAgICAgICAvLyBXZSBoYXZlIHJlYWNoZWQgdGhlIGVuZCBhbmQgc3RpbGwgb24gYSAnKionXG4gICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlLCB0eXBlTGVuZ3RoKTtcbiAgICAgIH0gZWxzZSBpZih4eFRyZWVbJyonXSAmJiB4eFRyZWVbJyonXS5fbGlzdGVuZXJzKSB7XG4gICAgICAgIHNlYXJjaExpc3RlbmVyVHJlZShoYW5kbGVycywgdHlwZSwgeHhUcmVlWycqJ10sIHR5cGVMZW5ndGgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gIH1cblxuICBmdW5jdGlvbiBncm93TGlzdGVuZXJUcmVlKHR5cGUsIGxpc3RlbmVyKSB7XG5cbiAgICB0eXBlID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XG5cbiAgICAvL1xuICAgIC8vIExvb2tzIGZvciB0d28gY29uc2VjdXRpdmUgJyoqJywgaWYgc28sIGRvbid0IGFkZCB0aGUgZXZlbnQgYXQgYWxsLlxuICAgIC8vXG4gICAgZm9yKHZhciBpID0gMCwgbGVuID0gdHlwZS5sZW5ndGg7IGkrMSA8IGxlbjsgaSsrKSB7XG4gICAgICBpZih0eXBlW2ldID09PSAnKionICYmIHR5cGVbaSsxXSA9PT0gJyoqJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHRyZWUgPSB0aGlzLmxpc3RlbmVyVHJlZTtcbiAgICB2YXIgbmFtZSA9IHR5cGUuc2hpZnQoKTtcblxuICAgIHdoaWxlIChuYW1lKSB7XG5cbiAgICAgIGlmICghdHJlZVtuYW1lXSkge1xuICAgICAgICB0cmVlW25hbWVdID0ge307XG4gICAgICB9XG5cbiAgICAgIHRyZWUgPSB0cmVlW25hbWVdO1xuXG4gICAgICBpZiAodHlwZS5sZW5ndGggPT09IDApIHtcblxuICAgICAgICBpZiAoIXRyZWUuX2xpc3RlbmVycykge1xuICAgICAgICAgIHRyZWUuX2xpc3RlbmVycyA9IGxpc3RlbmVyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYodHlwZW9mIHRyZWUuX2xpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRyZWUuX2xpc3RlbmVycyA9IFt0cmVlLl9saXN0ZW5lcnMsIGxpc3RlbmVyXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc0FycmF5KHRyZWUuX2xpc3RlbmVycykpIHtcblxuICAgICAgICAgIHRyZWUuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblxuICAgICAgICAgIGlmICghdHJlZS5fbGlzdGVuZXJzLndhcm5lZCkge1xuXG4gICAgICAgICAgICB2YXIgbSA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5fZXZlbnRzLm1heExpc3RlbmVycyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgbSA9IHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtID4gMCAmJiB0cmVlLl9saXN0ZW5lcnMubGVuZ3RoID4gbSkge1xuXG4gICAgICAgICAgICAgIHRyZWUuX2xpc3RlbmVycy53YXJuZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmVlLl9saXN0ZW5lcnMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIG5hbWUgPSB0eXBlLnNoaWZ0KCk7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhblxuICAvLyAxMCBsaXN0ZW5lcnMgYXJlIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2hcbiAgLy8gaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG4gIC8vXG4gIC8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuICAvLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmRlbGltaXRlciA9ICcuJztcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgICB0aGlzLl9ldmVudHMgfHwgaW5pdC5jYWxsKHRoaXMpO1xuICAgIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgPSBuO1xuICAgIGlmICghdGhpcy5fY29uZikgdGhpcy5fY29uZiA9IHt9O1xuICAgIHRoaXMuX2NvbmYubWF4TGlzdGVuZXJzID0gbjtcbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50ID0gJyc7XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKSB7XG4gICAgdGhpcy5tYW55KGV2ZW50LCAxLCBmbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5tYW55ID0gZnVuY3Rpb24oZXZlbnQsIHR0bCwgZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ21hbnkgb25seSBhY2NlcHRzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpc3RlbmVyKCkge1xuICAgICAgaWYgKC0tdHRsID09PSAwKSB7XG4gICAgICAgIHNlbGYub2ZmKGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICB9XG4gICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIGxpc3RlbmVyLl9vcmlnaW4gPSBmbjtcblxuICAgIHRoaXMub24oZXZlbnQsIGxpc3RlbmVyKTtcblxuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcblxuICAgIHZhciB0eXBlID0gYXJndW1lbnRzWzBdO1xuXG4gICAgaWYgKHR5cGUgPT09ICduZXdMaXN0ZW5lcicgJiYgIXRoaXMubmV3TGlzdGVuZXIpIHtcbiAgICAgIGlmICghdGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKSB7IHJldHVybiBmYWxzZTsgfVxuICAgIH1cblxuICAgIC8vIExvb3AgdGhyb3VnaCB0aGUgKl9hbGwqIGZ1bmN0aW9ucyBhbmQgaW52b2tlIHRoZW0uXG4gICAgaWYgKHRoaXMuX2FsbCkge1xuICAgICAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkobCAtIDEpO1xuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsOyBpKyspIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgZm9yIChpID0gMCwgbCA9IHRoaXMuX2FsbC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5ldmVudCA9IHR5cGU7XG4gICAgICAgIHRoaXMuX2FsbFtpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gICAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcblxuICAgICAgaWYgKCF0aGlzLl9hbGwgJiZcbiAgICAgICAgIXRoaXMuX2V2ZW50cy5lcnJvciAmJlxuICAgICAgICAhKHRoaXMud2lsZGNhcmQgJiYgdGhpcy5saXN0ZW5lclRyZWUuZXJyb3IpKSB7XG5cbiAgICAgICAgaWYgKGFyZ3VtZW50c1sxXSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgdGhyb3cgYXJndW1lbnRzWzFdOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuY2F1Z2h0LCB1bnNwZWNpZmllZCAnZXJyb3InIGV2ZW50LlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGhhbmRsZXI7XG5cbiAgICBpZih0aGlzLndpbGRjYXJkKSB7XG4gICAgICBoYW5kbGVyID0gW107XG4gICAgICB2YXIgbnMgPSB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyB0eXBlLnNwbGl0KHRoaXMuZGVsaW1pdGVyKSA6IHR5cGUuc2xpY2UoKTtcbiAgICAgIHNlYXJjaExpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIGhhbmRsZXIsIG5zLCB0aGlzLmxpc3RlbmVyVHJlZSwgMCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpXG4gICAgICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIC8vIHNsb3dlclxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB2YXIgbCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShsIC0gMSk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGw7IGkrKykgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoaGFuZGxlcikge1xuICAgICAgdmFyIGwgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkobCAtIDEpO1xuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBsOyBpKyspIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgICB2YXIgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMuZXZlbnQgPSB0eXBlO1xuICAgICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gKGxpc3RlbmVycy5sZW5ndGggPiAwKSB8fCAhIXRoaXMuX2FsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICByZXR1cm4gISF0aGlzLl9hbGw7XG4gICAgfVxuXG4gIH07XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG5cbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRoaXMub25BbnkodHlwZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ29uIG9ubHkgYWNjZXB0cyBpbnN0YW5jZXMgb2YgRnVuY3Rpb24nKTtcbiAgICB9XG4gICAgdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcblxuICAgIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT0gXCJuZXdMaXN0ZW5lcnNcIiEgQmVmb3JlXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lcnNcIi5cbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gICAgaWYodGhpcy53aWxkY2FyZCkge1xuICAgICAgZ3Jvd0xpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIHR5cGUsIGxpc3RlbmVyKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSB7XG4gICAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICAgIH1cbiAgICBlbHNlIGlmKHR5cGVvZiB0aGlzLl9ldmVudHNbdHlwZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc0FycmF5KHRoaXMuX2V2ZW50c1t0eXBlXSkpIHtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcblxuICAgICAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgICAgIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuXG4gICAgICAgIHZhciBtID0gZGVmYXVsdE1heExpc3RlbmVycztcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgbSA9IHRoaXMuX2V2ZW50cy5tYXhMaXN0ZW5lcnM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcblxuICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uQW55ID0gZnVuY3Rpb24oZm4pIHtcblxuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignb25Bbnkgb25seSBhY2NlcHRzIGluc3RhbmNlcyBvZiBGdW5jdGlvbicpO1xuICAgIH1cblxuICAgIGlmKCF0aGlzLl9hbGwpIHtcbiAgICAgIHRoaXMuX2FsbCA9IFtdO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgZnVuY3Rpb24gdG8gdGhlIGV2ZW50IGxpc3RlbmVyIGNvbGxlY3Rpb24uXG4gICAgdGhpcy5fYWxsLnB1c2goZm4pO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlbW92ZUxpc3RlbmVyIG9ubHkgdGFrZXMgaW5zdGFuY2VzIG9mIEZ1bmN0aW9uJyk7XG4gICAgfVxuXG4gICAgdmFyIGhhbmRsZXJzLGxlYWZzPVtdO1xuXG4gICAgaWYodGhpcy53aWxkY2FyZCkge1xuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XG4gICAgICBsZWFmcyA9IHNlYXJjaExpc3RlbmVyVHJlZS5jYWxsKHRoaXMsIG51bGwsIG5zLCB0aGlzLmxpc3RlbmVyVHJlZSwgMCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gZG9lcyBub3QgdXNlIGxpc3RlbmVycygpLCBzbyBubyBzaWRlIGVmZmVjdCBvZiBjcmVhdGluZyBfZXZlbnRzW3R5cGVdXG4gICAgICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSkgcmV0dXJuIHRoaXM7XG4gICAgICBoYW5kbGVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICAgIGxlYWZzLnB1c2goe19saXN0ZW5lcnM6aGFuZGxlcnN9KTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpTGVhZj0wOyBpTGVhZjxsZWFmcy5sZW5ndGg7IGlMZWFmKyspIHtcbiAgICAgIHZhciBsZWFmID0gbGVhZnNbaUxlYWZdO1xuICAgICAgaGFuZGxlcnMgPSBsZWFmLl9saXN0ZW5lcnM7XG4gICAgICBpZiAoaXNBcnJheShoYW5kbGVycykpIHtcblxuICAgICAgICB2YXIgcG9zaXRpb24gPSAtMTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gaGFuZGxlcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoaGFuZGxlcnNbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgICAoaGFuZGxlcnNbaV0ubGlzdGVuZXIgJiYgaGFuZGxlcnNbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB8fFxuICAgICAgICAgICAgKGhhbmRsZXJzW2ldLl9vcmlnaW4gJiYgaGFuZGxlcnNbaV0uX29yaWdpbiA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocG9zaXRpb24gPCAwKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZih0aGlzLndpbGRjYXJkKSB7XG4gICAgICAgICAgbGVhZi5fbGlzdGVuZXJzLnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgaWYodGhpcy53aWxkY2FyZCkge1xuICAgICAgICAgICAgZGVsZXRlIGxlYWYuX2xpc3RlbmVycztcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGhhbmRsZXJzID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAoaGFuZGxlcnMubGlzdGVuZXIgJiYgaGFuZGxlcnMubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB8fFxuICAgICAgICAoaGFuZGxlcnMuX29yaWdpbiAmJiBoYW5kbGVycy5fb3JpZ2luID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgaWYodGhpcy53aWxkY2FyZCkge1xuICAgICAgICAgIGRlbGV0ZSBsZWFmLl9saXN0ZW5lcnM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmQW55ID0gZnVuY3Rpb24oZm4pIHtcbiAgICB2YXIgaSA9IDAsIGwgPSAwLCBmbnM7XG4gICAgaWYgKGZuICYmIHRoaXMuX2FsbCAmJiB0aGlzLl9hbGwubGVuZ3RoID4gMCkge1xuICAgICAgZm5zID0gdGhpcy5fYWxsO1xuICAgICAgZm9yKGkgPSAwLCBsID0gZm5zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZihmbiA9PT0gZm5zW2ldKSB7XG4gICAgICAgICAgZm5zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hbGwgPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmO1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAhdGhpcy5fZXZlbnRzIHx8IGluaXQuY2FsbCh0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcbiAgICAgIHZhciBucyA9IHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHR5cGUuc3BsaXQodGhpcy5kZWxpbWl0ZXIpIDogdHlwZS5zbGljZSgpO1xuICAgICAgdmFyIGxlYWZzID0gc2VhcmNoTGlzdGVuZXJUcmVlLmNhbGwodGhpcywgbnVsbCwgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcblxuICAgICAgZm9yICh2YXIgaUxlYWY9MDsgaUxlYWY8bGVhZnMubGVuZ3RoOyBpTGVhZisrKSB7XG4gICAgICAgIHZhciBsZWFmID0gbGVhZnNbaUxlYWZdO1xuICAgICAgICBsZWFmLl9saXN0ZW5lcnMgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSByZXR1cm4gdGhpcztcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICAgIGlmKHRoaXMud2lsZGNhcmQpIHtcbiAgICAgIHZhciBoYW5kbGVycyA9IFtdO1xuICAgICAgdmFyIG5zID0gdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gdHlwZS5zcGxpdCh0aGlzLmRlbGltaXRlcikgOiB0eXBlLnNsaWNlKCk7XG4gICAgICBzZWFyY2hMaXN0ZW5lclRyZWUuY2FsbCh0aGlzLCBoYW5kbGVycywgbnMsIHRoaXMubGlzdGVuZXJUcmVlLCAwKTtcbiAgICAgIHJldHVybiBoYW5kbGVycztcbiAgICB9XG5cbiAgICB0aGlzLl9ldmVudHMgfHwgaW5pdC5jYWxsKHRoaXMpO1xuXG4gICAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFtdO1xuICAgIGlmICghaXNBcnJheSh0aGlzLl9ldmVudHNbdHlwZV0pKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgfTtcblxuICBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyc0FueSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgaWYodGhpcy5fYWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fYWxsO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgfTtcblxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRXZlbnRFbWl0dGVyO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIENvbW1vbkpTXG4gICAgZXhwb3J0cy5FdmVudEVtaXR0ZXIyID0gRXZlbnRFbWl0dGVyO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsLlxuICAgIHdpbmRvdy5FdmVudEVtaXR0ZXIyID0gRXZlbnRFbWl0dGVyO1xuICB9XG59KCk7XG4iLCJcbi8qKlxuICogRGVzY3JpYmVzIGEgc2luZ2xlIGZpZWxkIChjb2x1bW4pIGluIHRoZSBBdXRvUXVlcnlSZXN1bHRzIGRhdGEsIGZvciBtYXBwaW5ncyBwdXJwb3Nlcy5cbiAqL1xuY2xhc3MgTWFwcGluZ3NGaWVsZCB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge01hcHBpbmdzSGVscGVyfSBtYXBwaW5nc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICAgKiBAcGFyYW0ge251bWJlcn0ga2V5U2VxXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbiAoTWVhc3VyZXxHcm91cGluZylcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtYXBwaW5ncywgaW5kZXgsIGtleSwga2V5U2VxLCBvcHRpb24pIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG9wdGlvbiBrZXkgc3RvcmVkIGluIGNvbnRleHQub3B0aW9ucy5pdGVtcyBhbmQgZGVmaW5lZCBpbiBtYW5pZmVzdC5vcHRpb25zLml0ZW1zLlxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5rZXkgPSBrZXk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBzZXF1ZW5jZSBudW1iZXIgZm9yIHRoZSBzYW1lIGtleSwgb3Igd2hpY2ggJ3RpZXInIG9mIHRoZSBvcHRpb24ga2V5IHRoaXMgY29sdW1uIHJlcHJlc2VudHMsXG4gICAgICAgICAqIHR5cGljYWxseSB6ZXJvIHVubGVzcyB0aGVyZSBhcmUgbXVsdGlwbGUgaXRlbXMgY29uZmlndXJlZCBmb3IgYSAnbGlzdCcgdHlwZSBrZXkuXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmtleVNlcSA9IGtleVNlcTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIGNvbHVtbiBpbmRleCBpbiB0aGUgb3V0cHV0IGRhdGFcbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgc2NoZW1hIG9iamVjdCBmb3IgdGhpcyBvdXRwdXQgY29sdW1uXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9IGEgYSBTY2hlbWFGaWVsZFxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHNjaGVtYUZpZWxkID0gbWFwcGluZ3Muc2NoZW1hLmZpZWxkc1t0aGlzLmluZGV4XTsgLy8gbm8gbG9uZ2VyIGV4cG9zZWQsIHJlZHVuZGFudCAoc2VlIGJlbG93KVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbmFtZSBvZiB0aGUgZmllbGQgaW4gdGhlIG91dHB1dCBxdWVyeSwgdHlwaWNhbGx5IGRlYnVnIHB1cnBvc2VzIG9ubHlcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubmFtZSA9IHNjaGVtYUZpZWxkLm5hbWU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBkYXRhIHR5cGUgb2YgdGhlIG91dHB1dCBmaWVsZCwgd2hpY2ggbWF5IGRpZmZlciBmcm9tIHRoZSBzb3VyY2UgZmllbGQgZS5nLiBjZXJ0YWluIGFnZ3JlZ2F0aW9uIGZ1bmN0aW9uc1xuICAgICAgICAgKiBjYW4gcmV0dXJuIG51bWJlcnMgZm9yIHRleHQgZmllbGRzLlxuICAgICAgICAgKiBURVhULCBOVU1CRVIsIERBVEUsIFJBTkdFX05VTUJFUiwgUkFOR0VfREFURVxuICAgICAgICAgKiBGcm9tIFNjaGVtYUZpZWxkLnR5cGUuXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLnR5cGUgPSBzY2hlbWFGaWVsZC50eXBlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBUaGUgbWVhc3VyZSBvciBncm91cGluZyB0aGF0IGNyZWF0ZWQgdGhpcyBvdXRwdXQgY29sdW1uLlxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fSBhIE1lYXN1cmUgb3IgR3JvdXBpbmdcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMub3B0aW9uID0gb3B0aW9uO1xuXG4gICAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gTWFwcGluZ3NGaWVsZDtcbiIsInZhciBNYXBwaW5nc0ZpZWxkID0gcmVxdWlyZShcIi4vTWFwcGluZ3NGaWVsZFwiKTtcclxudmFyIE1hcHBpbmdzS2V5ID0gcmVxdWlyZShcIi4vTWFwcGluZ3NLZXlcIik7XHJcbnZhciBhdXRvUXVlcnlCdWlsZGluZyA9IHJlcXVpcmUoXCIuL2F1dG9RdWVyeUJ1aWxkaW5nXCIpO1xyXG5cclxuLyoqXHJcbiAqIEVuZCB1c2VyIGhlbHBlciBwcmVzZW50ZWQgYXMgb21uaXNjb3BlLnZpZXcubWFwcGluZ3MoKSBmb3IgaW50ZXJwcmV0aW5nIGF1dG8gcXVlcnkgcmVzdWx0cy5cclxuICovXHJcbmNsYXNzIE1hcHBpbmdzSGVscGVyIHtcclxuXHJcbiAgICAvLyBQRU5ESU5HOiBoYWxmd2F5IHRocm91Z2ggcmVvcmdhbmlzaW5nLCBuZWVkIHRvIGhhdmUga2V5cyBhbHdheXMgYW5kIGhhdmUgbm90IG1peCBmaWVsZCB3aXRoIGZpZWxkcyBwYXR0ZXJuXHJcblxyXG4gICAgY29uc3RydWN0b3IoY29udGV4dCkge1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgc2NoZW1hIHJldHVybmVkIGluIEF1dG9RdWVyeVJlc3VsdC5kYXRhLnNjaGVtYSB3aGljaCBzaG91bGQgYWx3YXlzIGFwcGx5IHRvIGJvdGggZGF0YSBhbmQgc2hhZG93RGF0YVxyXG4gICAgICAgICAqIChpZiBwcmVzZW50KS5cclxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fSBhIFNjaGVtYUZpZWxkc1F1ZXJ5T3V0cHV0XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5zY2hlbWEgPSBjb250ZXh0LnJlc3VsdC5kYXRhLnNjaGVtYTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIG51bWJlciBvZiBjb2x1bW5zIGluIHRoZSBvdXRwdXQgZGF0YVxyXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuc2NoZW1hLmZpZWxkcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgTWFwcGluZ3NLZXk+fSBhIG1hcCBvZiBzdHJpbmcga2V5IHRvIE1hcHBpbmdzS2V5IGhlbHBlciBvYmplY3QgZm9yIHRoYXQgb3B0aW9uIGtleSxcclxuICAgICAgICAgKiBpbmNsdWRpbmcgdGhvc2Ugbm90IHByZXNlbnQgYXMgZmllbGRzIGluIHRoZSByZXN1bHQgKGZvciBvcHRpb25zIG5vdCBjb25maWd1cmVkKS5cclxuICAgICAgICAgKi9cclxuICAgICAgICB0aGlzLmtleXMgPSB7fTtcclxuXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQXJyYXkgcmVzcGVjdGl2ZSB0byBjb2x1bW5zIGluIHJlc3VsdCBkYXRhLCBjb250YWluaW5nIHRoZSBNYXBwaW5nc0ZpZWxkIGhlbHBlciBvYmplY3QgZm9yIHRoYXQgY29sdW1uLlxyXG4gICAgICAgICAqIEB0eXBlIHtBcnJheS48TWFwcGluZ3NGaWVsZD59XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdGhpcy5maWVsZHMgPSBuZXcgQXJyYXkodGhpcy53aWR0aCk7XHJcblxyXG4gICAgICAgIC8vIEdvIHRocm91Z2ggYWxsIGF1dG8tcXVlcnkgb3B0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCwgZXZlbiBpZiBub3QgY3VycmVudGx5IGNvbmZpZ3VyZWQuLi5cclxuICAgICAgICBPYmplY3Qua2V5cyhjb250ZXh0Lm1hbmlmZXN0Lm9wdGlvbnMuaXRlbXMpLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgaWYgKCFhdXRvUXVlcnlCdWlsZGluZy5pbmNsdWRlT3B0aW9uSW5BdXRvUXVlcnkoY29udGV4dCwga2V5KSkgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgdmFyIG9wdGlvbkRlZiA9IGNvbnRleHQubWFuaWZlc3Qub3B0aW9ucy5pdGVtc1trZXldO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1rID0gbmV3IE1hcHBpbmdzS2V5KGtleSwgb3B0aW9uRGVmKTtcclxuICAgICAgICAgICAgdGhpcy5rZXlzW2tleV0gPSBtaztcclxuXHJcbiAgICAgICAgICAgIC8vIEdldCB0aGUgb3B0aW9uIHZhbHVlKHMpOlxyXG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IGNvbnRleHQub3B0aW9ucy5pdGVtc1trZXldOyAvLyBudWxsL3VuZGVmaW5lZCBpZiBub3QgY3VycmVudGx5IGNvbmZpZ3VyZWRcclxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucykgJiYgb3B0aW9ucy5sZW5ndGg9PT0wKSBvcHRpb25zID0gbnVsbDsgLy8gdHJlYXQgZW1wdHkgYXJyYXkgYXMgcGVyIHVuY29uZmlndXJlZFxyXG5cclxuICAgICAgICAgICAgaWYgKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIC8vIFRoaXMgb3B0aW9uIGhhcyBiZWVuIGNvbmZpZ3VyZWQgYW5kIHdpbGwgaGF2ZSBvbmUgb3IgbW9yZSBmaWVsZHMgaW4gdGhlIHJldXNsdC5cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXhlcyA9IGNvbnRleHQucmVzdWx0Lm1hcHBpbmdzW2tleV07XHJcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbkRlZi5saXN0KSBpbmRleGVzID0gW2luZGV4ZXNdO1xyXG5cclxuICAgICAgICAgICAgICAgIGluZGV4ZXMuZm9yRWFjaCgoaW5kZXgsIGtleVNlcSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcHRpb24gPSBvcHRpb25zO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25EZWYubGlzdCkgb3B0aW9uID0gb3B0aW9uW2tleVNlcV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBmID0gbmV3IE1hcHBpbmdzRmllbGQodGhpcywgaW5kZXgsIGtleSwga2V5U2VxLCBvcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmllbGRzW2luZGV4XSA9IGY7XHJcbiAgICAgICAgICAgICAgICAgICAgbWsuZmllbGRzLnB1c2goZik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIW9wdGlvbkRlZi5saXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWsuZmllbGQgPSBtay5maWVsZHNbMF07IC8vIHNpbmdsZSBmaWVsZFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWFwcGluZ3NIZWxwZXI7XHJcbiIsIlxuLyoqXG4gKiBEZXNjcmliZXMgYW4gb3B0aW9uIGtleSBhbmQgdGhlIGZpZWxkKHMpIGl0IG1hcHMgdG8uXG4gKiBUaGVyZSBpcyBhbHdheXMgYSBNYXBwaW5nc0tleSBmb3IgZXZlcnkgb3B0aW9uLCBldmVuIGlmIHRoZSBvcHRpb24gaGFzbid0IGJlZW4gY29uZmlndXJlZC5cbiAqL1xuY2xhc3MgTWFwcGluZ3NLZXkge1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtNYXBwaW5nc0hlbHBlcn0gbWFwcGluZ3NcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHRoZSBPcHRpb25EZWZpbml0aW9uIGZyb20gdGhlIG1hbmlmZXN0XG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioa2V5LCBvcHRpb25EZWYpIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG9wdGlvbiBrZXkgc3RvcmVkIGluIGNvbnRleHQub3B0aW9ucy5pdGVtcyBhbmQgZGVmaW5lZCBpbiBtYW5pZmVzdC5vcHRpb25zLml0ZW1zLlxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5rZXkgPSBrZXk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9IHRoZSBPcHRpb25EZWZpbml0aW9uIGZyb20gdGhlIG1hbmlmZXN0XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm9wdGlvbkRlZiA9IG9wdGlvbkRlZjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTm9uLW51bGwgYXJyYXkgb2YgTWFwcGluZ3NGaWVsZChzKSBjb3JyZXNwb25kaW5nIHRvIHRoaXMga2V5LlxuICAgICAgICAgKiBFbXB0eSBpZiB0aGlzIG9wdGlvbiBpc24ndCBjb25maWd1cmVkIGJ5IHRoZSB1c2VyLlxuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPE1hcHBpbmdzRmllbGQ+fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5maWVsZHMgPSBbXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHNpbmdsZSBNYXBwaW5nc0ZpZWxkLCBvciBudWxsIGlmIHRoZSBvcHRpb24gaXMgYSBsaXN0LCBvciBub3QgY29uZmlndXJlZCBieSB0aGUgdXNlci5cbiAgICAgICAgICogQHR5cGUge251bGx9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpZWxkID0gbnVsbDtcblxuICAgIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcHBpbmdzS2V5O1xuIiwidmFyIGNsb25lID0gcmVxdWlyZShcIkB2aXNva2lvL2NvbW1vbi9zcmMvdXRpbC9jbG9uZVwiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cclxuICAgIGluY2x1ZGVPcHRpb25JbkF1dG9RdWVyeShjb250ZXh0LCBrZXkgLyo6IHN0cmluZyovKSB7XHJcbiAgICAgICAgLy8gU2tpcCBzcGVjaWFsIGF1dG8tcGFuZSBwcm9wZXJ0aWVzIG5ldmVyIHVzZWQgaW4gYXV0by1xdWVyeSwgZXZlbiB3aGVuIG5vdCBhdXRvLXBhbmluZzpcclxuICAgICAgICBpZiAoa2V5PT09XCJwYW5lWFwiIHx8IGtleT09PVwicGFuZVlcIikgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgZGVmID0gY29udGV4dC5tYW5pZmVzdC5vcHRpb25zLml0ZW1zW2tleV07IC8vIE9wdGlvbkRlZmluaXRpb25cclxuICAgICAgICBpZiAoZGVmLnR5cGUhPT1cIkdST1VQSU5HXCIgJiYgZGVmLnR5cGUhPT1cIk1FQVNVUkVcIikgcmV0dXJuIGZhbHNlOyAvLyBub3QgYSBxdWVyeS1kcml2aW5nIG9wdGlvblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIEJ1aWxkcyB0aGUgU2ltcGxlUXVlcnkgZm9yIGF1dG8tcXVlcnksIGFuZCBzaW11bHRhbmVvdXNseSBidWlsZHMgdGhlIEF1dG9RdWVyeVJlc3VsdHMubWFwcGluZ3Mgb2JqZWN0XHJcbiAgICAgKiBkZXNjcmliaW5nIGhvdyBjb2x1bW4gaW5kZXhlcyBtYXAuXHJcbiAgICAgKlxyXG4gICAgICogV2UgdGFrZSBhbGwgdGhlIG9wdGlvbnMgdGhhdCBhcmUgR1JPVVBJTkcgdHlwZSwgYW5kIGFkZCB0aGVzZSBhcyBncm91cGluZ3MsIHdoaWNoIGJlY29tZSB0aGUgZmlyc3Qgc2VyaWVzIG9mIGNvbHVtbnNcclxuICAgICAqIGluIHRoZSBxdWVyeSByZXN1bHQuXHJcbiAgICAgKiBXZSB0aGVuIHRha2UgYWxsIHRoZSBvcHRpb25zIHRoYXQgYXJlIE1FQVNVUkUgdHlwZSwgYW5kIGFkZCB0aGVzZSBhcyBtZWFzdXJlcywgd2hpY2ggYmVjb21lIHRoZSBzdWJzZXF1ZW50IHNlcmllc1xyXG4gICAgICogb2YgY29sdW1ucyBpbiB0aGUgcXVlcnkgcmVzdWx0LlxyXG4gICAgICogT3B0aW9ucyBhcmUgb3JkZXJlZCBhbHBoYWJldGljYWxseSBieSB0aGVpciBrZXkgc3RyaW5nLCBmb3IgY29uc2lzdGVuY3kgY3Jvc3MtYnJvd3Nlci5cclxuICAgICAqIFdoZXJlIGFuIG9wdGlvbiBpcyBhIGxpc3QgdHlwZSwgdGhpcyBwcm9kdWNlcyBhbiBhcnJheSBvZiBncm91cGluZ3Mgb3IgbWVhc3VyZXMsIHNvIHdlIG1hcCB0byBhbiBhcnJheSBvZiBpbmRleGVzXHJcbiAgICAgKiAod2hpY2ggbWF5IG9mdGVuIGJlIGxlbmd0aCAxIGlmIHRoZSB1c2VyIG9ubHkgY2hvc2UgYSBzaW5nbGUgaXRlbSBpbiB0aGUgbGlzdCkuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBjb250ZXh0IGEgVmlld0FwaUNvbnRleHRcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBxdWVyeSBBbiBlbXB0eSBTaW1wbGVRdWVyeSBvYmplY3QgdG8gcG9wdWxhdGUgd2l0aCBtZWFzdXJlcyBhbmQgZ3JvdXBpbmdzXHJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gbWFwcGluZ3MgQW4gZW1wdHkgb2JqZWN0IHRvIHB1dCB0aGUgbWFwcGluZ3MgKFN0cmluZyBvcHRpb24ga2V5IG1hcHBpbmcgdG8gaW5kZXggb3IgYXJyYXkgb2YgaW5kaWNlcylcclxuICAgICAqL1xyXG4gICAgYnVpbGRBdXRvUXVlcnkoY29udGV4dCwgcXVlcnksIG1hcHBpbmdzKSB7XHJcbiAgICAgICAgLy8gSW4gY2FzZSB0aGUgY2FsbGVyIGRvZXNuJ3QgY2FyZSBhYm91dCBlaXRoZXI6XHJcbiAgICAgICAgcXVlcnkgPSBxdWVyeSB8fCB7fTtcclxuICAgICAgICBtYXBwaW5ncyA9IG1hcHBpbmdzIHx8IHt9O1xyXG5cclxuICAgICAgICAvLyBTdGFydCB3aXRoIGVtcHR5IG1lYXN1cmVzICYgZ3JvdXBpbmdzXHJcbiAgICAgICAgcXVlcnkubWVhc3VyZXMgPSBbXTtcclxuICAgICAgICBxdWVyeS5ncm91cGluZ3MgPSBbXTtcclxuXHJcbiAgICAgICAgLy8gVGhlc2UgdHdvIGhvbGQgdGhlIHRlbXBvcmFyeSBtYXBwaW5ncyB3aXRoIHJlbGF0aXZlIGluZGV4ZXNcclxuICAgICAgICB2YXIgbWVhc3VyZU1hcHBpbmdzICA9IHt9OyAvLyBNYXAgb2Yga2V5IHRvIChJbnRlZ2VyfEFycmF5LjxJbnRlZ2VyPilcclxuICAgICAgICB2YXIgZ3JvdXBpbmdNYXBwaW5ncyA9IHt9OyAvLyBNYXAgb2Yga2V5IHRvIChJbnRlZ2VyfEFycmF5LjxJbnRlZ2VyPilcclxuXHJcbiAgICAgICAgdmFyIG5leHRJZCA9IDE7IC8vIGZvciB1bmlxdWUgZmllbGQgbmFtZXNcclxuXHJcbiAgICAgICAgLy8gU29ydCBpbiBuYXR1cmFsIFN0cmluZyBvcmRlci4gSXQncyBub3QgaW4gdGhlIHNwZWMsIGFuZCB5b3UgZG9uJ3QgbmVlZCBpdCAod2UgaGF2ZSBtYXBwaW5ncyksXHJcbiAgICAgICAgLy8gYnV0IGl0IG1ha2VzIGJlaGF2aW91ciBjb25zaXN0ZW50LlxyXG4gICAgICAgIE9iamVjdC5rZXlzKGNvbnRleHQub3B0aW9ucy5pdGVtcykuc29ydCgpLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmluY2x1ZGVPcHRpb25JbkF1dG9RdWVyeShjb250ZXh0LCBrZXkpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB2YXIgdmFsID0gY29udGV4dC5vcHRpb25zLml0ZW1zW2tleV07IC8vIGVpdGhlciBhIE1lYXN1cmUgb3IgR3JvdXBpbmcsIG9yIGFycmF5IHRoZXJlb2YgKGRlcGVuZGluZyBvbiBkZWYubGlzdClcclxuICAgICAgICAgICAgaWYgKCF2YWwpIHJldHVybjsgLy8gT3B0aW9uYWwgb3B0aW9uLCB3aXRoIGV4cGxpY2l0IG51bGwuIE5vdCBzdXJlIGlmIHRoaXMgYXJpc2VzLCBidXQgc2tpcC5cclxuXHJcbiAgICAgICAgICAgIHZhciBkZWYgPSBjb250ZXh0Lm1hbmlmZXN0Lm9wdGlvbnMuaXRlbXNba2V5XTsgLy8gT3B0aW9uRGVmaW5pdGlvblxyXG5cclxuICAgICAgICAgICAgdmFyIHF1ZXJ5RGVzdGluYXRpb25BcnJheSA9IGRlZi50eXBlPT09XCJHUk9VUElOR1wiID8gcXVlcnkuZ3JvdXBpbmdzICA6IHF1ZXJ5Lm1lYXN1cmVzO1xyXG4gICAgICAgICAgICB2YXIgdGVtcE1hcHBpbmdzICAgICAgICAgID0gZGVmLnR5cGU9PT1cIkdST1VQSU5HXCIgPyBncm91cGluZ01hcHBpbmdzIDogbWVhc3VyZU1hcHBpbmdzO1xyXG5cclxuICAgICAgICAgICAgLyoqXHJcbiAgICAgICAgICAgICAqIENsb25lcyBhbmQgbXV0YXRlcyB0aGUgR3JvdXBpbmcgb3IgTWVhc3VyZSB0byBoYXZlIGEgdW5pcXVlIG5hbWUgaW4gdGhpcyBxdWVyeVxyXG4gICAgICAgICAgICAgKiBAcGFyYW0gb3B0XHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB2YXIgZ2l2ZU5hbWUgPSBvcHQgPT4ge1xyXG4gICAgICAgICAgICAgICAgb3B0ID0gY2xvbmUob3B0KTtcclxuICAgICAgICAgICAgICAgIGlmIChkZWYudHlwZT09PVwiTUVBU1VSRVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gT3B0aW9ucyBoYXMgcGxhaW4gTWVhc3VyZSwgcXVlcnkgQVBJIHJlcXVpcmVzIFRhYmxlTWVhc3VyZSAod2l0aCBuYW1lIHByb3BlcnR5IGFkZGVkKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNvIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSB0eXBlIGJlZm9yZSBhZGRpbmcgbmFtZTpcclxuICAgICAgICAgICAgICAgICAgICBvcHRbXCJAdmlzb2tpb3R5cGVcIl0gPSBcIlF1ZXJ5QXBpLlRhYmxlTWVhc3VyZVwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgb3B0Lm5hbWUgPSBcIl9cIisobmV4dElkKyspKyAvLyB1bmlxdWUgbmFtZSwgYW5kIGFsc28gYWRkIHRoZSBmb2xsb3dpbmcgZm9yIGRlYnVnOlxyXG4gICAgICAgICAgICAgICAgICAgIFwiX1wiK2tleSsob3B0Lm5hbWUgPyBcIl9cIitvcHQubmFtZSA6IFwiXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG9wdDtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkZWYubGlzdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbC5sZW5ndGg9PT0wKSByZXR1cm47IC8vIERvbid0IGNyZWF0ZSBtZWFuaW5nbGVzcyBrZXlzXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gdmFsIGlzIGFuIGFycmF5IG9mIGdyb3VwaW5ncyBvciBtZWFzdXJlcy5cclxuICAgICAgICAgICAgICAgIHRlbXBNYXBwaW5nc1trZXldID0gW107XHJcbiAgICAgICAgICAgICAgICB2YWwuZm9yRWFjaChvbmVWYWwgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHF1ZXJ5RGVzdGluYXRpb25BcnJheS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgdGVtcE1hcHBpbmdzW2tleV0ucHVzaChpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcXVlcnlEZXN0aW5hdGlvbkFycmF5LnB1c2goZ2l2ZU5hbWUob25lVmFsKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBzaW5nbGUgZ3JvdXBpbmcgb3IgbWVhc3VyZSwgbW9kZWxsZWQgd2l0aG91dCBhbiBlbmNsb3NpbmcgYXJyYXlcclxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHF1ZXJ5RGVzdGluYXRpb25BcnJheS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICB0ZW1wTWFwcGluZ3Nba2V5XSA9IGluZGV4O1xyXG4gICAgICAgICAgICAgICAgcXVlcnlEZXN0aW5hdGlvbkFycmF5LnB1c2goZ2l2ZU5hbWUodmFsKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gVE9ETzogc29ydCBieSBzb21lIGRlZmF1bHQgb3JkZXIsIHBlcmhhcHMgY29uZmlndXJhYmxlIGluIG1hbmlmZXN0LCBhbmQvb3IgdXNlciBzb3J0c1xyXG5cclxuICAgICAgICAvLyBNYWtlIGluZGV4IG1hcHBpbmdzIGFic29sdXRlLCBhbmQgY29tYmluZS4gR3JvdXBpbmcgY29sdW1ucyBhbHdheXMgY29tZSBiZWZvcmUgTWVhc3VyZSBjb2x1bW5zLlxyXG4gICAgICAgIC8vIFNvIEdyb3VwaW5nIG1hcHBpbmdzIGFyZSBhbHJlYWR5IHZhbGlkOlxyXG4gICAgICAgIE9iamVjdC5rZXlzKGdyb3VwaW5nTWFwcGluZ3MpLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgdmFyIGluZGV4T3JJbmRleGVzID0gZ3JvdXBpbmdNYXBwaW5nc1trZXldO1xyXG4gICAgICAgICAgICBtYXBwaW5nc1trZXldID0gaW5kZXhPckluZGV4ZXM7IC8vIHdoZXRoZXIgYXJyYXkgb3Igc2luZ2xlIGluZGV4LCBqdXN0IGNvcHkgKGFscmVhZHkgYWJzb2x1dGUpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IHF1ZXJ5Lmdyb3VwaW5ncy5sZW5ndGg7XHJcbiAgICAgICAgT2JqZWN0LmtleXMobWVhc3VyZU1hcHBpbmdzKS5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgICAgIHZhciBpbmRleE9ySW5kZXhlcyA9IG1lYXN1cmVNYXBwaW5nc1trZXldO1xyXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShpbmRleE9ySW5kZXhlcykpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4T3JJbmRleGVzLmZvckVhY2goKHZhbCwgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4T3JJbmRleGVzW2ldICs9IG9mZnNldDtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW5kZXhPckluZGV4ZXMgKz0gb2Zmc2V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1hcHBpbmdzW2tleV0gPSBpbmRleE9ySW5kZXhlcztcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn07XHJcbiIsIlxudmFyIGZpbHRlcnMgPSByZXF1aXJlKFwiLi9maWx0ZXJzXCIpO1xuXG4vKipcbiAqIERlZmF1bHQgdmFsdWUgaWYgVmlld0FwaU1hbmlmZXN0LmRhdGFMaW1pdCBpcyB1bmRlZmluZWQuIE51bWJlciBvZiByb3dzIHRvIGxpbWl0IHF1ZXJ5IHRvLlxuICogSWYgaXQgdGFrZXMgZWZmZWN0IGEgd2F0ZXJtYXJrIGlzIHNob3duLlxuICogU2hvdWxkIG1hdGNoIGJlYW4gZGVmYXVsdC5cbiAqL1xuY29uc3QgREVGQVVMVF9EQVRBX0xJTUlUID0gMTAwMDA7XG5cbi8qKlxuICogQ2hlY2sgaWYgdHdvIG9iamVjdCBjaGFuZ2UsIGN1cnJlbnRseSBqdXN0IGEgSlNPTi5zdHJpbmdpZnkgY2hlY2sgYmV0d2VlbiB0aGVtXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtICB7T2JqZWN0fSBhXG4gKiBAcGFyYW0gIHtPYmplY3R9IGJcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGNoYW5nZWQoYSwgYikge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhKSAhPT0gSlNPTi5zdHJpbmdpZnkoYik7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICAvKipcbiAgICAgKiBUcnVuY2F0ZSBhIHJlY29yZHMgYXJyYXkgaWYgbmVlZGVkLCBpdCB3aWxsIHJldHVybiB0cnVlIGZvciB0cnVuY2F0ZWQgZGF0YSBhbmQgZmFsc2UgaWYgaXQgaXMgbm90LlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gcmVjb3JkcyBBcnJheSBvZiByZWNvcmRzIChyb3dzKVxuICAgICAqIEBwYXJhbSAge251bWJlcn0gbGltaXQgICAgTnVtYmVyIG9mIG1heCByb3dzXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0cnVuY2F0ZVJlY29yZHMoe3JlY29yZHMsIGxpbWl0fSkge1xuICAgICAgICBpZiAoIXJlY29yZHMpIHtcbiAgICAgICAgICAgIC8vIE5vIGRhdGEgdG8gdHJ1bmNhdGVcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGltaXQgJiYgcmVjb3Jkcy5sZW5ndGggPiBsaW1pdCkge1xuICAgICAgICAgICAgcmVjb3JkcyA9IHJlY29yZHMuc2xpY2UoMCwgbGltaXQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBnZXREYXRhKGNvbnRleHQpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQucmVzdWx0LmRhdGE7XG4gICAgfSxcblxuICAgIGdldFNoYWRvd0RhdGEoY29udGV4dCkge1xuICAgICAgICByZXR1cm4gY29udGV4dC5yZXN1bHQuc2hhZG93RGF0YTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRoZSB0aGUgY29udGV4dCBpbnN0YW5jZSB3aXRoIHRoZSBzY2hlbWFcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSByZXNwb25zZVxuICAgICAqL1xuICAgIHNldFNjaGVtYTogZnVuY3Rpb24oe2NvbnRleHQsIHNjaGVtYX0pIHtcblxuICAgICAgICAvLyBUcmFuc2Zvcm0gdGhlIGFwaSByZXNwb25zZTpcbiAgICAgICAgLy8gICAgICBbe2ZpZWxkOiBcInN0cmluZ1wiLCB0eXBlOiBcInN0cmluZ1wifV1cbiAgICAgICAgLy8gaW50byA6XG4gICAgICAgIC8vICAgICAge1wiZmllbGRcIjogeyBmaWVsZDogXCJzdGlybmdcIiwgdHlwZTogXCJzdHJpbmdcIiB9fVxuICAgICAgICAvL1xuICAgICAgICAvLyBGb3IgZWFzaWVyIHVzZVxuICAgICAgICB2YXIgcmVzdWx0ID0gc2NoZW1hLnJlZHVjZSgocmVzdWx0LCBpdGVtKSA9PiB7XG4gICAgICAgICAgICByZXN1bHRbaXRlbS5uYW1lXSA9IGl0ZW07XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LCB7fSk7XG5cbiAgICAgICAgY29udGV4dC5yZXN1bHQuc2NoZW1hID0gcmVzdWx0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYmV0d2VlbiB0aGUgcHJldmlvdXMgYW5kIHRoZSBjdXJyZW50IGNvbnRleHQgc29tZXRoaW5nIGNoYW5nZSB0aGF0IGFmZmVjdHMgdGhlIHF1ZXJ5IGFwaSxcbiAgICAgKiBwcm9iYWxieSByZXN1bHRpbmcgb24gYSBuZXcgcXVlcnkgIGJlaXVuZyBleGVjdXRlZFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBwcmV2aW91c1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjdXJyZW50XG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICAgcXVlcnlQYXJhbXNPckJydXNoaW5nQ2hhbmdlOiBmdW5jdGlvbihwcmV2aW91cywgY3VycmVudCkge1xuXG4gICAgICAgIHJldHVybiAoY2hhbmdlZChmaWx0ZXJzLmdldEZpbHRlcihwcmV2aW91cyksIGZpbHRlcnMuZ2V0RmlsdGVyKGN1cnJlbnQpKSB8fFxuICAgICAgICAgICAgY2hhbmdlZChwcmV2aW91cy5vcHRpb25zLCBjdXJyZW50Lm9wdGlvbnMpIHx8XG4gICAgICAgICAgICBjaGFuZ2VkKGZpbHRlcnMuZ2V0U2hhZG93RmlsdGVyKHByZXZpb3VzKSwgZmlsdGVycy5nZXRTaGFkb3dGaWx0ZXIoY3VycmVudCkpKTtcbiAgICB9LFxuXG4gICAgZ2V0TGltaXQoY29udGV4dCkge1xuXG4gICAgICAgIHZhciBkYXRhTGltaXQgPSBjb250ZXh0Lm1hbmlmZXN0LmRhdGFMaW1pdCxcbiAgICAgICAgICAgIGxpbWl0ID0gREVGQVVMVF9EQVRBX0xJTUlUO1xuXG4gICAgICAgIGlmIChkYXRhTGltaXQgPT09IG51bGwpIGxpbWl0ID0gMDtcblxuICAgICAgICBpZiAoZGF0YUxpbWl0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGxpbWl0ID0gZGF0YUxpbWl0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpbWl0O1xuXG4gICAgfVxufTtcbiIsIlxudmFyIGNsb25lID0gcmVxdWlyZShcImNsb25lXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIGdldEZpbHRlcihjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiBjb250ZXh0LmRhdGFDb25maWcuZmlsdGVyID8gY2xvbmUoY29udGV4dC5kYXRhQ29uZmlnLmZpbHRlcikgOiBudWxsO1xuICAgIH0sXG5cbiAgICBnZXRTaGFkb3dGaWx0ZXIoY29udGV4dCkge1xuICAgICAgICByZXR1cm4gY29udGV4dC5kYXRhQ29uZmlnLnNoYWRvd0ZpbHRlciA/IGNsb25lKGNvbnRleHQuZGF0YUNvbmZpZy5zaGFkb3dGaWx0ZXIpIDogbnVsbDtcbiAgICB9XG5cbn07XG4iLCJcbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgZmlsdGVyczogcmVxdWlyZShcIi4vZmlsdGVyc1wiKSxcbiAgICBkYXRhOiByZXF1aXJlKFwiLi9kYXRhXCIpLFxuICAgIHF1ZXJpZXM6IHJlcXVpcmUoXCIuL3F1ZXJpZXNcIiksXG4gICAgTWFwcGluZ3NIZWxwZXI6IHJlcXVpcmUoXCIuL01hcHBpbmdzSGVscGVyXCIpLFxuICAgIGF1dG9RdWVyeUJ1aWxkaW5nOiByZXF1aXJlKFwiLi9hdXRvUXVlcnlCdWlsZGluZ1wiKSxcblxuICAgIGhhc1NoYWRvdyhjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuZmlsdGVycy5nZXRTaGFkb3dGaWx0ZXIoY29udGV4dCk7XG4gICAgfVxufTtcbiIsIlxyXG4vKipcclxuICogSGVscGVyIGZvciByZWdpc3RlcmluZyB0aGUgd2luZG93Lm9uZXJyb3IgaGFuZGxlciBmb3IgYm90aCBJRlJBTUUgcGFuZSBjZWxscyBmb3Igbm9uLW5hdGl2ZSB2aWV3cywgYW5kIHRoZVxyXG4gKiBlbWJlZGRlZCBicm93c2VyIGZvciBzd2luZyBqeGJyb3dzZXIgZW1iZWRkZWQgdmlldyBjb250YWluZXIuXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oe21lc3NhZ2U6IHN0cmluZywgaW50ZXJuYWw6ICp9KX0gaGFuZGxlciBBIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdoZW4gYW4gZXJyb3Igb2NjdXJzLlxyXG4gICAgICogVGhlIHNpbmdsZSBhcmd1bWVudCBpcyBhbiBvYmplY3Qge21lc3NhZ2UsIGludGVybmFsfSBhcyBwZXIgQ29udGFpbmVyIEFQSSBlcnJvciBvYmplY3Qgc3BlYy5cclxuICAgICAqL1xyXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKGhhbmRsZXIpIHtcclxuXHJcbiAgICAgICAgLy8gTkIuIHVzaW5nIGFkZEV2ZW50TGlzdGVuZXIgcmVzdWx0cyBpbiBhbiBldmVudCB0aGF0IGlzbid0IGFzIHdlbGwgZGVmaW5lZCBhcyB1c2luZyBvbmVycm9yLlxyXG4gICAgICAgIHdpbmRvdy5vbmVycm9yID0gKGVycm9yTWVzc2FnZSwgdXJsLCBsaW5lTnVtYmVyLCBjb2xOdW1iZXIsIGVycikgPT4ge1xyXG5cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhbiBlcnJvciBvYmplY3QgYXMgc3BlY2lmaWVkIGJ5IHRoZSBDb250YWluZXIgQVBJLlxyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyAgeyBtZXNzYWdlLCBpbnRlcm5hbH0gIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHR3byBhcmd1bWVudHMgdG8gb21uaXNjb3BlLnZpZXcuZXJyb3IoKSxcclxuICAgICAgICAgICAgICAgIC8vIGFuZCBiZWNvbWVzIGV2ZW50LmRhdGEgd2hlbiBlbWl0dGVkIGJ5IGNvbnRhaW5lciwgb3IgaXMgdGhlIHBheWxvYWQgd2hlbiBzZW50IHZpYSBjb21ldGQuXHJcbiAgICAgICAgICAgICAgICB2YXIgcGF5bG9hZCA9IHtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJvck1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJuYWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JNZXNzYWdlLCB1cmwsIGxpbmVOdW1iZXIsIGNvbE51bWJlciAvLyByZWd1bGFyIGFyZ3VtZW50c1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYSBicm93c2VyIHRoYXQgZ2l2ZXMgdXMgYW4gRXJyb3Igb2JqZWN0IGhlcmVcclxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgYWxsIHBvc3NpYmxlIHZlbmRvciBwcm9wcyBhcyBleHRyYSBwcm9wczpcclxuICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLmludGVybmFsLmVyciA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVOYW1lOiBlcnIuZmlsZU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVOdW1iZXI6IGVyci5saW5lTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2x1bW5OdW1iZXI6IGVyci5jb2x1bW5OdW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGVyci5uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBudW1iZXI6IGVyci5udW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2tcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaGFuZGxlcihwYXlsb2FkKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoY3JhenkpIHtcclxuICAgICAgICAgICAgICAgIC8vIERvbid0IGxldCBlcnJvcnMgd2l0aCBlcnJvciBoYW5kbGVyIGNhdXNlIGZ1cnRoZXIgcHJvYmxlbXMhXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yIHdpdGggZXJyb3IgaGFuZGxlcjpcIik7IC8vIG5iLiBjb25zb2xlLmxvZyhtdWx0aXBsZSxhcmd1bWVudHMpIGRvZXNuJ3Qgd29yayBpbiBqeGJyb3dzZXJcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNyYXp5KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gYW5kIGFsbG93IGJyb3dzZXIgdG8gaGFuZGxlIG9yaWdpbmFsIGVycm9yIGFsc28gKGRvbid0IHJldHVybiB0cnVlKVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn07IiwiXG52YXIgYXV0b1F1ZXJ5QnVpbGRpbmcgPSByZXF1aXJlKFwiLi9hdXRvUXVlcnlCdWlsZGluZ1wiKTtcblxuLyoqXG4gKiBXcmFwIGEgdmFsdWUgaW4gYW4gYXJyYXkgaWYgaXMgbm90IG9uZSBhbHJlYWR5LiBJZiBpdHMgbm90IGFuIGFycmF5IGl0IHdpbGwgcmV0dXJuIGFuIGVtcHR5IG9uZVxuICogQHBhcmFtICB7Kn0gdmFsdWVcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5mdW5jdGlvbiB3cmFwKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIFtdO1xuICAgIHJldHVybiB2YWx1ZS5jb25zdHJ1Y3RvciAhPT0gQXJyYXkgPyBbdmFsdWVdIDogdmFsdWU7XG59XG5cblxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgLyoqXG4gICAgICogQnVpbGRzIHRoZSBTaW1wbGVRdWVyeSBuZWVkZWQgZm9yIGF1dG8tcXVlcnkuXG4gICAgICogVGFrZXMgYWxsIGdyb3VwaW5ncyBhbmQgbWVhc3VyZXMgZnJvbSB0aGUgb3B0aW9ucyBpbiB0aGUgY29udGV4dC5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGNvbnRleHQgYSBWaWV3QXBpQ29udGV4dFxuICAgICAqIEBwYXJhbSAge09iamVjdD19IGZpbHRlciBhIEZpbHRlcjsgaWYgbm90IHN1cHBsaWVkIHRoZSB2aWV3J3MgY3VycmVudCBmaWx0ZXJzIGFyZSB1c2VkLlxuICAgICAqIEByZXR1cm4ge09iamVjdH0gYSBTaW1wbGVRdWVyeVxuICAgICAqL1xuICAgIHRhYmxlKGNvbnRleHQsIGZpbHRlcikge1xuXG4gICAgICAgIHZhciBkYXRhQ29uZmlnID0gY29udGV4dC5kYXRhQ29uZmlnO1xuXG4gICAgICAgIGZpbHRlciA9IGZpbHRlciB8fCBkYXRhQ29uZmlnLmZpbHRlcjtcblxuICAgICAgICB2YXIgcXVlcnkgPSB7XG4gICAgICAgICAgICBmaWx0ZXI6IGZpbHRlciB8fCBudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgYXV0b1F1ZXJ5QnVpbGRpbmcuYnVpbGRBdXRvUXVlcnkoY29udGV4dCwgcXVlcnksIG51bGwpOyAvLyBkb24ndCBjYXJlIGFib3V0IG1hcHBpbmdzXG5cbiAgICAgICAgcmV0dXJuIHF1ZXJ5O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBCdWlsZHMgdGhlIG1hcHBpbmdzIGNvcnJlc3BvbmRpbmcgdG8gI3RhYmxlKCkuXG4gICAgICogVGhpcyBtYXBzIHRoZSBvcHRpb24ga2V5IG5hbWUgdG8gdGhlIGluZGV4IG9yIGFycmF5IG9mIGluZGV4ZXMgcmVwcmVzZW50aW5nIHRoZSBjb2x1bW4ocykgaW4gdGhlIHF1ZXJ5IHJlc3VsdC5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGNvbnRleHQgYSBWaWV3QXBpQ29udGV4dFxuICAgICAqIEByZXR1cm4ge09iamVjdH0gYSBtYXAgb2Yga2V5IHRvIG51bWJlciBvciBhcnJheSBvZiBudW1iZXJzLlxuICAgICAqL1xuICAgIHRhYmxlTWFwcGluZ3MoY29udGV4dCkge1xuICAgICAgICB2YXIgbWFwcGluZ3MgPSB7fTtcbiAgICAgICAgYXV0b1F1ZXJ5QnVpbGRpbmcuYnVpbGRBdXRvUXVlcnkoY29udGV4dCwgbnVsbCwgbWFwcGluZ3MpOyAvLyBkb24ndCBjYXJlIGFib3V0IHF1ZXJ5XG4gICAgICAgIHJldHVybiBtYXBwaW5ncztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQnVpbGRzIHRoZSBHcmlkUXVlcnlJbnB1dCBuZWVkZWQgZm9yIGF1dG8tcGFuaW5nIGFuZCBvcHRpb25hbGx5IGF1dG8tcXVlcnkgKGFzIGNlbGwgcXVlcmllcykuXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBjb250ZXh0IGEgVmlld0FwaUNvbnRleHRcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSBhdXRvUXVlcnkgVHJ1ZSB0byBwb3B1bGF0ZSB0aGUgY2VsbCBxdWVyaWVzIHdpdGggdGhlIFNpbXBsZVF1ZXJ5KHMpIG5lZWRlZCBmb3IgYXV0b3F1ZXJ5XG4gICAgICogQHJldHVybiB7T2JqZWN0fSBhIEdyaWRRdWVyeUlucHV0XG4gICAgICovXG4gICAgZ3JpZDogZnVuY3Rpb24oY29udGV4dCwgYXV0b1F1ZXJ5KSB7XG5cbiAgICAgICAgdmFyIHJlc3VsdCxcbiAgICAgICAgICAgIGRhdGFDb25maWcgPSBjb250ZXh0LmRhdGFDb25maWcsXG4gICAgICAgICAgICBvcHRpb25zID0gY29udGV4dC5vcHRpb25zLFxuICAgICAgICAgICAgaXRlbXMsXG4gICAgICAgICAgICBwYW5lRmlsdGVyLFxuICAgICAgICAgICAgYXhlcyA9IFtdO1xuXG4gICAgICAgIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5pdGVtcykgdGhyb3cgbmV3IEVycm9yKFwiTm8gb3B0aW9ucyBkZWZpbmVkIGZvciB0aGUgdmlld1wiKTtcblxuICAgICAgICBpdGVtcyA9IG9wdGlvbnMuaXRlbXM7XG5cbiAgICAgICAgYXhlcy5wdXNoKHtncm91cGluZ3M6IGl0ZW1zLnBhbmVZID8gd3JhcChpdGVtcy5wYW5lWSkgOiBbXX0pO1xuICAgICAgICBheGVzLnB1c2goe2dyb3VwaW5nczogaXRlbXMucGFuZVggPyB3cmFwKGl0ZW1zLnBhbmVYKSA6IFtdfSk7XG5cbiAgICAgICAgcGFuZUZpbHRlciA9IGRhdGFDb25maWcuc2hhZG93RmlsdGVyIHx8IGRhdGFDb25maWcuZmlsdGVyO1xuXG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIGlucHV0OiAocGFuZUZpbHRlciA/IHtmaWx0ZXI6IHBhbmVGaWx0ZXJ9IDogbnVsbCksXG4gICAgICAgICAgICBheGVzOiBheGVzLFxuICAgICAgICAgICAgY2VsbFF1ZXJpZXM6IHt9XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGF1dG9RdWVyeSkge1xuXG4gICAgICAgICAgICByZXN1bHQuY2VsbFF1ZXJpZXMucXVlcnkgPSB0aGlzLnRhYmxlKGNvbnRleHQsIGRhdGFDb25maWcuZmlsdGVyKTtcbiAgICAgICAgICAgIGlmIChkYXRhQ29uZmlnLnNoYWRvd0ZpbHRlcikge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5jZWxsUXVlcmllcy5zaGFkb3dRdWVyeSA9IHRoaXMudGFibGUoY29udGV4dCwgZGF0YUNvbmZpZy5zaGFkb3dGaWx0ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuIiwidmFyIEV2ZW50RW1pdHRlcjIgPSByZXF1aXJlKFwiZXZlbnRlbWl0dGVyMlwiKS5FdmVudEVtaXR0ZXIyO1xuXG5jbGFzcyBFdmVudEVtaXR0ZXIge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyMih7XG4gICAgICAgICAgICB3aWxkY2FyZHM6IHRydWUsXG4gICAgICAgICAgICBkZWxpbWl0ZXI6IFwiLlwiLFxuICAgICAgICAgICAgbWF4TGlzdGVuZXJzOiAxMFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBOb3RlOiBzb21lIG9mIHRoZXNlIG1ldGhvZHMgbXVzdCBub3QgY2hhbmdlIHNpbmNlIHRoZXkgYXJlIHBhcnQgb2YgdGhlIHB1YmxpYyBBUEkgYW5kXG4gICAgLy8gZXhwb3NlZCB2aWEgc3ViY2xhc3MgQXBpLmpzIChzZWVuIGFzIG9tbmlzY29wZS52aWV3KSBhbmQgZG9jdW1lbnRlZCBpbiAvVmlld3MvZG9jcy9hcGkvanMvdmlldy5qc1xuXG4gICAgLy8gRE9DVU1FTlRFRCBJTiAvVmlld3MvZG9jcy9hcGkvanMvdmlldy5qc1xuICAgIG9uKHR5cGVzLCBsaXN0ZW5lcikge1xuICAgICAgICAodHlwZXMuY29uc3RydWN0b3IgPT09IEFycmF5ID8gdHlwZXMgOiBbdHlwZXNdKS5mb3JFYWNoKHR5cGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5vbih0eXBlLCBsaXN0ZW5lcik7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyBET0NVTUVOVEVEIElOIC9WaWV3cy9kb2NzL2FwaS9qcy92aWV3LmpzXG4gICAgb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgICB0aGlzLl9lbWl0dGVyLm9uY2UodHlwZSwgbGlzdGVuZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhbnkobGlzdGVuZXIpIHtcbiAgICAgICAgdGhpcy5fZW1pdHRlci5vbkFueShsaXN0ZW5lcik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8vIERPQ1VNRU5URUQgSU4gL1ZpZXdzL2RvY3MvYXBpL2pzL3ZpZXcuanNcbiAgICBvZmYodHlwZXMsIGxpc3RlbmVyKSB7XG4gICAgICAgICh0eXBlcy5jb25zdHJ1Y3RvciA9PT0gQXJyYXkgPyB0eXBlcyA6IFt0eXBlc10pLmZvckVhY2goXG4gICAgICAgICAgICB0eXBlID0+IHRoaXMuX2VtaXR0ZXIub2ZmKHR5cGUsIGxpc3RlbmVyKVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZWRpc3BhdGNoKHR5cGVzLCB0YXJnZXQpIHtcbiAgICAgICAgKHR5cGVzLmNvbnN0cnVjdG9yID09PSBBcnJheSA/IHR5cGVzIDogW3R5cGVzXSkuZm9yRWFjaChcbiAgICAgICAgICAgIHR5cGUgPT4gdGhpcy5vbih0eXBlLCAoZXZlbnQpID0+IHRhcmdldC5lbWl0KGV2ZW50LnR5cGUsIGV2ZW50LmRhdGEpKVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBub25lKGxpc3RlbmVyKSB7XG4gICAgICAgIHRoaXMuX2VtaXR0ZXIub2ZmQW55KGxpc3RlbmVyKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgbWF4TGlzdGVuZXJzKG51bWJlcikge1xuICAgICAgICB0aGlzLl9lbWl0dGVyLm1heExpc3RlbmVycyhudW1iZXIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5fZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBlbWl0KHR5cGUsIGRhdGEpIHtcbiAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KHR5cGUsIGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KHR5cGUsIHt0eXBlOiB0eXBlLCB0YXJnZXQ6IHRoaXMsIGRhdGE6IGRhdGF9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuIiwiXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjbG9uZVwiKTtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICBnZXRTdHlsZTogZnVuY3Rpb24oZWxlbWVudCwgcHJvcCkge1xuXG4gICAgICAgIHZhciByZXN1bHQgPSBcIlwiO1xuXG4gICAgICAgIGlmIChlbGVtZW50LmN1cnJlbnRTdHlsZSkge1xuICAgICAgICAgICAgcmVzdWx0ID0gZWxlbWVudC5jdXJyZW50U3R5bGVbcHJvcF07XG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93LmdldENvbXB1dGVkU3R5bGUpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWxlbWVudCxudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKHByb3ApO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHZhbHVlTGlzdCA9IHJlc3VsdC5zcGxpdChcIiBcIikubWFwKHZhbHVlID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5pbmRleE9mKFwicHhcIikgPyArdmFsdWUucmVwbGFjZShcInB4XCIsIFwiXCIpIDogdmFsdWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB2YWx1ZUxpc3QubGVuZ3RoIDw9IDEgPyB2YWx1ZUxpc3RbMF0gOiB2YWx1ZUxpc3Q7XG4gICAgfSxcblxuICAgIGdldFBhZGRpbmc6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcblxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgdGhpcy5nZXRTdHlsZShlbGVtZW50LCBcInBhZGRpbmctdG9wXCIpLFxuICAgICAgICAgICAgdGhpcy5nZXRTdHlsZShlbGVtZW50LCBcInBhZGRpbmctcmlnaHRcIiksXG4gICAgICAgICAgICB0aGlzLmdldFN0eWxlKGVsZW1lbnQsIFwicGFkZGluZy1ib3R0b21cIiksXG4gICAgICAgICAgICB0aGlzLmdldFN0eWxlKGVsZW1lbnQsIFwicGFkZGluZy1sZWZ0XCIpXG4gICAgICAgIF07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbmRlciB0aGUgZ2l2ZW4gc3RyaW5nIGFzIGh0bWwgYW5iZCByZXR1cm4gaXQgYXMgYW4gYXJyYXkgaWYgdGhlIHRlbXBsYXRlIHByb2R1Y2VzXG4gICAgICogYSBsaXN0IG9mIGVsZW1lbnQgb3IgYXMgYSBzaW5nbGUgb25lIGlzIHRoZSB0ZW1wbGF0ZSBoYXMgb25lIHJvb3QgZWxlbWVudFxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gdGVtcGxhdGVcbiAgICAgKiBAcmV0dXJuIHtIVE1MRWxlbWVudH1cbiAgICAgKi9cbiAgICByZW5kZXI6IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG5cbiAgICAgICAgdmFyIGR1bW15ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZHVtbXkuaW5uZXJIVE1MID0gdGVtcGxhdGU7XG5cbiAgICAgICAgcmV0dXJuIGR1bW15LmNoaWxkcmVuLmxlbmd0aCA+IDEgPyBkdW1teS5jaGlsZHJlbiA6IGR1bW15LmNoaWxkcmVuWzBdO1xuICAgIH1cbn07XG4iLCJcbi8qKlxuICogTm9ybWFsaXplIHRoZSBnaXZlbiB3aGVlbCBldmVudCBzbyBhbGwgdGhlIHdlIGdvdCB0aGUgc2FtZSBvYmplY3Qgbm8gbWF0dGVyIHdoYXQgYnJvd3NlciB3ZSB1c2VcbiAqIFRPRE86IFJlcGxhY2UgZW1wdHkgb2JqZWN0IHdpdGggY3VzdG9tIG9yIG1vdXNlIGV2ZW50IGFuZCByZW1vdmUgSUUgPCA5IGNoZWNrcyBzaW5jZSB3ZSBkb250IHN1cHBvcnQgdGhlbVxuICogKG1ha2Ugc3VyZSBpdCBkb2Vuc3QgYWN0dWFsbHkgaGFuZGxlIG90aGVyIGJyb3dzZXJzKVxuICogQHBhcmFtICB7TW91c2VFdmVudH0gZXZlbnRcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplKGV2ZW50KSB7XG5cbiAgICB2YXIgZGVsdGFYID0gXCJkZWx0YVhcIiBpbiBldmVudCA/IGV2ZW50LmRlbHRhWCA6XG4gICAgICAgIC8vIEZhbGxiYWNrIHRvIGB3aGVlbERlbHRhWGAgZm9yIFdlYmtpdCBhbmQgbm9ybWFsaXplIChyaWdodCBpcyBwb3NpdGl2ZSkuXG4gICAgICAgIFwid2hlZWxEZWx0YVhcIiBpbiBldmVudCA/IC1ldmVudC53aGVlbERlbHRhWCA6IDA7XG5cbiAgICB2YXIgZGVsdGFZID1cbiAgICAgICAgXCJkZWx0YVlcIiBpbiBldmVudCA/IGV2ZW50LmRlbHRhWSA6XG4gICAgICAgICAgICAvLyBGYWxsYmFjayB0byBgd2hlZWxEZWx0YVlgIGZvciBXZWJraXQgYW5kIG5vcm1hbGl6ZSAoZG93biBpcyBwb3NpdGl2ZSkuXG4gICAgICAgICAgICBcIndoZWVsRGVsdGFZXCIgaW4gZXZlbnQgPyAtZXZlbnQud2hlZWxEZWx0YVkgOlxuICAgICAgICAgICAgICAgIC8vIEZhbGxiYWNrIHRvIGB3aGVlbERlbHRhYCBmb3IgSUU8OSBhbmQgbm9ybWFsaXplIChkb3duIGlzIHBvc2l0aXZlKS5cbiAgICAgICAgICAgICAgICBcIndoZWVsRGVsdGFcIiBpbiBldmVudCA/IC1ldmVudC53aGVlbERlbHRhIDogMDtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHRhcmdldDogZXZlbnQudGFyZ2V0LFxuICAgICAgICBjdXJyZW50VGFyZ2V0OiBldmVudC5jdXJyZW50VGFyZ2V0LFxuICAgICAgICBvcmlnaW5hbEV2ZW50OiBldmVudCxcbiAgICAgICAgZGVsdGFYOiBkZWx0YVgsXG4gICAgICAgIGRlbHRhWTogZGVsdGFZLFxuICAgICAgICBkZWx0YVo6IG51bGwsXG4gICAgICAgIHByZXZlbnREZWZhdWx0OiBldmVudC5wcmV2ZW50RGVmYXVsdCxcbiAgICAgICAgc3RvcFByb3BhZ2F0aW9uOiBldmVudC5zdG9wUHJvcGFnYXRpb25cbiAgICB9O1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSB3aGVlbCBpbiBhIGNyb3h4YnJvd3NlciB3YXlcbiAgICAgKiBAcGFyYW0ge0VMZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gICAgICogQHBhcmFtIHtib29sZWFufSBjYXB0dXJlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICAgKi9cbiAgICBhZGRXaGVlbExpc3RlbmVyOiBmdW5jdGlvbihlbGVtZW50LCBoYW5kbGVyLCBjYXB0dXJlLCBjb250ZXh0KSB7XG5cbiAgICAgICAgdmFyIHR5cGUgPSAoXCJvbndoZWVsXCIgaW4gZG9jdW1lbnQpID8gXCJ3aGVlbFwiIDogXCJtb3VzZXdoZWVsXCI7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBldmVudCA9PiBoYW5kbGVyLmNhbGwoY29udGV4dCB8fCB0aGlzLCBub3JtYWxpemUoZXZlbnQpKSwgY2FwdHVyZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhbGwgdGhlIG1vdXNlIHdoZWVsIGxpc3RlbmVycyBmb3JtIHRoZSBnaXZlbiBlbGVtZW50XG4gICAgICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKi9cbiAgICByZW1vdmVXaGVlbExpc3RlbmVyczogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50Lm9ud2hlZWwgPSBudWxsO1xuICAgICAgICBlbGVtZW50Lm9ubW91c2V3aGVlbCA9IG51bGw7XG4gICAgfVxufTtcbiIsIlxuXG4vKipcbiAqIEJhc2ljIGxvZ2dlciBjbGFzcyB0aGF0IHdpbGwgbG9nIG1lc3NhZ2VzIGluIHRlaCBjb25zb2xlIGlmIGl0cyBlbmFibGVkLCBpZiBub3QgaXQgd2lsbCBkbyBub3RoaW5nLiBVc2VkXG4gKiBmb3IgZGVidWdnaW5nIHB1cnBvdXNlcyBpbiBzb21lIHByb2plY3RzIGxpa2UgdGhhIGNvbW11bmljYXRvbiBhbmQgdGhlIHBhbmluZ1xuICovXG5jbGFzcyBMb2dnZXIge1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtICB7c2F0cmluZ30gbmFtZSBOYW1lIG9mIHRoZSBsb2dnZXJcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSBlbmFibGVkXG4gICAgICovXG4gICAgY29uc3RydWN0b3IobmFtZSkge1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBOYW1lIHRoYXQgd2lsbCBiZSBhcHBlbmRlZCBpbiB0aGUgbG9ncyBvZiB0aGUgY29uc29sZVxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIHRydWUgdGhlIGxvZ2dlciB3aWxsIHNob3cgdGhlIG1lc3NhZ2VzIGluIHRlaCBjb25zb2xlXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZW5hYmxlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIHRydWUgZW5hYmxlIHRoZSBsb2dnZXIgc28gaXQgbG9ncyB0aGUgbWVzc2FnZXMgaW4gdGhlIGNvbnNvbGVcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSB2YWx1ZVxuICAgICAqIEByZXR1cm4ge0xvZ2dlcn1cbiAgICAgKi9cbiAgICBlbmFibGUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fZW5hYmxlZCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFcXVpdmFsZW50IHRvIGNvbnNvbGUubG9nXG4gICAgICogQHBhcmFtICB7Kn0gYXJncyAgU2FtZSBwYXJhbWV0ZXJzIGFzIGNvbnNvbGUubG9nIGNhbiByZWNlaXZlXG4gICAgICogQHJldHVybiB7TG9nZ2VyfVxuICAgICAqL1xuICAgIGxvZyguLi5hcmdzKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbmFibGVkKSBjb25zb2xlLmxvZyh0aGlzLl9uYW1lICsgXCIgOlwiLCAuLi5hcmdzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXF1aXZhbGVudCB0byBjb25zb2xlLmluZm9cbiAgICAgKiBAcGFyYW0gIHsqfSBhcmdzICBTYW1lIHBhcmFtZXRlcnMgYXMgY29uc29sZS5pbmZvIGNhbiByZWNlaXZlXG4gICAgICogQHJldHVybiB7TG9nZ2VyfVxuICAgICAqL1xuICAgIGluZm8oLi4uYXJncykge1xuICAgICAgICBpZiAodGhpcy5fZW5hYmxlZCkgY29uc29sZS5pbmZvKHRoaXMuX25hbWUgKyBcIiA6XCIsIC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFcXVpdmFsZW50IHRvIGNvbnNvbGUud2FyblxuICAgICAqIEBwYXJhbSAgeyp9IGFyZ3MgIFNhbWUgcGFyYW1ldGVycyBhcyBjb25zb2xlLndhcm4gY2FuIHJlY2VpdmVcbiAgICAgKiBAcmV0dXJuIHtMb2dnZXJ9XG4gICAgICovXG4gICAgd2FybiguLi5hcmdzKSB7XG4gICAgICAgIGlmICh0aGlzLl9lbmFibGVkKSBjb25zb2xlLndhcm4odGhpcy5fbmFtZSArIFwiIDpcIiwgLi4uYXJncyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVxdWl2YWxlbnQgdG8gY29uc29sZS5lcnJvclxuICAgICAqIEBwYXJhbSAgeyp9IGFyZ3MgIFNhbWUgcGFyYW1ldGVycyBhcyBjb25zb2xlLmVycm9yIGNhbiByZWNlaXZlXG4gICAgICogQHJldHVybiB7TG9nZ2VyfVxuICAgICAqL1xuICAgIGVycm9yKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuX2VuYWJsZWQpIGNvbnNvbGUuZXJyb3IodGhpcy5fbmFtZSArIFwiIDpcIiwgLi4uYXJncyk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgbG9nZ2VyIHdpdGggdGhlIGdpdmVuIG5hbWVcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJuIHtMb2dnZXJ9XG4gICAgICovXG4gICAgY3JlYXRlKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBMb2dnZXIobmFtZSk7XG4gICAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgcGFyc2UoKSB7XHJcbiAgICAgICAgaWYgKCF3aW5kb3cgfHwgIXdpbmRvdy5sb2NhdGlvbiB8fCAhd2luZG93LmxvY2F0aW9uLnNlYXJjaCkgcmV0dXJuIHt9O1xyXG4gICAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uc2VhcmNoXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eXFw/LywgXCJcIilcclxuICAgICAgICAgICAgLnNwbGl0KFwiJlwiKVxyXG4gICAgICAgICAgICAucmVkdWNlKGZ1bmN0aW9uIChvLCBwYXJhbUFuZFZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYXJyID0gcGFyYW1BbmRWYWx1ZS5zcGxpdChcIj1cIik7XHJcbiAgICAgICAgICAgICAgICBvW2FyclswXV0gPSBhcnJbMV07XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbztcclxuICAgICAgICAgICAgfSwge30pO1xyXG4gICAgfVxyXG59O1xyXG4iLCJcbnZhciBpc0lPUyA9IC8oaVBhZHxpUGhvbmV8aVBvZCkvZy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xudmFyIGlzQW5kcm9pZCA9IC9BbmRyb2lkL2cudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaXNJT1M6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXNJT1M7XG4gICAgfSxcbiAgICBpc0FuZHJvaWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gaXNBbmRyb2lkO1xuICAgIH0sXG4gICAgLy8gQ3VydHRpbiB0aGUgbXVzdGFyZCA6IGh0dHA6Ly9yZXNwb25zaXZlbmV3cy5jby51ay9wb3N0LzE4OTQ4NDY2Mzk5L2N1dHRpbmctdGhlLW11c3RhcmRcbiAgICBpc01vZGVybjogZnVuY3Rpb24oKSB7XG4gICAgXHRyZXR1cm4gXCJ2aXNpYmlsaXR5U3RhdGVcIiBpbiBkb2N1bWVudDsgLy8gSUUxMCtcbiAgICB9XG59O1xuIiwiXG52YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZShcIi4uL2V2ZW50L0V2ZW50RW1pdHRlclwiKTtcblxuLy8gTGlzdCBvZiB0aGUgcG9zc2libGUgc3RhdHVzIG9mIHRoZSByZXF1ZXN0XG52YXIgU1RBVFVTID0ge1xuICAgIE5FVzogXCJuZXdcIixcbiAgICBTRU5UOiBcInNlbnRcIixcbiAgICBMT0FERUQ6IFwibG9hZGVkXCIsXG4gICAgRVJST1I6IFwiZXJyb3JcIlxufTtcblxuLyoqXG4gKiBDbGFzcyB1c2VkIHRvIG1ha2UgYWpheCByZXF1ZXN0cyB0byB0aGUgc2VydmVyXG4gKi9cbmNsYXNzIFJlcXVlc3QgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCAgIEZ1bGwgdXJsIHRvIHRoZSBxdWV5ciBhcGkgZW5kcG9pbnQgd2l0aCB2ZXJzaW9uIGFuZCBtZXRob2RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSAgRGF0YSB0byBiZSBzZW5kIGluIHRoZSByZXF1ZXN0LCBpdXQgY2FuIGJlIGFuIEpTT04gb2JqZWN0LCBhIEZvcm1EYXRhLCBldGMuXG4gICAgICovXG4gICAgY29uc3RydWN0b3Ioe3VybCwgbWV0aG9kLCBkYXRhLCByZXNwQ29udGVudFR5cGUsIGNvbnRlbnRUeXBlfSkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBVcmwgdXNlZCBmb3IgdGhlIGNhbGxcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3VybCA9IHVybDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTWV0aG9kIHVzZWQgaW4gdGhlIGFqYXggY2FsbCwgYnkgZGVmYXVsdCBHRVRcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX21ldGhvZCA9IG1ldGhvZCB8fCBcIkdFVFwiO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBPYmplY3Qgd2l0aCB0aGUgb3B0aW9ucyBmb3IgdGhlIGNhbGxcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2RhdGEgPSBkYXRhIHx8IFwiXCI7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFN0YXR1cyBvZiB0aGUgcmVxdWVzdCwgbmV3IHdoZW4geW91IGNyZWF0ZSB0aGUgUmVxdWVzdCBpbnN0YW5jZSxcbiAgICAgICAgICogc2VudCB3aGVuIHlvdSBleGVjdXRlIHRoZSByZXF1ZXN0LCBsb2FkZWQgd2hlbiBpdCBsb2FkcyBvciBlcnJvciB3aGVuIHNvbWV0aGlnblxuICAgICAgICAgKiBmYWlsc1xuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc3RhdHVzID0gU1RBVFVTLk5FVztcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHlwZSBvZiB0aGUgcmVzcG9uc2UsIEpTT04gYnkgZGVmYXVsdC4gQ2FuIGFsc28gYmUgc3RyaW5nIGZvciBubyBwYXJzaW5nLlxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdHlwZSA9IHJlc3BDb250ZW50VHlwZSB8fCBcImpzb25cIjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29udGVudCB0eXBlIGhlYWRlciB0byB1c2VcbiAgICAgICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2NvbnRlbnRUeXBlID0gY29udGVudFR5cGUgfHwgXCJcIjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVzcG9uc2UgZm9yIHRoZSByZXF1ZXN0XG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9yZXNwb25zZSA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEVycm9yIG9iamVjdCB0aGF0IGRlc2NpcmJlcyB0aGUgcHJvYmxlbSB3aXRoIHRoZSByZXF1ZXN0XG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9lcnJvciA9IG51bGw7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFhNTEh0dHBSZXF1ZXN0IG9iamVjdCB1c2VkIHRvIG1ha2UgdGhlIHJlcXVlc3QgdG8gdGhlIHNlcnZlclxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKiBAdHlwZSB7WE1MSHR0cFJlcXVlc3R9XG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl94aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICAvLyBBZGQgbGlzdGVuZXJzIGZvciBib3RoIHRoZSBsb2FkIGFuZCB0aGUgZXJyb3IgZXZlbnRzXG4gICAgICAgIHRoaXMuX3hoci5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCB0aGlzLl9sb2FkSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5feGhyLmFkZEV2ZW50TGlzdGVuZXIoXCJ1cGxvYWRcIiwgdGhpcy5fdXBsb2FkSGFuZGxlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5feGhyLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCB0aGlzLl9lcnJvckhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgZXJyb3IgbWVzc2FnZSB0byBiZSB1c2VkIGluIHRoZSBPbW5pc2NvcGUgcmVwb3J0aW5nIGxvZ2ljLiBJdCBpc1xuICAgICAqIGZvcm1hdHRlZCBpbiBhIHdheSB0aGF0IGxvb2tzIG1vcmUgb3IgbGVzcyBnb29kIGluIHRoZSBPbW5pc2NvcGUgTW9iaWxlXG4gICAgICogcmVwb3J0aW5nIGRpYWxvZy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY29kZSBDb2RlIGZvciB0aGUgZXJyb3IsIHVzdWFsbHkgYW4gaHR0cCBzdGF0dXMgY29kZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IFRleHQgcmVzcG9uc2UgZm9ybSB0aGUgcXVlcnkgb3IgdGhlIGVycm9yIG1lc3NhZ2UgaW4gY2FzZSBvZiBhbiBleGNlcHRpb25cbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICovXG4gICAgX2ludGVybmFsRXJyb3JNZXNzYWdlKGNvZGUsIHRleHQsIGNvbnRlbnRUeXBlKSB7XG4gICAgXHRpZiAoY29udGVudFR5cGU9PT1cImFwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLThcIikgey8vIFRoaXMgaXMgZXhhY3RseSB3aGF0IHdlIGV4cGVjdCBmcm9tIG91ciBzZXJ2ZXJcbiAgICBcdFx0dHJ5IHtcbiAgICBcdFx0XHR0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoSlNPTi5wYXJzZSh0ZXh0KSwgbnVsbCwgMik7XG4gICAgXHRcdH0gY2F0Y2ggKGUpIHtcbiAgICBcdFx0XHRjb25zb2xlLmxvZyhlKTtcbiAgICBcdFx0fVxuICAgIFx0fVxuICAgICAgICByZXR1cm4gYFxcblxcbmAgK1xuICAgICAgICAgICAgYFVybDpcXG4keyB0aGlzLl91cmwgfVxcblxcbmAgK1xuICAgICAgICAgICAgYERhdGE6XFxuJHsgSlNPTi5zdHJpbmdpZnkodGhpcy5fZGF0YSwgbnVsbCwgMikgfVxcblxcbmAgK1xuICAgICAgICAgICAgYFJlc3BvbnNlOlxcbigkeyBjb2RlIH0pXFxuJHsgdGV4dCB9IFxcbmA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcnMgZXJyb3IgcmVwb3J0ZWQgYnkgdGhlIHhociBvYmplY3QgYnkgZW1pdGluZyBhbmQgZXJyb3IgZXZlbnQgaW4gdGhlIHRoaXMgb2JqZWN0IGZvbGxvd2VkXG4gICAgICogYnkgYSBmaW5hbGx5IG9uZS5cbiAgICAgKiBJZiB0aGF0IGVycm9yIGlzIG5vdCBoYW5kbGVkIGl0IHdpbGwgdGhyb3cgYW5kIGV4Y2VwdGlvbiBhcyBkZWZpbmVkIGluIHRoZSBFdmVudEVtaXR0ZXIgaXRzZWxmXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICAgICAqL1xuICAgIF9lcnJvckhhbmRsZXIoZXZlbnQpIHtcblxuICAgICAgICBjb25zb2xlLmVycm9yKFwiUmVxdWVzdCBlcnJvclwiLCB0aGlzLl9pbnRlcm5hbEVycm9yTWVzc2FnZSgtMSwgZXZlbnQubWVzc2FnZSwgbnVsbCkpO1xuXG4gICAgICAgIHRoaXMuX3N0YXR1cyA9IFNUQVRVUy5FUlJPUjtcbiAgICAgICAgdGhpcy5fZXJyb3IgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiBcIkVycm9yIG1ha2luZyBhIHJlcXVlc3QgdG8gdGhlIHNlcnZlclwiLFxuICAgICAgICAgICAgZGV0YWlsczogdGhpcy5faW50ZXJuYWxFcnJvck1lc3NhZ2UoLTEsIGV2ZW50Lm1lc3NhZ2UsIG51bGwpLFxuICAgICAgICAgICAgZXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgeGhyOiB0aGlzLl94aHJcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmVtaXQoXCJlcnJvclwiLCB0aGlzLl9lcnJvcik7XG4gICAgICAgIHRoaXMuZW1pdChcImVuZFwiLCB7fSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyB0aGUgdXBsb2FkIGV2ZW50IGZvcm0gdGhlIHhociBvYmplY3QgdGhhdCB3aWxsIGJlIGRpc3BhdGNoZWQgd2hpbGVcbiAgICAgKiB0aGUgYnJvd3NlciBpcyBzZW5kaW5nIHRoZSBkYXRhLiBNb3N0bHkgdXNlZnVsbCB0byB0cmFjayBmaWxlIHVwbG9hZHNcbiAgICAgKi9cbiAgICBfdXBsb2FkSGFuZGxlcihldmVudCkge1xuICAgICAgICB0aGlzLmVtaXQoXCJ1cGxvYWRcIiwge1xuICAgICAgICAgICAgbG9hZGVkOiBldmVudC5sb2FkZWQsXG4gICAgICAgICAgICB0b3RhbDogZXZlbnQudG90YWwsXG4gICAgICAgICAgICBvcmlnaW5hbDogZXZlbnRcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlcyB0aGUgbG9hZCBvZiB0aGUgeGhyIG9iamVjdCBieSBwYXJzaW5nIHRoZSByZXNwb25zZSBhcyBKU09OIGFuZCBlbWl0aW5nIGEgbG9hZCBldmVudCBmb2xsb3dlZCBieSBhXG4gICAgICogZmluYWxseSBvbmUuIElmIHRoZSBzZXJ2ZXIgcmV0dXJuIGEgc3RhdHVzIGNvZGUgdGhhdCBpcyBub3QgMjAwIHdlIHdpbGwgZW1pdCBhbmQgZXJyb3IgZXZlbnQuXG4gICAgICogSW4gdGhlIHNhbWUgd2F5IGlmIHdlIGNhbm5vdCBwYXJzZSB0aGUgcmVzcG9uc2UgYXMgSlNPTiBhbiBlcnJvciBldmVudCB3aWxsIHRoZSBlbWl0dGVkLlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAgICAgKi9cbiAgICBfbG9hZEhhbmRsZXIoZXZlbnQpIHtcblxuICAgICAgICB2YXIgeGhyID0gZXZlbnQudGFyZ2V0LFxuICAgICAgICAgICAgcmVzcG9uc2U7XG5cbiAgICAgICAgaWYgKHhoci5zdGF0dXMgIT09IDIwMCkge1xuXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcmVzcG9uc2VcIiwgdGhpcy5faW50ZXJuYWxFcnJvck1lc3NhZ2UoXG4gICAgICAgIFx0XHR4aHIuc3RhdHVzLCB4aHIucmVzcG9uc2VUZXh0LCB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJDb250ZW50LVR5cGVcIilcbiAgICBcdFx0KSk7XG5cbiAgICAgICAgICAgIHRoaXMuX3N0YXR1cyA9IFNUQVRVUy5FUlJPUjtcbiAgICAgICAgICAgIHRoaXMuX2Vycm9yID0ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiRXJyb3IgbWFraW5nIHJlcXVlc3QgdG8gdGhlIHF1ZXJ5IGFwaVwiLFxuICAgICAgICAgICAgICAgIGRldGFpbHM6IHRoaXMuX2ludGVybmFsRXJyb3JNZXNzYWdlKHhoci5zdGF0dXMsIHhoci5yZXNwb25zZVRleHQsIHhoci5nZXRSZXNwb25zZUhlYWRlcihcIkNvbnRlbnQtVHlwZVwiKSksXG4gICAgICAgICAgICAgICAgZXZlbnQ6IGV2ZW50XG4gICAgICAgICAgICAgICAgLy94aHI6IHhociAvLyB3ZSBsb25nZXIgaW5jbHVkZSB4aHJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMuZW1pdChcImVycm9yXCIsIHRoaXMuX2Vycm9yKTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0cnkge1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3R5cGUudG9Mb3dlckNhc2UoKSA9PT0gXCJqc29uXCIpe1xuICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgcGFyc2luZyByZXNwb25zZVwiLCB0aGlzLl9pbnRlcm5hbEVycm9yTWVzc2FnZSh4aHIuc3RhdHVzLCB4aHIucmVzcG9uc2VUZXh0LCBudWxsKSk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9zdGF0dXMgPSBTVEFUVVMuRVJST1I7XG4gICAgICAgICAgICAgICAgdGhpcy5fZXJyb3IgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiRXJyb3IgcGFyc2luZyBxdWVyeSBhcGkgcmVzcG9uc2VcIixcbiAgICAgICAgICAgICAgICAgICAgZGV0YWlsczogdGhpcy5faW50ZXJuYWxFcnJvck1lc3NhZ2UoeGhyLnN0YXR1cywgeGhyLnJlc3BvbnNlVGV4dCwgeGhyLmdldFJlc3BvbnNlSGVhZGVyKFwiQ29udGVudC1UeXBlXCIpKSxcbiAgICAgICAgICAgICAgICAgICAgLy94aHI6IHhociwgLy8gd2UgbG9uZ2VyIGluY2x1ZGUgeGhyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBlXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImVycm9yXCIsIHRoaXMuX2Vycm9yKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RhdHVzID0gU1RBVFVTLkxPQURFRDtcbiAgICAgICAgICAgICAgICB0aGlzLl9yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChcImxvYWRcIiwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbWl0KFwiZW5kXCIsIHt9KTsgLy8gd2UgbG9uZ2VyIGluY2x1ZGUgeGhyXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlcGFyZSB0aGUgZGF0YSB0byBzZW5kIGJ5ZG9pbmcgdGhlIG5lY2Nlc2FyeSB0cmFuc2Zvcm1hdGlvbnMsIGxpa2VcbiAgICAgKiBzdHJpbmdpZnkgdGhlIGpzb24uLi5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuICAgICAqIEByZXR1cm4ge3N0cmluZ3xPYmplY3R9XG4gICAgICovXG4gICAgX3ByZXBhcmVEYXRhKGRhdGEpIHtcblxuICAgICAgICBpZiAodGhpcy5fbWV0aG9kLnRvTG93ZXJDYXNlKCkgPT09IFwiZ2V0XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGEgJiYgKGRhdGEuY29uc3RydWN0b3IgPT09IE9iamVjdCB8fCBBcnJheS5pc0FycmF5KGRhdGEpKSkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlcGFyZSB0aGUgdXJsIHdpdGggdGhlIHNwZWNpZmllZCBkYXRhIGlmIHRoZSBtZXRob2QgaXMgZ2V0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKi9cbiAgICBfcHJlcGFyZVVybCh1cmwpIHtcblxuICAgICAgICB2YXIgcGFyYW1zID0gXCJcIjtcblxuICAgICAgICBpZiAodGhpcy5fbWV0aG9kLnRvTG93ZXJDYXNlKCkgPT09IFwiZ2V0XCIgJiYgdGhpcy5fZGF0YSAmJiB0aGlzLl9kYXRhLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcblxuICAgICAgICAgICAgcGFyYW1zID0gT2JqZWN0LmtleXModGhpcy5fZGF0YSkubWFwKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGtleSArIFwiPVwiICsgdGhpcy5fZGF0YVtrZXldO1xuICAgICAgICAgICAgfSkuam9pbihcIiZcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdXJsICsgKHBhcmFtcyA/IFwiP1wiICsgcGFyYW1zIDogXCJcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBjdXJyZW50IHN0YXR1cyBvZiB0aGUgcmVxdWVzdFxuICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgKi9cbiAgICBnZXQgc3RhdHVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RhdHVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbmNlbCB0aGUgY3VycmVudCB4aHIgcmVxdWVzdCBhbmQgZW1pdCBhIGNhbmNlbCBldmVudC5cbiAgICAgKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICAgICAqL1xuICAgIGNhbmNlbCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl94aHIpIHJldHVybiB0aGlzOyAvLyBkaXNwb3NlZFxuICAgICAgICB0aGlzLl94aHIuYWJvcnQoKTtcbiAgICAgICAgdGhpcy5lbWl0KFwiY2FuY2VsXCIsIHt9KTsgLy8gd2UgbG9uZ2VyIGluY2x1ZGUgeGhyXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc3Bvc2UgdGhpcyBvYmplY3QgYnkgcmVtb3ZpbmcgdGhlIGV2ZW50IGxpc3RlbmVycywgY2FuY2VsaW5nIHRoZSByZXF1ZXN0IGlmXG4gICAgICogaXQgaXMgdGFraW5nIHBsYWNlIGFuZCByZW1vdmluZyB0aGUgcmVmZXJlbmNlIHRvIHRoZSB4aHIgb2JqZWN0XG4gICAgICovXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgdGhpcy5feGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIHRoaXMuX2xvYWRIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl94aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInVwbG9hZFwiLCB0aGlzLl91cGxvYWRIYW5kbGVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl94aHIucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIHRoaXMuX2Vycm9ySGFuZGxlci5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvLyBJZiB3ZSBkaXNwb3NlIHdoaWxlIHRoZSByZXF1ZXN0IGlzIHRha2luZyBwbGFjZSB3ZSBjYW5jZWwgaXQuXG4gICAgICAgIGlmICh0aGlzLl9zdGF0dXMgPT09IFNUQVRVUy5TRU5UKSB7XG4gICAgICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5feGhyID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPcGVuIHRoZSB4aHIgb2JqZWN0IHdpdGggdGhlIHF1ZXJ5IHVybCBhbmQgUE9TVCBtZXRob2QsIHNlbmQgdGhlIG9wdGlvbnMgYXMgSlNPTiBhbmQgdGhlblxuICAgICAqIGVtaXQgYW4geGVjdXRlIG1laHRvZFxuICAgICAqIEByZXR1cm4ge1JlcXVlc3R9XG4gICAgICovXG4gICAgZXhlY3V0ZSgpIHtcblxuICAgICAgICB0aGlzLl94aHIub3Blbih0aGlzLl9tZXRob2QsIHRoaXMuX3ByZXBhcmVVcmwodGhpcy5fdXJsKSk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2NvbnRlbnRUeXBlKSB7XG4gICAgICAgICAgICAvL0NvbnRlbnQtVHlwZVx0YXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOFxuICAgICAgICAgICAgdGhpcy5feGhyLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgdGhpcy5fY29udGVudFR5cGUgKyBcIjsgY2hhcnNldD1VVEYtOFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3hoci5zZW5kKHRoaXMuX3ByZXBhcmVEYXRhKHRoaXMuX2RhdGEpKTtcblxuICAgICAgICB0aGlzLl9zdGF0dXMgPSBTVEFUVVMuU0VOVDtcbiAgICAgICAgdGhpcy5lbWl0KFwiZXhlY3V0ZVwiLCB7fSk7IC8vIHdlIGxvbmdlciBpbmNsdWRlIHhoclxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIG9uKHR5cGUpIHtcblxuICAgICAgICAvLyBJZiB3ZSB3YW50IHRvIGxpc3RlbiBmb3IgbG9hZCBvciBlcnJvciBidXQgdGhlIHN0YXR1cyBpcyBhbHJlYWR5IGxvYWRlZCBvciBlcnJvclxuICAgICAgICBpZiAodHlwZS5pbmRleE9mKFwibG9hZFwiKSAmJiB0aGlzLl9zdGF0dXMgPT09IFNUQVRVUy5MT0FERUQpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImxvYWRcIiwgdGhpcy5fcmVzcG9uc2UpOyAvLyB3ZSBsb25nZXIgaW5jbHVkZSB4aHJcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlLmluZGV4T2YoXCJlcnJvclwiKSAmJiB0aGlzLl9zdGF0dXMgPT09IFNUQVRVUy5FUlJPUikge1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiZXJyb3JcIiwgdGhpcy5fZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUuaW5kZXhPZihcImVuZFwiKSAmJiAodGhpcy5fc3RhdHVzID09PSBTVEFUVVMuRVJST1IgfHwgdGhpcy5fc3RhdHVzID09PSBTVEFUVVMuTE9BREVEKSkge1xuICAgICAgICAgICAgdGhpcy5lbWl0KFwiZW5kXCIsIHt9KTsgLy8gd2UgbG9uZ2VyIGluY2x1ZGUgeGhyXG4gICAgICAgIH1cblxuICAgICAgICBzdXBlci5vbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUmVxdWVzdDtcbiIsIlxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9zcmNcIik7XG4iLCJcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiQHZpc29raW8vY29tbW9uL3NyYy9ldmVudC9FdmVudEVtaXR0ZXJcIik7XG52YXIgZXZlbnRzID0gcmVxdWlyZShcIkB2aXNva2lvL2NvbW1vbi9zcmMvdXRpbC9ldmVudHNcIik7XG52YXIgY2xvbmUgPSByZXF1aXJlKFwiQHZpc29raW8vY29tbW9uL3NyYy91dGlsL2Nsb25lXCIpO1xudmFyIGNvbW0gPSByZXF1aXJlKFwiQHZpc29raW8vY2hhcnQtY29tbXVuaWNhdGlvblwiKTtcbnZhciBsb2dnZXIgPSByZXF1aXJlKFwiQHZpc29raW8vY29tbW9uL3NyYy91dGlsL2xvZ2dlclwiKTtcbnZhciBkb20gPSByZXF1aXJlKFwiQHZpc29raW8vY29tbW9uL3NyYy91dGlsL2RvbVwiKTtcblxudmFyIGdyaWQgPSByZXF1aXJlKFwiLi9ncmlkQnVpbGRlclwiKTtcbnZhciBwYW5lcyA9IHJlcXVpcmUoXCIuL2xheW91dC9wYW5lc1wiKTtcbnZhciBjb250ZXh0VXRpbCA9IHJlcXVpcmUoXCJAdmlzb2tpby9jb21tb24vc3JjL2NvbnRleHRcIik7XG52YXIgd2F0ZXJtYXJrID0gcmVxdWlyZShcIi4vdXRpbC93YXRlcm1hcmtcIik7XG5cbnZhciBwYW5lQ2VsbCA9IHJlcXVpcmUoXCIuL2NlbGxcIik7XG5cbi8qKlxuICogQ2xhc3MgdGhhdCByZXByZXNlbnRzIHRoZSBwYW5pbmcgZ3JpZC4gSXRzIHRoZSByZXNwb25zYWJsZSBvZiBsb2FkaW5nIHRoZSB2aWV3IGl0c2VsZiBwZXIgcGFuZSBhbmQgcGFzcyB0aGUgbWVzc2FnZXNcbiAqIHRvIGl0IGFzIHdlbGwgYXMgZXhwb3NlIHRoZSBtZXRob2RzIG5lZWRlZCB0byBpbnRlcmFjdCB3aXRoIHRoZSB2aWV3IGZvcm0gb3V0c2lkZSwgZm9yIGV4bWFwbGUgd2hlbiB5b3UgZ2V0IGEgbWVzc2FnZVxuICogZm9ybSB0aGUgcHVibGljIGFwaSBhbmQgeW91IHdhbnQgdG8gc2VuZCBpdCB0byB0aGUgcGFuZSBpdHNlbGYgbGlrZSB1cGRhdGUsIHIgZXNpemUsIGV0Yy5cbiAqL1xuY2xhc3MgUGFuaW5nICBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSAge0hUTUxFTGVtZW50fSBwYXJlbnRcblx0ICogQHBhcmFtICB7T2JqZWN0fSBjb250ZXh0XG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IHJlbmRlcmVyXG4gICAgICogQHBhcmFtICB7Ym9vbGVhbn0gaWdub3JlSGVhZGVyc1xuXHQgKi9cblx0Y29uc3RydWN0b3IocGFyZW50LCBjb250ZXh0LCByZW5kZXJlciwgaWdub3JlSGVhZGVycykge1xuXHRcdHN1cGVyKCk7XG5cblx0XHQvKipcblx0XHQgKiBMb2dnZXIgdXNlZCB0byBkZWJ1ZyB0aGUgcGFuaW5nLCBkaXNhYmxlZCBieSBkZWZhdWx0LCB0byBlbmFibGUgcGFzcyB0cnVlIGhlcmUgb3IgZG8gdGhpcy5fbG9nZ2VyLmVuYWJsZSh0cnVlKVxuXHRcdCAqIEB0eXBlIHtMb2dnZXJ9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHR0aGlzLl9sb2dnZXIgPSBsb2dnZXIuY3JlYXRlKFwicGFuaW5nQFBhbmluZ1wiKTsvLy5lbmFibGUodHJ1ZSk7XG5cblx0XHQvKipcblx0XHQgKiBJZCBvZiB0aGUgdmlld1xuXHRcdCAqIEB0eXBlIHtudW1iZXJ9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHR0aGlzLl9pZCA9IGNvbW0uZ2VuZXJhdGVJZCgpICsgXCJfXCIgKyBjb250ZXh0LnZpZXdJbnN0YW5jZUlkICsgXCItcGFuaW5nLWdyaWRcIjtcblxuXHRcdC8qKlxuXHRcdCAqIEhUTUwgZWxlbWVudCB0aGF0IGFjdHMgYXMgdGhlIHBhcmVudCBvZiB0aGUgcGFuaW5nIGdyaWRcblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0dGhpcy5fcGFyZW50ID0gcGFyZW50O1xuXG5cdFx0LyoqXG5cdFx0ICogQ3VycmVudCBjb250ZXh0IGxvYWRlZCBmb3IgdGhlIHZpZXdcblx0XHQgKiBAdHlwZSB7T2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0dGhpcy5fY29udGV4dCA9IGNsb25lKGNvbnRleHQpO1xuXG5cdFx0LyoqXG5cdFx0ICogRnVuY2l0b24gdGhhdCB3aWxsIGJlIHVzZSBkb3QgcmVuZGVyIGVhY2ggcGFuZVxuXHRcdCAqIEB0eXBlIHtGdW5jdGlvbn1cblx0XHQgKiBAcHJpdmF0ZVwiXG5cdFx0ICovXG5cdFx0dGhpcy5fcmVuZGVyZXIgPSByZW5kZXJlcjtcblxuXHRcdC8qKlxuXHRcdCAqIExpc3Qgb2YgdGhlIGRpZmZlcmVudCBzYWVjdGlvbnMgb2YgdGhlIFwiZ3JpZFwiLCBcImJvZHlcIiwgXCJyb3dIZWFkZXJzXCIsXG5cdFx0ICogXCJjb2xIZWFkZXJzXCIgYW5kIHRoZSBcImdyaWRcIiBpdHNlbGZcblx0XHQgKiBAdHlwZSB7T2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXCJcblx0XHQgKi9cblx0XHR0aGlzLl9zZWN0aW9ucyA9IG51bGw7XG5cblx0XHQvKipcblx0XHQgKiBEZXNjcmlwdGlvbiBvZiB0aGUgc2l6ZSBvZiB0aGUgcGFuZXMgYW5kIHRoZSB0b3RhbCBhcmVhIGZvciB0aGVtXG5cdFx0ICogQHR5cGUge09iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdHRoaXMuX3BhbmVTaXplID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogVHJ1ZSBpZiB0aGlzLl9wYW5lU2l6ZSBpcyB2YWxpZC4gRmFsc2UgaWYgd2FpdGluZyBmb3Igc2l6ZSB0byBiZSByZXRyaWV2ZWQuXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcGFuZVNpemVWYWxpZCA9IGZhbHNlO1xuXG5cdFx0LyoqXG5cdFx0ICogQ3VycmVudCBjb2wgb2YgdGhlIHBhbmluZyBncmlkXG5cdFx0ICogQHR5cGUge251bWJlcn1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdHRoaXMuX2NvbCA9IDA7XG5cblx0XHQvKipcblx0XHQgKiBDdXJyZW50IHJvdyBvZiB0aGUgcGFuaW5nIGdyaWRcblx0XHQgKiBAdHlwZSB7bnVtYmVyfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0dGhpcy5fcm93ID0gMDtcblxuXHRcdC8qKlxuXHRcdCAqIExpc3Qgb2YgcGFuZXMgdXNlZCBpbiB0aGUgZ3JpZFxuXHRcdCAqIEB0eXBlIHtBcnJheS48UGFuZUNlbGw+fVxuXHRcdCAqL1xuXHRcdHRoaXMuX3BhbmVzID0gW107XG5cblx0XHQvKipcblx0XHQgKiBIZWFkZXIgb3IgaGVhZGVycyAoZGVwZW5kaW5nIG9uIHRoZSBzZXR0aW5ncykgZm9yIHRoZSBwYW5pbmcgZ3JpZCByb3dzXG5cdFx0ICogQHR5cGUge0FycmF5LjxIVE1MRWxlbWVudD59XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHR0aGlzLl9yb3dIZWFkZXJzID0gW107XG5cblx0XHQvKipcblx0XHQgKiBIZWFkZXIgb3IgaGVhZGVycyAoZGVwZW5kaW5nIG9uIHRoZSBzZXR0aW5ncykgZm9yIHRoZSBwYW5pbmcgZ3JpZCBjb2xzXG5cdFx0ICogQHR5cGUge0FycmF5LjxIVE1MRWxlbWVudD59XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHR0aGlzLl9jb2xIZWFkZXJzID0gW107XG5cblx0XHQvKipcblx0XHQgKiBUaW1lciB1c2VkIHRvIGRlYm91bmNlIHRoZSBsb2FkaW5nIG9mIHRoZSBwYW5lcyB3aGVuIHRoZSBncmlkIGlzIHNjcm9sbGVkXG5cdFx0ICogQHR5cGUge251bWJlcn1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdHRoaXMuX3Njcm9sbFRpbWVyID0gMDtcblxuXHRcdHRoaXMuX2hlYWRlclBhbmVzID0gbnVsbDtcblx0XHR0aGlzLl9ib2R5UGFuZXMgPSBudWxsO1xuXG5cdFx0dGhpcy5fc2Nyb2xsSGFuZGxlciA9IG51bGw7XG5cblx0XHR0aGlzLl9pZ25vcmVIZWFkZXJzID0gaWdub3JlSGVhZGVycztcblxuXHRcdHRoaXMuX2F4ZXMgPSBudWxsO1xuXG5cdFx0LyoqXG5cdFx0ICogRm9yIGNvbnRyb2xsaW5nIHNlcXVlbmNpbmcgb2YgcmVxdWVzdHMsIHBhc3NlZCB0aHJvdWdoIHdoZW4gZGF0YSBpcyByZXF1ZXN0ZWQgYW5kIHJldHVybmVkLlxuXHRcdCAqIEB0eXBlIHtudW1iZXJ9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHR0aGlzLl9jdXJOZWVkU2l6ZUlkID0gMDtcblxuXHRcdC8qKlxuXHRcdCAqIEZvciBjb250cm9sbGluZyBzZXF1ZW5jaW5nIG9mIHJlcXVlc3RzLCBwYXNzZWQgdGhyb3VnaCB3aGVuIGRhdGEgaXMgcmVxdWVzdGVkIGFuZCByZXR1cm5lZC5cblx0XHQgKiBAdHlwZSB7bnVtYmVyfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0dGhpcy5fY3VyTmVlZERhdGFJZCA9IDA7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNldCB0byB0cnVlIHdoZW4gbG9hZEJvZHlEYXRhIGhhcyBydW4gaW4gbm9uLXBhbmluZyBtb2RlLlxuICAgICAgICAgKiBDbGVhcmVkIHdoZW4gaXQgcnVucyBpbiBwYW5pbmcgbW9kZS5cbiAgICAgICAgICogQWxsb3dzIGRpcnR5IHF1aWNrLWZpeCBvcHRpbWlzYXRpb25zIHRvIG9jY3VyIHRoYXQgcHJldmVudCByZWxvYWQsIHdoaWxlIGFsbG93aW5nIHRoZVxuICAgICAgICAgKiBzYW1lIHZpZXcgdG8gYmUgcmVjb25maWd1cmVkIGZvciBwYW5pbmcgYW5kIHRvIHVwZGF0ZSBwcm9wZXJseS5cbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9sYXN0TG9hZEJvZHlEYXRhV2FzTm9uUGFuaW5nTW9kZSA9IGZhbHNlO1xuXG5cdFx0dGhpcy5fbG9nZ2VyLmluZm8oXCJQYW5uaW5nIGNyZWF0ZWRcIik7XG5cblx0XHQvLyBETyB0aGUgaW5pdGlhbCBsb2FkIG9mIHRoZSBvcGFuaW5nIGdyaWQgYmFzZWQgb24gdGhlIHNldGl0bmdzIGZvcm0gdGhlIGNvbnRleHRcblx0XHR0aGlzLl9sb2FkR3JpZCh0aGlzLl9jb250ZXh0KTtcblx0fVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiBhdXRvIHBhbmUgaXMgb2ZmLiBJLmUuIG5vdCBwYW5pbmcsIGFuZCBub3QgZW5hYmxlZCBpbiBtYW5pZmVzdC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9pc05vblBhbmluZ01vZGUoKSB7XG4gICAgICAgIGlmICh0aGlzLl9pZ25vcmVIZWFkZXJzKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgICAvLyBBbHNvIGFsbG93IHRoZSBjYXNlIG9mIGEgc2luZ2xldG9uIHBhbmUgd2hlbiBhdXRvLXBhbmUgaXMgZW5hYmxlZCBidXQgcGFuaW5nIGlzbid0IGNvbmZpZ3VyZWQgaW4gWC9ZXG4gICAgICAgIC8vIHRvIGJlIG9wdGltaXNlZCB3aXRob3V0IHJlbG9hZFxuICAgICAgICAvLyAoRGlydHkgZml4IHVudGlsIHdlIGhhdmUgUmVhY3QgZHJpdmVuIHBhbmluZylcblxuICAgICAgICAvLyBUT0RPOiB3ZSBhcmUgcmVmZXJyaW5nIHRvIHBhbmluZyBvcHRpb25zLCBidXQgdGhpcyBpcyBpbnRlbmRlZCB0byBiZSBjb25maWd1cmFibGUgYXMgYSBsaWJyYXJ5IGluIGZ1dHVyZVxuICAgICAgICAvLyBUaGVyZSBhcmUgb3RoZXIgcGxhY2VzIGluIHRoaXMgZmlsZSB3aGljaCByZWZlciB0byBwYW5lWC9wYW5lWSAtIHRoaXMgc2hvdWxkIGJlIHRoZSByZXNwb25zaWJpbGl0eVxuICAgICAgICAvLyBvZiB0aGUgY29udGFpbmVyLCBpbnN0ZWFkIG9mIHJlZmVycmluZyB0byB0aGVtIGhlcmUuXG5cbiAgICAgICAgaWYgKHRoaXMuX2NvbnRleHQub3B0aW9ucy5pdGVtcy5wYW5lWCAmJiB0aGlzLl9jb250ZXh0Lm9wdGlvbnMuaXRlbXMucGFuZVgubGVuZ3RoPjApIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMuX2NvbnRleHQub3B0aW9ucy5pdGVtcy5wYW5lWSAmJiB0aGlzLl9jb250ZXh0Lm9wdGlvbnMuaXRlbXMucGFuZVkubGVuZ3RoPjApIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cdF9uZXdOZWVkU2l6ZUlkKCkge1xuXHRcdHRoaXMuX2N1ck5lZWRTaXplSWQrKztcblx0XHR0aGlzLl9uZXdOZWVkRGF0YUlkKCk7IC8vIGVuc3VyZSBhbGwgZXhpc3RpbmcgZGF0YSByZXF1ZXN0cyBhcmUgZGlzY2FyZGVkLlxuXHR9XG5cdF9uZXdOZWVkRGF0YUlkKCkge1xuXHRcdHRoaXMuX2N1ck5lZWREYXRhSWQrKztcblx0fVxuXG5cdF91cGRhdGVDb2xBbmRSb3coY29sLCByb3cpIHtcblx0XHR0aGlzLl9jb2wgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihjb2wsIHRoaXMuX3BhbmVTaXplLnRvdGFsLmNvbHMgLSB0aGlzLl9wYW5lU2l6ZS52aWV3cG9ydC5jb2xzKSk7XG5cdFx0dGhpcy5fcm93ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4ocm93LCB0aGlzLl9wYW5lU2l6ZS50b3RhbC5yb3dzIC0gdGhpcy5fcGFuZVNpemUudmlld3BvcnQucm93cykpO1xuXHRcdHRoaXMuX25ld05lZWREYXRhSWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgdGhlIHNjcm9sbCBmb3IgdGhlIGhlYWRlcnMgYmFzZSBkb24gdGhlIHNjcm9sbCBvZiB0aGUgYm9keSBhbmQgdXBkYXRlIHRoZSBjdXJyZW50IHJvdyBhbmQgY29sIHZhbHVlcyB0aGF0IHJlcHJlc2VudHNcblx0ICogdGhlIHN0YXJ0IHJvdyBhbmQgY29sLlxuXHQgKi9cblx0X3VwZGF0ZVNjcm9sbCgpIHtcblx0XHRpZiAoIXRoaXMuX3BhbmVTaXplVmFsaWQpIHJldHVybjsgLy8gc3RpbGwgd2FpdGluZyBmb3Igc2l6ZVxuXG5cdFx0dmFyIHNjcm9sbFRvcCA9IHRoaXMuX3NlY3Rpb25zLmJvZHkuc2Nyb2xsVG9wLFxuXHRcdFx0c2Nyb2xsTGVmdCA9IHRoaXMuX3NlY3Rpb25zLmJvZHkuc2Nyb2xsTGVmdDtcblxuXHRcdHRoaXMuX3VwZGF0ZUNvbEFuZFJvdyhNYXRoLmZsb29yKHNjcm9sbExlZnQgLyB0aGlzLl9wYW5lU2l6ZS5zaXplLndpZHRoKSwgTWF0aC5mbG9vcihzY3JvbGxUb3AgLyB0aGlzLl9wYW5lU2l6ZS5zaXplLmhlaWdodCkpO1xuXG5cdFx0Ly8gc3luY2hyb25pemUgdGhlIHNjcm9sbCBiZXR3ZWVuIHRoZSBib2R5IGFuZCB0aGUgaGVhZGVyc1xuXHRcdHRoaXMuX3NlY3Rpb25zLnJvd0hlYWRlcnMuZm9yRWFjaChoZWFkZXIgPT4gaGVhZGVyLnNjcm9sbFRvcCA9IHNjcm9sbFRvcCk7XG5cdFx0dGhpcy5fc2VjdGlvbnMuY29sSGVhZGVycy5mb3JFYWNoKGhlYWRlciA9PiBoZWFkZXIuc2Nyb2xsTGVmdCA9IHNjcm9sbExlZnQpO1xuXG5cdFx0d2luZG93LmNsZWFyVGltZW91dCh0aGlzLl9zY3JvbGxUaW1lcik7XG5cblx0XHQvLyBEZWZlciB0aGUgYnVpbGRpbmcgb2YgdGhlIHBhbmVzIHNvIHdlIGRvbnQga2lsbCB0aGUgc2Nyb2xsXG5cdFx0Ly8gVE9ETzogSW5zdGVhZCBvZiBmdWxseSByZWJ1aWxkIHRoZSBwYW5lcyBqdXN0IHJldWFzZSBkaHRlbSBhbmQgbW92ZSBodG1lXG5cdFx0dGhpcy5fc2Nyb2xsVGltZXIgPSB3aW5kb3cuc2V0VGltZW91dCh0aGlzLl9idWlsZFBhbmVzLmJpbmQodGhpcyksIDEwMCk7XG5cdH1cblxuXG5cdF9yZXNldFNjcm9sbCgpIHtcblx0XHR0aGlzLl9zZWN0aW9ucy5ib2R5LnNjcm9sbFRvcCA9IDA7XG5cdFx0dGhpcy5fc2VjdGlvbnMuYm9keS5zY3JvbGxMZWZ0ID0gMDtcblxuXHRcdC8vIFdlIG1heSBub3QgaGF2ZSB0aGUgcGFuZSBzaXplIHlldCBpZiB0aGUgcmVzaXplIGhhcHBlbnMgYmVmb3JlIHdlIG1hbmFnZSB0byBnZXQgdGhlIHNpemUgb2YgdGhlIGdyaWRcblx0XHRpZiAodGhpcy5fcGFuZVNpemVWYWxpZCkgdGhpcy5fdXBkYXRlU2Nyb2xsKCk7XG5cdH1cblxuXHQvKipcblx0ICogTG9hZCB0aGUgYmFzaWMgZ3JpZCBmb3IgdGhlIGdpdmVuIGNvbnRleHQgb3B0aW9ucy4gSWYgdGhlIGF4ZXMgaW5mbyBpcyBwcm92aWRlZCBpdCB3aWxsIGFsc28gYXBwbHkgdGhlIHRvdGFsIHNpemVcblx0ICogdG8gYm90aCB0aGUgaGVhZGVycyBhbmQgdGhlIGJvZHlcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtICB7T2JqZWN0fSBjb250ZXh0XG5cdCAqIEBwYXJhbSAge09iamVjdH0gYXhlc1xuXHQgKi9cblx0X2xvYWRHcmlkKGNvbnRleHQsIGF4ZXMpIHtcblxuICAgICAgICBpZiAodGhpcy5faXNOb25QYW5pbmdNb2RlKCkgJiYgdGhpcy5fcGFuZVNpemUgJiZcbiAgICAgICAgICAgIHRoaXMuX3BhbmVTaXplLnRvdGFsLmNvbHM9PT0xICYmIHRoaXMuX3BhbmVTaXplLnRvdGFsLnJvd3M9PT0xKVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgcmVjdCA9IHRoaXMuX3NlY3Rpb25zLmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBsZXQgb2xkID0gdGhpcy5fcGFuZVNpemUudmlld3BvcnQ7XG4gICAgICAgICAgICBpZiAocmVjdC53aWR0aD09PW9sZC53aWR0aCAmJiByZWN0LmhlaWdodD09PW9sZC5oZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAvLyAuLi4gYW5kIHRoZSBzaXplIG9mIHRoZSB2aWV3cG9ydCBoYXNuJ3QgY2hhbmdlZC4uLlxuICAgICAgICAgICAgICAgIC8vIFNpbmdsZXRvbiBwYW5lIGNlbGwsIGFuZCBncmlkIGhhcyBhbHJlYWR5IGJlZW4gZnVsbHkgbG9hZGVkLiBBdm9pZCB1bm5lY2Vzc2FyeSByZWxvYWRzLlxuICAgICAgICAgICAgICAgIC8vIERpcnR5IHN0b3AgZ2FwIHVudGlsIHdlIGhhdmUgcHJvcGVyIFJlYWN0IGRyaXZlbiBwYW5pbmcuXG4gICAgICAgICAgICAgICAgdGhpcy5fbG9nZ2VyLmxvZyhcIlNraXBwaW5nIGxvYWRHcmlkXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTGFzdCBzaW5nbGUgcGFuZSBtb2RlIHdhcyBhIGRpZmZlcmVudCBzaXplLCBzbzpcbiAgICAgICAgICAgIHRoaXMuX2xhc3RMb2FkQm9keURhdGFXYXNOb25QYW5pbmdNb2RlID0gZmFsc2U7IC8vIGZvcmNlIGZ1bGwgcmVidWlsZFxuICAgICAgICB9XG5cblxuICAgICAgICB0aGlzLl9sb2dnZXIuaW5mbyhcIkxvYWRpbmcgYSBuZXcgZ3JpZCB3aXRoIGNvbnRleHQgYW5kIGF4ZXM6XCIsIGNvbnRleHQsIGF4ZXMpO1xuXG5cdFx0aWYgKHRoaXMuX3NlY3Rpb25zKSB7XG5cblx0XHRcdGV2ZW50cy5yZW1vdmVXaGVlbExpc3RlbmVycyh0aGlzLl9zZWN0aW9ucy5ib2R5KTtcblx0XHRcdHRoaXMuX3NlY3Rpb25zLmJvZHkucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLl9zY3JvbGxIYW5kbGVyKTtcblxuXHRcdFx0Ly8gVE9ETzogUmVtdm9lIGV2ZW50IGxpc3RlbmVycywgZXRjLCBmb3JtIHByZXZpb3VzIGdyaWRcblx0XHRcdHRoaXMuX3BhcmVudC5pbm5lckhUTUwgPSBcIlwiO1xuXHRcdH1cblxuXHRcdC8vIEJ1aWxkIHRoZSBodG1sIGZvciB0aGUgZGlmZmVyZW50IHNlY2l0b25zIG9mIHRoZSBncmlkLCBoZWFkZXJzLCBib2R5IGFuZCBjb3JuZXJzIGFuZCBsb2FkZWQgaW4gdGhlIHBhcmVudFxuXHRcdHRoaXMuX3NlY3Rpb25zID0gZ3JpZC5idWlsZChjb250ZXh0LCB0aGlzLl9pZ25vcmVIZWFkZXJzLCB0aGlzLl9pc05vblBhbmluZ01vZGUoKSk7XG5cdFx0dGhpcy5fcGFyZW50LmFwcGVuZENoaWxkKHRoaXMuX3NlY3Rpb25zLmdyaWQpO1xuXG5cdFx0Ly8gSWYgd2UgYWxyZWFkeSBoYXZlIHRoZSBheGVzIGRhdGEgYXBwbHkgdGhlIHNpemUgdG8gdGhlIGlubmVyIGxpc3Qgb2YgdGhlIHNlY3Rpb25zICh0ZWggdG90YWwgc2l6ZSBmb3IgdGhlXG5cdFx0Ly8gYm9keSBhbmQgaGVhZGVycyBiYXNpY2FsbHkpXG5cdFx0aWYgKCFheGVzKSByZXR1cm47IC8vID9cblxuXHRcdHRoaXMuX2xvZ2dlci5pbmZvKFwiU2V0dGluZyB0aGUgc2l6ZSBmb3IgdGhlIGdyaWQgZm9yIGF4ZXM6XCIsIGF4ZXMpO1xuXG5cdFx0Ly8gQ3JlYXQgdGhlIGlubmVyIGxzaXRzIHdpdGggdGhlIGZ1bGwgc2l6ZSBvZiB0aGUgaGVhZGVycyBhbmQgYm9keVxuXHRcdHRoaXMuX3BhbmVTaXplID0gcGFuZXMuc2l6ZSh0aGlzLl9zZWN0aW9ucy5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCB0aGlzLl9jb250ZXh0LCBheGVzKTtcbiAgICAgICAgdGhpcy5fcGFuZVNpemVWYWxpZCA9IHRydWU7XG5cblx0XHRpZiAodGhpcy5fcGFuZVNpemUudG90YWwuY29scyAhPT0gdGhpcy5fcGFuZVNpemUudmlld3BvcnQuY29scyB8fCB0aGlzLl9wYW5lU2l6ZS50b3RhbC5yb3dzICE9PSB0aGlzLl9wYW5lU2l6ZS52aWV3cG9ydC5yb3dzKSB7XG5cblx0XHRcdC8vIExpc3RlbiB0byB0aGUgd2hlZWwgZXZlbnRzIGFuZCBkbyB0aGUgc2Nyb2xsIGJ5IGhhbmQgdG8gcHJldmVudCBkZXN5bmNocm9uaXphdGlvblxuXHRcdFx0Ly8gaW4gbWFjIGFuZCBhbHNvIHRvIHN5bmMgdGhlIHNjcm9sbCBiZXR3ZWVuIHRoZSBoZWFkZXJzIG9yIHRoZSBib2R5XG5cdFx0XHRldmVudHMuYWRkV2hlZWxMaXN0ZW5lcih0aGlzLl9zZWN0aW9ucy5ib2R5LCBldmVudCA9PiB7XG5cdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0XHR0aGlzLl9zZWN0aW9ucy5ib2R5LnNjcm9sbExlZnQgKz0gZXZlbnQuZGVsdGFYO1xuXHRcdFx0XHR0aGlzLl9zZWN0aW9ucy5ib2R5LnNjcm9sbFRvcCArPSBldmVudC5kZWx0YVk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5fc2Nyb2xsSGFuZGxlciA9IHRoaXMuX3VwZGF0ZVNjcm9sbC5iaW5kKHRoaXMpO1xuXG5cdFx0XHQvLyBTeW5jIHRoZSBoZWFkZXJzIGFuZCB0aGUgYm9keSB3aGVuIHRoZSB1c2VyIGRyYWdzIHRoZSBzY3JvbGxiYXJzXG5cdFx0XHR0aGlzLl9zZWN0aW9ucy5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgdGhpcy5fc2Nyb2xsSGFuZGxlcik7XG5cblx0XHR9XG5cblx0XHRpZiAodGhpcy5fcGFuZVNpemUudG90YWwuY29scyA9PT0gdGhpcy5fcGFuZVNpemUudmlld3BvcnQuY29scykgdGhpcy5fc2VjdGlvbnMuYm9keS5jbGFzc0xpc3QuYWRkKFwicGFubmluZy1ib2R5LXNpbmdsZS1jb2xcIik7XG5cdFx0aWYgKHRoaXMuX3BhbmVTaXplLnRvdGFsLnJvd3MgPT09IHRoaXMuX3BhbmVTaXplLnZpZXdwb3J0LnJvd3MpIHRoaXMuX3NlY3Rpb25zLmJvZHkuY2xhc3NMaXN0LmFkZChcInBhbm5pbmctYm9keS1zaW5nbGUtcm93XCIpO1xuXG5cdFx0Ly8gQ3JlYXRlIHRoZSBpbm5lciBsaXN0cyB3aXRoIHRoZSBmdWxsIHNpemUgb2YgdGhlIGhlYWRlcnMgYW5kIGJvZHlcblx0XHQvLyBUT0RPIERPIHRoZSBsb2FkIGdyaWQgb25seSB0aGUgZmlyc3QgaXRtZSBhbmQgdGhlbiBkbyB0aGlzIHdoZW4gdGhlIHNpemUgY2hhbmdlc1xuXHRcdGdyaWQucmVzaXplKHRoaXMuX2NvbnRleHQsIHRoaXMuX3NlY3Rpb25zLCB0aGlzLl9wYW5lU2l6ZSk7XG5cdH1cblxuXHQvKipcblx0ICogUG9wdWxhdGUgdGhlIGdpdmVuIGhlYWRlciBwYW5lcyB3aXRoIHRoZSBheGUgZGF0YSBwcm92aWRlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0gIHtBcnJheS48SFRNTEVsZW1lbnQ+fSBwYW5lc1xuXHQgKiBAcGFyYW0gIHtPYmplY3R9IGF4ZVxuXHQgKi9cblx0X3BvcHVsYXRlSGVhZGVyUGFuZXMocGFuZXMsIGF4ZSkge1xuXHRcdHBhbmVzLmZvckVhY2goKHBhbmUsIGkpID0+IHtcblx0XHRcdHZhciBkaXYgPSBkb20ucmVuZGVyKGA8ZGl2IGNsYXNzPVwibGFiZWxcIj48L2Rpdj5gKTtcblx0XHRcdHZhciBoZWFkZXJzID0gYXhlLmhlYWRlcnNbaV07XG5cdFx0XHRoZWFkZXJzID0gaGVhZGVycy5tYXAodmFsID0+IHRoaXMuX2Zvcm1hdEhlYWRlcih2YWwpKTtcblx0XHRcdGRpdi50ZXh0Q29udGVudCA9IGhlYWRlcnMuam9pbihcIiwgXCIpO1xuXHRcdFx0cGFuZS5hcHBlbmRDaGlsZChkaXYpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZvcm1hdHMgYSBzaW5nbGUgaGVhZGVyIGNlbGwgdmFsdWUgYXMgcmV0dXJuZWQgZnJvbSBncmlkIGF4aXMgaGVhZGVycyAoaS5lLiBhcyBwZXIgVGFibGVRdWVyeU91dHB1dCBjZWxscylcblx0ICogQHBhcmFtIHtPYmplY3R8c3RyaW5nfG51bWJlcnxEYXRlfSBoZWFkZXJcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9mb3JtYXRIZWFkZXIoaGVhZGVyKSB7XG5cdFx0aWYgKGhlYWRlcj09PW51bGwgfHwgaGVhZGVyPT09dW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gXCIobm8gdmFsdWUpXCI7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YoaGVhZGVyKSE9PVwib2JqZWN0XCIpIHtcblx0XHRcdC8vIEl0J3MgYSBwcmltaXRpdmUgbnVtYmVyIG9yIHRleHQgKFRPRE86IGZvcm1hdCBudW1iZXJzKVxuXHRcdFx0cmV0dXJuIGhlYWRlcjtcblx0XHR9XG5cdFx0Ly8gSXQncyBhbiBvYmplY3Rcblx0XHRpZiAoaGVhZGVyLmxvd2VyKSB7XG5cdFx0XHQvLyBIaXN0b2dyYW0gYnVja2V0XG5cdFx0XHRyZXR1cm4gdGhpcy5fZm9ybWF0SGVhZGVyKGhlYWRlci5sb3dlcitcIiB0byBcIitoZWFkZXIudXBwZXIpO1xuXHRcdH1cblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbnJlY29nbmlzZWQgaGVhZGVyIGNlbGwgdmFsdWU6IFwiK0pTT04uc3RyaW5naWZ5KGhlYWRlcikpO1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWQgdGhlIGdpdmVuIGRhdGEgaW4gdGhlIGhlYWRlciBwYW5lc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0gIHtPYmplY3R9IGRhdGFcblx0ICovXG5cdF9sb2FkSGVhZGVyc0RhdGEoZGF0YSkge1xuXHRcdGlmICghdGhpcy5faWdub3JlSGVhZGVycyAmJiB0aGlzLl9jb250ZXh0Lm9wdGlvbnMuaXRlbXMucGFuZVkpIHRoaXMuX3BvcHVsYXRlSGVhZGVyUGFuZXModGhpcy5faGVhZGVyUGFuZXMucm93cywgZGF0YS5heGVzWzBdKTtcblx0XHRpZiAoIXRoaXMuX2lnbm9yZUhlYWRlcnMgJiYgdGhpcy5fY29udGV4dC5vcHRpb25zLml0ZW1zLnBhbmVYKSB0aGlzLl9wb3B1bGF0ZUhlYWRlclBhbmVzKHRoaXMuX2hlYWRlclBhbmVzLmNvbHMsIGRhdGEuYXhlc1sxXSk7XG5cdH1cblxuXHRfbG9hZEJvZHlEYXRhKHtncmlkUXVlcnlPdXRwdXQsIGNlbGxRdWVyeU1hcHBpbmdzfSkge1xuXHRcdE9iamVjdC5rZXlzKHRoaXMuX2JvZHlQYW5lcykuZm9yRWFjaChyb3cgPT4ge1xuXHRcdFx0T2JqZWN0LmtleXModGhpcy5fYm9keVBhbmVzW3Jvd10pLmZvckVhY2goY29sID0+IHtcblxuXHRcdFx0XHR2YXIgYm9keVBhbmUgPSB0aGlzLl9ib2R5UGFuZXNbcm93XVtjb2xdO1xuXHRcdFx0XHRib2R5UGFuZS5pbm5lckhUTUwgPSBcIlwiO1xuXG5cdFx0XHRcdGJvZHlQYW5lLmNsYXNzTGlzdC5yZW1vdmUoXCJwYW5pbmctYm9keS1wYW5lLWVtcHR5XCIpO1xuXG4gICAgICAgICAgICAgICAgbGV0IG9iaiA9IHRoaXMuX2NyZWF0ZVBhbmVDb250ZXh0KGJvZHlQYW5lLCBncmlkUXVlcnlPdXRwdXQsIGNlbGxRdWVyeU1hcHBpbmdzLCByb3csIGNvbCk7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmopIHJldHVybjtcbiAgICAgICAgICAgICAgICBsZXQgeyBjb250ZXh0LCB0cnVuY2F0ZWQgfSA9IG9iajtcblxuXHRcdFx0XHQvLyBDcmVhdCB0aGUgcGFuZSBhbmQgd2lyZSB0aGUgY29tbXVuaWNhdGlvbiB3aXRoIHRoZSBncmlkXG5cdFx0XHRcdHRoaXMuX3BhbmVzLnB1c2goXG5cdFx0XHRcdFx0cGFuZUNlbGwuY3JlYXRlKHtcblx0XHRcdFx0XHRcdHBhcmVudDogYm9keVBhbmUsXG5cdFx0XHRcdFx0XHRwYXJlbnRJZDogdGhpcy5faWQsXG5cdFx0XHRcdFx0XHRpZDogYCR7dGhpcy5faWR9XyR7Y29tbS5nZW5lcmF0ZUlkKCl9X3BhbmUtJHtyb3d9LSR7Y29sfWAsXG5cdFx0XHRcdFx0XHRjb250ZXh0LFxuXHRcdFx0XHRcdFx0cmVuZGVyZXI6IHRoaXMuX3JlbmRlcmVyXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQucmVkaXNwYXRjaChbXCJ3aGl0ZXNwYWNlQ2xpY2tcIiwgXCJlcnJvclwiXSwgdGhpcylcblx0XHRcdFx0XHQub24oXCJidXN5XCIsICgpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuZW1pdChcImJ1c3lcIiwgdGhpcy5fcGFuZXMuc29tZShwYW5lID0+IHBhbmUuZ2V0QnVzeSgpKSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQub24oXCJ1cGRhdGVcIiwgKGUpID0+IHtcblxuXHRcdFx0XHRcdFx0dmFyIHNlbGVjdGlvbnMgPSB0aGlzLl9wYW5lcy5maWx0ZXIocGFuZSA9PiBwYW5lLmdldENvbnRleHQoKS52aWV3U2VsZWN0aW9uKTtcblx0XHRcdFx0XHRcdHRoaXMuX2NvbnRleHQudmlld1NlbGVjdGlvbiA9IG51bGw7XG5cdFx0XHRcdFx0XHRpZiAoc2VsZWN0aW9ucy5sZW5ndGgpIHtcblxuXHRcdFx0XHRcdFx0XHR0aGlzLl9jb250ZXh0LnZpZXdTZWxlY3Rpb24gPSBzZWxlY3Rpb25zXG5cdFx0XHRcdFx0XHRcdFx0LnJlZHVjZSgoc2VsZWN0aW9uLCBwYW5lKSA9PiB7XG5cblx0XHRcdFx0XHRcdFx0XHRcdHZhciBjb250ZXh0ID0gcGFuZS5nZXRDb250ZXh0KCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdHNlbGVjdGlvbi5maWx0ZXJzLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0eXBlOiBcIkFORFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRmaWx0ZXJzOiBbXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dC5kYXRhQ29uZmlnLmZpbHRlcixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0LnZpZXdTZWxlY3Rpb25cblx0XHRcdFx0XHRcdFx0XHRcdFx0XVxuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VsZWN0aW9uO1xuXHRcdFx0XHRcdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcdFx0XHRcdHR5cGU6IFwiT1JcIixcblx0XHRcdFx0ICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzOiBbXVxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoZS5kYXRhLmRldmljZXNWaWV3KSB7XG5cdFx0XHRcdFx0XHRcdC8vIEFzc3VtZSB0aGlzIGlzIGEgbm8tcGFuaW5nIGRldmljZXMgdmlldywgcHJvcGFnYXRlIHVwOlxuXHRcdFx0XHRcdFx0XHR0aGlzLl9jb250ZXh0LmRldmljZXNWaWV3ID0gZS5kYXRhLmRldmljZXNWaWV3O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR0aGlzLmVtaXQoXCJ1cGRhdGVcIiwgdGhpcy5fY29udGV4dCk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVBhbmVUcnVuY2F0ZWRXYXRlcm1hcmsoYm9keVBhbmUsIHRydW5jYXRlZCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcbiAgICAgICAgdGhpcy5fbGFzdExvYWRCb2R5RGF0YVdhc05vblBhbmluZ01vZGUgPSB0aGlzLl9pc05vblBhbmluZ01vZGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBwYW5lIGNlbGwgZGF0YSB0byBiZSBnaXZlbiB0byB0aGUgcGFuZSdzIGNlbGwgcXVlcmllcyByZXN1bHQuXG4gICAgICpcbiAgICAgKiBBbHNvIHVwZGF0ZXMgQ1NTIGNsYXNzIGZvciB0aGUgYm9keVBhbmUgZm9yIHdoZXRoZXIgdGhlIGNlbGwgaXMgYSBzcGVjaWFsIGNhc2Ugb2YgYW4gZW1wdHkgY2VsbFxuICAgICAqIChubyBkYXRhIGF0IGludGVyc2VjdGlvbikuXG4gICAgICpcbiAgICAgKiBSZXR1cm5zIG51bGwgaWYgdGhlIGNlbGwgaXMgZW1wdHkgKG5vIGRhdGEpLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZXh0cmFjdFBhbmVDZWxsRGF0YUFuZEhhbmRsZUVtcHR5KGJvZHlQYW5lLCBncmlkUXVlcnlPdXRwdXQsIHJvdywgY29sKSB7XG4gICAgICAgIGxldCBwYW5lQ2VsbERhdGEgPSBudWxsOyAvLyBUaGUgb2JqZWN0IGluIHRoZSBwYW5lIGdyaWQsIHR5cGljYWxseSBhIGJ1bmNoIG9mIHF1ZXJ5IHJlc3VsdHMgYnkga2V5XG5cbiAgICAgICAgLy8gSWYgbm90IGRvaW5nIGF1dG8tcXVlcnksIGNlbGxzIG1heSBub3QgZXZlbiBiZSBzdXBwbGllZDsgd2UgbWlnaHQgb25seSBoYXZlIGhlYWRlcnMgKGdyaWQgcXVlcnkgaW1wbCBkZXBlbmRlbnQpXG4gICAgICAgIGlmIChncmlkUXVlcnlPdXRwdXQuY2VsbHMpIHtcbiAgICAgICAgICAgIGlmIChncmlkUXVlcnlPdXRwdXQuY2VsbHMubGVuZ3RoPT09MCB8fCBncmlkUXVlcnlPdXRwdXQuY2VsbHNbMF0ubGVuZ3RoPT09MCkge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFwcGVucyB3aGVuIHRoZXJlIGlzIG5vIGRhdGEsIGFuZCBiZWNhdXNlIHBhbmluZyBpcyBub3QgY29uZmlndXJlZCxcbiAgICAgICAgICAgICAgICAvLyB3ZSBkb24ndCBib3RoZXIgdG8gZG8gYSBcInNpemVcIiByZXF1ZXN0IGFuZCBhc3N1bWUgaXQgaXMgMXgxLFxuICAgICAgICAgICAgICAgIC8vIGJ1dCB3aGVuIHdlIGdldCB0aGUgZGF0YSByZXNwb25zZSwgaXQgaXMgaW4gZmFjdCAweDAuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzTm9uUGFuaW5nTW9kZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vbi1wYW5pbmcgbW9kZS4gQmVoYXZlIGFzIGlmIHBhbmluZyBpc24ndCBwcmVzZW50LCBhbmQgcGFzcyB0aGlzIHN0YXRlIHRocm91Z2ggdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHBhbmUgY2VsbCB3aGljaCBtdXN0IGJlIGNyZWF0ZWQuXG4gICAgICAgICAgICAgICAgICAgIC8vIEZha2UgdXAgdGhlIHJlc3VsdCBvZiBhIHplcm8tcmVjb3JkIGNlbGwgcXVlcnk6XG4gICAgICAgICAgICAgICAgICAgIGxldCBmYWtlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcXVlcnk6IFtdXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jb250ZXh0LmRhdGFDb25maWcuc2hhZG93RmlsdGVyKSB7IC8vIGJydXNoaW5nIGlzIGFjdGl2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZmFrZS5zaGFkb3dRdWVyeSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJvZHlQYW5lLmNsYXNzTGlzdC5yZW1vdmUoXCJwYW5pbmctYm9keS1wYW5lLWVtcHR5XCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFrZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYm9keVBhbmUuY2xhc3NMaXN0LmFkZChcInBhbmluZy1ib2R5LXBhbmUtZW1wdHlcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIERvbid0IHJlbmRlciBhbnl0aGluZyBpbiB0aGlzIGNlbGxcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcGFuZUNlbGxEYXRhID0gZ3JpZFF1ZXJ5T3V0cHV0LmNlbGxzW3JvdyAtIHRoaXMuX3Jvd11bY29sIC0gdGhpcy5fY29sXTtcblxuICAgICAgICAgICAgaWYgKCFwYW5lQ2VsbERhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGF1dG8tcXVlcnksIGJ1dCB0aGVyZSBpcyBubyBkYXRhIGluIHRoaXMgcGFuZSBjZWxsLlxuICAgICAgICAgICAgICAgIC8vIE5vdGUsIGlmIHdlIGFyZW4ndCBkb2luZyBhdXRvLXF1ZXJ5LCB0aGVyZSBpcyBubyB3YXkgb2YgdGVsbGluZyBpZiB0aGUgY2VsbCBpcyBlbXB0eVxuICAgICAgICAgICAgICAgIC8vIG9mIGRhdGEuIFRoZSBjZWxscyAoaW50ZXJzZWN0aW9uIG9mIHJvdy9jb2x1bW4gZmlsdGVycykgYXJlIG9ubHkgZXZhbHVhdGVkIGlmIHdlXG4gICAgICAgICAgICAgICAgLy8gaGF2ZSBjZWxsIHF1ZXJpZXMuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzTm9uUGFuaW5nTW9kZSgpKSBib2R5UGFuZS5jbGFzc0xpc3QucmVtb3ZlKFwicGFuaW5nLWJvZHktcGFuZS1lbXB0eVwiKTtcbiAgICAgICAgICAgICAgICBlbHNlIGJvZHlQYW5lLmNsYXNzTGlzdC5hZGQoXCJwYW5pbmctYm9keS1wYW5lLWVtcHR5XCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBEb24ndCByZW5kZXIgYW55dGhpbmcgaW4gdGhpcyBjZWxsXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFuZUNlbGxEYXRhO1xuICAgIH1cblxuICAgIF91cGRhdGVQYW5lVHJ1bmNhdGVkV2F0ZXJtYXJrKGJvZHlQYW5lLCB0cnVuY2F0ZWQpIHtcbiAgICAgICAgd2F0ZXJtYXJrLnRvZ2dsZShib2R5UGFuZSwgdHJ1bmNhdGVkID8gY29udGV4dFV0aWwuZGF0YS5nZXRMaW1pdCh0aGlzLl9jb250ZXh0KSA6IDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4gez97Y29udGV4dCwgdHJ1bmNhdGVkfX0gVmlld0FwaUNvbnRleHQsIG9yIG51bGxcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jcmVhdGVQYW5lQ29udGV4dChib2R5UGFuZSwgZ3JpZFF1ZXJ5T3V0cHV0LCBjZWxsUXVlcnlNYXBwaW5ncywgcm93LCBjb2wpIHtcbiAgICAgICAgbGV0IHBhbmVDZWxsRGF0YSA9IHRoaXMuX2V4dHJhY3RQYW5lQ2VsbERhdGFBbmRIYW5kbGVFbXB0eShib2R5UGFuZSwgZ3JpZFF1ZXJ5T3V0cHV0LCByb3csIGNvbCk7XG4gICAgICAgIGlmIChwYW5lQ2VsbERhdGE9PT1udWxsKSByZXR1cm4gbnVsbDsgLy8gZW1wdHkgb2YgZGF0YVxuXG4gICAgICAgIC8vIENsb25lIHRoZSBjb250ZXh0IGFuZCBwdXQgdGhlIGRhdGEgaW5cbiAgICAgICAgdmFyIGNvbnRleHQgPSBjbG9uZSh0aGlzLl9jb250ZXh0KTtcblxuICAgICAgICBpZiAoIXRoaXMuX2lzTm9uUGFuaW5nTW9kZSgpKSB7XG4gICAgICAgICAgICAvLyBJLmUuIHBhbmluZyBpcyBlbmFibGVkLiBBZGQgc3R1ZmYgdGhhdCBpcyBvbmx5IG5lZWRlZCB3aGVuIHBhbmluZyBpcyBjb25maWd1cmVkOlxuICAgICAgICAgICAgLy8gUGFuZSBjb29yZHMsIGFuZCBwYW5lLXNwZWNpZmljIGZpbHRlcnMuXG5cbiAgICAgICAgICAgIC8vIFRPRE86IHdoYXQgaXMgdGhpcyBmb3I/IEl0IGlzIE5PVCB0aGUgdmlldyBpbnN0YW5jZSBJRCEgIFdyb25nLlxuICAgICAgICAgICAgY29udGV4dC52aWV3SW5zdGFuY2VJZCArPSBgLXZpZXctJHtyb3d9LSR7Y29sfWA7XG5cbiAgICAgICAgICAgIGNvbnRleHQucGFuZSA9IHt4OiBjb2wsIHk6IHJvd307IC8vIEF1dG9QYW5lQ2VsbFxuXG4gICAgICAgICAgICAvLyBSZS1saW5rIGZpbHRlcnMgdG8gcGVyLXBhbmUsIHdpdGggZ2xvYmFsIGFzIGJhc2U6XG4gICAgICAgICAgICB2YXIgcGFuZVhGaWx0ZXIgPSB0aGlzLl9jcmVhdGVBeGlzRmlsdGVyKGdyaWRRdWVyeU91dHB1dC5heGVzWzFdLCBjb2wgLSB0aGlzLl9jb2wsIGNvbnRleHQub3B0aW9ucy5pdGVtcy5wYW5lWCk7XG4gICAgICAgICAgICB2YXIgcGFuZVlGaWx0ZXIgPSB0aGlzLl9jcmVhdGVBeGlzRmlsdGVyKGdyaWRRdWVyeU91dHB1dC5heGVzWzBdLCByb3cgLSB0aGlzLl9yb3csIGNvbnRleHQub3B0aW9ucy5pdGVtcy5wYW5lWSk7XG4gICAgICAgICAgICBjb250ZXh0LmRhdGFDb25maWcuYmFzZUZpbHRlciA9IGNvbnRleHQuZGF0YUNvbmZpZy5maWx0ZXI7XG4gICAgICAgICAgICBjb250ZXh0LmRhdGFDb25maWcuZmlsdGVyID0geyB0eXBlOiBcIkFORFwiLCBmaWx0ZXJzOiBbXG4gICAgICAgICAgICAgICAgcGFuZVhGaWx0ZXIsXG4gICAgICAgICAgICAgICAgcGFuZVlGaWx0ZXJcbiAgICAgICAgICAgIF19O1xuXG4gICAgICAgICAgICBpZiAoY29udGV4dC5kYXRhQ29uZmlnLmJhc2VGaWx0ZXIpIGNvbnRleHQuZGF0YUNvbmZpZy5maWx0ZXIuZmlsdGVycy5wdXNoKGNvbnRleHQuZGF0YUNvbmZpZy5iYXNlRmlsdGVyKTtcblxuICAgICAgICAgICAgaWYgKGNvbnRleHQuZGF0YUNvbmZpZy5zaGFkb3dGaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmRhdGFDb25maWcuYmFzZVNoYWRvd0ZpbHRlciA9IGNvbnRleHQuZGF0YUNvbmZpZy5zaGFkb3dGaWx0ZXI7XG4gICAgICAgICAgICAgICAgY29udGV4dC5kYXRhQ29uZmlnLnNoYWRvd0ZpbHRlciA9IHsgdHlwZTogXCJBTkRcIiwgZmlsdGVyczogW1xuICAgICAgICAgICAgICAgICAgICBwYW5lWEZpbHRlcixcbiAgICAgICAgICAgICAgICAgICAgcGFuZVlGaWx0ZXJcbiAgICAgICAgICAgICAgICBdfTtcbiAgICAgICAgICAgICAgICBpZiAoY29udGV4dC5kYXRhQ29uZmlnLmJhc2VGaWx0ZXIpIGNvbnRleHQuZGF0YUNvbmZpZy5zaGFkb3dGaWx0ZXIuZmlsdGVycy5wdXNoKGNvbnRleHQuZGF0YUNvbmZpZy5iYXNlU2hhZG93RmlsdGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0cnVuY2F0ZWQgPSBmYWxzZTtcblxuICAgICAgICBpZiAocGFuZUNlbGxEYXRhKSB7XG4gICAgICAgICAgICAvLyBpLmUuIGlmIHdlIGhhdmUgYXV0byBxdWVyeSAodmlhIGF1dG9RdWVyeT10cnVlIGluIG1hbmlmZXN0LCBvciB2aWEgM3JkIHBhcnR5IHVzZSBvZiBwYW5pbmdcbiAgICAgICAgICAgIC8vIHNwZWNpZnlpbmcgYXV0b1F1ZXJ5PXRydWUgaW4gY2FsbCB0byBvbW5pc2NvcGUudmlldy5xdWVyeWluZy5ncmlkKCkpOlxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBwYXJhbSBncmlkUXVlcnlPdXRwdXQgVGhlIHJlc3VsdCBvZiB0aGUgZ3JpZCBxdWVyeSBpbmNsdWRpbmcgbWV0YSBzY2hlbWEgZm9yIGVhY2gga2V5XG4gICAgICAgICAgICAgKiBAcGFyYW0gcGFuZUNlbGxEYXRhIFRoZSBjZWxsIGRhdGEgZm9yIHRoZSBwYW5lIGNvbnRhaW5pbmcgYSBcInJlY29yZHNcIiBhcnJheSBmb3IgZWFjaCBrZXlcbiAgICAgICAgICAgICAqIEBwYXJhbSBjZWxsUXVlcnlLZXkgVGhlIGtleSAoXCJxdWVyeVwiIG9yIFwic2hhZG93UXVlcnlcIikuXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBhIFRhYmxlUXVlcnlPdXRwdXQgcmVjb25zdGl0dXRlZCBmcm9tIHRoZSBncmlkIHF1ZXJ5LCBvciBudWxsIGlmIHRoZSBrZXkgd2Fzbid0IHByZXNlbnQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHZhciBjcmVhdGVUYWJsZVF1ZXJ5T3V0cHV0ID0gKGdyaWRRdWVyeU91dHB1dCwgcGFuZUNlbGxEYXRhLCBjZWxsUXVlcnlLZXkpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgcmVjb3JkcyA9IHBhbmVDZWxsRGF0YVtjZWxsUXVlcnlLZXldOyAvLyBhcnJheSBvZiBbeV1beF0gcmF3IGRhdGEgZm9yIGEgdGFibGUgcXVlcnlcbiAgICAgICAgICAgICAgICBpZiAoIXJlY29yZHMpIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICAgICAgdmFyIHNjaGVtYSA9IGdyaWRRdWVyeU91dHB1dC5jZWxsUXVlcmllc1NjaGVtYVtjZWxsUXVlcnlLZXldOyAvLyBhIFNjaGVtYUZpZWxkc1F1ZXJ5T3V0cHV0XG4gICAgICAgICAgICAgICAgaWYgKCFzY2hlbWEpIHRocm93IG5ldyBFcnJvcihcIkRhdGEgYnV0IG5vIHNjaGVtYVwiKTsgLy8gbm8gY2VsbCBxdWVyaWVzIG1ldGFcblxuICAgICAgICAgICAgICAgIC8vIEFwcGx5IGF1dG8gbGltaXQgZnJvbSBtYW5pZmVzdCAoZGVmYXVsdCAxMCwwMDApOlxuICAgICAgICAgICAgICAgIHZhciBsaW1pdCA9IGNvbnRleHRVdGlsLmRhdGEuZ2V0TGltaXQodGhpcy5fY29udGV4dCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnRleHRVdGlsLmRhdGEudHJ1bmNhdGVSZWNvcmRzKHtyZWNvcmRzLCBsaW1pdH0pKSB0cnVuY2F0ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgc2NoZW1hLCByZWNvcmRzIH07IC8vIGEgVGFibGVRdWVyeU91dHB1dFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29udGV4dC5yZXN1bHQgPSB7IC8vIEF1dG9RdWVyeVJlc3VsdFxuICAgICAgICAgICAgICAgIGRhdGE6IFx0XHRjcmVhdGVUYWJsZVF1ZXJ5T3V0cHV0KGdyaWRRdWVyeU91dHB1dCwgcGFuZUNlbGxEYXRhLCBcInF1ZXJ5XCIpLCAvLyBzaG91bGQgbm90IGJlIG51bGwgZXZlclxuICAgICAgICAgICAgICAgIHNoYWRvd0RhdGE6IGNyZWF0ZVRhYmxlUXVlcnlPdXRwdXQoZ3JpZFF1ZXJ5T3V0cHV0LCBwYW5lQ2VsbERhdGEsIFwic2hhZG93UXVlcnlcIiksIC8vIG51bGwgd2hlbiBub3QgYnJ1c2hpbmdcbiAgICAgICAgICAgICAgICBtYXBwaW5nczogICBjZWxsUXVlcnlNYXBwaW5nc1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB9IC8vIGVsc2UsIG5vdCBhdXRvIHF1ZXJ5aW5nLiBEbyBub3QgZGVmaW5lIGNvbnRleHQucmVzdWx0LlxuXG4gICAgICAgIHJldHVybiB7IGNvbnRleHQsIHRydW5jYXRlZCB9O1xuICAgIH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGF4aXNSZXN1bHQgLSBhIEdyaWRBeGlzT3V0cHV0IGZyb20gcXVlcnkgQVBJXG5cdCAqIEBwYXJhbSBpbmRleCBUaGUgaW5kZXggd2l0aGluIHRoZSBwYW5lIGdyaWQsIHJlbGF0aXZlIHRvIHRoZSBxdWVyeSBvcmlnaW4gKGZsYXR0ZW5lZCBncmlkIG9mIG11bHRpcGxlIHRpZXJzKSwgaS5lLiBjb2x1bW4gb3Igcm93IGluIHJlc3VsdFxuXHQgKiBAcGFyYW0ge0FycmF5LjxPYmplY3Q+fSBvcHRzIEFycmF5IG9mIEdyb3VwaW5nIG9iamVjdHMgcmVzcGVjdGl2ZSB0byBncmlkIHRpZXJzIGluIHRoaXMgYXhpc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2NyZWF0ZUF4aXNGaWx0ZXIoYXhpc1Jlc3VsdCwgaW5kZXgsIG9wdHMpIHtcblx0XHR2YXIgZGF0YSA9IGF4aXNSZXN1bHQuaGVhZGVyc1tpbmRleF07IC8vIGFuIGFycmF5IG9mIGFsbCB0aGUgaGVhZGVycyBmb3IgdGhpcyByb3cvY29sdW1uLCBlYWNoIHJlc3BlY3RpdmUgdG8gb3B0aW9uc1xuXHRcdHZhciBmaWx0ZXIgPSB7XG5cdFx0XHR0eXBlOiBcIkFORFwiLFxuXHRcdFx0ZmlsdGVyczogW11cblx0XHR9O1xuXHRcdGlmICghb3B0cykge1xuXHRcdFx0Ly8gVGhpcyBpcyB0aGUgXCJBbGxcIiBjb2x1bW4vcm93LCB3aGVuIG5vIHBhbmluZyBpbiB0aGlzIGF4aXMgaXMgY29uZmlndXJlZC5cblx0XHRcdHJldHVybiBmaWx0ZXI7IC8vIFwiQWxsXCIgZmlsdGVyXG5cdFx0fVxuXHRcdGlmICghQXJyYXkuaXNBcnJheShvcHRzKSkgb3B0cyA9IFtvcHRzXTsgLy8gZS5nLiBpZiBwYW5lWCBpc24ndCBjb25maWd1cmVkIGFzIGEgbGlzdFxuXHRcdGZvciAodmFyIHRpZXI9MDsgdGllcjxkYXRhLmxlbmd0aDsgdGllcisrKSB7XG5cdFx0XHRmaWx0ZXIuZmlsdGVycy5wdXNoKHtcblx0XHRcdFx0dHlwZTogXCJGSUVMRF9WQUxVRVwiLFxuXHRcdFx0XHRpbnB1dEZpZWxkOiBvcHRzW3RpZXJdLmlucHV0RmllbGQsXG5cdFx0XHRcdG9wZXJhdG9yOiBcIj1cIixcblx0XHRcdFx0dmFsdWU6IGRhdGFbdGllcl1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gZmlsdGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0aGF0IHdlIGludm9rZSB3aGVuIHdlIHdhbnQgdG8gZmVlZCBkYXRhIGZvciB0aGUgcGFuZXMgdG8gdGhlIGdyaWQuIEJhc2ljYWxseSBpdCBzaG91bGQgcmV2Y2VpdmUgdGhlIHJlc3VsdFxuXHQgKiBvZiBhIGdyaWQgcXVlcnkgYW5kIGl0IHdpbGwgZGlzdHJpYnV0ZSB0aGUgZGF0YSBpbiB0aGUgcGFuZXNcblx0ICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXG5cdCAqIEByZXR1cm4ge1BhbmluZ31cblx0ICovXG5cdGxvYWREYXRhKHtncmlkUXVlcnlPdXRwdXQsIGNlbGxRdWVyeU1hcHBpbmdzLCBpZH0pIHtcblx0XHRpZiAoaWQhPT10aGlzLl9jdXJOZWVkRGF0YUlkKSB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhcInNraXAgb2xkIGRhdGFcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5fbG9nZ2VyLmxvZyhcIkxvYWRpbmcgZ3JpZCAgd2l0aCBkYXRhOlwiLCBncmlkUXVlcnlPdXRwdXQpO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc05vblBhbmluZ01vZGUoKSAmJiB0aGlzLl9sYXN0TG9hZEJvZHlEYXRhV2FzTm9uUGFuaW5nTW9kZSkge1xuICAgICAgICAgICAgLy8gTm90IGF1dG8tcGFuaW5nLlxuICAgICAgICAgICAgLy8gQW5kIHRoZSBzaW5nbGUgJ3BhbmUnIGhhcyBhbHJlYWR5IGJlZW4gY3JlYXRlZC5cbiAgICAgICAgICAgIC8vIERpc2FibGUgYWxsIHBhbmluZyBtb2pvLCBhbmQgaW5zdGVhZCBqdXN0IHBhc3MgdG8gbmVzdGVkIHBhbmUuXG4gICAgICAgICAgICAvLyBUaGlzIGlzIGEgZGlydHkgc3RvcCBnYXAgdW50aWwgd2UgaGF2ZSBSZWFjdCBkcml2ZW4gcGFuaW5nLCB0byBzdG9wIHRoZSByZWxvYWRzLlxuICAgICAgICAgICAgLy8gRnJvbSBfbG9hZEJvZHlEYXRhIGFib3ZlOlxuICAgICAgICAgICAgbGV0IHJvdz0wLCBjb2w9MDtcbiAgICAgICAgICAgIGxldCBib2R5UGFuZSA9IHRoaXMuX2JvZHlQYW5lc1tyb3ddW2NvbF07XG4gICAgICAgICAgICBsZXQgb2JqID0gdGhpcy5fY3JlYXRlUGFuZUNvbnRleHQoYm9keVBhbmUsIGdyaWRRdWVyeU91dHB1dCwgY2VsbFF1ZXJ5TWFwcGluZ3MsIHJvdywgY29sKTtcbiAgICAgICAgICAgIGlmICghb2JqKSByZXR1cm47XG4gICAgICAgICAgICBsZXQgeyBjb250ZXh0LCB0cnVuY2F0ZWQgfSA9IG9iajtcbiAgICAgICAgICAgIHRoaXMuX3BhbmVzWzBdLnVwZGF0ZShjb250ZXh0KTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVBhbmVUcnVuY2F0ZWRXYXRlcm1hcmsoYm9keVBhbmUsIHRydW5jYXRlZCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuXHRcdC8vIENsZWFyIHByZXZpb3VzIGVuZHBvaW50cyBiZWZvcmUgY3JlYXRpbmcgbmV3IG9uZXMgZm9yIHRoZSBuZXcgcGFuZXNcblx0XHR0aGlzLl9jbGVhclBhbmVzKCk7XG5cblx0XHR0aGlzLl9sb2FkSGVhZGVyc0RhdGEoZ3JpZFF1ZXJ5T3V0cHV0KTtcblx0XHR0aGlzLl9sb2FkQm9keURhdGEoe2dyaWRRdWVyeU91dHB1dCwgY2VsbFF1ZXJ5TWFwcGluZ3N9KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkIHRoZSBwYW5lcyBmb3IgdGhlIGdpdmVuIHJhbmdlXG5cdCAqL1xuXHRfYnVpbGRQYW5lcygpIHtcblx0XHRpZiAoIXRoaXMuX3BhbmVTaXplVmFsaWQpIHJldHVybjsgLy8gc3RpbGwgd2FpdGluZyBmb3Igc2l6ZVxuXG5cdFx0dmFyIHJhbmdlO1xuXG5cdFx0Ly8gVE9ETzogQ2hhbmdlIHRoZSByYW5nZSBsb2dpYyBhbmQgbWFrZSBpdCBzbyBpdCBhZGRzIGEgbWFyZ2luIGFyb3VuZCB0aGUgdmlld3BvcnQgc28geW91IGNhbiBzZWUgbW9yZSB0aGFuIHRoZSBjdXJyZW50IHBhZ2Vcblx0XHRyYW5nZSA9IHtcblx0XHRcdHg6IHtzdGFydDogdGhpcy5fY29sLCBsZW5ndGg6IE1hdGgubWluKHRoaXMuX3BhbmVTaXplLnZpZXdwb3J0LmNvbHMgKyAxLCB0aGlzLl9wYW5lU2l6ZS50b3RhbC5jb2xzIC0gdGhpcy5fY29sKX0sXG5cdFx0XHR5OiB7c3RhcnQ6IHRoaXMuX3JvdywgbGVuZ3RoOiBNYXRoLm1pbih0aGlzLl9wYW5lU2l6ZS52aWV3cG9ydC5yb3dzICsgMSwgdGhpcy5fcGFuZVNpemUudG90YWwucm93cyAtIHRoaXMuX3Jvdyl9XG5cdFx0fTtcblxuXHRcdHRoaXMuX2hlYWRlclBhbmVzID0gZ3JpZC5oZWFkZXJzKHJhbmdlLCB0aGlzLl9wYW5lU2l6ZSk7XG5cblx0XHR0aGlzLl9zZWN0aW9ucy5yb3dIZWFkZXJzLmZvckVhY2goaGVhZGVyID0+IHtcblx0XHRcdGhlYWRlci5maXJzdENoaWxkLmlubmVySFRNTCA9IFwiXCI7XG5cdFx0XHR0aGlzLl9oZWFkZXJQYW5lcy5yb3dzLmZvckVhY2gocm93ID0+IGhlYWRlci5maXJzdENoaWxkLmFwcGVuZENoaWxkKHJvdykpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5fc2VjdGlvbnMuY29sSGVhZGVycy5mb3JFYWNoKGhlYWRlciA9PiB7XG5cdFx0XHRoZWFkZXIuZmlyc3RDaGlsZC5pbm5lckhUTUwgPSBcIlwiO1xuXHRcdFx0dGhpcy5faGVhZGVyUGFuZXMuY29scy5mb3JFYWNoKGNvbCA9PiBoZWFkZXIuZmlyc3RDaGlsZC5hcHBlbmRDaGlsZChjb2wpKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuX2JvZHlQYW5lcyA9IGdyaWQuYm9keShyYW5nZSwgdGhpcy5fcGFuZVNpemUpO1xuXG5cdFx0Ly8gQ2xlYXIgdGhlIGJvZHlcblx0XHR0aGlzLl9jbGVhclBhbmVzKCk7XG5cdFx0dGhpcy5fc2VjdGlvbnMuYm9keS5maXJzdENoaWxkLmlubmVySFRNTCA9IFwiXCI7XG5cblx0XHQvLyBBcHBlbmQgdGhlIGJvZHkgcGFuZXMgdG8gdGhlIGJvZHlcblx0XHRPYmplY3Qua2V5cyh0aGlzLl9ib2R5UGFuZXMpLmZvckVhY2gocm93ID0+IHtcblx0XHRcdE9iamVjdC5rZXlzKHRoaXMuX2JvZHlQYW5lc1tyb3ddKS5mb3JFYWNoKGNvbCA9PiB7XG5cdFx0XHRcdHRoaXMuX3NlY3Rpb25zLmJvZHkuZmlyc3RDaGlsZC5hcHBlbmRDaGlsZCh0aGlzLl9ib2R5UGFuZXNbcm93XVtjb2xdKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdFx0Ly8gQWZ0ZXIgYSByZXNpemUgd2Ugd2lsbCBuZWVkIG5ldyBkYXRhXG5cdFx0dGhpcy5lbWl0KFwibmVlZC1kYXRhXCIsIHsgY29udGV4dDogdGhpcy5fY29udGV4dCwgcmFuZ2U6IHJhbmdlLCBpZDogdGhpcy5fY3VyTmVlZERhdGFJZCB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIHNpemUgb2YgdGhlIHBhbmUuIFRoZSBkYXRhIHNob3VsZCBiZSB0aGUgcmVzdWx0IG9mIGEgZ3JpZCBzaXplIHF1ZXJ5XG5cdCAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxuXHQgKiBAcmV0dXJuIHtQYW5pbmd9XG5cdCAqL1xuXHRzZXRTaXplKHtkYXRhLCBpZH0pIHtcblx0XHRpZiAoaWQhPT10aGlzLl9jdXJOZWVkU2l6ZUlkKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcInNraXAgb2xkIHNpemVcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5fYXhlcyA9IGRhdGEuYXhlcztcblxuXHRcdHRoaXMuX2xvZ2dlci5pbmZvKFwiUmVjZWl2ZSBuZXcgc2l6ZSBkYXRhXCIsIGRhdGEpO1xuXG5cdFx0Ly8gVE9ETzsgRG8gdGhpcyBvbmx5IGlmIHRoZSBjb250ZXh0IG9wdGlvbnMgZm9yIHRoZSBwYW5lcyBjaGFuZ2Vcblx0XHR0aGlzLl9sb2FkR3JpZCh0aGlzLl9jb250ZXh0LCB0aGlzLl9heGVzKTtcblxuXHRcdC8vIFdlIHJlc2V0IHRoZSBzY3JvbGwgcG9zaXRpb24gd2hlbiB3ZSByZXNpemUgIHNpbmNlIHRoZSBwYW5lIHNpemUgY2hhbmdlLiBUaGF0IHdpbGwgdHJpZ2dlciBhIHJlYnVpbGQgb2YgdGhlXG5cdFx0Ly8gcGFuZXMgYW5kIHdpbGwgZW1pdCB0aGUgbmVlZC1kYXRhIGV2ZW50IGl0c2VsZlxuXHRcdHRoaXMuX3Jlc2V0U2Nyb2xsKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDbGVhciB0aGUgZW5wb2ludHMgYnkgZmlyc3QgYnJvYWRjYXN0aW5nIGEgZGlzcG9zZSBtZXNzYWdlIGFuZCB0aGVuIGNhbGxpbmcgdGhlIGRpc3Bvc2UgZXZlbnQgaW4gdGhlbSBhbmQgY2xlYXJpbmdcblx0ICogdGhlIHBhbmluZyBncmlkIGxpc3Rcblx0ICovXG5cdF9jbGVhclBhbmVzKCkge1xuXHRcdGNvbW0uYnJvYWRjYXN0KHRoaXMuX2lkLCBcImRpc3Bvc2VcIik7IC8vIFNlbmQgZGlzcG9zZSB0byBhbGwgdGhlIHBhbmVzIHdpdGggYnJvYWRjYXN0XG5cdFx0Y29tbS5jbGVhcih0aGlzLl9pZCk7XG5cblx0XHR0aGlzLl9wYW5lcy5mb3JFYWNoKHBhbmUgPT4gcGFuZS5kaXNwb3NlKCkpO1xuXHRcdHRoaXMuX3BhbmVzID0gW107XG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlIHRoZSBjb250ZXh0IGZvciB0aGUgcGFuaW5nIGdyaWQuIFJpZ2h0IG5vdyBpdCB3aWxsIGFsd2F5cyByZXF1ZXN0IG5ldyBzaXplIGFuZCBkYXRhLlxuXHQgKiBUT0RPOiBNYWtlIGl0IHNvIGl0IHdpbGwgb25seSByZXF1ZXN0IHRoZSBkYXRhIGlzIGl0IG5lZWRzIHRvLCB0aGF0cyBpZiB0aGUgZmlsdGVycyBjaGFuZ2UsIHRoZSBwYW5lIG9wdGlvbnMsIGV0Yy5cblx0ICogQHBhcmFtICB7T2JqZWN0fSBjb250ZXh0XG5cdCAqIEByZXR1cm4ge1BhbmluZ31cblx0ICovXG5cdHVwZGF0ZShjb250ZXh0KSB7XG5cblx0XHR0aGlzLl9sb2dnZXIuaW5mbyhcIlJlY2VpdmVkIG5ldyBjb250ZXh0XCIsIGNvbnRleHQpO1xuXG5cdFx0dGhpcy5fY29udGV4dCA9IGNvbnRleHQ7IC8vIHNob3VsZG4ndCBuZWVkIHRvIGNsb25lIGF0IHRoZSB0b3AgbGV2ZWxcblxuICAgICAgICBpZiAodGhpcy5faXNOb25QYW5pbmdNb2RlKCkgJiYgdGhpcy5fbGFzdExvYWRCb2R5RGF0YVdhc05vblBhbmluZ01vZGUpIHtcbiAgICAgICAgICAgIC8vIE5vdCBhdXRvLXBhbmluZy4gQW5kIHBhbmluZyBkaXNhYmxlZCBpbiBtYW5pZmVzdC4gVGhpcyBpbnN0YW5jZSBvZiBQYW5pbmcgd2lsbCBuZXZlciBwYW5lLlxuICAgICAgICAgICAgLy8gRGlzYWJsZSBhbGwgcGFuaW5nIG1vam8sIGFuZCBpbnN0ZWFkIGp1c3QgcGFzcyB0byBuZXN0ZWQgcGFuZS5cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYSBkaXJ0eSBzdG9wIGdhcCB1bnRpbCB3ZSBoYXZlIFJlYWN0IGRyaXZlbiBwYW5pbmcsIHRvIHN0b3AgdGhlIHJlbG9hZHMuXG4gICAgICAgICAgICB0aGlzLmVtaXQoXCJuZWVkLWRhdGFcIiwge1xuICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuX2NvbnRleHQsXG4gICAgICAgICAgICAgICAgcmFuZ2U6IHt4OiB7c3RhcnQ6MCwgbGVuZ3RoOjF9LCB5OiB7c3RhcnQ6MCwgbGVuZ3RoOjF9fSxcbiAgICAgICAgICAgICAgICBpZDogdGhpcy5fY3VyTmVlZERhdGFJZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuXHRcdC8vIENsZWFyIGFsbCB0aGUgcHJldmlvdXMgZW5kcG9pbnRzIG9mIHRoaXMgZ3JpZCwgYXMgd2UgZ290IGEgbmV3IGNvbnRleHQgd2UgYXJlIGdvaW5nIHRvIHJlYnVpbGQhXG5cdFx0Ly8gVE9ETzsgRG8gdGhpcyBvbmx5IHdoZW4gd2UgbmVlZCB0byByZWJ1aWxkLCBzbyBmb3Igc3BlY2lmaWMgc2V0dGluZ3MgaW5zdGVhZCBvZiBhbHdheXNcblx0XHR0aGlzLl9jbGVhclBhbmVzKCk7XG5cblx0XHR0aGlzLl9uZXdOZWVkU2l6ZUlkKCk7IC8vIHdpbGwgY2FuY2VsIGV4aXN0aW5nIGRhdGEgcmVxdWVzdHMgdG9vXG4gICAgICAgIHRoaXMuX3BhbmVTaXplVmFsaWQgPSBmYWxzZTsgLy8gZGlzYWJsZSBuZXcgZGF0YSByZXF1ZXN0cyB1bnRpbCB1cGRhdGVkIHNpemUgcmVjZWl2ZWRcblx0XHRyZXR1cm4gdGhpcy5lbWl0KFwibmVlZC1zaXplXCIsIHsgY29udGV4dDogdGhpcy5fY29udGV4dCwgaWQ6IHRoaXMuX2N1ck5lZWRTaXplSWQgfSk7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcnMgdGhlIGluaXRpYWwgbmVlZC1zaXplXG5cdCAqL1xuXHRzdGFydCgpIHtcblx0XHR0aGlzLl9uZXdOZWVkU2l6ZUlkKCk7XG5cdFx0cmV0dXJuIHRoaXMuZW1pdChcIm5lZWQtc2l6ZVwiLCB7IGNvbnRleHQ6IHRoaXMuX2NvbnRleHQsIGlkOiB0aGlzLl9jdXJOZWVkU2l6ZUlkIH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXIgZm9yIHRoZSByZXNpemUgZXZlbnQgZm9yIHRoZSBjdXNvdG0gdmlldy4gSXQgc2hvdWxkIGJlIGludm9rZWQgd2hlbiB0aGUgdmlld3BvcnQgZm9yIHRoZSB2aWV3IGNoYW5nZXNcblx0ICogYW5kIGl0IHdpbGwgY2FsY3VsYXRlIHRoZSBuZXcgdmlld3BvcnQgZm9yIHRoZSBwYW5pbmcgZ3JpZCBhbmQgdXBkYXRlIGl0IGFjY29yZGluZ2x5XG5cdCAqIEBwYXJhbSB7RE9NUmVjdH0gc2l6ZVxuXHQgKiBAcmV0dXJuIHtQYW5pbmd9XG5cdCAqL1xuXHRyZXNpemUoc2l6ZSkge1xuXHRcdC8vIFJpZ2h0IG5vdyB3ZSByZWJ1aWxkIGV2ZXJ5IHRpbWUuIEluZiB1dHVyZSB3ZSBjYW4gYnJvYWRjYXN0IGluc3RlYWQgb2YgY2FsbGluZyBwZXIgcGFuZSBzaW5jZVxuXHRcdC8vIHdlIGRvbnQgc2VuZCBhbnkgc2l6ZSB3ZSBqc3V0IG5vdGlmeSB0aGF0IGEgc2l6ZSBjaGFuZ2UgaGFwcGVuZWRcblx0XHQvLyBjb21tLmJyb2FkY2FzdCh0aGlzLl9pZCwgXCJyZXNpemVcIik7XG5cblx0XHQvLyBUT0RPOyBEbyB0aGlzIG9ubHkgaWYgdGhlIGNvbnRleHQgb3B0aW9ucyBmb3IgdGhlIHBhbmVzIGNoYW5nZVxuXHRcdHRoaXMuX2xvYWRHcmlkKHRoaXMuX2NvbnRleHQsIHRoaXMuX2F4ZXMpO1xuXG5cdFx0Ly8gV2UgcmVzZXQgdGhlIHNjcm9sbCBwb3NpdGlvbiB3aGVuIHdlIHJlc2l6ZSAgc2luY2UgdGhlIHBhbmUgc2l6ZSBjaGFuZ2UuIFRoYXQgd2lsbCB0cmlnZ2VyIGEgcmVidWlsZCBvZiB0aGVcblx0XHQvLyBwYW5lcyBhbmQgd2lsbCBlbWl0IHRoZSBuZWVkLWRhdGEgZXZlbnQgaXRzZWxmXG5cdFx0dGhpcy5fcmVzZXRTY3JvbGwoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cblx0LyoqXG5cdCAqIERpc3Bvc2UgdGhlIHBhbmluZyBncmlkIGJ5IGRpc3Bvc2luZyBhbGwgdGhlIGFjdGl2ZSBlbmRwb2ludHMgYW5kIHJlbW92aW5nIGFsbCB0aGUgbGlzdGVuZXJzXG5cdCAqIEByZXR1cm4ge1BhbmluZ31cblx0ICovXG5cdGRpc3Bvc2UoKSB7XG5cdFx0dGhpcy5fY2xlYXJQYW5lcygpO1xuXHRcdHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhbmluZztcbiIsIlxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoXCJAdmlzb2tpby9jb21tb24vc3JjL2V2ZW50L0V2ZW50RW1pdHRlclwiKTtcblxudmFyIGNvbW0gPSByZXF1aXJlKFwiQHZpc29raW8vY2hhcnQtY29tbXVuaWNhdGlvblwiKTtcbnZhciBkb20gPSByZXF1aXJlKFwiQHZpc29raW8vY29tbW9uL3NyYy91dGlsL2RvbVwiKTtcbnZhciBhcGkgPSByZXF1aXJlKFwiQHZpc29raW8vcHVibGljLWFwaS9zcmNcIik7XG5cbmNsYXNzIFBhbmVDZWxsIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHtwYXJlbnQsIHBhcmVudElkLCBpZCwgY29udGV4dCwgcmVuZGVyZXJ9KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5fZWxlbWVudCA9IGRvbS5yZW5kZXIoYDxkaXYgY2xhc3M9XCJuZXN0ZWRcIj48L2Rpdj5gKTsgLy8gb3VyIG93biBlbGVtZW50IHNvIHdhdGVybWFyayBpcyBub3QgYWZmZWN0ZWQgYnkgdXNcbiAgICAgICAgdGhpcy5fcGFyZW50SWQgPSBwYXJlbnRJZDtcbiAgICAgICAgdGhpcy5faWQgPSBpZDtcbiAgICAgICAgdGhpcy5fY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gcmVuZGVyZXI7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBvcHVsYXRlZCBieSBfY3JlYXRlRW5kcG9pbnQsIHdoaWNoIGlzIGNhbGxlZCBpbmRpcmVjdGx5IGluIGNvbnN0cnVjdG9yIGZvciB2YW5pbGxhIFBhbmVDZWxsXG4gICAgICAgICAqIGJ1dCBpcyBjYWxsZWQgdXBvbiBsb2FkIGV2ZW50IGZvciBQYW5lSUZyYW1lQ2VsbC5cbiAgICAgICAgICogQHR5cGUgez9FbmRwb2ludH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2VuZHBvaW50ID0gbnVsbDtcblxuICAgICAgICB0aGlzLl9idXN5ID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLl9yZW5kZXIocGFyZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgdGhlIGVuZHBvaW50IGZvciB0aGUgZ2l2ZW4gcGFyZW50aWQsIGlkIGFuZCBjaGFubmVsLiBJZiB0aGUgY2hhbm5lbCBpcyBudWxsXG4gICAgICogaXQgd2lsbCBiZSBhIG5hdGl2ZSBlbmRwb2ludCwgaWYgbm90IGFuIGlmcmFtZSB3aW5kb3cgaXMgZXhwZWN0ZWQgdG8gY3JlYXRlXG4gICAgICogYSBwc290TWVzc2FnZSBiYXNlZCBvbmUuXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBwYXJlbnRJZFxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gaWRcbiAgICAgKiBAcGFyYW0gIHtXaW5kb3c9fSBjaGFubmVsXG4gICAgICovXG4gICAgX2NyZWF0ZUVuZHBvaW50KHBhcmVudElkLCBpZCwgY2hhbm5lbCkge1xuICAgICAgICB0aGlzLl9lbmRwb2ludCA9IGNvbW0uZW5kcG9pbnQocGFyZW50SWQsIGlkLCBjaGFubmVsKVxuICAgICAgICAgICAgLm9uKFwidXBkYXRlXCIsIHRoaXMuX3VwZGF0ZVNlbGVjdGlvbi5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLm9uKFwiYnVzeVwiLCBldmVudCA9PiB0aGlzLl9idXN5ID0gZXZlbnQuZGF0YSlcbiAgICAgICAgICAgIC5yZWRpc3BhdGNoKFtcInVwZGF0ZVwiLCBcIndoaXRlc3BhY2VDbGlja1wiLCBcImVycm9yXCIsIFwiYnVzeVwiXSwgdGhpcylcbiAgICAgICAgICAgIC5zZW5kKFwidXBkYXRlXCIsIHRoaXMuX2NvbnRleHQpO1xuICAgIH1cblxuICAgIF91cGRhdGVTZWxlY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdGhpcy5fY29udGV4dC52aWV3U2VsZWN0aW9uICA9IGV2ZW50LmRhdGEudmlld1NlbGVjdGlvbjtcbiAgICB9XG5cbiAgICBfcmVuZGVyKHBhcmVudCkge1xuXG5cdFx0cGFyZW50LmFwcGVuZENoaWxkKHRoaXMuX2VsZW1lbnQpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlcihhcGkuYnVpbGQoY29tbS5lbmRwb2ludCh0aGlzLl9pZCwgdGhpcy5fcGFyZW50SWQpLCB0aGlzLl9lbGVtZW50KSk7XG4gICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBpbiBuYXRpdmUgY2hhcnQgcmVuZGVyZXJcIiwgZSk7XG4gICAgICAgICAgICBjb21tLmNsZWFyKHRoaXMuX2lkKTtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jcmVhdGVFbmRwb2ludCh0aGlzLl9wYXJlbnRJZCwgdGhpcy5faWQpO1xuICAgIH1cblxuICAgIGdldENvbnRleHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250ZXh0O1xuICAgIH1cblxuICAgIGdldFNlbGVjdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGVjdGlvbjtcbiAgICB9XG5cbiAgICBnZXRCdXN5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYnVzeTtcbiAgICB9XG5cbiAgICB1cGRhdGUoY29udGV4dCkge1xuICAgICAgICB0aGlzLl9jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgdGhpcy5fZW5kcG9pbnQuc2VuZChcInVwZGF0ZVwiLCB0aGlzLl9jb250ZXh0KTtcbiAgICB9XG5cbiAgICBkaXNwb3NlKCkge1xuXG4gICAgICAgIGNvbW0uY2xlYXIodGhpcy5faWQpO1xuXG4gICAgICAgIGlmICh0aGlzLl9lbGVtZW50ICYmIHRoaXMuX2VsZW1lbnQucGFyZW50Tm9kZSkgdGhpcy5fZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX2VsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSBudWxsO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUGFuZUNlbGw7XG4iLCJcbnZhciBQYW5lQ2VsbCA9IHJlcXVpcmUoXCIuL1BhbmVDZWxsXCIpO1xuXG52YXIgZG9tID0gcmVxdWlyZShcIkB2aXNva2lvL2NvbW1vbi9zcmMvdXRpbC9kb21cIik7XG5cbi8qKlxuICogR2V0IHRoZSBpZnJhbWUgdGVtcGxhdGUgYW5kIHJlbmRlciBpdCB3aXRoIHRoZSBzcGVjaWZpZWQgc291cmNlIGFuZCBpZlxuICogVE9ETzogQWRkIG1vcmUgc3R1ZmYgdG8gdGhlIHRlbXBsYXRlIHdoZW4gaXMgbmVlZGVkLCBtYXliZSBsb2FkZXJzIG9yIHNvbWV0aGluZyBzaW1pbGFyIGZvciBwYW5uaW5nIGlmcmFtZXMsXG4gKiBhbGwgdGhlIGh0bWwgbmVlZGVkIHRvIG5vdCBpbnRlcmFjdCB3aXRoIHRoZSBpZnJhbWUgbG9naWMgc3BlY2lmaWNhbGx5LlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHBhcmFtIHtzdHJpbmd9IGlkXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHNhbmRib3hcbiAqIEByZXR1cm4ge0hUTUxJRnJhbWVFbGVtZW50fVxuICovXG52YXIgcmVuZGVySUZyYW1lID0gZnVuY3Rpb24odXJsLCBpZCwgcGFuZUlkLCBzYW5kYm94KSB7XG5cbiAgICByZXR1cm4gZG9tLnJlbmRlcihgXG4gICAgICAgIDxpZnJhbWVcbiAgICAgICAgICAgIGNsYXNzPVwiaWZyYW1lLWNoYXJ0XCJcbiAgICAgICAgICAgIHNjcm9sbGluZz1cIm5vXCJcbiAgICAgICAgICAgICR7c2FuZGJveCA/IFwic2FuZGJveD1cXFwiYWxsb3ctc2NyaXB0c1xcXCJcIiA6IFwiXCJ9XG4gICAgICAgICAgICBzcmM9XCIkeyB1cmwgfT9zb3VyY2U9JHsgaWQgfSZ0YXJnZXQ9JHtwYW5lSWR9XCJcbiAgICAgICAgPjwvaWZyYW1lPlxuICAgIGApO1xufTtcblxuY2xhc3MgUGFuZUlGcmFtZUNlbGwgIGV4dGVuZHMgUGFuZUNlbGwge1xuXG4gICAgY29uc3RydWN0b3IoLi4uYXJncykge1xuICAgICAgICBzdXBlciguLi5hcmdzKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSUZyYW1lIHVzZWQgdG8gcmVuZGVyIGxvYWQgdGhlIGN1c3RvbSB2aWV3XG4gICAgICAgICAqIEB0eXBlIHtIVE1MSUZyYW1lRWxlbWVudH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2lmcmFtZSA9IHJlbmRlcklGcmFtZSh0aGlzLl9jb250ZXh0LmJhc2VVcmwsIHRoaXMuX3BhcmVudElkLCB0aGlzLl9pZCwgdGhpcy5fY29udGV4dC5tYW5pZmVzdC5zYW5kYm94KTtcblxuICAgICAgICB0aGlzLl9pZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZXZlbnQgPT4gdGhpcy5fY3JlYXRlRW5kcG9pbnQodGhpcy5fcGFyZW50SWQsIHRoaXMuX2lkLCBldmVudC50YXJnZXQuY29udGVudFdpbmRvdykpO1xuICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuX2lmcmFtZSk7XG4gICAgfVxuXG4gICAgX3JlbmRlcihwYXJlbnQpIHtcblx0XHRwYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5fZWxlbWVudCk7XG4gICAgfVxuXG4gICAgZGlzcG9zZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lmcmFtZSkge1xuICAgICAgICAgICAgdGhpcy5faWZyYW1lLm9ubG9hZCA9IG51bGw7XG4gICAgICAgICAgICBpZiAodGhpcy5faWZyYW1lLnBhcmVudE5vZGUpIHRoaXMuX2lmcmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX2lmcmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9pZnJhbWUgPSBudWxsO1xuICAgICAgICBzdXBlci5kaXNwb3NlKCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhbmVJRnJhbWVDZWxsO1xuIiwiXG52YXIgUGFuZUNlbGwgPSByZXF1aXJlKFwiLi9QYW5lQ2VsbFwiKTtcbnZhciBQYW5lSUZyYW1lQ2VsbCA9IHJlcXVpcmUoXCIuL1BhbmVJRnJhbWVDZWxsXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjcmVhdGU6IGZ1bmN0aW9uKHtwYXJlbnRJZCwgaWQsIHBhcmVudCwgY29udGV4dCwgcmVuZGVyZXJ9KSB7XG4gICAgICAgIGlmIChjb250ZXh0Lm1hbmlmZXN0LmlzTmF0aXZlKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFBhbmVDZWxsKHtwYXJlbnRJZCwgaWQsIHBhcmVudCwgY29udGV4dCwgcmVuZGVyZXJ9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG5ldyBQYW5lSUZyYW1lQ2VsbCh7cGFyZW50SWQsIGlkLCBwYXJlbnQsIGNvbnRleHQsIHJlbmRlcmVyfSk7XG5cdFx0fVxuICAgIH1cbn07XG4iLCJcbnZhciBkb20gPSByZXF1aXJlKFwiQHZpc29raW8vY29tbW9uL3NyYy91dGlsL2RvbVwiKTtcbnZhciBhcmVhID0gcmVxdWlyZShcIi4vbGF5b3V0L2FyZWFcIik7XG5cbmZ1bmN0aW9uIHRyYW5zbGF0ZVN0eWxlKGtleSwgdmFsdWUpIHtcblxuICAgIHN3aXRjaChrZXkpIHtcblxuICAgICAgICBjYXNlIFwid2lkdGhcIjpcbiAgICAgICAgY2FzZSBcImhlaWdodFwiOlxuICAgICAgICBjYXNlIFwidG9wXCI6XG4gICAgICAgIGNhc2UgXCJyaWdodFwiOlxuICAgICAgICBjYXNlIFwiYm90dG9tXCI6XG4gICAgICAgIGNhc2UgXCJsZWZ0XCI6XG4gICAgICAgICAgICByZXR1cm4gYCR7a2V5fTogJHsodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSA/IHZhbHVlICsgXCJweFwiIDogdmFsdWV9YDtcblxuICAgICAgICBjYXNlIFwidHJhbnNmb3JtXCI6XG4gICAgICAgICAgICByZXR1cm4gYC1tcy10cmFuc2Zvcm06ICR7dmFsdWV9OyAtd2Via2l0LXRyYW5zZm9ybTogJHt2YWx1ZX07IHRyYW5zZm9ybTogJHt2YWx1ZX1gO1xuICAgIH1cblxuICAgIHJldHVybiBgJHtrZXl9OiAke3ZhbHVlfWA7XG59XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3R5bGUobGlzdCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhsaXN0KVxuICAgICAgICAubWFwKGtleSA9PiB0cmFuc2xhdGVTdHlsZShrZXksIGxpc3Rba2V5XSkpXG4gICAgICAgIC5qb2luKFwiO1wiKTtcbn1cblxuZnVuY3Rpb24gcm93c0hlYWRlckxpc3QoY29udGV4dCwgcGFuZXMpIHtcbiAgICByZXR1cm4gZG9tLnJlbmRlcihgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwYW5pbmctaGVhZGVyLWxpc3RcIiBzdHlsZT1cImhlaWdodDogJHtwYW5lcy50b3RhbC5oZWlnaHR9cHhcIj48L2Rpdj5cbiAgICBgKTtcbn1cblxuZnVuY3Rpb24gY29sc0hlYWRlckxpc3QoY29udGV4dCwgcGFuZXMpIHtcbiAgICByZXR1cm4gZG9tLnJlbmRlcihgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwYW5pbmctaGVhZGVyLWxpc3RcIiBzdHlsZT1cIndpZHRoOiAke3BhbmVzLnRvdGFsLndpZHRofXB4XCI+PC9kaXY+XG4gICAgYCk7XG59XG5cbmZ1bmN0aW9uIGJvZHlMaXN0KGNvbnRleHQsIHBhbmVzKSB7XG5cbiAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgIHdpZHRoOiBwYW5lcy50b3RhbC53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBwYW5lcy50b3RhbC5oZWlnaHRcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRvbS5yZW5kZXIoYFxuICAgICAgICA8ZGl2IGNsYXNzPVwicGFubmluZy1ib2R5LWxpc3RcIiBzdHlsZT1cIiR7b2JqZWN0VG9TdHlsZShzdHlsZSl9XCI+PC9kaXY+XG4gICAgYCk7XG59XG5cbmZ1bmN0aW9uIGFycmF5KHNpemUpIHtcbiAgICByZXR1cm4gQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkoc2l6ZSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IFZpZXdBcGlDb250ZXh0XG4gICAgICogQHBhcmFtIHtib29sZWFufSBpZ25vcmVIZWFkZXJzIFRydWUgd2hlbiBwYW5pbmcgaXMgbm90IHBvc3NpYmxlIGJlY2F1c2UgYXV0by1wYW5pbmcgaXMgZGlzYWJsZWQgaW4gdGhlIG1hbmlmZXN0LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbm9uUGFuaW5nTW9kZSBUcnVlIHdoZW4gcGFuaW5nIGlzIG5vdCBjdXJyZW50bHkgY29uZmlndXJlZCAoYW5kIGltcGxpY2l0bHkgYSBzaW5nbGV0b24gcGFuZSkuXG4gICAgICogRmFsc2Ugd2hlbiBwYW5pbmcgaXMgY29uZmlndXJlZCAoYnV0IHRoZXJlIG1pZ2h0IHN0aWxsIGJlIGEgc2luZ2xldG9uIHBhbmUgZHVlIHRvIGZpbHRlcmluZykuXG4gICAgICovXG4gICAgYnVpbGQoY29udGV4dCwgaWdub3JlSGVhZGVycywgbm9uUGFuaW5nTW9kZSkge1xuXG4gICAgICAgIHZhciBhcmVhcyA9IGFyZWEuZ3JpZChjb250ZXh0LCBpZ25vcmVIZWFkZXJzKSxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICByb3dIZWFkZXJzID0gW10sXG4gICAgICAgICAgICBjb2xIZWFkZXJzID0gW10sXG4gICAgICAgICAgICBjb3JuZXJzID0gW10sXG4gICAgICAgICAgICBncmlkO1xuXG4gICAgICAgIC8vIEFkanVzdCBvbmUgcGl4ZWwgdG8gdGhlIGxlZnQgdG8gYXZvaWQgZG91YmxlIGJyb2RlcnMgYW5kIGFsaWduIHByb2JsZW1zIHdpdGggdGhlIGhlYWRlciBib3JkZXJzXG4gICAgICAgIGFyZWFzLmJvZHkubGVmdCA9IGFyZWFzLmJvZHkubGVmdCAtIDE7XG5cbiAgICAgICAgcm93SGVhZGVycyA9IE9iamVjdC5rZXlzKGFyZWFzLmhlYWRlcnMpXG4gICAgICAgICAgICAuZmlsdGVyKHBvc2l0aW9uID0+IHBvc2l0aW9uID09PSBcImxlZnRcIiB8fCBwb3NpdGlvbiA9PT0gXCJyaWdodFwiKVxuICAgICAgICAgICAgLm1hcChwb3NpdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbS5yZW5kZXIoYDxkaXYgY2xhc3M9XCJwYW5pbmctaGVhZGVyIHBhbmluZy1oZWFkZXItcm93cyBwb3NpdGlvbi0ke3Bvc2l0aW9ufVwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPVwiJHtvYmplY3RUb1N0eWxlKGFyZWFzLmhlYWRlcnNbcG9zaXRpb25dKX1cIj48L2Rpdj5gKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbEhlYWRlcnMgPSBPYmplY3Qua2V5cyhhcmVhcy5oZWFkZXJzKVxuICAgICAgICAgICAgLmZpbHRlcihwb3NpdGlvbiA9PiBwb3NpdGlvbiA9PT0gXCJ0b3BcIiB8fCBwb3NpdGlvbiA9PT0gXCJib3R0b21cIilcbiAgICAgICAgICAgIC5tYXAocG9zaXRpb24gPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb20ucmVuZGVyKGA8ZGl2IGNsYXNzPVwicGFuaW5nLWhlYWRlciBwYW5pbmctaGVhZGVyLWNvbHMgcG9zaXRpb24tJHtwb3NpdGlvbn1cIlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT1cIiR7b2JqZWN0VG9TdHlsZShhcmVhcy5oZWFkZXJzW3Bvc2l0aW9uXSl9XCI+PC9kaXY+YCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb3JuZXJzID0gT2JqZWN0LmtleXMoYXJlYXMuY29ybmVycylcbiAgICAgICAgICAgIC5tYXAocG9zaXRpb24gPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb20ucmVuZGVyKGA8ZGl2IGNsYXNzPVwicGFuaW5nLWNvcm5lciBwb3NpdGlvbi0ke3Bvc2l0aW9ufVwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPVwiJHtvYmplY3RUb1N0eWxlKGFyZWFzLmNvcm5lcnNbcG9zaXRpb25dKX1cIj48L2Rpdj5gKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGJvZHkgPSBkb20ucmVuZGVyKGA8ZGl2IGNsYXNzPVwicGFuaW5nLWJvZHlcIiBzdHlsZT1cIiR7b2JqZWN0VG9TdHlsZShhcmVhcy5ib2R5KX1cIj48L2Rpdj5gKTtcblxuICAgICAgICBncmlkID0gZG9tLnJlbmRlcihgPGRpdiBjbGFzcz1cInBhbmluZy1ncmlkICR7bm9uUGFuaW5nTW9kZSA/IFwicGFuaW5nLWdyaWQtbm90LXBhbmluZ1wiIDogXCJcIn1cIj48L2Rpdj5gKTtcblxuICAgICAgICByb3dIZWFkZXJzLmZvckVhY2goaGVhZGVyID0+IGdyaWQuYXBwZW5kQ2hpbGQoaGVhZGVyKSk7XG4gICAgICAgIGNvbEhlYWRlcnMuZm9yRWFjaChoZWFkZXIgPT4gZ3JpZC5hcHBlbmRDaGlsZChoZWFkZXIpKTtcbiAgICAgICAgY29ybmVycy5mb3JFYWNoKGNvcm5lciA9PiBncmlkLmFwcGVuZENoaWxkKGNvcm5lcikpO1xuXG4gICAgICAgIGdyaWQuYXBwZW5kQ2hpbGQoYm9keSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdyaWQsXG4gICAgICAgICAgICByb3dIZWFkZXJzLFxuICAgICAgICAgICAgY29sSGVhZGVycyxcbiAgICAgICAgICAgIGJvZHlcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzaXplIHRoZSBib2R5IGFuZCBoZWFkZXJzIGJ5IHB1dHRpbmcgdGhlIGxpc3Qgd2l0aCB0aGUgdG90YWwgc2l6ZSBpbnNpZGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc2VjdGlvbnNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gcGFuZXNTaXplXG4gICAgICovXG4gICAgcmVzaXplKGNvbnRleHQsIHNlY3Rpb25zLCBwYW5lc1NpemUpIHtcblxuICAgICAgICBzZWN0aW9ucy5ib2R5ID0gc2VjdGlvbnMuZ3JpZC5xdWVyeVNlbGVjdG9yKFwiLnBhbmluZy1ib2R5XCIpO1xuXG5cdFx0Ly8gTG9kIHRoZSBjb250YWluZXIgZm9yIGJvdGggdGhlIHJvd3MgYW5kIHRoZSBjb29scywgdGhlIHBhbmVzIHRoZW1zZWx2ZXMgd2lsbCBiZSBsb2FkZWQgd2hlbiB3ZSBnb3QgdGhlIGRhdGFcblx0XHRzZWN0aW9ucy5yb3dIZWFkZXJzLmZvckVhY2goaGVhZGVyID0+IHsgaGVhZGVyLmlubmVySFRNTCA9IFwiXCI7IGhlYWRlci5hcHBlbmRDaGlsZChyb3dzSGVhZGVyTGlzdChjb250ZXh0LCBwYW5lc1NpemUpKTsgfSk7XG5cdFx0c2VjdGlvbnMuY29sSGVhZGVycy5mb3JFYWNoKGhlYWRlciA9PiB7IGhlYWRlci5pbm5lckhUTUwgPSBcIlwiOyBoZWFkZXIuYXBwZW5kQ2hpbGQoY29sc0hlYWRlckxpc3QoY29udGV4dCwgcGFuZXNTaXplKSk7IH0pO1xuXG5cdFx0Ly8gTG9hZCB0aGUgY29udGFpbmVyIHdpdGggdGhlIGZ1bGwgc2l6ZSB0byB0aGUgYm9keVxuICAgICAgICBzZWN0aW9ucy5ib2R5LmlubmVySFRNTCA9IFwiXCI7XG5cdFx0c2VjdGlvbnMuYm9keS5hcHBlbmRDaGlsZChib2R5TGlzdChjb250ZXh0LCBwYW5lc1NpemUpKTtcblxuXHRcdC8vIFNJemUgb2YgdGhlIHNjcm9sbGJhclxuXHRcdHZhciBzY3JvbGxCYXJTaXplID0gc2VjdGlvbnMuYm9keS5vZmZzZXRXaWR0aCAtIHNlY3Rpb25zLmJvZHkuY2xpZW50V2lkdGg7XG5cbiAgICAgICAgc2VjdGlvbnMucm93SGVhZGVycy5mb3JFYWNoKGhlYWRlciA9PiBoZWFkZXIuZmlyc3RDaGlsZC5zdHlsZS5wYWRkaW5nQm90dG9tID0gc2Nyb2xsQmFyU2l6ZSArIFwicHhcIik7XG4gICAgICAgIHNlY3Rpb25zLmNvbEhlYWRlcnMuZm9yRWFjaChoZWFkZXIgPT4gaGVhZGVyLmZpcnN0Q2hpbGQuc3R5bGUucGFkZGluZ1JpZ2h0ID0gc2Nyb2xsQmFyU2l6ZSArIFwicHhcIik7XG4gICAgfSxcblxuXG4gICAgaGVhZGVycyhyYW5nZSwgcGFuZXMpIHtcblxuICAgICAgICB2YXIgcm93cywgY29scywgcG9zaXRpb247XG5cbiAgICAgICAgLy8gVE9ETzsgQXBwbHkgcHJlZml4ZXMgd2hlbiBuZWVkZWRcblxuXHRcdHJvd3MgPSBhcnJheShyYW5nZS55Lmxlbmd0aClcblx0XHRcdC5tYXAoKHBhbmUsIGkpID0+IHtcblxuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gaSArIHJhbmdlLnkuc3RhcnQ7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZG9tLnJlbmRlcihgXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYW5pbmctaGVhZGVyLXBhbmUgcGFuaW5nLWhlYWRlci1yb3ctcGFuZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLXJvdz1cIiR7cG9zaXRpb259XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPVwiaGVpZ2h0OiAke3BhbmVzLnNpemUuaGVpZ2h0fXB4O3RyYW5zZm9ybTogdHJhbnNsYXRlWSgke3BhbmVzLnNpemUuaGVpZ2h0ICogcG9zaXRpb259cHgpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgYCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBjb2xzID0gYXJyYXkocmFuZ2UueC5sZW5ndGgpXG5cdFx0XHQubWFwKChwYW5lLCBpKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IGkgKyByYW5nZS54LnN0YXJ0O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbS5yZW5kZXIoYFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFuaW5nLWhlYWRlci1wYW5lIHBhbmluZy1oZWFkZXItY29sLXBhbmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1jb2w9XCIkeyBwb3NpdGlvbiB9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPVwid2lkdGg6ICR7cGFuZXMuc2l6ZS53aWR0aH1weDt0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoJHtwYW5lcy5zaXplLndpZHRoICogcG9zaXRpb259cHgpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgYCk7XG4gICAgICAgICAgICB9KTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRyb3dzLFxuICAgICAgICAgICAgY29sc1xuXHRcdH07XG5cdH0sXG5cbiAgICBib2R5KHJhbmdlLCBwYW5lcykge1xuXG4gICAgICAgIHZhciBzdHlsZSA9IHt9LFxuICAgICAgICAgICAgY29sLFxuICAgICAgICAgICAgcm93O1xuXG4gICAgICAgIHJldHVybiBhcnJheShyYW5nZS55Lmxlbmd0aCkucmVkdWNlKChyb3dzLCBpdGVtLCBpKSA9PiB7XG5cbiAgICAgICAgICAgIHJvdyA9IGkgKyByYW5nZS55LnN0YXJ0O1xuXG4gICAgICAgICAgICByb3dzW3Jvd10gPSBhcnJheShyYW5nZS54Lmxlbmd0aCkucmVkdWNlKChjb2xzLCBpdGVtLCBqKSA9PiB7XG5cblxuICAgICAgICAgICAgICAgIGNvbCA9IGogKyByYW5nZS54LnN0YXJ0O1xuXG4gICAgICAgICAgICAgICAgc3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBwYW5lcy5zaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHBhbmVzLnNpemUuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHtwYW5lcy5zaXplLndpZHRoICogY29sfXB4LCAke3BhbmVzLnNpemUuaGVpZ2h0ICogcm93fXB4KWBcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgY29sc1tjb2xdID0gZG9tLnJlbmRlcihgXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYW5pbmctYm9keS1wYW5lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtcm93PVwiJHsgcm93IH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1jb2w9XCIkeyBjb2wgfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT1cIiR7b2JqZWN0VG9TdHlsZShzdHlsZSl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgYCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gY29scztcblxuICAgICAgICAgICAgfSwge30pO1xuXG4gICAgICAgICAgICByZXR1cm4gcm93cztcbiAgICAgICAgfSwge30pO1xuICAgIH1cbn07XG4iLCJcbnZhciBQYW5pbmcgPSByZXF1aXJlKFwiLi9QYW5pbmdcIik7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG5cdC8qKlxuXHQgKiBNZXRob2QgdGhhdCBjcmVhdGUgdGhlIHBhbmluZyBjb21wb25ldCB1c2VkIHRvIGFwcGx5IHBhbmluZyB0byBhIHZpZXdcblx0ICogQHBhcmFtICB7SFRNTEVsZW1lbnR9IHBhcmVudFxuXHQgKiBAcGFyYW0gIHtPYmplY3R9IGNvbnRleHRcblx0ICogQHBhcmFtICB7RnVuY3Rpb249fSByZW5kZXJlciBJZiBkZWZpbmVkIHRoZSBwYW5pZ24gd2lsbCB1c2UgdGhlIE5hdGl2ZUxvYWRlciwgaWYgbm90IGl0IHdpbGwgdXNlIHRoZSBJRnJhbWVMb2FkZXJcblx0ICogQHJldHVybiB7T2JqZWN0fVxuXHQgKi9cblx0Y3JlYXRlKHBhcmVudCwgY29udGV4dCwgcmVuZGVyZXIsIGlnbm9yZUhlYWRlcnMpIHtcblx0XHRyZXR1cm4gbmV3IFBhbmluZyhwYXJlbnQsIGNvbnRleHQsIHJlbmRlcmVyLCBpZ25vcmVIZWFkZXJzKTtcblx0fVxufTtcbiIsIlxuLy8gdmFyIGNvbnRleHQgPSB7XG4vLyBcdHBhbmU6IHtcbi8vIFx0XHRjZWxsOiB1bmRlZmluZWQsXG4vLyBcdFx0b3B0aW9uczoge1xuXG4vLyBcdFx0XHQvLyBIRWFkZXIgc2V0dGluZ3MsIGluY2x1ZGluZyB2aXNpYmlsaXR5IGFuZCBzaXplXG4vLyBcdFx0XHRoZWFkZXI6IHtcbi8vIFx0XHRcdFx0dG9wOiB7XG4vLyBcdFx0XHRcdFx0c2l6ZTogNTAsIC8vIE9ubHkgaGVpZ2h0IHNpbmNlIHdpZGh0IGlzIGRlZmluZWQgYnkgdGhlIHBhbmVcbi8vIFx0XHRcdFx0XHRzaG93OiBcImFsd2F5c1wiXG4vLyBcdFx0XHRcdH0sXG4vLyBcdFx0XHRcdGxlZnQ6IHtcbi8vIFx0XHRcdFx0XHRzaXplOiAxMjAsIC8vIE9ubHkgd2lkdGggc2luY2UgaGVpZ2h0IGlzIGRlZmluZWQgYnkgdGhlIHBhbmVcbi8vIFx0XHRcdFx0XHRzaG93OiBcImFsd2F5c1wiXG4vLyBcdFx0XHRcdH1cbi8vIFx0XHRcdH0sXG5cbi8vIFx0XHRcdC8vIFBhbmUgc2V0dG5ncywgc2l6ZSBhbmQgbWF4IG51bWJlciBvZiBwYW5lcyBwZXIgZ3JpZFxuLy8gXHRcdFx0cGFuZXM6IHtcbi8vIFx0XHRcdFx0c2l6ZToge1xuLy8gXHRcdFx0XHRcdHdpZHRoOiA1MCxcbi8vIFx0XHRcdFx0XHRoZWlnaHQ6IDUwXG4vLyBcdFx0XHRcdH0sXG4vLyBcdFx0XHRcdG1heDogMTAwXG4vLyBcdFx0XHR9LFxuXG4vLyBcdFx0XHQvLyBJZiB0cnVlIGV4cGFuZCB0aGUgZ3JpZCBpZiBpdHMgc21hbGxlciB0aGFuIHRoZSB2aWV3cG9ydFxuLy8gXHRcdFx0ZXhwYW5kOiB0cnVlXG4vLyBcdFx0fVxuLy8gXHR9XG4vLyB9O1xuXG4vLyBIZWxwZXJzIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSBhcmVhcyBvZiB0aGUgcGFuaW5nIGdyaWQsIHdpdGggaGVhZGVycywgZXRjLlxubW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0LyoqXG5cdCAqIEJhc2VkIG9uIHRoZSBnaXZlbiBjb250ZXh0IHJldHVybiBhbiBvYmplY3Qgd2l0aCB0aGUgaGVhZGVycywgY29ybmVycyBhbmQgYm9keSBzaXplIGFuZCBwb3NpdGlvbiBpbiB0aGUgZ3JpZFxuXHQgKiBUT0RPOiBBZGQgbG9naWMgdG8gdXNlIGJvdW5kaW5nIHJlY3Qgb2YgdGhlIHBhcmVudCBlbGVtZW50IHRvIGRlZmluZSB0aGUgaGVhZGVycyBzaXplIGFuZCBhZGFwdCB0aGVtLFxuXHQgKiBzdXBwb3J0aW5nIHJlbGF0aXZlIG1lYXN1cmVzIChsaWtlIHBlcmNlbnRhZ2VzLCBtaW4vbWF4IHJhbmdlcywgZXRjKVxuXHQgKiBAcGFyYW0ge29iamVjdH0gY29udGV4dFxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGlnbm9yZUhlYWRlcnNcblx0ICogQHJldHVybiB7b2JqZWN0fVxuXHQgKi9cblx0Z3JpZChjb250ZXh0LCBpZ25vcmVIZWFkZXJzKSB7XG5cblx0XHR2YXIgcGFuZU9wdHMgPSBjb250ZXh0Lm9wdGlvbnMucGFuZSxcblx0XHRcdHRvcEhlYWRlciA9IDAsXG5cdFx0XHRib3R0b21IZWFkZXIgPSAwLFxuXHRcdFx0bGVmdEhlYWRlciA9IDAsXG5cdFx0XHRyaWdodEhlYWRlciA9IDAsXG5cdFx0XHRyZXN1bHQgPSB7XG5cdFx0XHRcdGhlYWRlcnM6IHt9LFxuXHRcdFx0XHRjb3JuZXJzOiB7fSxcblx0XHRcdFx0Ym9keToge31cblx0XHRcdH07XG5cblx0XHRpZiAoIWlnbm9yZUhlYWRlcnMpIHtcblx0XHRcdGlmIChwYW5lT3B0cy5oZWFkZXJIZWlnaHQgJiYgY29udGV4dC5vcHRpb25zLml0ZW1zLnBhbmVYKSB7XG5cdFx0XHRcdGxldCB4cCA9IHBhbmVPcHRzLnhIZWFkZXJQbGFjZW1lbnQ7XG5cdFx0XHRcdGlmICh4cD09PVwiVE9QXCIpIHRvcEhlYWRlciA9IHBhbmVPcHRzLmhlYWRlckhlaWdodDtcblx0XHRcdFx0aWYgKHhwPT09XCJCT1RUT01cIikgYm90dG9tSGVhZGVyID0gcGFuZU9wdHMuaGVhZGVySGVpZ2h0O1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBhbmVPcHRzLmhlYWRlcldpZHRoICYmIGNvbnRleHQub3B0aW9ucy5pdGVtcy5wYW5lWSkge1xuXHRcdFx0XHRsZXQgeXAgPSBwYW5lT3B0cy55SGVhZGVyUGxhY2VtZW50O1xuXHRcdFx0XHRpZiAoeXA9PT1cIkxFRlRcIikgbGVmdEhlYWRlciA9IHBhbmVPcHRzLmhlYWRlcldpZHRoO1xuXHRcdFx0XHRpZiAoeXA9PT1cIlJJR0hUXCIpIHJpZ2h0SGVhZGVyID0gcGFuZU9wdHMuaGVhZGVyV2lkdGg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHRvcEhlYWRlcikge1xuXG5cdFx0XHRyZXN1bHQuaGVhZGVycy50b3AgPSB7XG5cdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0bGVmdDogbGVmdEhlYWRlcixcblx0XHRcdFx0cmlnaHQ6IHJpZ2h0SGVhZGVyLFxuXHRcdFx0XHRoZWlnaHQ6IHRvcEhlYWRlclxuXHRcdFx0fTtcblxuXHRcdH1cblxuXHRcdGlmIChyaWdodEhlYWRlcikge1xuXG5cdFx0XHRyZXN1bHQuaGVhZGVycy5yaWdodCA9IHtcblx0XHRcdFx0cmlnaHQ6IDAsXG5cdFx0XHRcdHRvcDogdG9wSGVhZGVyLFxuXHRcdFx0XHRib3R0b206IGJvdHRvbUhlYWRlcixcblx0XHRcdFx0d2lkdGg6IHJpZ2h0SGVhZGVyXG5cdFx0XHR9O1xuXG5cdFx0fVxuXG5cdFx0aWYgKGJvdHRvbUhlYWRlcikge1xuXG5cdFx0XHRyZXN1bHQuaGVhZGVycy5ib3R0b20gPSB7XG5cdFx0XHRcdGJvdHRvbTogMCxcblx0XHRcdFx0bGVmdDogbGVmdEhlYWRlcixcblx0XHRcdFx0cmlnaHQ6IHJpZ2h0SGVhZGVyLFxuXHRcdFx0XHRoZWlnaHQ6IGJvdHRvbUhlYWRlclxuXHRcdFx0fTtcblxuXHRcdH1cblxuXHRcdGlmIChsZWZ0SGVhZGVyKSB7XG5cblx0XHRcdHJlc3VsdC5oZWFkZXJzLmxlZnQgPSB7XG5cdFx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRcdHRvcDogdG9wSGVhZGVyLFxuXHRcdFx0XHRib3R0b206IGJvdHRvbUhlYWRlcixcblx0XHRcdFx0d2lkdGg6IGxlZnRIZWFkZXJcblx0XHRcdH07XG5cblx0XHR9XG5cblx0XHRpZiAodG9wSGVhZGVyICYmIGxlZnRIZWFkZXIpIHtcblx0XHRcdHJlc3VsdC5jb3JuZXJzLnRvcGxlZnQgPSB7XG5cdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0bGVmdDogMCxcblx0XHRcdFx0aGVpZ2h0OiB0b3BIZWFkZXIsXG5cdFx0XHRcdHdpZHRoOiBsZWZ0SGVhZGVyXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmICh0b3BIZWFkZXIgJiYgcmlnaHRIZWFkZXIpIHtcblx0XHRcdHJlc3VsdC5jb3JuZXJzLnRvcHJpZ2h0ID0ge1xuXHRcdFx0XHR0b3A6IDAsXG5cdFx0XHRcdHJpZ2h0OiAwLFxuXHRcdFx0XHRoZWlnaHQ6IHRvcEhlYWRlcixcblx0XHRcdFx0d2lkdGg6IHJpZ2h0SGVhZGVyXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChib3R0b21IZWFkZXIgJiYgbGVmdEhlYWRlcikge1xuXHRcdFx0cmVzdWx0LmNvcm5lcnMuYm90dG9tbGVmdCA9IHtcblx0XHRcdFx0Ym90dG9tOiAwLFxuXHRcdFx0XHRsZWZ0OiAwLFxuXHRcdFx0XHRoZWlnaHQ6IGJvdHRvbUhlYWRlcixcblx0XHRcdFx0d2lkdGg6IGxlZnRIZWFkZXJcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0aWYgKGJvdHRvbUhlYWRlciAmJiByaWdodEhlYWRlcikge1xuXHRcdFx0cmVzdWx0LmNvcm5lcnMuYm90dG9tcmlnaHQgPSB7XG5cdFx0XHRcdGJvdHRvbTogMCxcblx0XHRcdFx0cmlnaHQ6IDAsXG5cdFx0XHRcdGhlaWdodDogYm90dG9tSGVhZGVyLFxuXHRcdFx0XHR3aWR0aDogcmlnaHRIZWFkZXJcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0cmVzdWx0LmJvZHkgPSB7XG5cdFx0XHR0b3A6IHRvcEhlYWRlcixcblx0XHRcdHJpZ2h0OiByaWdodEhlYWRlcixcblx0XHRcdGJvdHRvbTogYm90dG9tSGVhZGVyLFxuXHRcdFx0bGVmdDogbGVmdEhlYWRlclxuXHRcdH07XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59O1xuIiwiXG4vLyBIZWxwZXJzIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSBsYXlvdXQgb2YgdGhlIHBhbmVzIGluIHRoZSBib2R5IG9mIHRoZSBwYW5pbmcgZ3JpZCxcbi8vIGdlbmVyYXRlIGRpZmZzLCBldGMuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuXHQvKipcblx0ICogR2V0IHRoZSBzaXplIGZvciB0aGUgaW5kaXZpZHVhbCBwYW5lcyBwbHVzIHRoZSB0b3RhbCBhbW91bnQgb2Ygcm93cyBhbmQgY29scyBhbmQgdGhlIHRvdGFsIHNpemUgb2YgdGhlIHBhbmVzXG5cdCAqIEBwYXJhbSAge0RPTVJlY3R9IGJvdW5kc1xuXHQgKiBAcGFyYW0gIHtPYmplY3R9IGNvbnRleHRcblx0ICogQHBhcmFtICB7T2JqZWN0fSBheGVzXG5cdCAqIEByZXR1cm4ge09iamVjdH1cblx0ICovXG5cdHNpemUoYm91bmRzLCBjb250ZXh0LCBheGVzKSB7XG5cblx0XHR2YXIgcGFuZVNpemUgPSB7XG5cdFx0XHRcdHdpZHRoOiBjb250ZXh0Lm9wdGlvbnMucGFuZS5wYW5lV2lkdGgsXG5cdFx0XHRcdGhlaWdodDogY29udGV4dC5vcHRpb25zLnBhbmUucGFuZUhlaWdodFxuXHRcdFx0fSxcblx0XHRcdG1heENlbGxzID0gY29udGV4dC5tYW5pZmVzdC5wYW5lID8gY29udGV4dC5tYW5pZmVzdC5wYW5lLm1heENlbGxzIDogMjAvKmxlZ2FjeSBtYW5pZmVzdD8qLyxcblx0XHRcdHJlZHVjdGlvbixcblx0XHRcdHJvd3MsXG5cdFx0XHRjb2xzLFxuXHRcdFx0d2lkdGgsXG5cdFx0XHRoZWlnaHQsXG5cdFx0XHR0b3RhbFJvd3MgPSAxLFxuXHRcdFx0dG90YWxDb2xzID0gMTtcblxuXHRcdC8vIEdldCB0aGUgdG90YWwgcm93cyBhbmQgY29scyBkZXBlbmRpbmcgb24gdGhlIGF4ZXMgYW5kIHRoZSBjb250ZXh0IG9wdGlvbnNcblx0XHR0b3RhbENvbHMgPSBheGVzWzFdLnNpemU7XG5cdFx0dG90YWxSb3dzID0gYXhlc1swXS5zaXplO1xuXG5cdFx0Ly8gRmlyc3Qgd2UgY2FsY3VsYXQgZXRoZSByb3dzIGFkbiBjb2xzIHRoYXQgd2UgY2FuIHNob3cgaW4gdGhlIGF2YWlsYWJsZSBib3VuZHNcblx0XHQvLyBXZSBmbG9vciB0byBtYWtlIHN1cmUgdGhhdCB3ZSBmaXQgYSBmaXhlZCBudW1iZXIgb2YgcGFuZXMgaW4gdGhlIGdyaWRcblx0XHRyb3dzID0gTWF0aC5taW4oTWF0aC5mbG9vcihib3VuZHMuaGVpZ2h0IC8gcGFuZVNpemUuaGVpZ2h0KSwgdG90YWxSb3dzKTtcblx0XHRjb2xzID0gTWF0aC5taW4oTWF0aC5mbG9vcihib3VuZHMud2lkdGggLyBwYW5lU2l6ZS53aWR0aCksIHRvdGFsQ29scyk7XG5cblxuXHRcdC8vIEFkanVzdCB0aGUgcGFuZXMgdG8gbm90IGJlIG1vcmUgdGhhbiB0aGUgbWF4IGFtb3VudFxuXHRcdGlmIChyb3dzICogY29scyA+IG1heENlbGxzKSB7XG5cdFx0XHRyZWR1Y3Rpb24gPSBNYXRoLnNxcnQobWF4Q2VsbHMpIC8gTWF0aC5zcXJ0KHJvd3MqY29scyk7XG5cblx0XHRcdC8vIExpbWl0IGNvbHVtbnMgZmlyc3Q6XG5cdFx0XHRjb2xzID0gY29scyAqIHJlZHVjdGlvbjtcblxuXHRcdFx0Ly8gUm91bmQgZG93biBhbmQgYXQgbGVhc3QgMTpcblx0XHRcdGNvbHMgPSBNYXRoLm1heCgxLCBNYXRoLmZsb29yKGNvbHMpKTtcblxuXHRcdFx0Ly8gRGVyaXZlIHJvd3MgZnJvbSBjb2xzLCBhaW1pbmcgZm9yIG1heENlbGxzLCBidXQgbm8gZ3JlYXRlciB0aGFuIG9yaWdpbmFsIHJvd3M6XG5cdFx0XHRyb3dzID0gTWF0aC5taW4ocm93cywgTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihtYXhDZWxscy9jb2xzKSkpO1xuXG5cdFx0XHQvLyBUaGlzIGlzIGltcGVyZmVjdCwgZS5nLiBmb3IgMTE1eDUxLCB5b3UgZ2V0IDE1eDYgd2hlcmUgMTZ4NiB3b3VsZCBiZSBhIGJldHRlciBmaXQuXG5cdFx0XHQvLyBGaW5hbCBhc3NlcnRpb246XG5cdFx0XHRpZiAocm93cyAqIGNvbHMgPiBtYXhDZWxscykgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IG1lZXQgbWF4Q2VsbHMgcmVxdWlyZW1lbnQ6IFwiK2NvbHMrXCJ4XCIrcm93cyk7XG5cdFx0fVxuXG5cdFx0Ly8gR2V0IHRoZSB0YXJnZXQgd2lkdGggYW5kIGhlaWdodCBvZiB0aGUgdmlld3BvcnRcblx0XHR3aWR0aCA9IGNvbHMgKiBwYW5lU2l6ZS53aWR0aDtcblx0XHRoZWlnaHQgPSByb3dzICogcGFuZVNpemUuaGVpZ2h0O1xuXG5cdFx0Ly8gSWYgdGhlIHJlc3VsdGluZyB3aWR0aCBpcyBzbWFsbGVyIHRoYW4gdGhlIGF2YWlsYWJsZSBib3VuZHMgdGhlIHdlIG5lZWQgdG8gZXhwYW5kXG5cdFx0Ly8gVE9ETzogUHV0IHRoZSBleHBhbmQgdG8gZmlsbCB0aGUgdmlld3BvcnQgYXNkIGEgc2V0dGluZyBpbiB0aGUgcGFuZSBvcHRpb25zIHNlY3Rpb24gb2YgdGhlIGNvbnRleHRcblx0XHRpZiAod2lkdGggPCBib3VuZHMud2lkdGgpIHtcblx0XHRcdHBhbmVTaXplLndpZHRoICs9IChib3VuZHMud2lkdGggLSB3aWR0aCkgLyBjb2xzO1xuXHRcdFx0d2lkdGggPSBib3VuZHMud2lkdGg7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgdGhlIHJlc3VsdGluZyB3aWR0aCBpcyBzbWFsbGVyIHRoYW4gdGhlIGF2YWlsYWJsZSBib3VuZHMgdGhlIHdlIG5lZWQgdG8gZXhwYW5kXG5cdFx0Ly8gVE9ETzogUHV0IHRoZSBleHBhbmQgdG8gZmlsbCB0aGUgdmlld3BvcnQgYXNkIGEgc2V0dGluZyBpbiB0aGUgcGFuZSBvcHRpb25zIHNlY3Rpb24gb2YgdGhlIGNvbnRleHRcblx0XHRpZiAoaGVpZ2h0IDwgYm91bmRzLmhlaWdodCkge1xuXHRcdFx0cGFuZVNpemUuaGVpZ2h0ICs9IChib3VuZHMuaGVpZ2h0IC0gaGVpZ2h0KSAvIHJvd3M7XG5cdFx0XHRoZWlnaHQgPSBib3VuZHMuaGVpZ2h0O1xuXHRcdH1cblxuXG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0c2l6ZToge1xuXHRcdFx0XHR3aWR0aDogcGFuZVNpemUud2lkdGgsXG5cdFx0XHRcdGhlaWdodDogcGFuZVNpemUuaGVpZ2h0XG5cdFx0XHR9LFxuXHRcdFx0dmlld3BvcnQ6IHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgcHJlY2lzZSBwaXhlbCBzaXplIG9mIHRoZSB2aWV3cG9ydDpcbiAgICAgICAgICAgICAgICB3aWR0aDogYm91bmRzLndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogYm91bmRzLmhlaWdodCxcbiAgICAgICAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIHJvd3MgYW5kIGNvbHVtbnMgdGhhdCBzdHJhZGRsZSB0aGUgdmlld3BvcnQ6XG5cdFx0XHRcdGNvbHM6IGNvbHMsXG5cdFx0XHRcdHJvd3M6IHJvd3Ncblx0XHRcdH0sXG5cdFx0XHR0b3RhbDoge1xuXHRcdFx0XHRyb3dzOiB0b3RhbFJvd3MsXG5cdFx0XHRcdGNvbHM6IHRvdGFsQ29scyxcblx0XHRcdFx0d2lkdGg6IHRvdGFsQ29scyAqIHBhbmVTaXplLndpZHRoLFxuXHRcdFx0XHRoZWlnaHQ6IHRvdGFsUm93cyAqIHBhbmVTaXplLmhlaWdodFxuXHRcdFx0fSxcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGRpZmYgYmV0d2VlbiB0d28gcGFuZSBsYXlvdXRzLCB3aXRoIHRoZSBpbmZvcm1hdGlvbiBhYm91dCB0aGluZ3MgdGhhdCB3ZSBuZWVkIG90IHVwZGF0ZSxcblx0ICogdGhpbmdzIHRvIGFkZCBhbmQgdGhpbmdzIHRvIHJlbW92ZVxuXHQgKiBAcGFyYW0gIHtPYmplY3R9IHByZXZpb3VzXG5cdCAqIEBwYXJhbSAge09iamVjdH0gY3VycmVudFxuXHQgKiBAcmV0dXJuIHtPYmplY3R9XG5cdCAqL1xuXHRkaWZmKHByZXZpb3VzLCBjdXJyZW50KSB7XG5cblx0fVxufTtcbiIsIlxudmFyIGRvbSA9IHJlcXVpcmUoXCJAdmlzb2tpby9jb21tb24vc3JjL3V0aWwvZG9tXCIpO1xuXG5cbnZhciBDU1NfQ0xBU1MgPSBcInZpZXctd2F0ZXJtYXJrXCI7XG52YXIgQ1NTX0NMQVNTX0lURU0gPSBcInZpZXctd2F0ZXJtYXJrLWl0ZW1cIjtcblxuLy9UT0RPOiBSaWdodCBub3cgdGhlIHdhdGVybWFyayB3aWxsIGNhcHR1cmUgdGhlIG1vc3VlIGV2ZW50cyBpbiBJRTEwIGFuZCBJRTkgc2luY2Vcbi8vIHdlIGFyZSB1c2luZyBwb2ludGVyLWV2ZW50czpub25lIGZyb20gY3NzIHRvIHByZXZlbnQgdGhhdCBiZWhhdmlvdXIuIFdlIHdpbGwgbmVlZCB0b1xuLy8gZmluZCBhIHdheSBvZiByZXBsaWNhdGluZyB0aGF0IGFuZCBzb21laG93IHBhc3MgdGhlIGV2ZW50IHRvIHRoZSBpZnJhbWUuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgd2F0ZXJtYXJrIHFpdGggdGhlIGdpdmVuIGluZm9ybWF0aW9uIGFuZCBhcHBlbmQgaXQgdG8gdGhlIGZpdmVuIHBhcmVudFxuICAgICAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBwYXJlbnRcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IGluZm8gVGhhIGluZm8gY2FuIGJlIHRleHQsIGRldGFpbHMgKHVzZWQgZm9yIHRpdGxlKSBhbmQgaWNvbiAoZm9udC1hd2Vzb21lIG5hbWUpXG4gICAgICovXG4gICAgY3JlYXRlOiBmdW5jdGlvbihwYXJlbnQsIGluZm8pIHtcblxuICAgICAgICB2YXIgY29udGFpbmVyID0gcGFyZW50LnF1ZXJ5U2VsZWN0b3IoXCIuXCIgKyBDU1NfQ0xBU1MpO1xuXG4gICAgICAgIGlmICghY29udGFpbmVyKSB7XG4gICAgICAgICAgICBjb250YWluZXIgPSBkb20ucmVuZGVyKGA8ZGl2IGNsYXNzPVwiJHtDU1NfQ0xBU1N9XCIgdGl0bGU9XCJcIj48L2Rpdj5gKTtcbiAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChjb250YWluZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1lc3NhZ2UgPSBpbmZvLmlkID8gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWlkPSR7aW5mby5pZH1dYCkgOiBudWxsO1xuXG4gICAgICAgIGlmICghbWVzc2FnZSkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IGRvbS5yZW5kZXIoYDxkaXYgY2xhc3M9XCIke0NTU19DTEFTU19JVEVNfVwiPjxpIGNsYXNzPVwiXCI+PC9pPjwvZGl2PmApO1xuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSBgPGkgY2xhc3M9XCJcIj48L2k+YDtcbiAgICAgICAgfVxuXG4gICAgICAgIG1lc3NhZ2Uuc2V0QXR0cmlidXRlKFwiZGF0YS1pZFwiLCBpbmZvLmlkKTtcbiAgICAgICAgbWVzc2FnZS5jaGlsZHJlblswXS5jbGFzc05hbWUgPSBpbmZvLmljb24gPyBcImZhIFwiICsgaW5mby5pY29uIDogXCJcIjtcbiAgICAgICAgbWVzc2FnZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShpbmZvLnRleHQpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIHRoZSB3YXRlcm1hcmsgaWYgYW55IGZvcm0gdGhlIHNwZWNpZmllZCBwYXJlbnRcbiAgICAgKiBAcGFyYW0gIHtIVE1MRWxlbWVudH0gcGFyZW50XG4gICAgICovXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihwYXJlbnQsIGlkKSB7XG5cbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IHBhcmVudC5xdWVyeVNlbGVjdG9yKFwiLlwiICsgQ1NTX0NMQVNTKSxcbiAgICAgICAgICAgIG1lc3NhZ2U7XG5cbiAgICAgICAgaWYgKCFjb250YWluZXIpIHJldHVybjtcblxuICAgICAgICBpZiAoaWQpIHtcblxuICAgICAgICAgICAgbWVzc2FnZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKGBbZGF0YS1pZD0ke2lkfV1gKTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlKSBtZXNzYWdlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobWVzc2FnZSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNvbnRhaW5lcik7XG4gICAgICAgIH1cblxuICAgIH0sXG5cbiAgICB0b2dnbGUocGFyZW50LCBsaW1pdCkge1xuICAgICAgICBcbiAgICAgICAgaWYgKGxpbWl0KSB7XG5cbiAgICAgICAgICAgIHRoaXMuY3JlYXRlKHBhcmVudCwge1xuICAgICAgICAgICAgICAgIGlkOiBcImRhdGEtdHJ1bmNhdGlvblwiLFxuICAgICAgICAgICAgICAgIHRleHQ6IGBEYXRhIGhhcyBiZWVuIHRydW5jYXRlZCB0byBtZWV0IHRoZSBjYXBhYmlsaXRpZXMgb2YgdGhpcyB2aWV3IChtYXggJHtsaW1pdH0gdmlzdWFsIGVsZW1lbnRzKWAsXG4gICAgICAgICAgICAgICAgaWNvbjogXCJmYS1leGNsYW1hdGlvbi10cmlhbmdsZVwiXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZShwYXJlbnQsIFwiZGF0YS10cnVuY2F0aW9uXCIpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIEVWRU5UOiB7XG4gICAgICAgIFNIT1c6IFwid2F0ZXJtYXJrLnNob3dcIixcbiAgICAgICAgSElERTogXCJ3YXRlcm1hcmsuaGlkZVwiXG4gICAgfVxufTtcbiIsIlxudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoXCJAdmlzb2tpby9jb21tb24vc3JjL2V2ZW50L0V2ZW50RW1pdHRlclwiKTtcbnZhciBjb250ZXh0VXRpbCA9IHJlcXVpcmUoXCJAdmlzb2tpby9jb21tb24vc3JjL2NvbnRleHRcIik7XG52YXIgcXVlcnkgPSByZXF1aXJlKFwiQHZpc29raW8vcXVlcnktYXBpXCIpO1xudmFyIGNsb25lID0gcmVxdWlyZShcIkB2aXNva2lvL2NvbW1vbi9zcmMvdXRpbC9jbG9uZVwiKTtcbnZhciBvbmVycm9yID0gcmVxdWlyZShcIkB2aXNva2lvL2NvbW1vbi9zcmMvY29udGV4dC9vbmVycm9yXCIpO1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgdGhhdCByZXByZXNlbnRzIHRoZSBwdWJsaWMgYXBpIGJlZm9yZSBhZGRpbmcgYXV0by1wYW5pbmcgYW5kIGF1dG8tcXVlcnlpbmdcbiAqL1xuY2xhc3MgQXBpIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RW5kcG9pbnR9IGVuZHBvaW50XG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBwYXJlbnRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlbmRwb2ludCwgcGFyZW50KSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEJ1c3kgc3RhdGUgb2YgdGhlIHZpZXdcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9idXN5ID0gZmFsc2U7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENvbnRleHQgb2JqZWN0XG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9jb250ZXh0ID0gbnVsbDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUGFyZW50IGVsZW1lbnQgdXNlZCB0byByZW5kZXIgdGhlIGN1c3RvbSB2aWV3IGNvbnRlbnRzXG4gICAgICAgICAqIEB0eXBlIHtIVE1MRWxlbWVudH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogT2JqZWN0IHdpaHQgdGhlIG1hcHBpbmdzIGZvciB0aGUgZGF0YSBpbiB0aGUgY29udGV4dFxuICAgICAgICAgKiBAdHlwZSB7TWFwcGluZ3NIZWxwZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9tYXBwaW5ncyA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb21tdW5pY2F0aW9uIEFQSSBlbmRwb2ludCB1c2VkIHRvIGNvbW11bmljYXRlIHdpdGhcbiAgICAgICAgICogdmlldy5cbiAgICAgICAgICogQHR5cGUge0VuZHBvaW50fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZW5kcG9pbnQgPSBlbmRwb2ludDtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGNvbnRleHQgYW5kIG1hcHBpbmdzIGFzIHNvb25hIHMgd2UgcmVjZWl2ZSBhIG5ldyBvbmVcbiAgICAgICAgdGhpcy5fZW5kcG9pbnQub24oXCJ1cGRhdGVcIiwgZXZlbnQgPT4ge1xuICAgICAgICAgICAgdGhpcy5fY29udGV4dCA9IGV2ZW50LmRhdGE7XG4gICAgICAgICAgICB0aGlzLl9tYXBwaW5ncyA9IHRoaXMuX2NvbnRleHQucmVzdWx0ICYmIHRoaXMuX2NvbnRleHQucmVzdWx0LmRhdGEgPyBuZXcgY29udGV4dFV0aWwuTWFwcGluZ3NIZWxwZXIodGhpcy5fY29udGV4dCkgOiB7fTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVGhlIGZpcnN0IHRpbWUgaW5zdGVhZCBvZiBsb2FkIGVtaXQgYW4gdXBkYXRlLCB0aGUgbmV4dCBvbmVzIHdpbGwgcHJvZHVjZSBhIHJlZ3VsYXIgdXBkYXRlIGV2ZW50XG4gICAgICAgIHRoaXMuX2VuZHBvaW50Lm9uY2UoXCJ1cGRhdGVcIiwgZXZlbnQgPT4ge1xuXG4gICAgICAgICAgICAvLyBUT0RPOiBSZXZpc2l0IHRoZSBlcnJvciBoYW5kbGluZyBsb2dpYyB0byBoYW5kbGUgc2FuZGJveCBwcm9wZXJseVxuXG4gICAgICAgICAgICBpZiAoIWV2ZW50LmRhdGEubWFuaWZlc3QuaXNOYXRpdmUpIHtcbiAgICAgICAgICAgICAgICAvLyBPbmx5IGRvIHRoZSBlcnJvciBsaXN0ZW5lciBmb3Igbm9uLW5hdGl2ZSB2aWV3cywgd2hpY2ggYXJlIGxvYWRlZCBpbnNpZGUgdGhlaXIgb3duIElGUkFNRS5cbiAgICAgICAgICAgICAgICAvLyBUaGUgbmF0aXZlIG9uZXMgYXJlIGhhbmRsZWQgYnkgbW9iaWxlJ3Mgb3duIHdpbmRvdy5vbmVycm9yIGhhbmRsZXIuXG4gICAgICAgICAgICAgICAgLy8gRW1iZWRkZWQgdmlld3MgaGF2ZSBhIHdpbmRvdy5vbmVycm9yIGhhbmRsZXIgc2V0IHNlcGFyYXRlbHkgKHVzaW5nIHRoZSBzYW1lIG9uZXJyb3IuanMgaGVscGVyKS5cbiAgICAgICAgICAgICAgICBvbmVycm9yLnJlZ2lzdGVyKGVyck9iaiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXJyb3IoZXJyT2JqLm1lc3NhZ2UsIGVyck9iai5pbnRlcm5hbCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuZW1pdChcImxvYWRcIiwgZXZlbnQuZGF0YSk7XG4gICAgICAgICAgICB0aGlzLl9lbmRwb2ludC5yZWRpc3BhdGNoKFtcInVwZGF0ZVwiXSwgdGhpcyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlZGlzcGF0Y2ggcmVzaXplIG9ubHkgaWYgd2UgaGF2ZSBhIGNvbnRleHQsIGluIHRoZSBjYXNlIG9mIG5vIGNvbnRleHQgd2UgZG9udCBuZWVkIHRvIHRyaWdnZXIgaXQgc2luY2UgdGhlXG4gICAgICAgIC8vIHZpZXcgaXMgbm90IGV2ZW4gaW5pdGlhbGlzZVxuICAgICAgICB0aGlzLl9lbmRwb2ludC5vbihcInJlc2l6ZVwiLCAoc2l6ZSkgPT4geyBpZiAodGhpcy5fY29udGV4dCkgdGhpcy5lbWl0KFwicmVzaXplXCIsIHNpemUpOyB9KTtcbiAgICAgICAgLy8gKGluIHRoZW9yeSB3ZSBzaG91bGRuJ3QgaGF2ZSBhIHJlc2l6ZSBldmVudCB3aGVuIHdlIGRvbid0IGhhdmUgY29udGV4dD8gQnV0IHdlIGRvLi4uIGFzeW5jIG1lc3NhZ2luZyBpc3N1ZSlcblxuICAgICAgICAvLyBSZWRpc3BhdGNoIHRoZSBkaXNwb3NlIGFuZCByZXNpemUgYmVmb3JlIHNldHRpbmcgb3VyIGxpc3RlbmVycyBzaW5jZSB0aGUgYXBpIGRvbnQgbmVlZCB0byBkbyBhbnl0aGluZyB3aXRoXG4gICAgICAgIC8vIHRoZW0gYmVmb3JlIHRoZSB1c2UgcmhhbmRsZSB0aGVtLiBXZSBkbyBkaXNwb3NlIGJ1dCB3ZSB3YWl0IGZvciB0aGUgdXNlciB0byBkaXNwb3NlIGl0cyBvd24gdGhpbmdzXG4gICAgICAgIHRoaXMuX2VuZHBvaW50LnJlZGlzcGF0Y2goW1wiZGlzcG9zZVwiXSwgdGhpcyk7XG5cbiAgICAgICAgLy8gV2hlbiB3ZSBnb3QgYSBkaXNwb3NlLCBhZnRlciB0aGUgdXNlciBkaW9kIHdoYXRldmVyIHRoZXkgd2FudCBub3cgd2UgY2FuIGRpc3Bvc2UgdGhlIGVuZHBvaW50IGFuZCByZW1vdmUgYWxsIG91ciBsaXN0ZW5lcnMuXG4gICAgICAgIHRoaXMuX2VuZHBvaW50Lm9uKFwiZGlzcG9zZVwiLCAoKSA9PiB7IHRoaXMuX2VuZHBvaW50LmRpc3Bvc2UoKTsgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoKTsgfSk7XG5cbiAgICAgICAgdGhpcy5xdWVyaWVzID0ge1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEhlbHBlciB0aGF0IGNyZWF0ZXMgYW4gZW1wdHkgc3RhcnRlciBxdWVyeSBpbnB1dCBvYmplY3QuXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBhIFNpbXBsZVF1ZXJ5IGNvbmZpZ3VyZWQgdG8gZmlsdGVyIGJ1dCBvdGhlcndpc2UgZW1wdHksIHJlYWR5IHRvIGhhdmVcbiAgICAgICAgICAgICAqIG1lYXN1cmVzIGFuZCBncm91cGluZ3MgYWRkZWQuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGVtcHR5OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyOiBjbG9uZSh0aGlzLmNvbnRleHQoKS5kYXRhQ29uZmlnLmZpbHRlcilcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBIZWxwZXIgdGhhdCBjcmVhdGVzIGEgdGFibGUgcXVlcnkgd2l0aCB0aGUgc2FtZSBlZmZlY3QgYXMgcGVyIG1hbmlmZXN0LmF1dG9RdWVyeT10cnVlLlxuICAgICAgICAgICAgICogQHJldHVybnMge09iamVjdH0gYSBTaW1wbGVRdWVyeSBmdWxseSBjb25maWd1cmVkIGFzIHBlciBncm91cGluZ3MgYW5kIG1lYXN1cmVzIGZyb20gdXNlciBvcHRpb25zXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRhYmxlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQXV0b21hdGljYWxseSB1c2VzIGRhdGFDb25maWcuZmlsdGVyIChjYWxsZXIgY2FuIGNoYW5nZSBhZnRlcilcbiAgICAgICAgICAgICAgICByZXR1cm4gY2xvbmUoY29udGV4dFV0aWwucXVlcmllcy50YWJsZSh0aGlzLmNvbnRleHQoKSkpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBIZWxwZXIgdGhhdCBjcmVhdGVzIGEgZ3JpZCBxdWVyeSB3aXRoIHRoZSBzYW1lIGVmZmVjdCBhcyBwZXIgbWFuaWZlc3QuYXV0b1BhbmU9dHJ1ZS5cbiAgICAgICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gYXV0b1F1ZXJ5IElmIHRydWUsIGluY2x1ZGUgY2VsbCBxdWVyaWVzICdxdWVyeScgYW5kICdzaGFkb3dRdWVyeScgYXMgcGVyXG4gICAgICAgICAgICAgKiBtYW5pZmVzdC5hdXRvUXVlcnk9dHJ1ZS4gSWYgZmFsc2UsIGRvbid0IGluY2x1ZGUgYW55IGNlbGwgcXVlcmllcy5cbiAgICAgICAgICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGEgR3JpZFF1ZXJ5SW5wdXQgZnVsbHkgY29uZmlndXJlZCBhcyBwZXIgdXNlciBvcHRpb25zXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGdyaWQ6IGF1dG9RdWVyeSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQXV0b21hdGljYWxseSB1c2VzIGRhdGFDb25maWcuZmlsdGVyL3NoYWRvd0ZpbHRlciAoY2FsbGVyIGNhbiBjaGFuZ2UgYWZ0ZXIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsb25lKGNvbnRleHRVdGlsLnF1ZXJpZXMuZ3JpZCh0aGlzLmNvbnRleHQoKSwgYXV0b1F1ZXJ5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFVwZGF0ZXMgdGhlIGNvbnRleHQgb2JqZWN0IHdpdGggdGhlIGdpdmVuIHNlbGVjdGlvblxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gdmF1ZVxuICAgICAgICAgKiBAcmV0dXJuIHtWaWV3fVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZWxlY3Rpb24uY2xlYXIgPSBmdW5jdGlvbigpIHsgdGhpcy5jb250ZXh0KCkudmlld1NlbGVjdGlvbiA9IG51bGw7IHJldHVybiB0aGlzOyB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciB0aGF0IGNyZWF0ZXMgYSBxdWVyeSBidWlsZGVyIHByZS1jb25maWd1cmVkIHRvIHVzZSB0aGUgdmlldydzIHF1ZXJ5IGVuZHBvaW50LlxuICAgICAqIERPQ1VNRU5URUQgSU4gL1ZpZXdzL2RvY3MvYXBpL2pzL3ZpZXcuanNcbiAgICAgKi9cbiAgICBxdWVyeUJ1aWxkZXIoKSB7XG4gICAgICAgIHJldHVybiBxdWVyeS5idWlsZGVyKHRoaXMuZW5kcG9pbnQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyB0aGUgY29udGV4dCBvYmplY3Qgd2l0aCB0aGUgZ2l2ZW4gc2VsZWN0aW9uXG4gICAgICogVE9ETzogcmVtb3ZlLCB1bm5lY2Vzc2FyeVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YXVlXG4gICAgICogQHJldHVybiB7Vmlld31cbiAgICAgKi9cbiAgICBzZWxlY3Rpb24odmFsdWUpIHtcblxuICAgICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0KCkudmlld1NlbGVjdGlvbiA9IHZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0KCkudmlld1NlbGVjdGlvbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIG9yIGdldCB0aGUgcGFyZW50IGVsZW1lbnQgd2hlcmUgdG8gcmVuZGVyIHRoZSBjb250ZW50cyBvZiB0aGUgY3VzdG9tIHZpZXdcbiAgICAgKiBVTkRPQ1VNRU5URUQgYXMgaXQgaXMgb25seSByZXF1aXJlZCBmb3IgbmF0aXZlIHZpZXdzLlxuICAgICAqIEByZXR1cm4ge0hUTUxFbGVtZW50fVxuICAgICAqL1xuICAgIHBhcmVudChuZXdQYXJlbnQpIHtcbiAgICAgICAgaWYgKG5ld1BhcmVudD09PXVuZGVmaW5lZCkgcmV0dXJuIHRoaXMuX3BhcmVudDtcbiAgICAgICAgaWYgKG5ld1BhcmVudD09PW51bGwpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcGFyZW50XCIpO1xuICAgICAgICBpZiAodGhpcy5fcGFyZW50IT09bmV3UGFyZW50ICYmIHRoaXMuX3BhcmVudCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlZGVmaW5lIHBhcmVudFwiKTtcbiAgICAgICAgdGhpcy5fcGFyZW50ID0gbmV3UGFyZW50O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGNvbnRleHQgb2JqZWN0XG4gICAgICogRE9DVU1FTlRFRCBJTiAvVmlld3MvZG9jcy9hcGkvanMvdmlldy5qc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBjb250ZXh0KCkge1xuICAgICAgICBpZiAoIXRoaXMuX2NvbnRleHQpIHRocm93IG5ldyBFcnJvcihcIkNvbnRleHQgbm90IHlldCBhdmFpbGFibGUuIFlvdSBtdXN0IHdhaXQgZm9yICdsb2FkJyBldmVudCBmaXJzdC5cIik7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250ZXh0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGFjdGl2ZSBmaWx0ZXIgb2JqZWN0XG4gICAgICogVE9ETzogcmVtb3ZlLCB1bm5lY2Vzc2FyeVxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBmaWx0ZXIoKSB7XG4gICAgICAgIHJldHVybiBjb250ZXh0VXRpbC5maWx0ZXJzLmdldEZpbHRlcih0aGlzLmNvbnRleHQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBjb250ZXh0IG9iamVjdFxuICAgICAqIFRPRE86IHJlbW92ZSwgdW5uZWNlc3NhcnlcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgc2hhZG93RmlsdGVyICgpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRleHRVdGlsLmZpbHRlcnMuZ2V0U2hhZG93RmlsdGVyKHRoaXMuY29udGV4dCgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcm92aWRlcyBpbmZvcm1hdGlvbiB3aGVhdGhlciB0aGUgc2hhZG93IHNob3VsZCBiZSBhcHBsaWVkIHRvIHZpZXdcbiAgICAgKiBUT0RPOiByZW1vdmUsIHVubmVjZXNzYXJ5XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaGFzU2hhZG93ICgpIHtcbiAgICAgICAgcmV0dXJuICEhY29udGV4dFV0aWwuZmlsdGVycy5nZXRTaGFkb3dGaWx0ZXIodGhpcy5jb250ZXh0KCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgbWFwcGluZ3MgZm9yIHRoZSBkYXRhIG9mIHRoZSBwcm9qZWN0XG4gICAgICogQHJldHVybiB7TWFwcGluZ3NIZWxwZXJ9XG4gICAgICovXG4gICAgbWFwcGluZ3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tYXBwaW5ncztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGRhdGEgZnJvbSB0aGUgY29udGV4dFxuICAgICAqIFRPRE86IHJlbW92ZSwgdW5uZWNlc3NhcnksIHVuc2FmZVxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkYXRhKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuY29udGV4dCgpLnJlc3VsdCkgPyB0aGlzLmNvbnRleHQoKS5yZXN1bHQuZGF0YSA6IHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0aGUgZGF0YSBmb3JtIHRoZSBjb250ZXh0XG4gICAgICogVE9ETzogcmVtb3ZlLCB1bm5lY2Vzc2FyeSwgdW5zYWZlXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNoYWRvd0RhdGEoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5jb250ZXh0KCkucmVzdWx0KSA/IHRoaXMuY29udGV4dCgpLnJlc3VsdC5zaGFkb3dEYXRhIDoge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBkYXRhIGZvcm0gdGhlIGNvbnRleHRcbiAgICAgKiBUT0RPOiByZW1vdmUsIHdyb25nXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIHNjaGVtYSgpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmNvbnRleHQoKS5yZXN1bHQpID8gdGhpcy5jb250ZXh0KCkucmVzdWx0LnNjaGVtYSA6IFtdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgb3IgZ2V0cyB0aGUgYnVzeSBzdGF0ZSBvZiB0aGUgY3VzdG9tIHZpZXcuXG4gICAgICogRE9DVU1FTlRFRCBJTiAvVmlld3MvZG9jcy9hcGkvanMvdmlldy5qc1xuICAgICAqIEBwYXJhbSAge2Jvb2xlYW59IHZhbHVlXG4gICAgICogQHJldHVybiB7Vmlld31cbiAgICAgKi9cbiAgICBidXN5KGlzQnVzeSkge1xuXG4gICAgICAgIGlmIChpc0J1c3kgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHRoaXMuX2J1c3k7XG5cbiAgICAgICAgdGhpcy5fYnVzeSA9IGlzQnVzeTtcbiAgICAgICAgdGhpcy5fZW5kcG9pbnQuc2VuZChcImJ1c3lcIiwgaXNCdXN5KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBjdXJyZW50IHF1ZXJ5IEFQSSBlbmRwb2ludCBmb3IgdGhlIGN1c3RvbSB2aWV3XG4gICAgICogRE9DVU1FTlRFRCBJTiAvVmlld3MvZG9jcy9hcGkvanMvdmlldy5qc1xuICAgICAqIFRPRE86IHJlbW92ZSwgdW5jbGVhciwgdW5uZWNlc3NhcnlcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICovXG4gICAgZW5kcG9pbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRleHQoKS5kYXRhQ29uZmlnLnF1ZXJ5QXBpRW5kcG9pbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhbiBlcnJvciBtZXNzYWdlIHRvIHRoZSBjb250YWluZXJcbiAgICAgKiBET0NVTUVOVEVEIElOIC9WaWV3cy9kb2NzL2FwaS9qcy92aWV3LmpzXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW50ZXJuYWxcbiAgICAgKiBAcmV0dXJuIHtWaWV3fVxuICAgICAqL1xuICAgIGVycm9yKG1lc3NhZ2UsIGludGVybmFsKSB7XG4gICAgICAgIHRoaXMuX2VuZHBvaW50LnNlbmQoXCJlcnJvclwiLCB7bWVzc2FnZSwgaW50ZXJuYWx9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZCBhbiB1cGRhdGVkIG1lc3NhZ2UgdG8gdGhlIGNvbnRhaW5lci4gVGhpcyBzaG91bGQgYmUgZG9uZSBhZnRlciB0aGUgY29udGV4dCBjaGFuZ2UgaXNcbiAgICAgKiBtb2RpZmllZCwgZm9yIGV4YW1wbGUgd2hlbiB5b3UgdXBkYXRlIHRoZSBzZWxlY3Rpb25cbiAgICAgKiBET0NVTUVOVEVEIElOIC9WaWV3cy9kb2NzL2FwaS9qcy92aWV3LmpzXG4gICAgICogQHJldHVybiB7Vmlld31cbiAgICAqL1xuICAgIHVwZGF0ZWQoKSB7XG4gICAgICAgIHRoaXMuX2VuZHBvaW50LnNlbmQoXCJ1cGRhdGVcIiwgdGhpcy5jb250ZXh0KCkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kIGEgd2hpdGVzcGFjZSBtZXNzYWdlIHRvIHRoZSBjb250YWluZXIuXG4gICAgICogRE9DVU1FTlRFRCBJTiAvVmlld3MvZG9jcy9hcGkvanMvdmlldy5qc1xuICAgICAqIEByZXR1cm4ge1ZpZXd9XG4gICAgICovXG4gICAgd2hpdGVzcGFjZUNsaWNrKCkge1xuICAgICAgICB0aGlzLl9lbmRwb2ludC5zZW5kKFwid2hpdGVzcGFjZUNsaWNrXCIsIHt9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwaTtcbiIsIlxudmFyIEFwaSA9IHJlcXVpcmUoXCIuL0FwaVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0Y3JlYXRlKGVuZHBvaW50LCBwYXJlbnQpIHtcblxuXHRcdHJldHVybiBuZXcgQXBpKGVuZHBvaW50LCBwYXJlbnQpO1xuXHR9XG59O1xuIiwiXG52YXIgZW5kcG9pbnRVdGlsID0gcmVxdWlyZShcIi4vdXRpbC9lbmRwb2ludFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cblx0LyoqXG5cdCAqIEBwYXJhbSAge0VuZHBvaW50fSBlbmRwb2ludFxuXHQgKiBAcGFyYW0gIHtFbGVtZW50PX0gcGFyZW50XG5cdCAqIEByZXR1cm4ge09iamVjdH1cblx0ICovXG5cdGJ1aWxkKGVuZHBvaW50LCBwYXJlbnQpIHtcblxuXHRcdHZhciByZXN1bHQgPSB7fTtcblxuXHRcdGlmICghZW5kcG9pbnQpIGVuZHBvaW50ID0gZW5kcG9pbnRVdGlsLmRlZmF1bHQoKTtcblx0XHRpZiAoZW5kcG9pbnQpIHtcblx0XHRcdC8vIFRoZXNlIHJlcXVpcmUgYW4gZW5kcG9pbnRcblx0XHRcdHJlc3VsdC52aWV3ID0gcmVxdWlyZShcIi4vYXBpL2luZGV4LmpzXCIpLmNyZWF0ZShlbmRwb2ludCwgcGFyZW50KTtcblx0XHRcdHJlc3VsdC50b29scyA9IHJlcXVpcmUoXCIuL3Rvb2xzXCIpLmNyZWF0ZShlbmRwb2ludCk7XG5cdFx0fVxuXG5cdFx0Ly8gVGhlc2UgZG9uJ3Rcblx0XHRyZXN1bHQucXVlcnkgPSByZXF1aXJlKFwiQHZpc29raW8vcXVlcnktYXBpXCIpO1xuXHRcdHJlc3VsdC5wYW5pbmcgPSByZXF1aXJlKFwiQHZpc29raW8vcGFuaW5nXCIpO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufTtcbiIsIlxuY2xhc3MgV2F0ZXJtYXJrIHtcblx0Y29uc3RydWN0b3IoZW5kcG9pbnQpIHtcblx0XHR0aGlzLl9lbmRwb2ludCA9IGVuZHBvaW50IHx8IHJlcXVpcmUoXCIuLi91dGlsL2VuZHBvaW50XCIpLmVuZHBvaW50O1xuXHR9XG5cblx0c2hvdyhpbmZvKSB7XG5cdFx0dGhpcy5fZW5kcG9pbnQuc2VuZChcIndhdGVybWFyay5zaG93XCIsIGluZm8pO1xuXHR9XG5cblx0aGlkZShpZCkge1xuXHRcdHRoaXMuX2VuZHBvaW50LnNlbmQoXCJ3YXRlcm1hcmsuaGlkZVwiLCBpZCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXYXRlcm1hcms7XG4iLCJcbnZhciBXYXRlcm1hcmsgPSByZXF1aXJlKFwiLi9XYXRlcm1hcmtcIik7XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGNyZWF0ZShlbmRwb2ludCkge1xuXHRcdHJldHVybiAge1xuXHRcdFx0d2F0ZXJtYXJrOiBuZXcgV2F0ZXJtYXJrKGVuZHBvaW50KVxuXHRcdH07XG5cdH1cbn07XG4iLCJcclxuLy8gVEhJcyBpcyBvbmx5IHVzZWQgd2hlbiBkZWFsaW5nIHdpdGggaWZyYW1lIGNvbW11bmljYXRpb24sIHRoZSBuYXRpdmUgb25lIGlzIGRvbmUgYnkgcmVxdWlyaW5nIHRoZSBhcGkgZmFjdG9yeSBtZXRob2QgbW9kdWxlXHJcbi8vIGFuZCBzZXR0aW5nIGFuIGVucG9pbnQgcHJldmlvdXNseSBjcmVhdGVkIGJ5IHRoZSBsb2FkZXJcclxuXHJcbnZhciBjb21tID0gcmVxdWlyZShcIkB2aXNva2lvL2NoYXJ0LWNvbW11bmljYXRpb25cIik7XHJcbnZhciBxdWVyeSA9IHJlcXVpcmUoXCJAdmlzb2tpby9jb21tb24vc3JjL3V0aWwvdXJsXCIpLnBhcnNlKCk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHJcbiAgICBkZWZhdWx0KCkge1xyXG5cclxuICAgICAgICBpZighcXVlcnkuc291cmNlIHx8ICFxdWVyeS50YXJnZXQpIHtcclxuICAgICAgICAgICAgLy8gVGhpcyBpcyBub3cgcGVybWl0dGVkLCBzbyB5b3UgY2FuIHVzZSB0aGUgb21uaXNjb3BlLmpzIGxpYnJhcnkgb3V0c2lkZSBvZiBhIHZpZXcsXHJcbiAgICAgICAgICAgIC8vIGUuZy4gZm9yIHF1ZXJ5IGJ1aWxkaW5nLlxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5hYmxlIHRvIGNyZWF0ZSBjb21tdW5pY2F0aW9uIGNoYW5uZWwgaW4gXCIke3dpbmRvdy5sb2NhdGlvbi5ocmVmfVwiIHdpdGggdmlldyBmb3IgdGhlIHNvdXJjZSBcIiR7cXVlcnkuc291cmNlfVwiIGFuZCB0YXJnZXQgXCIke3F1ZXJ5LnRhcmdldH1cImApO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb21tLmVuZHBvaW50KHF1ZXJ5LnRhcmdldCwgcXVlcnkuc291cmNlLCB3aW5kb3cucGFyZW50KTtcclxuICAgIH1cclxufTtcclxuIiwiXHJcblwidXNlIHN0cmljdFwiO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9zcmNcIik7XHJcbiIsIlxyXG5cInVzZSBzdHJpY3RcIjtcclxuXHJcbnZhciBRdWVyeUJ1aWxkZXIgPSByZXF1aXJlKFwiLi9xdWVyeS9RdWVyeUJ1aWxkZXJcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIGJ1aWxkZXI6IGZ1bmN0aW9uKGVuZHBvaW50LCB0cmFuc2xhdGVPcHRpb25zKSB7XHJcbiAgICAgICAgaWYgKCFlbmRwb2ludCkgdGhyb3cgbmV3IEVycm9yKFwiRW5kcG9pbnQgbm90IGRlZmluZWQsIGRpZCB5b3UgYWNjZXNzIG9tbmlzY29wZS52aWV3LmVuZHBvaW50KCkgYmVmb3JlIGxvYWQvdXBkYXRlIGhhcHBlbj9cIik7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBRdWVyeUJ1aWxkZXIoZW5kcG9pbnQsIHRyYW5zbGF0ZU9wdGlvbnMpO1xyXG4gICAgfVxyXG59O1xyXG4iLCJcbnZhciBRdWV1ZWRRdWVyeVJlcXVlc3QgPSByZXF1aXJlKFwiLi9RdWV1ZWRRdWVyeVJlcXVlc3RcIik7XG52YXIgY2xvbmUgPSByZXF1aXJlKFwiQHZpc29raW8vY29tbW9uL3NyYy91dGlsL2Nsb25lXCIpO1xuXG4vLyBWZXJzaW9uIG9mIHRoZSBRdWVyeSBBUEkgdG8gdXNlIHdoZW4gd2UgbWFrZSB0aGUgY2FsbHMgdG8gdGhlIGVuZHBvaW50XG52YXIgUVVFUllfQVBJX1ZFUlNJT04gPSBcIjFcIjtcblxuLyoqXG4gKiBPYmplY3QgdXNlZCB0byBjcmVhdGUgcXVlcnkgb2JqZWN0cyB0aGF0IGNhbiBtYWtlIHJlcXVlc3QgdG8gdGhlIHF1ZXJ5IGFwaVxuICovXG5jbGFzcyBRdWVyeUJ1aWxkZXIge1xuXG5cdC8qKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHtzdHJpbmd9IGVuZHBvaW50IFVybCBvZiB0aGUgZW5kcG9pbnQgbWludXMgdGhlIHZlcnNpb24sIHRoZSAvdlguWC8gd2lsbCBiZSBpbmplY3RlZC5cblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgIEZvciBleGFtcGxlIFwiaHR0cDovL2xvY2FsaG9zdDo0MTEyMS9tb2JpbGUvYXBpXCJcblx0ICovXG5cdGNvbnN0cnVjdG9yKGVuZHBvaW50KSB7XG5cblx0XHQvKipcblx0XHQgKiBRdWVyeSBBUEkgZW5kcG9pbnRcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEB0eXBlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0dGhpcy5fZW5kcG9pbnQgPSBlbmRwb2ludDtcblxuXHRcdC8qKlxuXHRcdCAqIEJhc2UgdXJsIHVzZWQgZm9yIHRoZSBjYWxscywgY29tcG9zZSB3aXRoIHRoZSBlbmRwb2ludCBhbmQgdGhlIHZlcnNpb25cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqIEB0eXBlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0dGhpcy5fYmFzZVVybCA9IHRoaXMuX2VuZHBvaW50ICsgXCIvdlwiICsgUVVFUllfQVBJX1ZFUlNJT04gKyBcIi9cIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBuZXcgcXVlcnkgb2JqZWN0IHdpdGggdGhlIHNwZWNpZmllZCBtZXRob2QgYW5kIHF1ZXJ5XG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgXHRcdFVybCBvZiB0aGUgZW5kcG9pbnQsIHRoaXMuX2Jhc2VVcmwsIGluY2x1ZGluZyB0aGUgbWV0aG9kLlxuXHQgKiAgICAgICAgICAgICAgICAgICAgICAgXHRGb3IgZXhhbXBsZSBcImh0dHA6Ly9sb2NhbGhvc3QvYXBpL3YxL3RhYmxlXCJcblx0ICogQHBhcmFtIHtvYmplY3R9IHF1ZXJ5IFx0UXVlcnkgQVBJIGlucHV0IG9iamVjdCAoc2VlIFF1ZXJ5IEFQSSBkb2NzKS5cblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgIEZvciBleGFtcGxlIHtcImZpZWxkc1wiOiBbXCJQcm9kdWN0X25hbWVcIl19XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBmaWx0ZXJzIFx0T3B0aW9uYWwgZmlsdGVycywgd2lsbCBiZSBpbnNlcnRlZCBpbnRvIHRoZSBxdWVyeSBQRU5ESU5HIGdldCByaWQgb2YgdGhpc1xuXHQgKi9cblx0X3JlcXVlc3QodXJsLCBxdWVyeSwgZmlsdGVycykge1xuXG5cdFx0dmFyIHBhcmFtcyA9IGNsb25lKHF1ZXJ5KTtcblxuXHRcdC8vIFdlIG5lZWQgdG8gZmlsdGVyIHNpbmNlIGEgZmlsdGVyOiBudWxsIHdvdWxkIHJldHVybiBhbmQgZXJyb3Jcblx0XHRpZiAoZmlsdGVycykge1xuXHRcdFx0cGFyYW1zLmZpbHRlciA9IGZpbHRlcnM7XG5cdFx0fVxuXG5cdFx0Ly8gQ2FsbCB0aGUgYXBpIGluIGEgcXVldWUgaW5zdGVhZCBvZiBkb2luZyBpdCBkaXJlY3RseVxuXHRcdC8vIHNvIHdlIGRvbnQgbWFrZSB0b28gbWFueSByZXF1ZXN0IGluIHBhcmFsbGVsIGFuZCBraWxsIHRoZSBzZXJ2ZXJcblx0XHRyZXR1cm4gbmV3IFF1ZXVlZFF1ZXJ5UmVxdWVzdCh7XG5cdFx0XHR1cmwsXG5cdFx0XHRtZXRob2Q6IFwiUE9TVFwiLFxuXHRcdFx0ZGF0YTogcGFyYW1zXG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogVGFibGUgYXBpIHF1ZXJ5IChzZWUgUXVlcnkgQVBJIGRvY3MpLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gcXVlcnlcblx0ICogQHBhcmFtIHtPYmplY3R9IGZpbHRlcnNcblx0ICovXG5cdF90YWJsZShxdWVyeSwgZmlsdGVycykge1xuXHRcdHJldHVybiB0aGlzLl9yZXF1ZXN0KFxuXHRcdFx0dGhpcy5fYmFzZVVybCArIFwidGFibGVcIixcblx0XHRcdHF1ZXJ5LFxuXHRcdFx0ZmlsdGVyc1xuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0dGVyIHRoYXQgcmV0dXJucyB0aGUgbWV0aG9kIHRoYXQgbWFrZSB0aGUgZGVmYXVsdCB0YWJsZSBxdWVyeS4gSXQgaGFzIHByb3BlcnRpZXMgbWFwcGVkXG5cdCAqIHRvIGFsbCB0aGUgZGlmZmVyZW50IG9wZXJhdGlvbnMgdGhhdCB5b3UgY2FuIGRvIGluIHRoZSB0YWJsZSBhcGkuXG5cdCAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuXHQgKi9cblx0Z2V0IHRhYmxlKCkge1xuXG5cdFx0dmFyIG1ldGhvZCA9IHRoaXMuX3RhYmxlLmJpbmQodGhpcyk7XG5cblx0XHRyZXR1cm4gbWV0aG9kO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdyaWQgc2l6ZSBhbmQgZGF0YSBhcGkgcXVlcnkgKHNlZSBRdWVyeSBBUEkgZG9jcykuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBxdWVyeVxuXHQgKi9cblx0X2dyaWQocXVlcnksIGZpbHRlcnMpIHtcblx0XHRyZXR1cm4gdGhpcy5fcmVxdWVzdChcblx0XHRcdHRoaXMuX2Jhc2VVcmwgKyBcImdyaWRcIixcblx0XHRcdHF1ZXJ5LFxuXHRcdFx0ZmlsdGVyc1xuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogR3JpZCBzaXplIGFwaSBxdWVyeSAoc2VlIFF1ZXJ5IEFQSSBkb2NzKS5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtPYmplY3R9IHF1ZXJ5XG5cdCAqL1xuXHRfZ3JpZFNpemUocXVlcnksIGZpbHRlcnMpIHtcblx0XHRyZXR1cm4gdGhpcy5fcmVxdWVzdChcblx0XHRcdHRoaXMuX2Jhc2VVcmwgKyBcImdyaWQvc2l6ZVwiLFxuXHRcdFx0cXVlcnksXG5cdFx0XHRmaWx0ZXJzXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHcmlkIGRhdGEgYXBpIHF1ZXJ5IChzZWUgUXVlcnkgQVBJIGRvY3MpLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gcXVlcnlcblx0ICovXG5cdF9ncmlkRGF0YShxdWVyeSwgZmlsdGVycykge1xuXHRcdHJldHVybiB0aGlzLl9yZXF1ZXN0KFxuXHRcdFx0dGhpcy5fYmFzZVVybCArIFwiZ3JpZC9kYXRhXCIsXG5cdFx0XHRxdWVyeSxcblx0XHRcdGZpbHRlcnNcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHRlciB0aGF0IHJldHVybnMgdGhlIG1ldGhvZCB0aGF0IG1ha2UgdGhlIGRlZmF1bHQgZ3JpZCBxdWVyeS4gSXQgaGFzIHByb3BlcnRpZXMgbWFwcGVkXG5cdCAqIHRvIGFsbCB0aGUgZGlmZmVyZW50IG9wZXJhdGlvbnMgdGhhdCB5b3UgY2FuIGRvIGluIHRoZSBncmlkIGFwaS4gRm9yIGV4YW1wbGUgeW91IGNhbiBkbyBcIi5ncmlkKClcIiBvclxuXHQgKiBcIi5ncmlkLnNpemUoKVwiXG5cdCAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuXHQgKi9cblx0Z2V0IGdyaWQoKSB7XG5cblx0XHR2YXIgbWV0aG9kID0gdGhpcy5fZ3JpZC5iaW5kKHRoaXMpO1xuXHRcdG1ldGhvZC5zaXplID0gdGhpcy5fZ3JpZFNpemUuYmluZCh0aGlzKTtcblx0XHRtZXRob2QuZGF0YSA9IHRoaXMuX2dyaWREYXRhLmJpbmQodGhpcyk7XG5cblx0XHRyZXR1cm4gbWV0aG9kO1xuXHR9XG5cblx0LyoqXG5cdCogR3JpZCBkYXRhIGFwaSBxdWVyeSAoc2VlIFF1ZXJ5IEFQSSBkb2NzKS5cblx0KiBAcHJpdmF0ZVxuXHQqL1xuXHRfc2NoZW1hRmllbGRzKCkgeyAvLyBQRU5ESU5HOiB1cGRhdGUsIG5vdyBkZXByZWNhdGVkLCBpbnN0ZWFkIHdlIGhhdmUgbmV3IHNjaGVtYShxdWVyeSkgPiBvYmplY3Rcblx0XHRyZXR1cm4gdGhpcy5fcmVxdWVzdChcblx0XHRcdHRoaXMuX2Jhc2VVcmwgKyBcInNjaGVtYS9maWVsZHNcIixcblx0XHRcdHt9XG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQqIEdldHRlciB0aGF0IHJldHVybnMgdGhlIG1ldGhvZCB0aGF0IG1ha2UgdGhlIGRlZmF1bHQgZ3JpZCBxdWVyeS4gSXQgaGFzIHByb3BlcnRpZXMgbWFwcGVkXG5cdCogdG8gYWxsIHRoZSBkaWZmZXJlbnQgb3BlcmF0aW9ucyB0aGF0IHlvdSBjYW4gZG8gaW4gdGhlIGdyaWQgYXBpLiBGb3IgZXhhbXBsZSB5b3UgY2FuIGRvIFwiLmdyaWQoKVwiIG9yXG5cdCogXCIuZ3JpZC5zaXplKClcIlxuXHQqIEByZXR1cm4ge0Z1bmN0aW9ufVxuXHQqL1xuXHRnZXQgc2NoZW1hKCkge1xuXG5cdFx0dmFyIG1ldGhvZCA9IHRoaXMuX3NjaGVtYUZpZWxkcy5iaW5kKHRoaXMpO1xuXHRcdG1ldGhvZC5maWVsZHMgPSB0aGlzLl9zY2hlbWFGaWVsZHMuYmluZCh0aGlzKTtcblxuXHRcdHJldHVybiBtZXRob2Q7XG5cdH1cblxuXHQvKipcblx0ICogQmF0Y2ggYXBpIHF1ZXJ5IChzZWUgUXVlcnkgQVBJIGRvY3MpLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge09iamVjdH0gcXVlcmllcyBUaGUgb2JqZWN0IGNvbnRhaW5pbmcgYSBiYXRjaCBvZiBrZXllZCBxdWVyaWVzLCBvciBhbiBhcnJheSBjb250YWluaW5nIHRoZSBiYXRjaCBvZiBxdWVyaWVzLlxuXHQgKi9cblx0X2JhdGNoKHF1ZXJ5LCBmaWx0ZXJzKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3JlcXVlc3QoXG5cdFx0XHR0aGlzLl9iYXNlVXJsICsgXCJiYXRjaFwiLFxuXHRcdFx0cXVlcnlcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHRlciB0aGF0IHJldHVybnMgdGhlIG1ldGhvZCB0aGF0IG1ha2VzIHRoZSBiYXRjaCBxdWVyeS5cblx0ICogQHJldHVybiB7RnVuY3Rpb259XG5cdCAqL1xuXHRnZXQgYmF0Y2goKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2JhdGNoLmJpbmQodGhpcyk7XG5cdH1cblxuXHRlbmRwb2ludCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fZW5kcG9pbnQ7XG5cdH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5QnVpbGRlcjtcbiIsIlxudmFyIHF1ZXVlID0gcmVxdWlyZShcIi4uL3V0aWwvcXVldWVcIik7XG52YXIgUmVxdWVzdCA9IHJlcXVpcmUoXCJAdmlzb2tpby9jb21tb24vc3JjL3hoci9SZXF1ZXN0XCIpO1xuXG4vKipcbiAqIENsYXNzIHRoYXQgcmVwcmVzZW50IGEgcXVldWVzIHF1ZXJ5IGNhbGxcbiAqL1xuY2xhc3MgUXVldWVkUXVlcnlSZXF1ZXN0IGV4dGVuZHMgUmVxdWVzdCB7XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHF1ZXJ5XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpblxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHt1cmwsIG1ldGhvZCwgZGF0YSwgcmVzcENvbnRlbnRUeXBlLCBjb250ZW50VHlwZSwgb3JpZ2lufSkge1xuICAgICAgICBzdXBlcih7dXJsLCBtZXRob2QsIGRhdGEsIHJlc3BDb250ZW50VHlwZSwgY29udGVudFR5cGV9KTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogT3JpZ2luIG9mIHRoZSBxdWVyeS4gVXNlZCB0byBjcmVhdGUgZGlmZmVyZW50IHF1ZXVlcyBUT0RPIGltcGxlbWVudCB0aGlzIGFuZCBtYWtlIFF1ZXVlZFF1ZXJ5IGluIGZhY3RcbiAgICAgICAgICogYSBjb21tb24gdXRpbCBRdWV1ZWRSZXF1ZXN0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb3JpZ2luID0gb3JpZ2luO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgdGhlIHF1ZXJ5IGJ5IGFkZGluZyBpdCB0byB0aGUgcXVldWUgaXNudGFlYWQgb2YgZG9pbmcgaXQgZGlyZWN0bHlcbiAgICAgKiBAcmV0dXJuIHtRdWV1ZWRRdWVyeX1cbiAgICAgKi9cbiAgICBleGVjdXRlKCkge1xuXG4gICAgICAgIC8vIFdlIGJ1aWxkIGFuZCBvYmplY3Qgd2l0aCB0aGUgaW5zdGFuY2Ugc28gdGhlIHF1ZXVlIGNhbiBsaXN0ZW4gdG8gaXRzIGV2ZW50c1xuICAgICAgICAvLyBhbmQgdGhlIG9yaWdpbmFsIGV4ZWN1dGUgbWVodG9kIG9mIHRoZSBxdWVyeVxuICAgICAgICBxdWV1ZS5hZGQoe1xuICAgICAgICAgICAgaW5zdGFuY2U6IHRoaXMsXG4gICAgICAgICAgICBleGVjdXRlOiBzdXBlci5leGVjdXRlLmJpbmQodGhpcylcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5lbWl0KFwicXVldWVcIiwge3hocjogdGhpcy5feGhyfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXVlZFF1ZXJ5UmVxdWVzdDtcbiIsIi8qKlxuKiBOdW1iZXIgb2YgcXVlcmllcyB3ZSBjYW4gcnVuIGluIHBhcmFsbGVsIHdoZW4gd2UgZG8gYSBxdWV1ZWQgcXVlcnkuXG4qIEB0eXBlIHtudW1iZXJ9XG4qL1xudmFyIFBBUkFMRUxMX1FVRVJJRVMgPSAxO1xuXG4vKipcbiogTGlzdCBvZiBwZW5kaW5nIHF1ZXJpZXNcbiogQHR5cGUge0FycmF5fVxuKi9cbnZhciBxdWV1ZSA9IFtdO1xuXG4vKipcbiAqIExpc3Qgb2YgY3VycmVudGx5IGV4ZWN1dGlnbiBxdWVyaWVzXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cbnZhciBleGVjdXRpbmcgPSBbXTtcblxuLyoqXG4gKiBNZXRob2QgdGhhdCBjaGVja3MgaWYgd2Ugc2hvdWxkIGV4ZWN1dGUgYSBwZW5kaW5nIHF1ZXJ5XG4gKi9cbmZ1bmN0aW9uIGNoZWNrKCkge1xuXG4gICAgaWYgKGV4ZWN1dGluZy5sZW5ndGggPj0gUEFSQUxFTExfUVVFUklFUyB8fCAhcXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgaXRlbSA9IChxdWV1ZS5zcGxpY2UoMCwgMSkpWzBdO1xuXG4gICAgaXRlbS5pbnN0YW5jZS5vbihcImVuZFwiLCBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgcG9zaXRpb24gPSBleGVjdXRpbmcuaW5kZXhPZih0aGlzKTtcbiAgICAgICAgZXhlY3V0aW5nLnNwbGljZShwb3NpdGlvbiwgMSk7XG5cbiAgICAgICAgY2hlY2soKTtcblxuICAgIH0uYmluZChpdGVtKSk7XG5cbiAgICBpdGVtLmV4ZWN1dGUoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICAvKipcbiAgICAgKiBBZGQgYSBvYmplY3Qgd2l0aCB0aGUgcXVlcnkgaW5zdGFuY2UgYW5kIGV4ZWN1dGUgbWV0aG9kIGFzIGFuIGl0ZW0gdG8gdGhlIHF1ZXVlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHF1ZXJ5IFF1ZXJ5IGxpa2Ugb2JqZWN0IHdpdGggdGhlIGluc3RhbmNlIGFuZCB0aGUgZXhlY3V0ZSBtZXRob2Q6XG4gICAgICogICAgICAgICAgICAgICAgICAgICAgIHtpbnN0YW5jZTogUXVlcnksIGV4ZWN1dGU6IGZ1bmN0aW9uKCl7fX1cbiAgICAgKi9cbiAgICBhZGQ6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcXVldWUucHVzaChpdGVtKTtcbiAgICAgICAgY2hlY2soKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdGhlIHBlbmRpbmcgcXVldWUuIElmIGNhbmNlbCBpcyB0cnVlIGFsc28gY2FuY2VsYWxsIHRoZSBjdXJyZW50bHkgZXhlY3V0aW5nIHF1ZXJpZXNcbiAgICAgKiBAcGFyYW0gIHtib29sZWFufSBjYW5jZWxcbiAgICAgKi9cbiAgICBjbGVhcjogZnVuY3Rpb24oY2FuY2VsKSB7XG4gICAgICAgIHF1ZXVlID0gW107XG5cbiAgICAgICAgaWYgKGNhbmNlbCkge1xuICAgICAgICAgICAgZXhlY3V0aW5nLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICBpdGVtLmluc3RhbmNlLmNhbmNlbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuIiwiXHJcbndpbmRvdy5vbW5pc2NvcGUgPSByZXF1aXJlKFwiLi9zcmNcIikuYnVpbGQoKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gd2luZG93Lm9tbmlzY29wZS52aWV3O1xyXG4iXX0=
