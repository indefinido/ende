/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("segmentio~extend@1.0.0", function (exports, module) {

module.exports = function extend (object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }

    return object;
};
});

require.register("pluma~assimilate@0.3.0", function (exports, module) {
/*! assimilate 0.3.0 Copyright (c) 2013 Alan Plum. MIT licensed. */
var slice = Array.prototype.slice;

function bind(fn, self) {
    var args = slice.call(arguments, 2);
    if (typeof Function.prototype.bind === 'function') {
        return Function.prototype.bind.apply(fn, [self].concat(args));
    }
    return function() {
        return fn.apply(self, args.concat(slice.call(arguments, 0)));
    };
}

function simpleCopy(target, name, source) {
    target[name] = source[name];
}

function properCopy(target, name, source) {
    var descriptor = Object.getOwnPropertyDescriptor(source, name);
    Object.defineProperty(target, name, descriptor);
}

function ownProperties(obj) {
    return Object.getOwnPropertyNames(obj);
}

function allKeys(obj) {
    var keys = [];
    for (var name in obj) {
        keys.push(name);
    }
    return keys;
}

function ownKeys(obj) {
    var keys = [];
    for (var name in obj) {
        if (obj.hasOwnProperty(name)) {
            keys.push(name);
        }
    }
    return keys;
}

function assimilateWithStrategy(target) {
    var strategy = this,
    sources = slice.call(arguments, 1),
    i, source, names, j, name;

    if (target === undefined || target === null) {
        target = {};
    }

    for (i = 0; i < sources.length; i++) {
        source = sources[i];
        names = strategy.keysFn(source);
        for (j = 0; j < names.length; j++) {
            name = names[j];
            strategy.copyFn(target, name, source);
        }
    }

    return target;
}

var strategies = {
    DEFAULT: {
        keysFn: ownKeys,
        copyFn: simpleCopy
    },
    PROPER: {
        keysFn: ownProperties,
        copyFn: properCopy
    },
    INHERITED: {
        keysFn: allKeys,
        copyFn: simpleCopy
    },
    DEEP: {
        keysFn: ownKeys,
        copyFn: function recursiveCopy(target, name, source) {
            var val = source[name];
            var old = target[name];
            if (typeof val === 'object' && typeof old === 'object') {
                assimilateWithStrategy.call(strategies.DEEP, old, val);
            } else {
                simpleCopy(target, name, source);
            }
        }
    },
    STRICT: {
        keysFn: ownKeys,
        copyFn: function strictCopy(target, name, source) {
            if (source[name] !== undefined) {
                simpleCopy(target, name, source);
            }
        }
    },
    FALLBACK: {
        keysFn: function fallbackCopy(target, name, source) {
            if (target[name] === undefined) {
                simpleCopy(target, name, source);
            }
        },
        copyFn: simpleCopy
    }
};

var assimilate = bind(assimilateWithStrategy, strategies.DEFAULT);
assimilate.strategies = strategies;
assimilate.withStrategy = function withStrategy(strategy) {
    if (typeof strategy === 'string') {
        strategy = strategies[strategy.toUpperCase()];
    }
    if (!strategy) {
        throw new Error('Unknwon or invalid strategy:' + strategy);
    }
    if (typeof strategy.copyFn !== 'function') {
        throw new Error('Strategy missing copy function:' + strategy);
    }
    if (typeof strategy.keysFn !== 'function') {
        throw new Error('Strategy missing keys function:' + strategy);
    }
    return bind(assimilateWithStrategy, strategy);
};

module.exports = assimilate;
});

require.register("paulmillr~es6-shim@0.10.1", function (exports, module) {
// ES6-shim 0.10.1 (c) 2013-2014 Paul Miller (http://paulmillr.com)
// ES6-shim may be freely distributed under the MIT license.
// For more details and documentation:
// https://github.com/paulmillr/es6-shim/

(function(undefined) {
  'use strict';

  var isCallableWithoutNew = function(func) {
    try { func(); }
    catch (e) { return false; }
    return true;
  };

  var supportsSubclassing = function(C, f) {
    /* jshint proto:true */
    try {
      var Sub = function() { C.apply(this, arguments); };
      if (!Sub.__proto__) { return false; /* skip test on IE < 11 */ }
      Object.setPrototypeOf(Sub, C);
      Sub.prototype = Object.create(C.prototype, {
        constructor: { value: C }
      });
      return f(Sub);
    } catch (e) {
      return false;
    }
  };

  var arePropertyDescriptorsSupported = function() {
    try {
      Object.defineProperty({}, 'x', {});
      return true;
    } catch (e) { /* this is IE 8. */
      return false;
    }
  };

  var startsWithRejectsRegex = function() {
    var rejectsRegex = false;
    if (String.prototype.startsWith) {
      try {
        '/a/'.startsWith(/a/);
      } catch (e) { /* this is spec compliant */
        rejectsRegex = true;
      }
    }
    return rejectsRegex;
  };

  var main = function() {
    var globals = (typeof global === 'undefined') ? window : global;
    var global_isFinite = globals.isFinite;
    var supportsDescriptors = !!Object.defineProperty && arePropertyDescriptorsSupported();
    var startsWithIsCompliant = startsWithRejectsRegex();
    var _slice = Array.prototype.slice;
    var _indexOf = String.prototype.indexOf;
    var _toString = Object.prototype.toString;
    var _hasOwnProperty = Object.prototype.hasOwnProperty;

    // Define configurable, writable and non-enumerable props
    // if they don’t exist.
    var defineProperties = function(object, map) {
      Object.keys(map).forEach(function(name) {
        var method = map[name];
        if (name in object) return;
        if (supportsDescriptors) {
          Object.defineProperty(object, name, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: method
          });
        } else {
          object[name] = method;
        }
      });
    };

    // This is a private name in the es6 spec, equal to '[Symbol.iterator]'
    // we're going to use an arbitrary _-prefixed name to make our shims
    // work properly with each other, even though we don't have full Iterator
    // support.  That is, `Array.from(map.keys())` will work, but we don't
    // pretend to export a "real" Iterator interface.
    var $iterator$ = (typeof Symbol === 'object' && Symbol.iterator) ||
      '_es6shim_iterator_';
    // Firefox ships a partial implementation using the name @@iterator.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14
    // So use that name if we detect it.
    if (globals.Set && typeof new globals.Set()['@@iterator'] === 'function') {
      $iterator$ = '@@iterator';
    }
    var addIterator = function(prototype, impl) {
      if (!impl) { impl = function iterator() { return this; }; }
      var o = {};
      o[$iterator$] = impl;
      defineProperties(prototype, o);
    };

    // taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js
    // can be replaced with require('is-arguments') if we ever use a build process instead
    var isArguments = function isArguments(value) {
      var str = _toString.call(value);
      var result = str === '[object Arguments]';
      if (!result) {
        result = str !== '[object Array]' &&
          value !== null &&
          typeof value === 'object' &&
          typeof value.length === 'number' &&
          value.length >= 0 &&
          _toString.call(value.callee) === '[object Function]';
      }
      return result;
    };

    var emulateES6construct = function(o) {
      if (!ES.TypeIsObject(o)) throw new TypeError('bad object');
      // es5 approximation to es6 subclass semantics: in es6, 'new Foo'
      // would invoke Foo.@@create to allocation/initialize the new object.
      // In es5 we just get the plain object.  So if we detect an
      // uninitialized object, invoke o.constructor.@@create
      if (!o._es6construct) {
        if (o.constructor && ES.IsCallable(o.constructor['@@create'])) {
          o = o.constructor['@@create'](o);
        }
        defineProperties(o, { _es6construct: true });
      }
      return o;
    };

    var ES = {
      CheckObjectCoercible: function(x, optMessage) {
        /* jshint eqnull:true */
        if (x == null)
          throw new TypeError(optMessage || ('Cannot call method on ' + x));
        return x;
      },

      TypeIsObject: function(x) {
        /* jshint eqnull:true */
        // this is expensive when it returns false; use this function
        // when you expect it to return true in the common case.
        return x != null && Object(x) === x;
      },

      ToObject: function(o, optMessage) {
        return Object(ES.CheckObjectCoercible(o, optMessage));
      },

      IsCallable: function(x) {
        return typeof x === 'function' &&
          // some versions of IE say that typeof /abc/ === 'function'
          _toString.call(x) === '[object Function]';
      },

      ToInt32: function(x) {
        return x >> 0;
      },

      ToUint32: function(x) {
        return x >>> 0;
      },

      ToInteger: function(value) {
        var number = +value;
        if (Number.isNaN(number)) return 0;
        if (number === 0 || !Number.isFinite(number)) return number;
        return Math.sign(number) * Math.floor(Math.abs(number));
      },

      ToLength: function(value) {
        var len = ES.ToInteger(value);
        if (len <= 0) return 0; // includes converting -0 to +0
        if (len > Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;
        return len;
      },

      SameValue: function(a, b) {
        if (a === b) {
          // 0 === -0, but they are not identical.
          if (a === 0) return 1 / a === 1 / b;
          return true;
        }
        return Number.isNaN(a) && Number.isNaN(b);
      },

      SameValueZero: function(a, b) {
        // same as SameValue except for SameValueZero(+0, -0) == true
        return (a === b) || (Number.isNaN(a) && Number.isNaN(b));
      },

      IsIterable: function(o) {
        return ES.TypeIsObject(o) &&
          (o[$iterator$] !== undefined || isArguments(o));
      },

      GetIterator: function(o) {
        if (isArguments(o)) {
          // special case support for `arguments`
          return new ArrayIterator(o, "value");
        }
        var it = o[$iterator$]();
        if (!ES.TypeIsObject(it)) {
          throw new TypeError('bad iterator');
        }
        return it;
      },

      IteratorNext: function(it) {
        var result = (arguments.length > 1) ? it.next(arguments[1]) : it.next();
        if (!ES.TypeIsObject(result)) {
          throw new TypeError('bad iterator');
        }
        return result;
      },

      Construct: function(C, args) {
        // CreateFromConstructor
        var obj;
        if (ES.IsCallable(C['@@create'])) {
          obj = C['@@create']();
        } else {
          // OrdinaryCreateFromConstructor
          obj = Object.create(C.prototype || null);
        }
        // Mark that we've used the es6 construct path
        // (see emulateES6construct)
        defineProperties(obj, { _es6construct: true });
        // Call the constructor.
        var result = C.apply(obj, args);
        return ES.TypeIsObject(result) ? result : obj;
      }
    };

    var numberConversion = (function () {
      // from https://github.com/inexorabletash/polyfill/blob/master/typedarray.js#L176-L266
      // with permission and license, per https://twitter.com/inexorabletash/status/372206509540659200

      function roundToEven(n) {
        var w = Math.floor(n), f = n - w;
        if (f < 0.5) {
          return w;
        }
        if (f > 0.5) {
          return w + 1;
        }
        return w % 2 ? w + 1 : w;
      }

      function packIEEE754(v, ebits, fbits) {
        var bias = (1 << (ebits - 1)) - 1,
          s, e, f, ln,
          i, bits, str, bytes;

        // Compute sign, exponent, fraction
        if (v !== v) {
          // NaN
          // http://dev.w3.org/2006/webapi/WebIDL/#es-type-mapping
          e = (1 << ebits) - 1;
          f = Math.pow(2, fbits - 1);
          s = 0;
        } else if (v === Infinity || v === -Infinity) {
          e = (1 << ebits) - 1;
          f = 0;
          s = (v < 0) ? 1 : 0;
        } else if (v === 0) {
          e = 0;
          f = 0;
          s = (1 / v === -Infinity) ? 1 : 0;
        } else {
          s = v < 0;
          v = Math.abs(v);

          if (v >= Math.pow(2, 1 - bias)) {
            e = Math.min(Math.floor(Math.log(v) / Math.LN2), 1023);
            f = roundToEven(v / Math.pow(2, e) * Math.pow(2, fbits));
            if (f / Math.pow(2, fbits) >= 2) {
              e = e + 1;
              f = 1;
            }
            if (e > bias) {
              // Overflow
              e = (1 << ebits) - 1;
              f = 0;
            } else {
              // Normal
              e = e + bias;
              f = f - Math.pow(2, fbits);
            }
          } else {
            // Subnormal
            e = 0;
            f = roundToEven(v / Math.pow(2, 1 - bias - fbits));
          }
        }

        // Pack sign, exponent, fraction
        bits = [];
        for (i = fbits; i; i -= 1) {
          bits.push(f % 2 ? 1 : 0);
          f = Math.floor(f / 2);
        }
        for (i = ebits; i; i -= 1) {
          bits.push(e % 2 ? 1 : 0);
          e = Math.floor(e / 2);
        }
        bits.push(s ? 1 : 0);
        bits.reverse();
        str = bits.join('');

        // Bits to bytes
        bytes = [];
        while (str.length) {
          bytes.push(parseInt(str.substring(0, 8), 2));
          str = str.substring(8);
        }
        return bytes;
      }

      function unpackIEEE754(bytes, ebits, fbits) {
        // Bytes to bits
        var bits = [], i, j, b, str,
            bias, s, e, f;

        for (i = bytes.length; i; i -= 1) {
          b = bytes[i - 1];
          for (j = 8; j; j -= 1) {
            bits.push(b % 2 ? 1 : 0);
            b = b >> 1;
          }
        }
        bits.reverse();
        str = bits.join('');

        // Unpack sign, exponent, fraction
        bias = (1 << (ebits - 1)) - 1;
        s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
        e = parseInt(str.substring(1, 1 + ebits), 2);
        f = parseInt(str.substring(1 + ebits), 2);

        // Produce number
        if (e === (1 << ebits) - 1) {
          return f !== 0 ? NaN : s * Infinity;
        } else if (e > 0) {
          // Normalized
          return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
        } else if (f !== 0) {
          // Denormalized
          return s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits));
        } else {
          return s < 0 ? -0 : 0;
        }
      }

      function unpackFloat64(b) { return unpackIEEE754(b, 11, 52); }
      function packFloat64(v) { return packIEEE754(v, 11, 52); }
      function unpackFloat32(b) { return unpackIEEE754(b, 8, 23); }
      function packFloat32(v) { return packIEEE754(v, 8, 23); }

      var conversions = {
        toFloat32: function (num) { return unpackFloat32(packFloat32(num)); }
      };
      if (typeof Float32Array !== 'undefined') {
        var float32array = new Float32Array(1);
        conversions.toFloat32 = function (num) {
          float32array[0] = num;
          return float32array[0];
        };
      }
      return conversions;
    }());

    defineProperties(String, {
      fromCodePoint: function() {
        var points = _slice.call(arguments, 0, arguments.length);
        var result = [];
        var next;
        for (var i = 0, length = points.length; i < length; i++) {
          next = Number(points[i]);
          if (!ES.SameValue(next, ES.ToInteger(next)) ||
              next < 0 || next > 0x10FFFF) {
            throw new RangeError('Invalid code point ' + next);
          }

          if (next < 0x10000) {
            result.push(String.fromCharCode(next));
          } else {
            next -= 0x10000;
            result.push(String.fromCharCode((next >> 10) + 0xD800));
            result.push(String.fromCharCode((next % 0x400) + 0xDC00));
          }
        }
        return result.join('');
      },

      raw: function(callSite) { // raw.length===1
        var substitutions = _slice.call(arguments, 1, arguments.length);
        var cooked = ES.ToObject(callSite, 'bad callSite');
        var rawValue = cooked.raw;
        var raw = ES.ToObject(rawValue, 'bad raw value');
        var len = Object.keys(raw).length;
        var literalsegments = ES.ToLength(len);
        if (literalsegments === 0) {
          return '';
        }

        var stringElements = [];
        var nextIndex = 0;
        var nextKey, next, nextSeg, nextSub;
        while (nextIndex < literalsegments) {
          nextKey = String(nextIndex);
          next = raw[nextKey];
          nextSeg = String(next);
          stringElements.push(nextSeg);
          if (nextIndex + 1 >= literalsegments) {
            break;
          }
          next = substitutions[nextKey];
          if (next === undefined) {
            break;
          }
          nextSub = String(next);
          stringElements.push(nextSub);
          nextIndex++;
        }
        return stringElements.join('');
      }
    });

    var StringShims = {
      // Fast repeat, uses the `Exponentiation by squaring` algorithm.
      // Perf: http://jsperf.com/string-repeat2/2
      repeat: (function() {
        var repeat = function(s, times) {
          if (times < 1) return '';
          if (times % 2) return repeat(s, times - 1) + s;
          var half = repeat(s, times / 2);
          return half + half;
        };

        return function(times) {
          var thisStr = String(ES.CheckObjectCoercible(this));
          times = ES.ToInteger(times);
          if (times < 0 || times === Infinity) {
            throw new RangeError('Invalid String#repeat value');
          }
          return repeat(thisStr, times);
        };
      })(),

      startsWith: function(searchStr) {
        var thisStr = String(ES.CheckObjectCoercible(this));
        if (_toString.call(searchStr) === '[object RegExp]') throw new TypeError('Cannot call method "startsWith" with a regex');
        searchStr = String(searchStr);
        var startArg = arguments.length > 1 ? arguments[1] : undefined;
        var start = Math.max(ES.ToInteger(startArg), 0);
        return thisStr.slice(start, start + searchStr.length) === searchStr;
      },

      endsWith: function(searchStr) {
        var thisStr = String(ES.CheckObjectCoercible(this));
        if (_toString.call(searchStr) === '[object RegExp]') throw new TypeError('Cannot call method "endsWith" with a regex');
        searchStr = String(searchStr);
        var thisLen = thisStr.length;
        var posArg = arguments.length > 1 ? arguments[1] : undefined;
        var pos = posArg === undefined ? thisLen : ES.ToInteger(posArg);
        var end = Math.min(Math.max(pos, 0), thisLen);
        return thisStr.slice(end - searchStr.length, end) === searchStr;
      },

      contains: function(searchString) {
        var position = arguments.length > 1 ? arguments[1] : undefined;
        // Somehow this trick makes method 100% compat with the spec.
        return _indexOf.call(this, searchString, position) !== -1;
      },

      codePointAt: function(pos) {
        var thisStr = String(ES.CheckObjectCoercible(this));
        var position = ES.ToInteger(pos);
        var length = thisStr.length;
        if (position < 0 || position >= length) return undefined;
        var first = thisStr.charCodeAt(position);
        var isEnd = (position + 1 === length);
        if (first < 0xD800 || first > 0xDBFF || isEnd) return first;
        var second = thisStr.charCodeAt(position + 1);
        if (second < 0xDC00 || second > 0xDFFF) return first;
        return ((first - 0xD800) * 1024) + (second - 0xDC00) + 0x10000;
      }
    };
    defineProperties(String.prototype, StringShims);

    // see https://people.mozilla.org/~jorendorff/es6-draft.html#sec-string.prototype-@@iterator
    var StringIterator = function(s) {
      this._s = String(ES.CheckObjectCoercible(s));
      this._i = 0;
    };
    StringIterator.prototype.next = function() {
      var s = this._s, i = this._i;
      if (s===undefined || i >= s.length) {
        this._s = undefined;
        return { value: undefined, done: true };
      }
      var first = s.charCodeAt(i), second, len;
      if (first < 0xD800 || first > 0xDBFF || (i+1) == s.length) {
        len = 1;
      } else {
        second = s.charCodeAt(i+1);
        len = (second < 0xDC00 || second > 0xDFFF) ? 1 : 2;
      }
      this._i = i + len;
      return { value: s.substr(i, len), done: false };
    };
    addIterator(StringIterator.prototype);
    addIterator(String.prototype, function() {
      return new StringIterator(this);
    });

    if (!startsWithIsCompliant) {
      // Firefox has a noncompliant startsWith implementation
      String.prototype.startsWith = StringShims.startsWith;
      String.prototype.endsWith = StringShims.endsWith;
    }

    defineProperties(Array, {
      from: function(iterable) {
        var mapFn = arguments.length > 1 ? arguments[1] : undefined;
        var thisArg = arguments.length > 2 ? arguments[2] : undefined;

        var list = ES.ToObject(iterable, 'bad iterable');
        if (mapFn !== undefined && !ES.IsCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        var usingIterator = ES.IsIterable(list);
        // does the spec really mean that Arrays should use ArrayIterator?
        // https://bugs.ecmascript.org/show_bug.cgi?id=2416
        //if (Array.isArray(list)) { usingIterator=false; }
        var length = usingIterator ? 0 : ES.ToLength(list.length);
        var result = ES.IsCallable(this) ? Object(usingIterator ? new this() : new this(length)) : new Array(length);
        var it = usingIterator ? ES.GetIterator(list) : null;
        var value;

        for (var i = 0; usingIterator || (i < length); i++) {
          if (usingIterator) {
            value = ES.IteratorNext(it);
            if (value.done) {
              length = i;
              break;
            }
            value = value.value;
          } else {
            value = list[i];
          }
          if (mapFn !== undefined) {
            result[i] = thisArg ? mapFn.call(thisArg, value) : mapFn(value);
          } else {
            result[i] = value;
          }
        }

        result.length = length;
        return result;
      },

      of: function() {
        return Array.from(arguments);
      }
    });

    defineProperties(globals, {
      ArrayIterator: function(array, kind) {
        this.i = 0;
        this.array = array;
        this.kind = kind;
      }
    });

    defineProperties(ArrayIterator.prototype, {
      next: function() {
        var i = this.i, array = this.array;
        if (i===undefined || this.kind===undefined) {
          throw new TypeError('Not an ArrayIterator');
        }
        if (array!==undefined) {
          var len = ES.ToLength(array.length);
          for (; i < len; i++) {
            var kind = this.kind;
            var retval;
            if (kind === "key") {
              retval = i;
            }
            if (kind === "value") {
              retval = array[i];
            }
            if (kind === "entry") {
              retval = [i, array[i]];
            }
            this.i = i + 1;
            return { value: retval, done: false };
          }
        }
        this.array = undefined;
        return { value: undefined, done: true };
      }
    });
    addIterator(ArrayIterator.prototype);

    defineProperties(Array.prototype, {
      copyWithin: function(target, start) {
        var end = arguments[2]; // copyWithin.length must be 2
        var o = ES.ToObject(this);
        var len = ES.ToLength(o.length);
        target = ES.ToInteger(target);
        start = ES.ToInteger(start);
        var to = target < 0 ? Math.max(len + target, 0) : Math.min(target, len);
        var from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
        end = (end===undefined) ? len : ES.ToInteger(end);
        var fin = end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
        var count = Math.min(fin - from, len - to);
        var direction = 1;
        if (from < to && to < (from + count)) {
          direction = -1;
          from += count - 1;
          to += count - 1;
        }
        while (count > 0) {
          if (_hasOwnProperty.call(o, from)) {
            o[to] = o[from];
          } else {
            delete o[from];
          }
          from += direction;
          to += direction;
          count -= 1;
        }
        return o;
      },
      fill: function(value) {
        var start = arguments[1], end = arguments[2]; // fill.length===1
        var O = ES.ToObject(this);
        var len = ES.ToLength(O.length);
        start = ES.ToInteger(start===undefined ? 0 : start);
        end = ES.ToInteger(end===undefined ? len : end);

        var relativeStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);

        for (var i = relativeStart; i < len && i < end; ++i) {
          O[i] = value;
        }
        return O;
      },

      find: function(predicate) {
        var list = ES.ToObject(this);
        var length = ES.ToLength(list.length);
        if (!ES.IsCallable(predicate)) {
          throw new TypeError('Array#find: predicate must be a function');
        }
        var thisArg = arguments[1];
        for (var i = 0, value; i < length; i++) {
          if (i in list) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) return value;
          }
        }
        return undefined;
      },

      findIndex: function(predicate) {
        var list = ES.ToObject(this);
        var length = ES.ToLength(list.length);
        if (!ES.IsCallable(predicate)) {
          throw new TypeError('Array#findIndex: predicate must be a function');
        }
        var thisArg = arguments[1];
        for (var i = 0; i < length; i++) {
          if (i in list) {
            if (predicate.call(thisArg, list[i], i, list)) return i;
          }
        }
        return -1;
      },

      keys: function() {
        return new ArrayIterator(this, "key");
      },

      values: function() {
        return new ArrayIterator(this, "value");
      },

      entries: function() {
        return new ArrayIterator(this, "entry");
      }
    });
    addIterator(Array.prototype, function() { return this.values(); });
    // Chrome defines keys/values/entries on Array, but doesn't give us
    // any way to identify its iterator.  So add our own shimmed field.
    addIterator(Object.getPrototypeOf([].values()));

    var maxSafeInteger = Math.pow(2, 53) - 1;
    defineProperties(Number, {
      MAX_SAFE_INTEGER: maxSafeInteger,
      MIN_SAFE_INTEGER: -maxSafeInteger,
      EPSILON: 2.220446049250313e-16,

      parseInt: globals.parseInt,
      parseFloat: globals.parseFloat,

      isFinite: function(value) {
        return typeof value === 'number' && global_isFinite(value);
      },

      isInteger: function(value) {
        return typeof value === 'number' &&
          !Number.isNaN(value) &&
          Number.isFinite(value) &&
          ES.ToInteger(value) === value;
      },

      isSafeInteger: function(value) {
        return Number.isInteger(value) &&
          Math.abs(value) <= Number.MAX_SAFE_INTEGER;
      },

      isNaN: function(value) {
        // NaN !== NaN, but they are identical.
        // NaNs are the only non-reflexive value, i.e., if x !== x,
        // then x is NaN.
        // isNaN is broken: it converts its argument to number, so
        // isNaN('foo') => true
        return value !== value;
      }

    });

    defineProperties(Number.prototype, {
    });

    if (supportsDescriptors) {
      defineProperties(Object, {
        getOwnPropertyDescriptors: function(subject) {
          var descs = {};
          Object.getOwnPropertyNames(subject).forEach(function(propName) {
            descs[propName] = Object.getOwnPropertyDescriptor(subject, propName);
          });
          return descs;
        },

        getPropertyDescriptor: function(subject, name) {
          var pd = Object.getOwnPropertyDescriptor(subject, name);
          var proto = Object.getPrototypeOf(subject);
          while (pd === undefined && proto !== null) {
            pd = Object.getOwnPropertyDescriptor(proto, name);
            proto = Object.getPrototypeOf(proto);
          }
          return pd;
        },

        getPropertyNames: function(subject) {
          var result = Object.getOwnPropertyNames(subject);
          var proto = Object.getPrototypeOf(subject);

          var addProperty = function(property) {
            if (result.indexOf(property) === -1) {
              result.push(property);
            }
          };

          while (proto !== null) {
            Object.getOwnPropertyNames(proto).forEach(addProperty);
            proto = Object.getPrototypeOf(proto);
          }
          return result;
        },

        // 19.1.3.1
        assign: function(target, source) {
          return Object.keys(source).reduce(function(target, key) {
            target[key] = source[key];
            return target;
          }, target);
        }
      });

      // 19.1.3.9
      // shim from https://gist.github.com/WebReflection/5593554
      defineProperties(Object, {
        setPrototypeOf: (function(Object, magic) {
          var set;

          var checkArgs = function(O, proto) {
            if (!ES.TypeIsObject(O)) {
              throw new TypeError('cannot set prototype on a non-object');
            }
            if (!(proto===null || ES.TypeIsObject(proto))) {
              throw new TypeError('can only set prototype to an object or null'+proto);
            }
          };

          var setPrototypeOf = function(O, proto) {
            checkArgs(O, proto);
            set.call(O, proto);
            return O;
          };

          try {
            // this works already in Firefox and Safari
            set = Object.getOwnPropertyDescriptor(Object.prototype, magic).set;
            set.call({}, null);
          } catch (e) {
            if (Object.prototype !== {}[magic]) {
              // IE < 11 cannot be shimmed
              return;
            }
            // probably Chrome or some old Mobile stock browser
            set = function(proto) {
              this[magic] = proto;
            };
            // please note that this will **not** work
            // in those browsers that do not inherit
            // __proto__ by mistake from Object.prototype
            // in these cases we should probably throw an error
            // or at least be informed about the issue
            setPrototypeOf.polyfill = setPrototypeOf(
              setPrototypeOf({}, null),
              Object.prototype
            ) instanceof Object;
            // setPrototypeOf.polyfill === true means it works as meant
            // setPrototypeOf.polyfill === false means it's not 100% reliable
            // setPrototypeOf.polyfill === undefined
            // or
            // setPrototypeOf.polyfill ==  null means it's not a polyfill
            // which means it works as expected
            // we can even delete Object.prototype.__proto__;
          }
          return setPrototypeOf;
        })(Object, '__proto__')
      });
    }

    // Workaround bug in Opera 12 where setPrototypeOf(x, null) doesn't work,
    // but Object.create(null) does.
    if (Object.setPrototypeOf && Object.getPrototypeOf &&
        Object.getPrototypeOf(Object.setPrototypeOf({}, null)) !== null &&
        Object.getPrototypeOf(Object.create(null)) === null) {
      (function() {
        var FAKENULL = Object.create(null);
        var gpo = Object.getPrototypeOf, spo = Object.setPrototypeOf;
        Object.getPrototypeOf = function(o) {
          var result = gpo(o);
          return result === FAKENULL ? null : result;
        };
        Object.setPrototypeOf = function(o, p) {
          if (p === null) { p = FAKENULL; }
          return spo(o, p);
        };
        Object.setPrototypeOf.polyfill = false;
      })();
    }

    defineProperties(Object, {
      getOwnPropertyKeys: function(subject) {
        return Object.keys(subject);
      },

      is: function(a, b) {
        return ES.SameValue(a, b);
      }
    });

    try {
      Object.keys('foo');
    } catch (e) {
      var originalObjectKeys = Object.keys;
      Object.keys = function (obj) {
        return originalObjectKeys(ES.ToObject(obj));
      };
    }

    var MathShims = {
      acosh: function(value) {
        value = Number(value);
        if (Number.isNaN(value) || value < 1) return NaN;
        if (value === 1) return 0;
        if (value === Infinity) return value;
        return Math.log(value + Math.sqrt(value * value - 1));
      },

      asinh: function(value) {
        value = Number(value);
        if (value === 0 || !global_isFinite(value)) {
          return value;
        }
        return value < 0 ? -Math.asinh(-value) : Math.log(value + Math.sqrt(value * value + 1));
      },

      atanh: function(value) {
        value = Number(value);
        if (Number.isNaN(value) || value < -1 || value > 1) {
          return NaN;
        }
        if (value === -1) return -Infinity;
        if (value === 1) return Infinity;
        if (value === 0) return value;
        return 0.5 * Math.log((1 + value) / (1 - value));
      },

      cbrt: function(value) {
        value = Number(value);
        if (value === 0) return value;
        var negate = value < 0, result;
        if (negate) value = -value;
        result = Math.pow(value, 1/3);
        return negate ? -result : result;
      },

      clz32: function(value) {
        // See https://bugs.ecmascript.org/show_bug.cgi?id=2465
        value = Number(value);
        if (Number.isNaN(value)) return NaN;
        var number = ES.ToUint32(value);
        if (number === 0) {
          return 32;
        }
        return 32 - (number).toString(2).length;
      },

      cosh: function(value) {
        value = Number(value);
        if (value === 0) return 1; // +0 or -0
        if (Number.isNaN(value)) return NaN;
        if (!global_isFinite(value)) return Infinity;
        if (value < 0) value = -value;
        if (value > 21) return Math.exp(value) / 2;
        return (Math.exp(value) + Math.exp(-value)) / 2;
      },

      expm1: function(value) {
        value = Number(value);
        if (value === -Infinity) return -1;
        if (!global_isFinite(value) || value === 0) return value;
        var result = 0;
        var n = 50;
        for (var i = 1; i < n; i++) {
          for (var j = 2, factorial = 1; j <= i; j++) {
            factorial *= j;
          }
          result += Math.pow(value, i) / factorial;
        }
        return result;
      },

      hypot: function(x, y) {
        var anyNaN = false;
        var allZero = true;
        var anyInfinity = false;
        var numbers = [];
        Array.prototype.every.call(arguments, function(arg) {
          var num = Number(arg);
          if (Number.isNaN(num)) anyNaN = true;
          else if (num === Infinity || num === -Infinity) anyInfinity = true;
          else if (num !== 0) allZero = false;
          if (anyInfinity) {
            return false;
          } else if (!anyNaN) {
            numbers.push(Math.abs(num));
          }
          return true;
        });
        if (anyInfinity) return Infinity;
        if (anyNaN) return NaN;
        if (allZero) return 0;

        numbers.sort(function (a, b) { return b - a; });
        var largest = numbers[0];
        var divided = numbers.map(function (number) { return number / largest; });
        var sum = divided.reduce(function (sum, number) { return sum += number * number; }, 0);
        return largest * Math.sqrt(sum);
      },

      log2: function(value) {
        return Math.log(value) * Math.LOG2E;
      },

      log10: function(value) {
        return Math.log(value) * Math.LOG10E;
      },

      log1p: function(value) {
        value = Number(value);
        if (value < -1 || Number.isNaN(value)) return NaN;
        if (value === 0 || value === Infinity) return value;
        if (value === -1) return -Infinity;
        var result = 0;
        var n = 50;

        if (value < 0 || value > 1) return Math.log(1 + value);
        for (var i = 1; i < n; i++) {
          if ((i % 2) === 0) {
            result -= Math.pow(value, i) / i;
          } else {
            result += Math.pow(value, i) / i;
          }
        }

        return result;
      },

      sign: function(value) {
        var number = +value;
        if (number === 0) return number;
        if (Number.isNaN(number)) return number;
        return number < 0 ? -1 : 1;
      },

      sinh: function(value) {
        value = Number(value);
        if (!global_isFinite(value) || value === 0) return value;
        return (Math.exp(value) - Math.exp(-value)) / 2;
      },

      tanh: function(value) {
        value = Number(value);
        if (Number.isNaN(value) || value === 0) return value;
        if (value === Infinity) return 1;
        if (value === -Infinity) return -1;
        return (Math.exp(value) - Math.exp(-value)) / (Math.exp(value) + Math.exp(-value));
      },

      trunc: function(value) {
        var number = Number(value);
        return number < 0 ? -Math.floor(-number) : Math.floor(number);
      },

      imul: function(x, y) {
        // taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
        var ah  = (x >>> 16) & 0xffff;
        var al = x & 0xffff;
        var bh  = (y >>> 16) & 0xffff;
        var bl = y & 0xffff;
        // the shift by 0 fixes the sign on the high part
        // the final |0 converts the unsigned value into a signed value
        return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
      },

      fround: function(x) {
        if (x === 0 || x === Infinity || x === -Infinity || Number.isNaN(x)) {
          return x;
        }
        var num = Number(x);
        return numberConversion.toFloat32(num);
      }
    };
    defineProperties(Math, MathShims);

    if (Math.imul(0xffffffff, 5) !== -5) {
      // Safari 6.1, at least, reports "0" for this value
      Math.imul = MathShims.imul;
    }

    // Promises
    // Simplest possible implementation; use a 3rd-party library if you
    // want the best possible speed and/or long stack traces.
    var PromiseShim = (function() {

      var Promise, Promise$prototype;

      ES.IsPromise = function(promise) {
        if (!ES.TypeIsObject(promise)) {
          return false;
        }
        if (!promise._promiseConstructor) {
          // _promiseConstructor is a bit more unique than _status, so we'll
          // check that instead of the [[PromiseStatus]] internal field.
          return false;
        }
        if (promise._status === undefined) {
          return false; // uninitialized
        }
        return true;
      };

      // "PromiseCapability" in the spec is what most promise implementations
      // call a "deferred".
      var PromiseCapability = function(C) {
        if (!ES.IsCallable(C)) {
          throw new TypeError('bad promise constructor');
        }
        var capability = this;
        var resolver = function(resolve, reject) {
          capability.resolve = resolve;
          capability.reject = reject;
        };
        capability.promise = ES.Construct(C, [resolver]);
        // see https://bugs.ecmascript.org/show_bug.cgi?id=2478
        if (!capability.promise._es6construct) {
          throw new TypeError('bad promise constructor');
        }
        if (!(ES.IsCallable(capability.resolve) &&
              ES.IsCallable(capability.reject))) {
          throw new TypeError('bad promise constructor');
        }
      };

      // find an appropriate setImmediate-alike
      var setTimeout = globals.setTimeout;
      var makeZeroTimeout = function() {
        // from http://dbaron.org/log/20100309-faster-timeouts
        var timeouts = [];
        var messageName = "zero-timeout-message";
        var setZeroTimeout = function(fn) {
          timeouts.push(fn);
          window.postMessage(messageName, "*");
        };
        var handleMessage = function(event) {
          if (event.source == window && event.data == messageName) {
            event.stopPropagation();
            if (timeouts.length === 0) { return; }
            var fn = timeouts.shift();
            fn();
          }
        };
        window.addEventListener("message", handleMessage, true);
        return setZeroTimeout;
      };
      var enqueue = ES.IsCallable(globals.setImmediate) ?
        globals.setImmediate.bind(globals) :
        typeof process === 'object' && process.nextTick ? process.nextTick :
        ES.IsCallable(window.postMessage) ? makeZeroTimeout() :
        function(task) { setTimeout(task, 0); }; // fallback

      var triggerPromiseReactions = function(reactions, x) {
        reactions.forEach(function(reaction) {
          enqueue(function() {
            // PromiseReactionTask
            var handler = reaction.handler;
            var capability = reaction.capability;
            var resolve = capability.resolve;
            var reject = capability.reject;
            try {
              var result = handler(x);
              if (result === capability.promise) {
                throw new TypeError('self resolution');
              }
              var updateResult =
                updatePromiseFromPotentialThenable(result, capability);
              if (!updateResult) {
                resolve(result);
              }
            } catch (e) {
              reject(e);
            }
          });
        });
      };

      var updatePromiseFromPotentialThenable = function(x, capability) {
        if (!ES.TypeIsObject(x)) {
          return false;
        }
        var resolve = capability.resolve;
        var reject = capability.reject;
        try {
          var then = x.then; // only one invocation of accessor
          if (!ES.IsCallable(then)) { return false; }
          then.call(x, resolve, reject);
        } catch(e) {
          reject(e);
        }
        return true;
      };

      var promiseResolutionHandler = function(promise, onFulfilled, onRejected){
        return function(x) {
          if (x === promise) {
            return onRejected(new TypeError('self resolution'));
          }
          var C = promise._promiseConstructor;
          var capability = new PromiseCapability(C);
          var updateResult = updatePromiseFromPotentialThenable(x, capability);
          if (updateResult) {
            return capability.promise.then(onFulfilled, onRejected);
          } else {
            return onFulfilled(x);
          }
        };
      };

      Promise = function(resolver) {
        var promise = this;
        promise = emulateES6construct(promise);
        if (!promise._promiseConstructor) {
          // we use _promiseConstructor as a stand-in for the internal
          // [[PromiseStatus]] field; it's a little more unique.
          throw new TypeError('bad promise');
        }
        if (promise._status !== undefined) {
          throw new TypeError('promise already initialized');
        }
        // see https://bugs.ecmascript.org/show_bug.cgi?id=2482
        if (!ES.IsCallable(resolver)) {
          throw new TypeError('not a valid resolver');
        }
        promise._status = 'unresolved';
        promise._resolveReactions = [];
        promise._rejectReactions = [];

        var resolve = function(resolution) {
          if (promise._status !== 'unresolved') { return; }
          var reactions = promise._resolveReactions;
          promise._result = resolution;
          promise._resolveReactions = undefined;
          promise._rejectReactions = undefined;
          promise._status = 'has-resolution';
          triggerPromiseReactions(reactions, resolution);
        };
        var reject = function(reason) {
          if (promise._status !== 'unresolved') { return; }
          var reactions = promise._rejectReactions;
          promise._result = reason;
          promise._resolveReactions = undefined;
          promise._rejectReactions = undefined;
          promise._status = 'has-rejection';
          triggerPromiseReactions(reactions, reason);
        };
        try {
          resolver(resolve, reject);
        } catch (e) {
          reject(e);
        }
        return promise;
      };
      Promise$prototype = Promise.prototype;
      defineProperties(Promise, {
        '@@create': function(obj) {
          var constructor = this;
          // AllocatePromise
          // The `obj` parameter is a hack we use for es5
          // compatibility.
          var prototype = constructor.prototype || Promise$prototype;
          obj = obj || Object.create(prototype);
          defineProperties(obj, {
            _status: undefined,
            _result: undefined,
            _resolveReactions: undefined,
            _rejectReactions: undefined,
            _promiseConstructor: undefined
          });
          obj._promiseConstructor = constructor;
          return obj;
        }
      });

      var _promiseAllResolver = function(index, values, capability, remaining) {
        var done = false;
        return function(x) {
          if (done) { return; } // protect against being called multiple times
          done = true;
          values[index] = x;
          if ((--remaining.count) === 0) {
            var resolve = capability.resolve;
            resolve(values); // call w/ this===undefined
          }
        };
      };

      Promise.all = function(iterable) {
        var C = this;
        var capability = new PromiseCapability(C);
        var resolve = capability.resolve;
        var reject = capability.reject;
        try {
          if (!ES.IsIterable(iterable)) {
            throw new TypeError('bad iterable');
          }
          var it = ES.GetIterator(iterable);
          var values = [], remaining = { count: 1 };
          for (var index = 0; ; index++) {
            var next = ES.IteratorNext(it);
            if (next.done) {
              break;
            }
            var nextPromise = C.resolve(next.value);
            var resolveElement = _promiseAllResolver(
              index, values, capability, remaining
            );
            remaining.count++;
            nextPromise.then(resolveElement, capability.reject);
          }
          if ((--remaining.count) === 0) {
            resolve(values); // call w/ this===undefined
          }
        } catch (e) {
          reject(e);
        }
        return capability.promise;
      };

      Promise.race = function(iterable) {
        var C = this;
        var capability = new PromiseCapability(C);
        var resolve = capability.resolve;
        var reject = capability.reject;
        try {
          if (!ES.IsIterable(iterable)) {
            throw new TypeError('bad iterable');
          }
          var it = ES.GetIterator(iterable);
          while (true) {
            var next = ES.IteratorNext(it);
            if (next.done) {
              // If iterable has no items, resulting promise will never
              // resolve; see:
              // https://github.com/domenic/promises-unwrapping/issues/75
              // https://bugs.ecmascript.org/show_bug.cgi?id=2515
              break;
            }
            var nextPromise = C.resolve(next.value);
            nextPromise.then(resolve, reject);
          }
        } catch (e) {
          reject(e);
        }
        return capability.promise;
      };

      Promise.reject = function(reason) {
        var C = this;
        var capability = new PromiseCapability(C);
        var reject = capability.reject;
        reject(reason); // call with this===undefined
        return capability.promise;
      };

      Promise.resolve = function(v) {
        var C = this;
        if (ES.IsPromise(v)) {
          var constructor = v._promiseConstructor;
          if (constructor === C) { return v; }
        }
        var capability = new PromiseCapability(C);
        var resolve = capability.resolve;
        resolve(v); // call with this===undefined
        return capability.promise;
      };

      Promise.prototype['catch'] = function( onRejected ) {
        return this.then(undefined, onRejected);
      };

      Promise.prototype.then = function( onFulfilled, onRejected ) {
        var promise = this;
        if (!ES.IsPromise(promise)) { throw new TypeError('not a promise'); }
        // this.constructor not this._promiseConstructor; see
        // https://bugs.ecmascript.org/show_bug.cgi?id=2513
        var C = this.constructor;
        var capability = new PromiseCapability(C);
        if (!ES.IsCallable(onRejected)) {
          onRejected = function(e) { throw e; };
        }
        if (!ES.IsCallable(onFulfilled)) {
          onFulfilled = function(x) { return x; };
        }
        var resolutionHandler =
          promiseResolutionHandler(promise, onFulfilled, onRejected);
        var resolveReaction =
          { capability: capability, handler: resolutionHandler };
        var rejectReaction =
          { capability: capability, handler: onRejected };
        switch (promise._status) {
        case 'unresolved':
          promise._resolveReactions.push(resolveReaction);
          promise._rejectReactions.push(rejectReaction);
          break;
        case 'has-resolution':
          triggerPromiseReactions([resolveReaction], promise._result);
          break;
        case 'has-rejection':
          triggerPromiseReactions([rejectReaction], promise._result);
          break;
        default:
          throw new TypeError('unexpected');
        }
        return capability.promise;
      };

      return Promise;
    })();
    // export the Promise constructor.
    defineProperties(globals, { Promise: PromiseShim });
    // In Chrome 33 (and thereabouts) Promise is defined, but the
    // implementation is buggy in a number of ways.  Let's check subclassing
    // support to see if we have a buggy implementation.
    if (!supportsSubclassing(globals.Promise, function(S) {
      return S.resolve(42) instanceof S;
    })) {
      globals.Promise = PromiseShim;
    }

    // Map and Set require a true ES5 environment
    if (supportsDescriptors) {

      var fastkey = function fastkey(key) {
        var type = typeof key;
        if (type === 'string') {
          return '$' + key;
        } else if (type === 'number') {
          // note that -0 will get coerced to "0" when used as a property key
          return key;
        }
        return null;
      };

      var emptyObject = function emptyObject() {
        // accomodate some older not-quite-ES5 browsers
        return Object.create ? Object.create(null) : {};
      };

      var collectionShims = {
        Map: (function() {

          var empty = {};

          function MapEntry(key, value) {
            this.key = key;
            this.value = value;
            this.next = null;
            this.prev = null;
          }

          MapEntry.prototype.isRemoved = function() {
            return this.key === empty;
          };

          function MapIterator(map, kind) {
            this.head = map._head;
            this.i = this.head;
            this.kind = kind;
          }

          MapIterator.prototype = {
            next: function() {
              var i = this.i, kind = this.kind, head = this.head, result;
              if (this.i === undefined) {
                return { value: undefined, done: true };
              }
              while (i.isRemoved() && i !== head) {
                // back up off of removed entries
                i = i.prev;
              }
              // advance to next unreturned element.
              while (i.next !== head) {
                i = i.next;
                if (!i.isRemoved()) {
                  if (kind === "key") {
                    result = i.key;
                  } else if (kind === "value") {
                    result = i.value;
                  } else {
                    result = [i.key, i.value];
                  }
                  this.i = i;
                  return { value: result, done: false };
                }
              }
              // once the iterator is done, it is done forever.
              this.i = undefined;
              return { value: undefined, done: true };
            }
          };
          addIterator(MapIterator.prototype);

          function Map() {
            var map = this;
            map = emulateES6construct(map);
            if (!map._es6map) {
              throw new TypeError('bad map');
            }

            var head = new MapEntry(null, null);
            // circular doubly-linked list.
            head.next = head.prev = head;

            defineProperties(map, {
              '_head': head,
              '_storage': emptyObject(),
              '_size': 0
            });

            // Optionally initialize map from iterable
            var iterable = arguments[0];
            if (iterable !== undefined && iterable !== null) {
              var it = ES.GetIterator(iterable);
              var adder = map.set;
              if (!ES.IsCallable(adder)) { throw new TypeError('bad map'); }
              while (true) {
                var next = ES.IteratorNext(it);
                if (next.done) { break; }
                var nextItem = next.value;
                if (!ES.TypeIsObject(nextItem)) {
                  throw new TypeError('expected iterable of pairs');
                }
                adder.call(map, nextItem[0], nextItem[1]);
              }
            }
            return map;
          }
          var Map$prototype = Map.prototype;
          defineProperties(Map, {
            '@@create': function(obj) {
              var constructor = this;
              var prototype = constructor.prototype || Map$prototype;
              obj = obj || Object.create(prototype);
              defineProperties(obj, { _es6map: true });
              return obj;
            }
          });

          Object.defineProperty(Map.prototype, 'size', {
            configurable: true,
            enumerable: false,
            get: function() {
              if (typeof this._size === 'undefined') {
                throw new TypeError('size method called on incompatible Map');
              }
              return this._size;
            }
          });

          defineProperties(Map.prototype, {
            get: function(key) {
              var fkey = fastkey(key);
              if (fkey !== null) {
                // fast O(1) path
                var entry = this._storage[fkey];
                return entry ? entry.value : undefined;
              }
              var head = this._head, i = head;
              while ((i = i.next) !== head) {
                if (ES.SameValueZero(i.key, key)) {
                  return i.value;
                }
              }
              return undefined;
            },

            has: function(key) {
              var fkey = fastkey(key);
              if (fkey !== null) {
                // fast O(1) path
                return typeof this._storage[fkey] !== 'undefined';
              }
              var head = this._head, i = head;
              while ((i = i.next) !== head) {
                if (ES.SameValueZero(i.key, key)) {
                  return true;
                }
              }
              return false;
            },

            set: function(key, value) {
              var head = this._head, i = head, entry;
              var fkey = fastkey(key);
              if (fkey !== null) {
                // fast O(1) path
                if (typeof this._storage[fkey] !== 'undefined') {
                  this._storage[fkey].value = value;
                  return;
                } else {
                  entry = this._storage[fkey] = new MapEntry(key, value);
                  i = head.prev;
                  // fall through
                }
              }
              while ((i = i.next) !== head) {
                if (ES.SameValueZero(i.key, key)) {
                  i.value = value;
                  return;
                }
              }
              entry = entry || new MapEntry(key, value);
              if (ES.SameValue(-0, key)) {
                entry.key = +0; // coerce -0 to +0 in entry
              }
              entry.next = this._head;
              entry.prev = this._head.prev;
              entry.prev.next = entry;
              entry.next.prev = entry;
              this._size += 1;
            },

            'delete': function(key) {
              var head = this._head, i = head;
              var fkey = fastkey(key);
              if (fkey !== null) {
                // fast O(1) path
                if (typeof this._storage[fkey] === 'undefined') {
                  return false;
                }
                i = this._storage[fkey].prev;
                delete this._storage[fkey];
                // fall through
              }
              while ((i = i.next) !== head) {
                if (ES.SameValueZero(i.key, key)) {
                  i.key = i.value = empty;
                  i.prev.next = i.next;
                  i.next.prev = i.prev;
                  this._size -= 1;
                  return true;
                }
              }
              return false;
            },

            clear: function() {
              this._size = 0;
              this._storage = emptyObject();
              var head = this._head, i = head, p = i.next;
              while ((i = p) !== head) {
                i.key = i.value = empty;
                p = i.next;
                i.next = i.prev = head;
              }
              head.next = head.prev = head;
            },

            keys: function() {
              return new MapIterator(this, "key");
            },

            values: function() {
              return new MapIterator(this, "value");
            },

            entries: function() {
              return new MapIterator(this, "key+value");
            },

            forEach: function(callback) {
              var context = arguments.length > 1 ? arguments[1] : null;
              var it = this.entries();
              for (var entry = it.next(); !entry.done; entry = it.next()) {
                callback.call(context, entry.value[1], entry.value[0], this);
              }
            }
          });
          addIterator(Map.prototype, function() { return this.entries(); });

          return Map;
        })(),

        Set: (function() {
          // Creating a Map is expensive.  To speed up the common case of
          // Sets containing only string or numeric keys, we use an object
          // as backing storage and lazily create a full Map only when
          // required.
          var SetShim = function Set() {
            var set = this;
            set = emulateES6construct(set);
            if (!set._es6set) {
              throw new TypeError('bad set');
            }

            defineProperties(set, {
              '[[SetData]]': null,
              '_storage': emptyObject()
            });

            // Optionally initialize map from iterable
            var iterable = arguments[0];
            if (iterable !== undefined && iterable !== null) {
              var it = ES.GetIterator(iterable);
              var adder = set.add;
              if (!ES.IsCallable(adder)) { throw new TypeError('bad set'); }
              while (true) {
                var next = ES.IteratorNext(it);
                if (next.done) { break; }
                var nextItem = next.value;
                adder.call(set, nextItem);
              }
            }
            return set;
          };
          var Set$prototype = SetShim.prototype;
          defineProperties(SetShim, {
            '@@create': function(obj) {
              var constructor = this;
              var prototype = constructor.prototype || Set$prototype;
              obj = obj || Object.create(prototype);
              defineProperties(obj, { _es6set: true });
              return obj;
            }
          });

          // Switch from the object backing storage to a full Map.
          var ensureMap = function ensureMap(set) {
            if (!set['[[SetData]]']) {
              var m = set['[[SetData]]'] = new collectionShims.Map();
              Object.keys(set._storage).forEach(function(k) {
                // fast check for leading '$'
                if (k.charCodeAt(0) === 36) {
                  k = k.substring(1);
                } else {
                  k = +k;
                }
                m.set(k, k);
              });
              set._storage = null; // free old backing storage
            }
          };

          Object.defineProperty(SetShim.prototype, 'size', {
            configurable: true,
            enumerable: false,
            get: function() {
              if (typeof this._storage === 'undefined') {
                // https://github.com/paulmillr/es6-shim/issues/176
                throw new TypeError('size method called on incompatible Set');
              }
              ensureMap(this);
              return this['[[SetData]]'].size;
            }
          });

          defineProperties(SetShim.prototype, {
            has: function(key) {
              var fkey;
              if (this._storage && (fkey = fastkey(key)) !== null) {
                return !!this._storage[fkey];
              }
              ensureMap(this);
              return this['[[SetData]]'].has(key);
            },

            add: function(key) {
              var fkey;
              if (this._storage && (fkey = fastkey(key)) !== null) {
                this._storage[fkey]=true;
                return;
              }
              ensureMap(this);
              return this['[[SetData]]'].set(key, key);
            },

            'delete': function(key) {
              var fkey;
              if (this._storage && (fkey = fastkey(key)) !== null) {
                delete this._storage[fkey];
                return;
              }
              ensureMap(this);
              return this['[[SetData]]']['delete'](key);
            },

            clear: function() {
              if (this._storage) {
                this._storage = emptyObject();
                return;
              }
              return this['[[SetData]]'].clear();
            },

            keys: function() {
              ensureMap(this);
              return this['[[SetData]]'].keys();
            },

            values: function() {
              ensureMap(this);
              return this['[[SetData]]'].values();
            },

            entries: function() {
              ensureMap(this);
              return this['[[SetData]]'].entries();
            },

            forEach: function(callback) {
              var context = arguments.length > 1 ? arguments[1] : null;
              var entireSet = this;
              ensureMap(this);
              this['[[SetData]]'].forEach(function(value, key) {
                callback.call(context, key, key, entireSet);
              });
            }
          });
          addIterator(SetShim.prototype, function() { return this.values(); });

          return SetShim;
        })()
      };
      defineProperties(globals, collectionShims);

      if (globals.Map || globals.Set) {
        /*
          - In Firefox < 23, Map#size is a function.
          - In all current Firefox, Set#entries/keys/values & Map#clear do not exist
          - https://bugzilla.mozilla.org/show_bug.cgi?id=869996
          - In Firefox 24, Map and Set do not implement forEach
          - In Firefox 25 at least, Map and Set are callable without "new"
        */
        if (
          typeof globals.Map.prototype.clear !== 'function' ||
          new globals.Set().size !== 0 ||
          new globals.Map().size !== 0 ||
          typeof globals.Set.prototype.keys !== 'function' ||
          typeof globals.Map.prototype.forEach !== 'function' ||
          typeof globals.Set.prototype.forEach !== 'function' ||
          isCallableWithoutNew(globals.Map) ||
          isCallableWithoutNew(globals.Set) ||
          !supportsSubclassing(globals.Map, function(M) {
            return (new M([])) instanceof M;
          })
        ) {
          globals.Map = collectionShims.Map;
          globals.Set = collectionShims.Set;
        }
      }
      // Shim incomplete iterator implementations.
      addIterator(Object.getPrototypeOf((new globals.Map()).keys()));
      addIterator(Object.getPrototypeOf((new globals.Set()).keys()));
    }
  };

  if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
    define(main); // RequireJS
  } else {
    main(); // CommonJS and <script>
  }
})();

});

require.register("component~type@1.0.0", function (exports, module) {

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});

require.register("component~bind@0.0.1", function (exports, module) {

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});

require.register("component~jquery@1.9.1", function (exports, module) {
/*!
 * jQuery JavaScript Library v1.9.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-2-4
 */
(function( window, undefined ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//"use strict";
var
	// The deferred used on DOM ready
	readyList,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// Support: IE<9
	// For `typeof node.method` instead of `node.method !== undefined`
	core_strundefined = typeof undefined,

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,
	location = window.location,

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$,

	// [[Class]] -> type pairs
	class2type = {},

	// List of deleted data cache ids, so we can reuse them
	core_deletedIds = [],

	core_version = "1.9.1",

	// Save a reference to some core methods
	core_concat = core_deletedIds.concat,
	core_push = core_deletedIds.push,
	core_slice = core_deletedIds.slice,
	core_indexOf = core_deletedIds.indexOf,
	core_toString = class2type.toString,
	core_hasOwn = class2type.hasOwnProperty,
	core_trim = core_version.trim,

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init( selector, context, rootjQuery );
	},

	// Used for matching numbers
	core_pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,

	// Used for splitting on whitespace
	core_rnotwhite = /\S+/g,

	// Make sure we trim BOM and NBSP (here's looking at you, Safari 5.0 and IE)
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,

	// JSON RegExp
	rvalidchars = /^[\],:{}\s]*$/,
	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	},

	// The ready event handler
	completed = function( event ) {

		// readyState === "complete" is good enough for us to call the dom ready in oldIE
		if ( document.addEventListener || event.type === "load" || document.readyState === "complete" ) {
			detach();
			jQuery.ready();
		}
	},
	// Clean-up method for dom ready events
	detach = function() {
		if ( document.addEventListener ) {
			document.removeEventListener( "DOMContentLoaded", completed, false );
			window.removeEventListener( "load", completed, false );

		} else {
			document.detachEvent( "onreadystatechange", completed );
			window.detachEvent( "onload", completed );
		}
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: core_version,

	constructor: jQuery,
	init: function( selector, context, rootjQuery ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt(0) === "<" && selector.charAt( selector.length - 1 ) === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[2] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return rootjQuery.ready( selector );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return core_slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	ready: function( fn ) {
		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	},

	slice: function() {
		return this.pushStack( core_slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: core_push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	noConflict: function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	},

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
		if ( !document.body ) {
			return setTimeout( jQuery.ready );
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.trigger ) {
			jQuery( document ).trigger("ready").off("ready");
		}
	},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type(obj) === "array";
	},

	isWindow: function( obj ) {
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {
		return !isNaN( parseFloat(obj) ) && isFinite( obj );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return String( obj );
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ core_toString.call(obj) ] || "object" :
			typeof obj;
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!core_hasOwn.call(obj, "constructor") &&
				!core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || core_hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw new Error( msg );
	},

	// data: string of html
	// context (optional): If specified, the fragment will be created in this context, defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	parseHTML: function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[1] ) ];
		}

		parsed = jQuery.buildFragment( [ data ], context, scripts );
		if ( scripts ) {
			jQuery( scripts ).remove();
		}
		return jQuery.merge( [], parsed.childNodes );
	},

	parseJSON: function( data ) {
		// Attempt to parse using the native JSON parser first
		if ( window.JSON && window.JSON.parse ) {
			return window.JSON.parse( data );
		}

		if ( data === null ) {
			return data;
		}

		if ( typeof data === "string" ) {

			// Make sure leading/trailing whitespace is removed (IE can't handle it)
			data = jQuery.trim( data );

			if ( data ) {
				// Make sure the incoming data is actual JSON
				// Logic borrowed from http://json.org/json2.js
				if ( rvalidchars.test( data.replace( rvalidescape, "@" )
					.replace( rvalidtokens, "]" )
					.replace( rvalidbraces, "")) ) {

					return ( new Function( "return " + data ) )();
				}
			}
		}

		jQuery.error( "Invalid JSON: " + data );
	},

	// Cross-browser xml parsing
	parseXML: function( data ) {
		var xml, tmp;
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		try {
			if ( window.DOMParser ) { // Standard
				tmp = new DOMParser();
				xml = tmp.parseFromString( data , "text/xml" );
			} else { // IE
				xml = new ActiveXObject( "Microsoft.XMLDOM" );
				xml.async = "false";
				xml.loadXML( data );
			}
		} catch( e ) {
			xml = undefined;
		}
		if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	},

	noop: function() {},

	// Evaluates a script in a global context
	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {
			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data );
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Use native String.trim function wherever possible
	trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
		function( text ) {
			return text == null ?
				"" :
				core_trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				core_push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( core_indexOf ) {
				return core_indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var l = second.length,
			i = first.length,
			j = 0;

		if ( typeof l === "number" ) {
			for ( ; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var retVal,
			ret = [],
			i = 0,
			length = elems.length;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret[ ret.length ] = value;
				}
			}
		}

		// Flatten any nested arrays
		return core_concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = core_slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( core_slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	access: function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			length = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {
				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < length; i++ ) {
					fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				length ? fn( elems[0], key ) : emptyGet;
	},

	now: function() {
		return ( new Date() ).getTime();
	}
});

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {
			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );

		// If IE event model is used
		} else {
			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch(e) {}

			if ( top && top.doScroll ) {
				(function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {
							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll("left");
						} catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				})();
			}
		}
	}
	return readyList.promise( obj );
};

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || type !== "function" &&
		( length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);
// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( core_rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,
		// Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				args = args || [];
				args = [ context, args.slice ? args.slice() : args ];
				if ( list && ( !fired || stack ) ) {
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};
jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var action = tuple[ 0 ],
								fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ action + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = core_slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? core_slice.call( arguments ) : value;
					if( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});
jQuery.support = (function() {

	var support, all, a,
		input, select, fragment,
		opt, eventName, isSupported, i,
		div = document.createElement("div");

	// Setup
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// Support tests won't run in some limited or non-browser environments
	all = div.getElementsByTagName("*");
	a = div.getElementsByTagName("a")[ 0 ];
	if ( !all || !a || !all.length ) {
		return {};
	}

	// First batch of tests
	select = document.createElement("select");
	opt = select.appendChild( document.createElement("option") );
	input = div.getElementsByTagName("input")[ 0 ];

	a.style.cssText = "top:1px;float:left;opacity:.5";
	support = {
		// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
		getSetAttribute: div.className !== "t",

		// IE strips leading whitespace when .innerHTML is used
		leadingWhitespace: div.firstChild.nodeType === 3,

		// Make sure that tbody elements aren't automatically inserted
		// IE will insert them into empty tables
		tbody: !div.getElementsByTagName("tbody").length,

		// Make sure that link elements get serialized correctly by innerHTML
		// This requires a wrapper element in IE
		htmlSerialize: !!div.getElementsByTagName("link").length,

		// Get the style information from getAttribute
		// (IE uses .cssText instead)
		style: /top/.test( a.getAttribute("style") ),

		// Make sure that URLs aren't manipulated
		// (IE normalizes it by default)
		hrefNormalized: a.getAttribute("href") === "/a",

		// Make sure that element opacity exists
		// (IE uses filter instead)
		// Use a regex to work around a WebKit issue. See #5145
		opacity: /^0.5/.test( a.style.opacity ),

		// Verify style float existence
		// (IE uses styleFloat instead of cssFloat)
		cssFloat: !!a.style.cssFloat,

		// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
		checkOn: !!input.value,

		// Make sure that a selected-by-default option has a working selected property.
		// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
		optSelected: opt.selected,

		// Tests for enctype support on a form (#6743)
		enctype: !!document.createElement("form").enctype,

		// Makes sure cloning an html5 element does not cause problems
		// Where outerHTML is undefined, this still works
		html5Clone: document.createElement("nav").cloneNode( true ).outerHTML !== "<:nav></:nav>",

		// jQuery.support.boxModel DEPRECATED in 1.8 since we don't support Quirks Mode
		boxModel: document.compatMode === "CSS1Compat",

		// Will be defined later
		deleteExpando: true,
		noCloneEvent: true,
		inlineBlockNeedsLayout: false,
		shrinkWrapBlocks: false,
		reliableMarginRight: true,
		boxSizingReliable: true,
		pixelPosition: false
	};

	// Make sure checked status is properly cloned
	input.checked = true;
	support.noCloneChecked = input.cloneNode( true ).checked;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE<9
	try {
		delete div.test;
	} catch( e ) {
		support.deleteExpando = false;
	}

	// Check if we can trust getAttribute("value")
	input = document.createElement("input");
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";

	// #11217 - WebKit loses check when the name is after the checked attribute
	input.setAttribute( "checked", "t" );
	input.setAttribute( "name", "t" );

	fragment = document.createDocumentFragment();
	fragment.appendChild( input );

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	support.appendChecked = input.checked;

	// WebKit doesn't clone checked state correctly in fragments
	support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Opera does not clone events (and typeof div.attachEvent === undefined).
	// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()
	if ( div.attachEvent ) {
		div.attachEvent( "onclick", function() {
			support.noCloneEvent = false;
		});

		div.cloneNode( true ).click();
	}

	// Support: IE<9 (lack submit/change bubble), Firefox 17+ (lack focusin event)
	// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP), test/csp.php
	for ( i in { submit: true, change: true, focusin: true }) {
		div.setAttribute( eventName = "on" + i, "t" );

		support[ i + "Bubbles" ] = eventName in window || div.attributes[ eventName ].expando === false;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	// Run tests that need a body at doc ready
	jQuery(function() {
		var container, marginDiv, tds,
			divReset = "padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",
			body = document.getElementsByTagName("body")[0];

		if ( !body ) {
			// Return for frameset docs that don't have a body
			return;
		}

		container = document.createElement("div");
		container.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px";

		body.appendChild( container ).appendChild( div );

		// Support: IE8
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
		tds = div.getElementsByTagName("td");
		tds[ 0 ].style.cssText = "padding:0;margin:0;border:0;display:none";
		isSupported = ( tds[ 0 ].offsetHeight === 0 );

		tds[ 0 ].style.display = "";
		tds[ 1 ].style.display = "none";

		// Support: IE8
		// Check if empty table cells still have offsetWidth/Height
		support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );

		// Check box-sizing and margin behavior
		div.innerHTML = "";
		div.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;";
		support.boxSizing = ( div.offsetWidth === 4 );
		support.doesNotIncludeMarginInBodyOffset = ( body.offsetTop !== 1 );

		// Use window.getComputedStyle because jsdom on node.js will break without it.
		if ( window.getComputedStyle ) {
			support.pixelPosition = ( window.getComputedStyle( div, null ) || {} ).top !== "1%";
			support.boxSizingReliable = ( window.getComputedStyle( div, null ) || { width: "4px" } ).width === "4px";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. (#3333)
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			marginDiv = div.appendChild( document.createElement("div") );
			marginDiv.style.cssText = div.style.cssText = divReset;
			marginDiv.style.marginRight = marginDiv.style.width = "0";
			div.style.width = "1px";

			support.reliableMarginRight =
				!parseFloat( ( window.getComputedStyle( marginDiv, null ) || {} ).marginRight );
		}

		if ( typeof div.style.zoom !== core_strundefined ) {
			// Support: IE<8
			// Check if natively block-level elements act like inline-block
			// elements when setting their display to 'inline' and giving
			// them layout
			div.innerHTML = "";
			div.style.cssText = divReset + "width:1px;padding:1px;display:inline;zoom:1";
			support.inlineBlockNeedsLayout = ( div.offsetWidth === 3 );

			// Support: IE6
			// Check if elements with layout shrink-wrap their children
			div.style.display = "block";
			div.innerHTML = "<div></div>";
			div.firstChild.style.width = "5px";
			support.shrinkWrapBlocks = ( div.offsetWidth !== 3 );

			if ( support.inlineBlockNeedsLayout ) {
				// Prevent IE 6 from affecting layout for positioned elements #11048
				// Prevent IE from shrinking the body in IE 7 mode #12869
				// Support: IE<8
				body.style.zoom = 1;
			}
		}

		body.removeChild( container );

		// Null elements to avoid leaks in IE
		container = div = tds = marginDiv = null;
	});

	// Null elements to avoid leaks in IE
	all = select = fragment = opt = a = input = null;

	return support;
})();

var rbrace = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
	rmultiDash = /([A-Z])/g;

function internalData( elem, name, data, pvt /* Internal Use Only */ ){
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var thisCache, ret,
		internalKey = jQuery.expando,
		getByName = typeof name === "string",

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && getByName && data === undefined ) {
		return;
	}

	if ( !id ) {
		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			elem[ internalKey ] = id = core_deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {
		cache[ id ] = {};

		// Avoids exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		if ( !isNode ) {
			cache[ id ].toJSON = jQuery.noop;
		}
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( getByName ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !jQuery.acceptData( elem ) ) {
		return;
	}

	var i, l, thisCache,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split(" ");
					}
				}
			} else {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			for ( i = 0, l = name.length; i < l; i++ ) {
				delete thisCache[ name[i] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( !( pvt ? isEmptyDataObject : jQuery.isEmptyObject )( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	} else if ( jQuery.support.deleteExpando || cache != cache.window ) {
		delete cache[ id ];

	// When all else fails, null
	} else {
		cache[ id ] = null;
	}
}

jQuery.extend({
	cache: {},

	// Unique for each copy of jQuery on the page
	// Non-digits removed to match rinlinejQuery
	expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),

	// The following elements throw uncatchable exceptions if you
	// attempt to add expando properties to them.
	noData: {
		"embed": true,
		// Ban all objects except for Flash (which handle expandos)
		"object": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
		"applet": true
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	},

	// A method for determining if a DOM node can handle the data expando
	acceptData: function( elem ) {
		// Do not set data on non-element because it will not be cleared (#8335).
		if ( elem.nodeType && elem.nodeType !== 1 && elem.nodeType !== 9 ) {
			return false;
		}

		var noData = elem.nodeName && jQuery.noData[ elem.nodeName.toLowerCase() ];

		// nodes accept data unless otherwise specified; rejection can be conditional
		return !noData || noData !== true && elem.getAttribute("classid") === noData;
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var attrs, name,
			elem = this[0],
			i = 0,
			data = null;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					attrs = elem.attributes;
					for ( ; i < attrs.length; i++ ) {
						name = attrs[i].name;

						if ( !name.indexOf( "data-" ) ) {
							name = jQuery.camelCase( name.slice(5) );

							dataAttr( elem, name, data[ name ] );
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				jQuery.data( this, key );
			});
		}

		return jQuery.access( this, function( value ) {

			if ( value === undefined ) {
				// Try to fetch any internally stored data first
				return elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : null;
			}

			this.each(function() {
				jQuery.data( this, key, value );
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			jQuery.removeData( this, key );
		});
	}
});

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[name] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}
jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray(data) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		hooks.cur = fn;
		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/jquery-delay/
	delay: function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var nodeHook, boolHook,
	rclass = /[\t\r\n]/g,
	rreturn = /\r/g,
	rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i,
	rboolean = /^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = jQuery.support.getSetAttribute,
	getSetInput = jQuery.support.input;

jQuery.fn.extend({
	attr: function( name, value ) {
		return jQuery.access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	},

	prop: function( name, value ) {
		return jQuery.access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each(function() {
			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch( e ) {}
		});
	},

	addClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}
					elem.className = jQuery.trim( cur );

				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j,
			i = 0,
			len = this.length,
			proceed = arguments.length === 0 || typeof value === "string" && value;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( core_rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}
					elem.className = value ? jQuery.trim( cur ) : "";
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value,
			isBool = typeof stateVal === "boolean";

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					state = stateVal,
					classNames = value.match( core_rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					state = isBool ? state : !self.hasClass( className );
					self[ state ? "addClass" : "removeClass" ]( className );
				}

			// Toggle whole class name
			} else if ( type === core_strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					jQuery._data( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : jQuery._data( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	},

	val: function( value ) {
		var ret, hooks, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val,
				self = jQuery(this);

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, self.val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map(val, function ( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				// attributes.value is undefined in Blackberry 4.7 but
				// uses .value. See #6932
				var val = elem.attributes.value;
				return !val || val.specified ? elem.value : elem.text;
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( jQuery.support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var values = jQuery.makeArray( value );

				jQuery(elem).find("option").each(function() {
					this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
				});

				if ( !values.length ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	},

	attr: function( elem, name, value ) {
		var hooks, notxml, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === core_strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( notxml ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] || ( rboolean.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && notxml && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && notxml && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {

			// In IE9+, Flash objects don't have .getAttribute (#12945)
			// Support: IE9+
			if ( typeof elem.getAttribute !== core_strundefined ) {
				ret =  elem.getAttribute( name );
			}

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( core_rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( rboolean.test( name ) ) {
					// Set corresponding property to false for boolean attributes
					// Also clear defaultChecked/defaultSelected (if appropriate) for IE<8
					if ( !getSetAttribute && ruseDefault.test( name ) ) {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					} else {
						elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !jQuery.support.radioValue && value === "radio" && jQuery.nodeName(elem, "input") ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	propFix: {
		tabindex: "tabIndex",
		readonly: "readOnly",
		"for": "htmlFor",
		"class": "className",
		maxlength: "maxLength",
		cellspacing: "cellSpacing",
		cellpadding: "cellPadding",
		rowspan: "rowSpan",
		colspan: "colSpan",
		usemap: "useMap",
		frameborder: "frameBorder",
		contenteditable: "contentEditable"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				return ( elem[ name ] = value );
			}

		} else {
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
				return ret;

			} else {
				return elem[ name ];
			}
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				var attributeNode = elem.getAttributeNode("tabindex");

				return attributeNode && attributeNode.specified ?
					parseInt( attributeNode.value, 10 ) :
					rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
						0 :
						undefined;
			}
		}
	}
});

// Hook for boolean attributes
boolHook = {
	get: function( elem, name ) {
		var
			// Use .prop to determine if this attribute is understood as boolean
			prop = jQuery.prop( elem, name ),

			// Fetch it accordingly
			attr = typeof prop === "boolean" && elem.getAttribute( name ),
			detail = typeof prop === "boolean" ?

				getSetInput && getSetAttribute ?
					attr != null :
					// oldIE fabricates an empty string for missing boolean attributes
					// and conflates checked/selected into attroperties
					ruseDefault.test( name ) ?
						elem[ jQuery.camelCase( "default-" + name ) ] :
						!!attr :

				// fetch an attribute node for properties not recognized as boolean
				elem.getAttributeNode( name );

		return detail && detail.value !== false ?
			name.toLowerCase() :
			undefined;
	},
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		// Use defaultChecked and defaultSelected for oldIE
		} else {
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}

		return name;
	}
};

// fix oldIE value attroperty
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return jQuery.nodeName( elem, "input" ) ?

				// Ignore the value *property* by using defaultValue
				elem.defaultValue :

				ret && ret.specified ? ret.value : undefined;
		},
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {
				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {
				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			return ret && ( name === "id" || name === "name" || name === "coords" ? ret.value !== "" : ret.specified ) ?
				ret.value :
				undefined;
		},
		set: function( elem, value, name ) {
			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					(ret = elem.ownerDocument.createAttribute( name ))
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			return name === "value" || value === elem.getAttribute( name ) ?
				value :
				undefined;
		}
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		get: nodeHook.get,
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each([ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		});
	});
}


// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !jQuery.support.hrefNormalized ) {
	jQuery.each([ "href", "src", "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = jQuery.extend( jQuery.attrHooks[ name ], {
			get: function( elem ) {
				var ret = elem.getAttribute( name, 2 );
				return ret == null ? undefined : ret;
			}
		});
	});

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each([ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	});
}

if ( !jQuery.support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {
			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case senstitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}

// Safari mis-reports the default selected property of an option
// Accessing the parent's selectedIndex property fixes it
if ( !jQuery.support.optSelected ) {
	jQuery.propHooks.selected = jQuery.extend( jQuery.propHooks.selected, {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		}
	});
}

// IE6/7 call enctype encoding
if ( !jQuery.support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}

// Radios and checkboxes getter/setter
if ( !jQuery.support.checkOn ) {
	jQuery.each([ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			get: function( elem ) {
				// Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
				return elem.getAttribute("value") === null ? "on" : elem.value;
			}
		};
	});
}
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = jQuery.extend( jQuery.valHooks[ this ], {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	});
});
var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		// jQuery(...).bind("mouseover mouseout", fn);
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( core_rnotwhite ) || [""];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = core_hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = core_hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		event.isTrigger = true;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] && jQuery._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && jQuery.acceptData( cur ) && handle.apply && handle.apply( cur, data ) === false ) {
				event.preventDefault();
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( elem.ownerDocument, data ) === false) &&
				!(type === "click" && jQuery.nodeName( elem, "a" )) && jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {
						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, ret, handleObj, matched, j,
			handlerQueue = [],
			args = core_slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var sel, handleObj, matches, i,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur != this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Chrome 23+, Safari?
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			}
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== document.activeElement && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {
						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === document.activeElement && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Even when returnValue equals to undefined Firefox will still show alert
				if ( event.result !== undefined ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{ type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === core_strundefined ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
			src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;
		if ( !e ) {
			return;
		}
		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// IE submit delegation
if ( !jQuery.support.submitBubbles ) {

	jQuery.event.special.submit = {
		setup: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {
				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ? elem.form : undefined;
				if ( form && !jQuery._data( form, "submitBubbles" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submit_bubble = true;
					});
					jQuery._data( form, "submitBubbles", true );
				}
			});
			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {
			// If form was submitted by the user, bubble the event up the tree
			if ( event._submit_bubble ) {
				delete event._submit_bubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event, true );
				}
			}
		},

		teardown: function() {
			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !jQuery.support.changeBubbles ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {
				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._just_changed = true;
						}
					});
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._just_changed && !event.isTrigger ) {
							this._just_changed = false;
						}
						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event, true );
					});
				}
				return false;
			}
			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "changeBubbles" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event, true );
						}
					});
					jQuery._data( elem, "changeBubbles", true );
				}
			});
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== "radio" && elem.type !== "checkbox") ) {
				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Create "bubbling" focus and blur events
if ( !jQuery.support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler while someone wants focusin/focusout
		var attaches = 0,
			handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				if ( attaches++ === 0 ) {
					document.addEventListener( orig, handler, true );
				}
			},
			teardown: function() {
				if ( --attaches === 0 ) {
					document.removeEventListener( orig, handler, true );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var type, origFn;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});
/*!
 * Sizzle CSS Selector Engine
 * Copyright 2012 jQuery Foundation and other contributors
 * Released under the MIT license
 * http://sizzlejs.com/
 */
(function( window, undefined ) {

var i,
	cachedruns,
	Expr,
	getText,
	isXML,
	compile,
	hasDuplicate,
	outermostContext,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsXML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,
	sortOrder,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	support = {},
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Array methods
	arr = [],
	pop = arr.pop,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},


	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
	operators = "([*^$|!~]?=)",
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
		"*(?:" + operators + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

	// Prefer arguments quoted,
	//   then not containing pseudos/brackets,
	//   then attribute selectors/non-parenthetical expressions,
	//   then anything else
	// These preferences are here to reduce the number of selectors
	//   needing tokenize in the PSEUDO preFilter
	pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace( 3, 8 ) + ")*)|.*)\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([\\x20\\t\\r\\n\\f>+~])" + whitespace + "*" ),
	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"NAME": new RegExp( "^\\[name=['\"]?(" + characterEncoding + ")['\"]?\\]" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rsibling = /[\x20\t\r\n\f]*[+~]/,

	rnative = /^[^{]+\{\s*\[native code/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rescape = /'|\\/g,
	rattributeQuotes = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = /\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,
	funescape = function( _, escaped ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		return high !== high ?
			escaped :
			// BMP codepoint
			high < 0 ?
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Use a stripped-down slice if we can't use a native one
try {
	slice.call( preferredDoc.documentElement.childNodes, 0 )[0].nodeType;
} catch ( e ) {
	slice = function( i ) {
		var elem,
			results = [];
		while ( (elem = this[i++]) ) {
			results.push( elem );
		}
		return results;
	};
}

/**
 * For feature detection
 * @param {Function} fn The function to test for native support
 */
function isNative( fn ) {
	return rnative.test( fn + "" );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var cache,
		keys = [];

	return (cache = function( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key += " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key ] = value);
	});
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return fn( div );
	} catch (e) {
		return false;
	} finally {
		// release memory in IE
		div = null;
	}
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( !documentIsXML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, slice.call(context.getElementsByTagName( selector ), 0) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getByClassName && context.getElementsByClassName ) {
				push.apply( results, slice.call(context.getElementsByClassName( m ), 0) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && !rbuggyQSA.test(selector) ) {
			old = true;
			nid = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && context.parentNode || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results, slice.call( newContext.querySelectorAll(
						newSelector
					), 0 ) );
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Detect xml
 * @param {Element|Object} elem An element or a document
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var doc = node ? node.ownerDocument || node : preferredDoc;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsXML = isXML( doc );

	// Check if getElementsByTagName("*") returns only elements
	support.tagNameNoComments = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if attributes should be retrieved by attribute nodes
	support.attributes = assert(function( div ) {
		div.innerHTML = "<select></select>";
		var type = typeof div.lastChild.getAttribute("multiple");
		// IE8 returns a string for some attributes even when not present
		return type !== "boolean" && type !== "string";
	});

	// Check if getElementsByClassName can be trusted
	support.getByClassName = assert(function( div ) {
		// Opera can't find a second classname (in 9.6)
		div.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>";
		if ( !div.getElementsByClassName || !div.getElementsByClassName("e").length ) {
			return false;
		}

		// Safari 3.2 caches class attributes and doesn't catch changes
		div.lastChild.className = "e";
		return div.getElementsByClassName("e").length === 2;
	});

	// Check if getElementById returns elements by name
	// Check if getElementsByName privileges form controls or returns elements by ID
	support.getByName = assert(function( div ) {
		// Inject content
		div.id = expando + 0;
		div.innerHTML = "<a name='" + expando + "'></a><div name='" + expando + "'></div>";
		docElem.insertBefore( div, docElem.firstChild );

		// Test
		var pass = doc.getElementsByName &&
			// buggy browsers will return fewer than the correct 2
			doc.getElementsByName( expando ).length === 2 +
			// buggy browsers will return more than the correct 0
			doc.getElementsByName( expando + 0 ).length;
		support.getIdNotName = !doc.getElementById( expando );

		// Cleanup
		docElem.removeChild( div );

		return pass;
	});

	// IE6/7 return modified attributes
	Expr.attrHandle = assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild && typeof div.firstChild.getAttribute !== strundefined &&
			div.firstChild.getAttribute("href") === "#";
	}) ?
		{} :
		{
			"href": function( elem ) {
				return elem.getAttribute( "href", 2 );
			},
			"type": function( elem ) {
				return elem.getAttribute("type");
			}
		};

	// ID find and filter
	if ( support.getIdNotName ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [m] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && !documentIsXML ) {
				var m = context.getElementById( id );

				return m ?
					m.id === id || typeof m.getAttributeNode !== strundefined && m.getAttributeNode("id").value === id ?
						[m] :
						undefined :
					[];
			}
		};
		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.tagNameNoComments ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Name
	Expr.find["NAME"] = support.getByName && function( tag, context ) {
		if ( typeof context.getElementsByName !== strundefined ) {
			return context.getElementsByName( name );
		}
	};

	// Class
	Expr.find["CLASS"] = support.getByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && !documentIsXML ) {
			return context.getElementsByClassName( className );
		}
	};

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21),
	// no need to also add to buggyMatches since matches checks buggyQSA
	// A support test would require too much code (would include document ready)
	rbuggyQSA = [ ":focus" ];

	if ( (support.qsa = isNative(doc.querySelectorAll)) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explictly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select><option selected=''></option></select>";

			// IE8 - Some boolean attributes are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {

			// Opera 10-12/IE8 - ^= $= *= and empty values
			// Should not select anything
			div.innerHTML = "<input type='hidden' i=''/>";
			if ( div.querySelectorAll("[i^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:\"\"|'')" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = isNative( (matches = docElem.matchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.webkitMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = new RegExp( rbuggyMatches.join("|") );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = isNative(docElem.contains) || docElem.compareDocumentPosition ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	// Document order sorting
	sortOrder = docElem.compareDocumentPosition ?
	function( a, b ) {
		var compare;

		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( (compare = b.compareDocumentPosition && a.compareDocumentPosition && a.compareDocumentPosition( b )) ) {
			if ( compare & 1 || a.parentNode && a.parentNode.nodeType === 11 ) {
				if ( a === doc || contains( preferredDoc, a ) ) {
					return -1;
				}
				if ( b === doc || contains( preferredDoc, b ) ) {
					return 1;
				}
				return 0;
			}
			return compare & 4 ? -1 : 1;
		}

		return a.compareDocumentPosition ? -1 : 1;
	} :
	function( a, b ) {
		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// Parentless nodes are either documents or disconnected
		} else if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	// Always assume the presence of duplicates if sort doesn't
	// pass them to our comparison function (as in Google Chrome).
	hasDuplicate = false;
	[0, 0].sort( sortOrder );
	support.detectDuplicates = hasDuplicate;

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	// rbuggyQSA always contains :focus, so no need for an existence check
	if ( support.matchesSelector && !documentIsXML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && !rbuggyQSA.test(expr) ) {
		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [elem] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	var val;

	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	if ( !documentIsXML ) {
		name = name.toLowerCase();
	}
	if ( (val = Expr.attrHandle[ name ]) ) {
		return val( elem );
	}
	if ( documentIsXML || support.attributes ) {
		return elem.getAttribute( name );
	}
	return ( (val = elem.getAttributeNode( name )) || elem.getAttribute( name ) ) && elem[ name ] === true ?
		name :
		val && val.specified ? val.value : null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

// Document sorting and removing duplicates
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		i = 1,
		j = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		for ( ; (elem = results[i]); i++ ) {
			if ( elem === results[ i - 1 ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	return results;
};

function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && ( ~b.sourceIndex || MAX_NEGATIVE ) - ( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

// Returns a function to use in pseudos for input types
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

// Returns a function to use in pseudos for buttons
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

// Returns a function to use in pseudos for positionals
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		for ( ; (node = elem[i]); i++ ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (see #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[5] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[4] ) {
				match[2] = match[4];

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeName ) {
			if ( nodeName === "*" ) {
				return function() { return true; };
			}

			nodeName = nodeName.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
			};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( elem.className || (typeof elem.getAttribute !== strundefined && elem.getAttribute("class")) || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifider
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsXML ?
						elem.getAttribute("xml:lang") || elem.getAttribute("lang") :
						elem.lang) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is only affected by element nodes and content nodes(including text(3), cdata(4)),
			//   not comment, processing instructions, or others
			// Thanks to Diego Perini for the nodeName shortcut
			//   Greater than "@" means alpha characters (specifically not starting with "#" or "?")
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeName > "@" || elem.nodeType === 3 || elem.nodeType === 4 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
			// use getAttribute instead to test this case
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === elem.type );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

function tokenize( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( tokens = [] );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push( {
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			} );
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push( {
					value: matched,
					type: type,
					matches: match
				} );
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
}

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var data, cache, outerCache,
				dirkey = dirruns + " " + doneName;

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (cache = outerCache[ dir ]) && cache[0] === dirkey ) {
							if ( (data = cache[1]) === true || data === cachedruns ) {
								return data === true;
							}
						} else {
							cache = outerCache[ dir ] = [ dirkey ];
							cache[1] = matcher( elem, context, xml ) || cachedruns;
							if ( cache[1] === true ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector( tokens.slice( 0, i - 1 ) ).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	// A counter to specify which element is currently being matched
	var matcherCachedRuns = 0,
		bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, expandContext ) {
			var elem, j, matcher,
				setMatched = [],
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				outermost = expandContext != null,
				contextBackup = outermostContext,
				// We must always have either seed elements or context
				elems = seed || byElement && Expr.find["TAG"]( "*", expandContext && context.parentNode || context ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1);

			if ( outermost ) {
				outermostContext = context !== document && context;
				cachedruns = matcherCachedRuns;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			for ( ; (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
						cachedruns = ++matcherCachedRuns;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, group /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !group ) {
			group = tokenize( selector );
		}
		i = group.length;
		while ( i-- ) {
			cached = matcherFromTokens( group[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );
	}
	return cached;
};

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function select( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		match = tokenize( selector );

	if ( !seed ) {
		// Try to minimize operations if there is only one group
		if ( match.length === 1 ) {

			// Take a shortcut and set the context if the root selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					context.nodeType === 9 && !documentIsXML &&
					Expr.relative[ tokens[1].type ] ) {

				context = Expr.find["ID"]( token.matches[0].replace( runescape, funescape ), context )[0];
				if ( !context ) {
					return results;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && context.parentNode || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, slice.call( seed, 0 ) );
							return results;
						}

						break;
					}
				}
			}
		}
	}

	// Compile and execute a filtering function
	// Provide `match` to avoid retokenization if we modified the selector above
	compile( selector, match )(
		seed,
		context,
		documentIsXML,
		results,
		rsibling.test( selector )
	);
	return results;
}

// Deprecated
Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Easy API for creating new setFilters
function setFilters() {}
Expr.filters = setFilters.prototype = Expr.pseudos;
Expr.setFilters = new setFilters();

// Initialize with the default document
setDocument();

// Override sizzle attribute retrieval
Sizzle.attr = jQuery.attr;
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;


})( window );
var runtil = /Until$/,
	rparentsprev = /^(?:parents|prev(?:Until|All))/,
	isSimple = /^.[^:#\[\.,]*$/,
	rneedsContext = jQuery.expr.match.needsContext,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend({
	find: function( selector ) {
		var i, ret, self,
			len = this.length;

		if ( typeof selector !== "string" ) {
			self = this;
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		ret = [];
		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, this[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = ( this.selector ? this.selector + " " : "" ) + selector;
		return ret;
	},

	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter(function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false) );
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true) );
	},

	is: function( selector ) {
		return !!selector && (
			typeof selector === "string" ?
				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				rneedsContext.test( selector ) ?
					jQuery( selector, this.context ).index( this[0] ) >= 0 :
					jQuery.filter( selector, this ).length > 0 :
				this.filter( selector ).length > 0 );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			ret = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			cur = this[i];

			while ( cur && cur.ownerDocument && cur !== context && cur.nodeType !== 11 ) {
				if ( pos ? pos.index(cur) > -1 : jQuery.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;
				}
				cur = cur.parentNode;
			}
		}

		return this.pushStack( ret.length > 1 ? jQuery.unique( ret ) : ret );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[0], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(
			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[0] : elem, this );
	},

	add: function( selector, context ) {
		var set = typeof selector === "string" ?
				jQuery( selector, context ) :
				jQuery.makeArray( selector && selector.nodeType ? [ selector ] : selector ),
			all = jQuery.merge( this.get(), set );

		return this.pushStack( jQuery.unique(all) );
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

jQuery.fn.andSelf = jQuery.fn.addBack;

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jQuery.unique( ret ) : ret;

		if ( this.length > 1 && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret );
	};
});

jQuery.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 ?
			jQuery.find.matchesSelector(elems[0], expr) ? [ elems[0] ] : [] :
			jQuery.find.matches(expr, elems);
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {

	// Can't pass null or undefined to indexOf in Firefox 4
	// Set to 0 to skip string check
	qualifier = qualifier || 0;

	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jQuery.grep(elements, function( elem ) {
			return ( elem === qualifier ) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jQuery.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jQuery.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jQuery.filter( qualifier, filtered );
		}
	}

	return jQuery.grep(elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) >= 0 ) === keep;
	});
}
function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
		"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
	rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	manipulation_rcheckableType = /^(?:checkbox|radio)$/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		area: [ 1, "<map>", "</map>" ],
		param: [ 1, "<object>", "</object>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
		// unless wrapped in a div with non-breaking characters in front of it.
		_default: jQuery.support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>"  ]
	},
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement("div") );

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

jQuery.fn.extend({
	text: function( value ) {
		return jQuery.access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );
		}, null, value, arguments.length );
	},

	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function(i) {
				jQuery(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function(i) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	},

	append: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip(arguments, true, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				this.insertBefore( elem, this.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, false, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	// keepData is for internal use only--do not document
	remove: function( selector, keepData ) {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( !selector || jQuery.filter( selector, [ elem ] ).length > 0 ) {
				if ( !keepData && elem.nodeType === 1 ) {
					jQuery.cleanData( getAll( elem ) );
				}

				if ( elem.parentNode ) {
					if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
						setGlobalEval( getAll( elem, "script" ) );
					}
					elem.parentNode.removeChild( elem );
				}
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return jQuery.access( this, function( value ) {
			var elem = this[0] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( jQuery.support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || ["", ""] )[1].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for (; i < l; i++ ) {
						// Remove element nodes and prevent memory leaks
						elem = this[i] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch(e) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function( value ) {
		var isFunc = jQuery.isFunction( value );

		// Make sure that the elements are removed from the DOM before they are inserted
		// this can help fix replacing a parent with child elements
		if ( !isFunc && typeof value !== "string" ) {
			value = jQuery( value ).not( this ).detach();
		}

		return this.domManip( [ value ], true, function( elem ) {
			var next = this.nextSibling,
				parent = this.parentNode;

			if ( parent ) {
				jQuery( this ).remove();
				parent.insertBefore( elem, next );
			}
		});
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, table, callback ) {

		// Flatten any nested arrays
		args = core_concat.apply( [], args );

		var first, node, hasScripts,
			scripts, doc, fragment,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[0],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction || !( l <= 1 || typeof value !== "string" || jQuery.support.checkClone || !rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[0] = value.call( this, index, table ? self.html() : undefined );
				}
				self.domManip( args, table, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				table = table && jQuery.nodeName( first, "tr" );
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call(
						table && jQuery.nodeName( this[i], "table" ) ?
							findOrAppend( this[i], "tbody" ) :
							this[i],
						node,
						i
					);
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!jQuery._data( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Hope ajax is available...
								jQuery.ajax({
									url: node.src,
									type: "GET",
									dataType: "script",
									async: false,
									global: false,
									"throws": true
								});
							} else {
								jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || "" ).replace( rcleanScript, "" ) );
							}
						}
					}
				}

				// Fix #11809: Avoid leaking memory
				fragment = first = null;
			}
		}

		return this;
	}
});

function findOrAppend( elem, tag ) {
	return elem.getElementsByTagName( tag )[0] || elem.appendChild( elem.ownerDocument.createElement( tag ) );
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	var attr = elem.getAttributeNode("type");
	elem.type = ( attr && attr.specified ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[1];
	} else {
		elem.removeAttribute("type");
	}
	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; (elem = elems[i]) != null; i++ ) {
		jQuery._data( elem, "globalEval", !refElements || jQuery._data( refElements[i], "globalEval" ) );
	}
}

function cloneCopyEvent( src, dest ) {

	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !jQuery.support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( jQuery.support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && manipulation_rcheckableType.test( src.type ) ) {
		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone(true);
			jQuery( insert[i] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			core_push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});

function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== core_strundefined ? context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== core_strundefined ? context.querySelectorAll( tag || "*" ) :
			undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}

// Used in buildFragment, fixes the defaultChecked property
function fixDefaultChecked( elem ) {
	if ( manipulation_rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( jQuery.support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {
			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( (!jQuery.support.noCloneEvent || !jQuery.support.noCloneChecked) &&
				(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; (node = srcElements[i]) != null; ++i ) {
				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[i] ) {
					fixCloneNodeIssues( node, destElements[i] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; (node = srcElements[i]) != null; i++ ) {
					cloneCopyEvent( node, destElements[i] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var j, elem, contains,
			tmp, tag, tbody, wrap,
			l = elems.length,

			// Ensure a safe fragment
			safe = createSafeFragment( context ),

			nodes = [],
			i = 0;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || safe.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || ["", ""] )[1].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;

					tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[2];

					// Descend through wrappers to the right content
					j = wrap[0];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Manually add leading whitespace removed by IE
					if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
						nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );
					}

					// Remove IE's autoinserted <tbody> from table fragments
					if ( !jQuery.support.tbody ) {

						// String was a <table>, *may* have spurious <tbody>
						elem = tag === "table" && !rtbody.test( elem ) ?
							tmp.firstChild :

							// String was a bare <thead> or <tfoot>
							wrap[1] === "<table>" && !rtbody.test( elem ) ?
								tmp :
								0;

						j = elem && elem.childNodes.length;
						while ( j-- ) {
							if ( jQuery.nodeName( (tbody = elem.childNodes[j]), "tbody" ) && !tbody.childNodes.length ) {
								elem.removeChild( tbody );
							}
						}
					}

					jQuery.merge( nodes, tmp.childNodes );

					// Fix #12392 for WebKit and IE > 9
					tmp.textContent = "";

					// Fix #12392 for oldIE
					while ( tmp.firstChild ) {
						tmp.removeChild( tmp.firstChild );
					}

					// Remember the top-level container for proper cleanup
					tmp = safe.lastChild;
				}
			}
		}

		// Fix #11356: Clear elements from fragment
		if ( tmp ) {
			safe.removeChild( tmp );
		}

		// Reset defaultChecked for any radios and checkboxes
		// about to be appended to the DOM in IE 6/7 (#8060)
		if ( !jQuery.support.appendChecked ) {
			jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
		}

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( safe.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		tmp = null;

		return safe;
	},

	cleanData: function( elems, /* internal */ acceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			deleteExpando = jQuery.support.deleteExpando,
			special = jQuery.event.special;

		for ( ; (elem = elems[i]) != null; i++ ) {

			if ( acceptData || jQuery.acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// IE does not allow us to delete expando properties from nodes,
						// nor does it have a removeAttribute function on Document nodes;
						// we must handle all of these cases
						if ( deleteExpando ) {
							delete elem[ internalKey ];

						} else if ( typeof elem.removeAttribute !== core_strundefined ) {
							elem.removeAttribute( internalKey );

						} else {
							elem[ internalKey ] = null;
						}

						core_deletedIds.push( id );
					}
				}
			}
		}
	}
});
var iframe, getStyles, curCSS,
	ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/,
	rposition = /^(top|right|bottom|left)$/,
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rmargin = /^margin/,
	rnumsplit = new RegExp( "^(" + core_pnum + ")(.*)$", "i" ),
	rnumnonpx = new RegExp( "^(" + core_pnum + ")(?!px)[a-z%]+$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + core_pnum + ")", "i" ),
	elemdisplay = { BODY: "block" },

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: 0,
		fontWeight: 400
	},

	cssExpand = [ "Top", "Right", "Bottom", "Left" ],
	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt(0).toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function isHidden( elem, el ) {
	// isHidden might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem = el || elem;
	return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = jQuery._data( elem, "olddisplay", css_defaultDisplay(elem.nodeName) );
			}
		} else {

			if ( !values[ index ] ) {
				hidden = isHidden( elem );

				if ( display && display !== "none" || !hidden ) {
					jQuery._data( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
				}
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.fn.extend({
	css: function( name, value ) {
		return jQuery.access( this, function( elem, name, value ) {
			var len, styles,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		var bool = typeof state === "boolean";

		return this.each(function() {
			if ( bool ? state : isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Exclude the following css properties to add px
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": jQuery.support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that NaN and null values aren't set. See: #7116
			if ( value == null || type === "number" && isNaN( value ) ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !jQuery.support.clearCloneStyle && value === "" && name.indexOf("background") === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {

				// Wrapped to prevent IE from throwing errors when 'invalid' values are provided
				// Fixes bug #5509
				try {
					style[ name ] = value;
				} catch(e) {}
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	},

	// A method for quickly swapping in/out CSS properties to get correct calculations
	swap: function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	}
});

// NOTE: we've included the "window" in window.getComputedStyle
// because jsdom on node.js will break without it.
if ( window.getComputedStyle ) {
	getStyles = function( elem ) {
		return window.getComputedStyle( elem, null );
	};

	curCSS = function( elem, name, _computed ) {
		var width, minWidth, maxWidth,
			computed = _computed || getStyles( elem ),

			// getPropertyValue is only needed for .css('filter') in IE9, see #12537
			ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
			style = elem.style;

		if ( computed ) {

			if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
				ret = jQuery.style( elem, name );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
			// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
			if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret;
	};
} else if ( document.documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, _computed ) {
		var left, rs, rsLeft,
			computed = _computed || getStyles( elem ),
			ret = computed ? computed[ name ] : undefined,
			style = elem.style;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are proportional to the parent element instead
		// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		return ret === "" ? "auto" : ret;
	};
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox && ( jQuery.support.boxSizingReliable || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

// Try to determine the default display value of an element
function css_defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {
			// Use the already-created iframe if possible
			iframe = ( iframe ||
				jQuery("<iframe frameborder='0' width='0' height='0'/>")
				.css( "cssText", "display:block !important" )
			).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[0].contentWindow || iframe[0].contentDocument ).document;
			doc.write("<!doctype html><html><body>");
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}

// Called ONLY from within css_defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),
		display = jQuery.css( elem[0], "display" );
	elem.remove();
	return display;
}

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return elem.offsetWidth === 0 && rdisplayswap.test( jQuery.css( elem, "display" ) ) ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.support.boxSizing && jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

if ( !jQuery.support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {
			// IE uses filters for opacity
			return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "" ) ?
				( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
				computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

// These hooks cannot be added until DOM ready because the support test
// for it is not run until after DOM ready
jQuery(function() {
	if ( !jQuery.support.reliableMarginRight ) {
		jQuery.cssHooks.marginRight = {
			get: function( elem, computed ) {
				if ( computed ) {
					// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
					// Work around by temporarily setting element display to inline-block
					return jQuery.swap( elem, { "display": "inline-block" },
						curCSS, [ elem, "marginRight" ] );
				}
			}
		};
	}

	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// getComputedStyle returns percent when specified for top/left/bottom/right
	// rather than make the css module depend on the offset module, we just check for it here
	if ( !jQuery.support.pixelPosition && jQuery.fn.position ) {
		jQuery.each( [ "top", "left" ], function( i, prop ) {
			jQuery.cssHooks[ prop ] = {
				get: function( elem, computed ) {
					if ( computed ) {
						computed = curCSS( elem, prop );
						// if curCSS returns percentage, fallback to offset
						return rnumnonpx.test( computed ) ?
							jQuery( elem ).position()[ prop ] + "px" :
							computed;
					}
				}
			};
		});
	}

});

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.hidden = function( elem ) {
		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||
			(!jQuery.support.reliableHiddenOffsets && ((elem.style && elem.style.display) || jQuery.css( elem, "display" )) === "none");
	};

	jQuery.expr.filters.visible = function( elem ) {
		return !jQuery.expr.filters.hidden( elem );
	};
}

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});
var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function(){
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function(){
			var type = this.type;
			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !manipulation_rcheckableType.test( type ) );
		})
		.map(function( i, elem ){
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ){
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});

//Serialize an array of form elements or a set of
//key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}
jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.hover = function( fnOver, fnOut ) {
	return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
};
var
	// Document location
	ajaxLocParts,
	ajaxLocation,
	ajax_nonce = jQuery.now(),

	ajax_rquery = /\?/,
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,

	// Keep a copy of the old load method
	_load = jQuery.fn.load,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( core_rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, response, type,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = url.slice( off, url.length );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ){
	jQuery.fn[ type ] = function( fn ){
		return this.on( type, fn );
	};
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": window.String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Cross-domain detection vars
			parts,
			// Loop variable
			i,
			// URL without anti-cache param
			cacheURL,
			// Response headers as string
			responseHeadersString,
			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,
			// Response headers
			responseHeaders,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( core_rnotwhite ) || [""];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? 80 : 443 ) ) !=
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? 80 : 443 ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + ajax_nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( ajax_rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + ajax_nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// If successful, handle type chaining
			if ( status >= 200 && status < 300 || status === 304 ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 ) {
					isSuccess = true;
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					isSuccess = true;
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					isSuccess = ajaxConvert( s, response );
					statusText = isSuccess.state;
					success = isSuccess.data;
					error = isSuccess.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	}
});

/* Handles responses to an ajax request:
 * - sets all responseXXX fields accordingly
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes,
		responseFields = s.responseFields;

	// Fill responseXXX fields
	for ( type in responseFields ) {
		if ( type in responses ) {
			jqXHR[ responseFields[type] ] = responses[ type ];
		}
	}

	// Remove auto dataType and get content-type in the process
	while( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

// Chain conversions given the request and the original response
function ajaxConvert( s, response ) {
	var conv2, current, conv, tmp,
		converters = {},
		i = 0,
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice(),
		prev = dataTypes[ 0 ];

	// Apply the dataFilter if provided
	if ( s.dataFilter ) {
		response = s.dataFilter( response, s.dataType );
	}

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	// Convert to each sequential dataType, tolerating list modification
	for ( ; (current = dataTypes[++i]); ) {

		// There's only work to do if current dataType is non-auto
		if ( current !== "*" ) {

			// Convert response if prev dataType is non-auto and differs from current
			if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split(" ");
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.splice( i--, 0, current );
								}

								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s["throws"] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}

			// Update prev for next iteration
			prev = current;
		}
	}

	return { state: "success", data: response };
}
// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery("head")[0] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement("script");

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
});
var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( ajax_nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( ajax_rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});
var xhrCallbacks, xhrSupported,
	xhrId = 0,
	// #5280: Internet Explorer will keep connections alive if we don't abort on unload
	xhrOnUnloadAbort = window.ActiveXObject && function() {
		// Abort all pending requests
		var key;
		for ( key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	};

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject("Microsoft.XMLHTTP");
	} catch( e ) {}
}

// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject ?
	/* Microsoft failed to properly
	 * implement the XMLHttpRequest in IE7 (can't request local files),
	 * so we use the ActiveXObject when it is available
	 * Additionally XMLHttpRequest can be disabled in IE7/IE8 so
	 * we need a fallback.
	 */
	function() {
		return !this.isLocal && createStandardXHR() || createActiveXHR();
	} :
	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

// Determine support properties
xhrSupported = jQuery.ajaxSettings.xhr();
jQuery.support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = jQuery.support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport(function( s ) {
		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !s.crossDomain || jQuery.support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {

					// Get a new xhr
					var handle, i,
						xhr = s.xhr();

					// Open the socket
					// Passing null username, generates a login popup on Opera (#2865)
					if ( s.username ) {
						xhr.open( s.type, s.url, s.async, s.username, s.password );
					} else {
						xhr.open( s.type, s.url, s.async );
					}

					// Apply custom fields if provided
					if ( s.xhrFields ) {
						for ( i in s.xhrFields ) {
							xhr[ i ] = s.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( s.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( s.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !s.crossDomain && !headers["X-Requested-With"] ) {
						headers["X-Requested-With"] = "XMLHttpRequest";
					}

					// Need an extra try/catch for cross domain requests in Firefox 3
					try {
						for ( i in headers ) {
							xhr.setRequestHeader( i, headers[ i ] );
						}
					} catch( err ) {}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( s.hasContent && s.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, responseHeaders, statusText, responses;

						// Firefox throws exceptions when accessing properties
						// of an xhr when a network error occurred
						// http://helpful.knobs-dials.com/index.php/Component_returned_failure_code:_0x80040111_(NS_ERROR_NOT_AVAILABLE)
						try {

							// Was never called and is aborted or complete
							if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

								// Only called once
								callback = undefined;

								// Do not keep as active anymore
								if ( handle ) {
									xhr.onreadystatechange = jQuery.noop;
									if ( xhrOnUnloadAbort ) {
										delete xhrCallbacks[ handle ];
									}
								}

								// If it's an abort
								if ( isAbort ) {
									// Abort it manually if needed
									if ( xhr.readyState !== 4 ) {
										xhr.abort();
									}
								} else {
									responses = {};
									status = xhr.status;
									responseHeaders = xhr.getAllResponseHeaders();

									// When requesting binary data, IE6-9 will throw an exception
									// on any attempt to access responseText (#11426)
									if ( typeof xhr.responseText === "string" ) {
										responses.text = xhr.responseText;
									}

									// Firefox throws an exception when accessing
									// statusText for faulty cross-domain requests
									try {
										statusText = xhr.statusText;
									} catch( e ) {
										// We normalize with Webkit giving an empty statusText
										statusText = "";
									}

									// Filter status for non standard behaviors

									// If the request is local and we have data: assume a success
									// (success with no data won't get notified, that's the best we
									// can do given current implementations)
									if ( !status && s.isLocal && !s.crossDomain ) {
										status = responses.text ? 200 : 404;
									// IE - #1450: sometimes returns 1223 when it should be 204
									} else if ( status === 1223 ) {
										status = 204;
									}
								}
							}
						} catch( firefoxAccessException ) {
							if ( !isAbort ) {
								complete( -1, firefoxAccessException );
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, responseHeaders );
						}
					};

					if ( !s.async ) {
						// if we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {
						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						setTimeout( callback );
					} else {
						handle = ++xhrId;
						if ( xhrOnUnloadAbort ) {
							// Create the active xhrs callbacks list if needed
							// and attach the unload handler
							if ( !xhrCallbacks ) {
								xhrCallbacks = {};
								jQuery( window ).unload( xhrOnUnloadAbort );
							}
							// Add to list of active xhrs callbacks
							xhrCallbacks[ handle ] = callback;
						}
						xhr.onreadystatechange = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	});
}
var fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + core_pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [function( prop, value ) {
			var end, unit,
				tween = this.createTween( prop, value ),
				parts = rfxnum.exec( value ),
				target = tween.cur(),
				start = +target || 0,
				scale = 1,
				maxIterations = 20;

			if ( parts ) {
				end = +parts[2];
				unit = parts[3] || ( jQuery.cssNumber[ prop ] ? "" : "px" );

				// We need to compute starting value
				if ( unit !== "px" && start ) {
					// Iteratively approximate from a nonzero starting point
					// Prefer the current property, because this process will be trivial if it uses the same units
					// Fallback to end or a simple constant
					start = jQuery.css( tween.elem, prop, true ) || end || 1;

					do {
						// If previous iteration zeroed out, double until we get *something*
						// Use a string for doubling factor so we don't accidentally see scale as unchanged below
						scale = scale || ".5";

						// Adjust and apply
						start = start / scale;
						jQuery.style( tween.elem, prop, start + unit );

					// Update scale, tolerating zero or NaN from tween.cur()
					// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
					} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
				}

				tween.unit = unit;
				tween.start = start;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[1] ? start + ( parts[1] + 1 ) * end : end;
			}
			return tween;
		}]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

function createTweens( animation, props ) {
	jQuery.each( props, function( prop, value ) {
		var collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( collection[ index ].call( animation, prop, value ) ) {

				// we're done with this property
				return;
			}
		}
	});
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	createTweens( animation, props );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

function propFilter( props, specialEasing ) {
	var value, name, index, easing, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

function defaultPrefilter( elem, props, opts ) {
	/*jshint validthis:true */
	var prop, index, length,
		value, dataShow, toggle,
		tween, hooks, oldfire,
		anim = this,
		style = elem.style,
		orig = {},
		handled = [],
		hidden = elem.nodeType && isHidden( elem );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		if ( jQuery.css( elem, "display" ) === "inline" &&
				jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !jQuery.support.inlineBlockNeedsLayout || css_defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";

			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !jQuery.support.shrinkWrapBlocks ) {
			anim.always(function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			});
		}
	}


	// show/hide pass
	for ( index in props ) {
		value = props[ index ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ index ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {
				continue;
			}
			handled.push( index );
		}
	}

	length = handled.length;
	if ( length ) {
		dataShow = jQuery._data( elem, "fxshow" ) || jQuery._data( elem, "fxshow", {} );
		if ( "hidden" in dataShow ) {
			hidden = dataShow.hidden;
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( index = 0 ; index < length ; index++ ) {
			prop = handled[ index ];
			tween = anim.createTween( prop, hidden ? dataShow[ prop ] : 0 );
			orig[ prop ] = dataShow[ prop ] || jQuery.style( elem, prop );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}
	}
}

function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Remove in 2.0 - this supports IE8's panic based approach
// to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );
				doAnimation.finish = function() {
					anim.stop( true );
				};
				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.cur && hooks.cur.finish ) {
				hooks.cur.finish.call( this );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth? 1 : 0;
	for( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p*Math.PI ) / 2;
	}
};

jQuery.timers = [];
jQuery.fx = Tween.prototype.init;
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	if ( timer() && jQuery.timers.push( timer ) ) {
		jQuery.fx.start();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};

// Back Compat <1.8 extension point
jQuery.fx.step = {};

if ( jQuery.expr && jQuery.expr.filters ) {
	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep(jQuery.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}
jQuery.fn.offset = function( options ) {
	if ( arguments.length ) {
		return options === undefined ?
			this :
			this.each(function( i ) {
				jQuery.offset.setOffset( this, options, i );
			});
	}

	var docElem, win,
		box = { top: 0, left: 0 },
		elem = this[ 0 ],
		doc = elem && elem.ownerDocument;

	if ( !doc ) {
		return;
	}

	docElem = doc.documentElement;

	// Make sure it's not a disconnected DOM node
	if ( !jQuery.contains( docElem, elem ) ) {
		return box;
	}

	// If we don't have gBCR, just use 0,0 rather than error
	// BlackBerry 5, iOS 3 (original iPhone)
	if ( typeof elem.getBoundingClientRect !== core_strundefined ) {
		box = elem.getBoundingClientRect();
	}
	win = getWindow( doc );
	return {
		top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
		left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
	};
};

jQuery.offset = {

	setOffset: function( elem, options, i ) {
		var position = jQuery.css( elem, "position" );

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		var curElem = jQuery( elem ),
			curOffset = curElem.offset(),
			curCSSTop = jQuery.css( elem, "top" ),
			curCSSLeft = jQuery.css( elem, "left" ),
			calculatePosition = ( position === "absolute" || position === "fixed" ) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
			props = {}, curPosition = {}, curTop, curLeft;

		// need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};


jQuery.fn.extend({

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true)
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || document.documentElement;
			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position") === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || document.documentElement;
		});
	}
});


// Create scrollLeft and scrollTop methods
jQuery.each( {scrollLeft: "pageXOffset", scrollTop: "pageYOffset"}, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return jQuery.access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? (prop in win) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}
// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return jQuery.access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});
// Limit scope pollution from any deprecated API
// (function() {

// })();

// Expose for component
module.exports = jQuery;

// Expose jQuery to the global object
//window.jQuery = window.$ = jQuery;

// Expose jQuery as an AMD module, but only for AMD loaders that
// understand the issues with loading multiple versions of jQuery
// in a page that all might call define(). The loader will indicate
// they have special allowances for multiple jQuery versions by
// specifying define.amd.jQuery = true. Register as a named module,
// since jQuery can be concatenated with other files that may use define,
// but not use a proper concatenation script that understands anonymous
// AMD modules. A named AMD is safest and most robust way to register.
// Lowercase jquery is used because AMD module names are derived from
// file names, and jQuery is normally delivered in a lowercase file name.
// Do this after creating the global so that if an AMD module wants to call
// noConflict to hide this version of jQuery, it will work.
if ( typeof define === "function" && define.amd && define.amd.jQuery ) {
	define( "jquery", [], function () { return jQuery; } );
}

})( window );

});

require.register("component~trim@0.0.1", function (exports, module) {

exports = module.exports = trim;

function trim(str){
  if (str.trim) return str.trim();
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  if (str.trimLeft) return str.trimLeft();
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  if (str.trimRight) return str.trimRight();
  return str.replace(/\s*$/, '');
};

});

require.register("component~querystring@1.3.0", function (exports, module) {

/**
 * Module dependencies.
 */

var encode = encodeURIComponent;
var decode = decodeURIComponent;
var trim = require("component~trim@0.0.1");
var type = require("component~type@1.0.0");

/**
 * Parse the given query `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if ('string' != typeof str) return {};

  str = trim(str);
  if ('' == str) return {};
  if ('?' == str.charAt(0)) str = str.slice(1);

  var obj = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    var key = decode(parts[0]);
    var m;

    if (m = /(\w+)\[(\d+)\]/.exec(key)) {
      obj[m[1]] = obj[m[1]] || [];
      obj[m[1]][m[2]] = decode(parts[1]);
      continue;
    }

    obj[parts[0]] = null == parts[1]
      ? ''
      : decode(parts[1]);
  }

  return obj;
};

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

exports.stringify = function(obj){
  if (!obj) return '';
  var pairs = [];

  for (var key in obj) {
    var value = obj[key];

    if ('array' == type(value)) {
      for (var i = 0; i < value.length; ++i) {
        pairs.push(encode(key + '[' + i + ']') + '=' + encode(value[i]));
      }
      continue;
    }

    pairs.push(encode(key) + '=' + encode(obj[key]));
  }

  return pairs.join('&');
};

});

require.register("components~modernizr@2.6.2", function (exports, module) {
/*!
 * Modernizr v2.6.2
 * www.modernizr.com
 *
 * Copyright (c) Faruk Ates, Paul Irish, Alex Sexton
 * Available under the BSD and MIT licenses: www.modernizr.com/license/
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in
 * the current UA and makes the results available to you in two ways:
 * as properties on a global Modernizr object, and as classes on the
 * <html> element. This information allows you to progressively enhance
 * your pages with a granular level of control over the experience.
 *
 * Modernizr has an optional (not included) conditional resource loader
 * called Modernizr.load(), based on Yepnope.js (yepnopejs.com).
 * To get a build that includes Modernizr.load(), as well as choosing
 * which tests to include, go to www.modernizr.com/download/
 *
 * Authors        Faruk Ates, Paul Irish, Alex Sexton
 * Contributors   Ryan Seddon, Ben Alman
 */

window.Modernizr = (function( window, document, undefined ) {

    var version = '2.6.2',

    Modernizr = {},

    /*>>cssclasses*/
    // option for enabling the HTML classes to be added
    enableClasses = true,
    /*>>cssclasses*/

    docElement = document.documentElement,

    /**
     * Create our "modernizr" element that we do most feature tests on.
     */
    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    /**
     * Create the input element for various Web Forms feature tests.
     */
    inputElem /*>>inputelem*/ = document.createElement('input') /*>>inputelem*/ ,

    /*>>smile*/
    smile = ':)',
    /*>>smile*/

    toString = {}.toString,

    // TODO :: make the prefixes more granular
    /*>>prefixes*/
    // List of property values to set for css tests. See ticket #21
    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),
    /*>>prefixes*/

    /*>>domprefixes*/
    // Following spec is to expose vendor-specific style properties as:
    //   elem.style.WebkitBorderRadius
    // and the following would be incorrect:
    //   elem.style.webkitBorderRadius

    // Webkit ghosts their properties in lowercase but Opera & Moz do not.
    // Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
    //   erik.eae.net/archives/2008/03/10/21.48.10/

    // More here: github.com/Modernizr/Modernizr/issues/issue/21
    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),
    /*>>domprefixes*/

    /*>>ns*/
    ns = {'svg': 'http://www.w3.org/2000/svg'},
    /*>>ns*/

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName, // used in testing loop


    /*>>teststyles*/
    // Inject element with style element and some CSS rules
    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
          // After page load injecting a fake body doesn't work so check if body exists
          body = document.body,
          // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
          fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
          // In order not to give false positives we create a node for each test
          // This also allows the method to scale for unspecified uses
          while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

      // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
      // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
      // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
      // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
      // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
      style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
      // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
      // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
      (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
          //avoid crashing IE8, if background image is used
          fakeBody.style.background = '';
          //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
          fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
      // If this is done after page load we don't want to remove the body so check if body exists
      if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },
    /*>>teststyles*/

    /*>>mq*/
    // adapted from matchMedia polyfill
    // by Scott Jehl and Paul Irish
    // gist.github.com/786768
    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq).matches;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },
     /*>>mq*/


    /*>>hasevent*/
    //
    // isEventSupported determines if a given element supports the given event
    // kangax.github.com/iseventsupported/
    //
    // The following results are known incorrects:
    //   Modernizr.hasEvent("webkitTransitionEnd", elem) // false negative
    //   Modernizr.hasEvent("textInput") // in Webkit. github.com/Modernizr/Modernizr/issues/333
    //   ...
    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

        // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
        var isSupported = eventName in element;

        if ( !isSupported ) {
          // If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
          if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

            // If property was created, "remove it" (by setting value to `undefined`)
            if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),
    /*>>hasevent*/

    // TODO :: Add flag for hasownprop ? didn't last time

    // hasOwnProperty shim by kangax needed for Safari 2.0 support
    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }

    // Adapted from ES5-shim https://github.com/kriskowal/es5-shim/blob/master/es5-shim.js
    // es5.github.com/#x15.3.4.5

    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    /**
     * setCss applies given styles to the Modernizr DOM node.
     */
    function setCss( str ) {
        mStyle.cssText = str;
    }

    /**
     * setCssAll extrapolates all vendor-specific css strings.
     */
    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    /**
     * is returns a boolean for if typeof obj is exactly type.
     */
    function is( obj, type ) {
        return typeof obj === type;
    }

    /**
     * contains returns a boolean for if substr is found within str.
     */
    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    /*>>testprop*/

    // testProps is a generic CSS / DOM property test.

    // In testing support for a given CSS property, it's legit to test:
    //    `elem.style[styleName] !== undefined`
    // If the property is supported it will return an empty string,
    // if unsupported it will return undefined.

    // We'll take advantage of this quick test and skip setting a style
    // on our modernizr element, but instead just testing undefined vs
    // empty string.

    // Because the testing of the CSS property names (with "-", as
    // opposed to the camelCase DOM properties) is non-portable and
    // non-standard but works in WebKit and IE (but not Gecko or Opera),
    // we explicitly reject properties with dashes so that authors
    // developing in WebKit or IE first don't end up with
    // browser-specific content by accident.

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }
    /*>>testprop*/

    // TODO :: add testDOMProps
    /**
     * testDOMProps is a generic DOM property test; if a browser supports
     *   a certain property, it won't return undefined for it.
     */
    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                // return the property name as a string
                if (elem === false) return props[i];

                // let's bind a function
                if (is(item, 'function')){
                  // default to autobind unless override
                  return item.bind(elem || obj);
                }

                // return the unbound function or obj or value
                return item;
            }
        }
        return false;
    }

    /*>>testallprops*/
    /**
     * testPropsAll tests a list of DOM properties we want to check against.
     *   We specify literally ALL possible (known and/or likely) properties on
     *   the element including the non-vendor prefixed one, for forward-
     *   compatibility.
     */
    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        // did they call .prefixed('boxSizing') or are we just testing a prop?
        if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

        // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
        } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }
    /*>>testallprops*/


    /**
     * Tests
     * -----
     */

    // The *new* flexbox
    // dev.w3.org/csswg/css3-flexbox

    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };

    // The *old* flexbox
    // www.w3.org/TR/2009/WD-css3-flexbox-20090723/

    tests['flexboxlegacy'] = function() {
        return testPropsAll('boxDirection');
    };

    // On the S60 and BB Storm, getContext exists, but always returns undefined
    // so we actually have to call getContext() to verify
    // github.com/Modernizr/Modernizr/issues/issue/97/

    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };

    // webk.it/70117 is tracking a legit WebGL feature detect proposal

    // We do a soft detect which may false positive in order to avoid
    // an expensive context creation: bugzil.la/732441

    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };

    /*
     * The Modernizr.touch test only indicates if the browser supports
     *    touch events, which does not necessarily reflect a touchscreen
     *    device, as evidenced by tablets running Windows 7 or, alas,
     *    the Palm Pre / WebOS (touch) phones.
     *
     * Additionally, Chrome (desktop) used to lie about its support on this,
     *    but that has since been rectified: crbug.com/36415
     *
     * We also test for Firefox 4 Multitouch Support.
     *
     * For more info, see: modernizr.github.com/Modernizr/touch.html
     */

    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };


    // geolocation is often considered a trivial feature detect...
    // Turns out, it's quite tricky to get right:
    //
    // Using !!navigator.geolocation does two things we don't want. It:
    //   1. Leaks memory in IE9: github.com/Modernizr/Modernizr/issues/513
    //   2. Disables page caching in WebKit: webk.it/43956
    //
    // Meanwhile, in Firefox < 8, an about:config setting could expose
    // a false positive that would throw an exception: bugzil.la/688158

    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    // Chrome incognito mode used to throw an exception when using openDatabase
    // It doesn't anymore.
    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    // Vendors had inconsistent prefixing with the experimental Indexed DB:
    // - Webkit's implementation is accessible through webkitIndexedDB
    // - Firefox shipped moz_indexedDB before FF4b9, but since then has been mozIndexedDB
    // For speed, we don't test the legacy (and beta-only) indexedDB
    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    // Per 1.6:
    // This used to be Modernizr.historymanagement but the longer
    // name has been deprecated in favor of a shorter and property-matching one.
    // The old API is still available in 1.6, but as of 2.0 will throw a warning,
    // and in the first release thereafter disappear entirely.
    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    // FF3.6 was EOL'ed on 4/24/12, but the ESR version of FF10
    // will be supported until FF19 (2/12/13), at which time, ESR becomes FF17.
    // FF10 still uses prefixes, so check for it until then.
    // for more ESR info, see: mozilla.org/en-US/firefox/organizations/faq/
    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    // css-tricks.com/rgba-browser-support/
    tests['rgba'] = function() {
        // Set an rgba() color and check the returned value

        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
        // Same as rgba(), in fact, browsers re-map hsla() to rgba() internally,
        //   except IE9 who retains it as hsla

        setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
        // Setting multiple images AND a color on the background shorthand property
        //  and then querying the style.background property value for the number of
        //  occurrences of "url(" is a reliable method for detecting ACTUAL support for this!

        setCss('background:url(https://),url(https://),red url(https://)');

        // If the UA supports multiple backgrounds, there should be three occurrences
        //   of the string "url(" in the return value for elemStyle.background

        return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };



    // this will false positive in Opera Mini
    //   github.com/Modernizr/Modernizr/issues/396

    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };


    // Super comprehensive table about all the unique implementations of
    // border-radius: muddledramblings.com/table-of-css3-border-radius-compliance

    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    // WebOS unfortunately false positives on this test.
    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    // FF3.0 will false positive on this test
    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
        // Browsers that actually have CSS Opacity implemented have done so
        //  according to spec, which means their return values are within the
        //  range of [0.0,1.0] - including the leading zero.

        setCssAll('opacity:.55');

        // The non-literal . in this regex is intentional:
        //   German Chrome returns this value as 0,55
        // github.com/Modernizr/Modernizr/issues/#issue/59/comment/516632
        return (/^0.55$/).test(mStyle.opacity);
    };


    // Note, Android < 4 will pass this test, but can only animate
    //   a single property at a time
    //   daneden.me/2011/12/putting-up-with-androids-bullshit/
    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        /**
         * For CSS Gradients syntax, please see:
         * webkit.org/blog/175/introducing-css-gradients/
         * developer.mozilla.org/en/CSS/-moz-linear-gradient
         * developer.mozilla.org/en/CSS/-moz-radial-gradient
         * dev.w3.org/csswg/css3-images/#gradients-
         */

        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
             // legacy webkit syntax (FIXME: remove when syntax not in use anymore)
              (str1 + '-webkit- '.split(' ').join(str2 + str1) +
             // standard syntax             // trailing 'background-image:'
              prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

        // Webkit's 3D transforms are passed off to the browser's own graphics renderer.
        //   It works fine in Safari on Leopard and Snow Leopard, but not in Chrome in
        //   some conditions. As a result, Webkit typically recognizes the syntax but
        //   will sometimes throw a false positive, thus we must do a more thorough check:
        if ( ret && 'webkitPerspective' in docElement.style ) {

          // Webkit allows this media query to succeed only if the feature is enabled.
          // `@media (transform-3d),(-webkit-transform-3d){ ... }`
          injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };


    /*>>fontface*/
    // @font-face detection routine by Diego Perini
    // javascript.nwbox.com/CSSSupport/

    // false positives:
    //   WebOS github.com/Modernizr/Modernizr/issues/342
    //   WP7   github.com/Modernizr/Modernizr/issues/538
    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };
    /*>>fontface*/

    // CSS generated content detection
    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#',mod,'{font:0/0 a}#',mod,':after{content:"',smile,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          bool = node.offsetHeight >= 3;
        });

        return bool;
    };



    // These tests evaluate support of the video/audio elements, as well as
    // testing what types of content they support.
    //
    // We're using the Boolean constructor here, so that we can extend the value
    // e.g.  Modernizr.video     // true
    //       Modernizr.video.ogg // 'probably'
    //
    // Codec values from : github.com/NielsLeenheer/html5test/blob/9106a8/index.html#L845
    //                     thx to NielsLeenheer and zcorpan

    // Note: in some older browsers, "no" was a return value instead of empty string.
    //   It was live in FF3.5.0 and 3.5.1, but fixed in 3.5.2
    //   It was also live in Safari 4.0.0 - 4.0.4, but fixed in 4.0.5

    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

        // IE9 Running on Windows Server SKU can cause an exception to be thrown, bug #224
        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                // Without QuickTime, this value will be `undefined`. github.com/Modernizr/Modernizr/issues/546
                bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                // Mimetypes accepted:
                //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
                //   bit.ly/iphoneoscodecs
                bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    // In FF4, if disabled, window.localStorage should === null.

    // Normally, we could not test that directly and need to do a
    //   `('localStorage' in window) && ` test first because otherwise Firefox will
    //   throw bugzil.la/365772 if cookies are disabled

    // Also in iOS5 Private Browsing mode, attempting to use localStorage.setItem
    // will throw the exception:
    //   QUOTA_EXCEEDED_ERRROR DOM Exception 22.
    // Peculiarly, getItem and removeItem calls do not throw.

    // Because we are forced to try/catch this, we'll go aggressive.

    // Just FWIW: IE8 Compat mode supports these features completely:
    //   www.quirksmode.org/dom/html5.html
    // But IE8 doesn't support either with local files

    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    // Thanks to Erik Dahlstrom
    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    // specifically for SVG inline in HTML, not within XHTML
    // test page: paulirish.com/demo/inline-svg
    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    // SVG SMIL animation
    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };

    // This test is only for clip paths in SVG proper, not clip paths on HTML content
    // demo: srufaculty.sru.edu/david.dailey/svg/newstuff/clipPath4.svg

    // However read the comments to dig into applying SVG clippaths to HTML content here:
    //   github.com/Modernizr/Modernizr/issues/213#issuecomment-1149491
    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    /*>>webforms*/
    // input features and input types go directly onto the ret object, bypassing the tests loop.
    // Hold this guy to execute in a moment.
    function webforms() {
        /*>>input*/
        // Run through HTML5's new input attributes to see if the UA understands any.
        // We're using f which is the <input> element created early on
        // Mike Taylr has created a comprehensive resource for testing these attributes
        //   when applied to all input types:
        //   miketaylr.com/code/input-type-attr.html
        // spec: www.whatwg.org/specs/web-apps/current-work/multipage/the-input-element.html#input-type-attr-summary

        // Only input placeholder is tested while textarea's placeholder is not.
        // Currently Safari 4 and Opera 11 have support only for the input placeholder
        // Both tests are available in feature-detects/forms-placeholder.js
        Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
              // safari false positive's on datalist: webk.it/74252
              // see also github.com/Modernizr/Modernizr/issues/146
              attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
        /*>>input*/

        /*>>inputtypes*/
        // Run through HTML5's new input types to see if the UA understands any.
        //   This is put behind the tests runloop because it doesn't return a
        //   true/false like all the other tests; instead, it returns an object
        //   containing each input type with its corresponding true/false value

        // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
        Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                // We first check to see if the type we give it sticks..
                // If the type does, we feed it a textual value, which shouldn't be valid.
                // If the value doesn't stick, we know there's input sanitization which infers a custom UI
                if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                      // Safari 2-4 allows the smiley as a value, despite making a slider
                      bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                              // Mobile android web browser has false positive, so must
                              // check the height to see if the widget is actually there.
                              (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                      // Spec doesn't define any special parsing or detectable UI
                      //   behaviors so we pass these through as true

                      // Interestingly, opera fails the earlier test, so it doesn't
                      //  even make it here.

                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                      // Real url and email support comes with prebaked validation.
                      bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                      // If the upgraded input compontent rejects the :) text, we got a winner
                      bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        /*>>inputtypes*/
    }
    /*>>webforms*/


    // End of test definitions
    // -----------------------



    // Run through all tests and detect their support in the current UA.
    // todo: hypothetically we could be doing an array of tests and use a basic loop here.
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
            // run the test, throw the return value into the Modernizr,
            //   then based on that boolean, define an appropriate className
            //   and push it into an array of classes we'll join later.
            featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    /*>>webforms*/
    // input tests need to run.
    Modernizr.input || webforms();
    /*>>webforms*/


    /**
     * addTest allows the user to define their own feature tests
     * the result will be added onto the Modernizr object,
     * as well as an appropriate className set on the html element
     *
     * @param feature - String naming the feature
     * @param test - Function returning true if feature is supported, false if not
     */
     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
           // we're going to quit if you're trying to overwrite an existing test
           // if we were to allow it, we'd do this:
           //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
           //   docElement.className = docElement.className.replace( re, '' );
           // but, no rly, stuff 'em.
           return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr; // allow chaining.
     };


    // Reset modElem.cssText to nothing to reduce memory footprint.
    setCss('');
    modElem = inputElem = null;

    /*>>shiv*/
    /*! HTML5 Shiv v3.6.1 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed */
    ;(function(window, document) {
    /*jshint evil:true */
      /** Preset options */
      var options = window.html5 || {};

      /** Used to skip problem elements */
      var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

      /** Not all elements can be cloned in IE **/
      var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

      /** Detect whether the browser supports default html5 styles */
      var supportsHtml5Styles;

      /** Name of the expando, to work with multiple documents or to re-shiv one document */
      var expando = '_html5shiv';

      /** The id for the the documents expando */
      var expanID = 0;

      /** Cached data for each document */
      var expandoData = {};

      /** Detect whether the browser supports unknown elements */
      var supportsUnknownElements;

      (function() {
        try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
            //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
            supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
              // assign a false positive if unable to shiv
              (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
        } catch(e) {
          supportsHtml5Styles = true;
          supportsUnknownElements = true;
        }

      }());

      /*--------------------------------------------------------------------------*/

      /**
       * Creates a style sheet with the given CSS text and adds it to the document.
       * @private
       * @param {Document} ownerDocument The document.
       * @param {String} cssText The CSS text.
       * @returns {StyleSheet} The style element.
       */
      function addStyleSheet(ownerDocument, cssText) {
        var p = ownerDocument.createElement('p'),
            parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

        p.innerHTML = 'x<style>' + cssText + '</style>';
        return parent.insertBefore(p.lastChild, parent.firstChild);
      }

      /**
       * Returns the value of `html5.elements` as an array.
       * @private
       * @returns {Array} An array of shived element node names.
       */
      function getElements() {
        var elements = html5.elements;
        return typeof elements == 'string' ? elements.split(' ') : elements;
      }

        /**
       * Returns the data associated to the given document
       * @private
       * @param {Document} ownerDocument The document.
       * @returns {Object} An object of data.
       */
      function getExpandoData(ownerDocument) {
        var data = expandoData[ownerDocument[expando]];
        if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
        }
        return data;
      }

      /**
       * returns a shived element for the given nodeName and document
       * @memberOf html5
       * @param {String} nodeName name of the element
       * @param {Document} ownerDocument The context document.
       * @returns {Object} The shived element.
       */
      function createElement(nodeName, ownerDocument, data){
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
        }
        if (!data) {
            data = getExpandoData(ownerDocument);
        }
        var node;

        if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
        } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
        } else {
            node = data.createElem(nodeName);
        }

        // Avoid adding some elements to fragments in IE < 9 because
        // * Attributes like `name` or `type` cannot be set/changed once an element
        //   is inserted into a document/fragment
        // * Link elements with `src` attributes that are inaccessible, as with
        //   a 403 response, will cause the tab/window to crash
        // * Script elements appended to fragments will execute when their `src`
        //   or `text` property is set
        return node.canHaveChildren && !reSkip.test(nodeName) ? data.frag.appendChild(node) : node;
      }

      /**
       * returns a shived DocumentFragment for the given document
       * @memberOf html5
       * @param {Document} ownerDocument The context document.
       * @returns {Object} The shived DocumentFragment.
       */
      function createDocumentFragment(ownerDocument, data){
        if (!ownerDocument) {
            ownerDocument = document;
        }
        if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
        }
        data = data || getExpandoData(ownerDocument);
        var clone = data.frag.cloneNode(),
            i = 0,
            elems = getElements(),
            l = elems.length;
        for(;i<l;i++){
            clone.createElement(elems[i]);
        }
        return clone;
      }

      /**
       * Shivs the `createElement` and `createDocumentFragment` methods of the document.
       * @private
       * @param {Document|DocumentFragment} ownerDocument The document.
       * @param {Object} data of the document.
       */
      function shivMethods(ownerDocument, data) {
        if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
        }


        ownerDocument.createElement = function(nodeName) {
          //abort shiv
          if (!html5.shivMethods) {
              return data.createElem(nodeName);
          }
          return createElement(nodeName, ownerDocument, data);
        };

        ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
          'var n=f.cloneNode(),c=n.createElement;' +
          'h.shivMethods&&(' +
            // unroll the `createElement` calls
            getElements().join().replace(/\w+/g, function(nodeName) {
              data.createElem(nodeName);
              data.frag.createElement(nodeName);
              return 'c("' + nodeName + '")';
            }) +
          ');return n}'
        )(html5, data.frag);
      }

      /*--------------------------------------------------------------------------*/

      /**
       * Shivs the given document.
       * @memberOf html5
       * @param {Document} ownerDocument The document to shiv.
       * @returns {Document} The shived document.
       */
      function shivDocument(ownerDocument) {
        if (!ownerDocument) {
            ownerDocument = document;
        }
        var data = getExpandoData(ownerDocument);

        if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
          data.hasCSS = !!addStyleSheet(ownerDocument,
            // corrects block display not defined in IE6/7/8/9
            'article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
            // adds styling not present in IE6/7/8/9
            'mark{background:#FF0;color:#000}'
          );
        }
        if (!supportsUnknownElements) {
          shivMethods(ownerDocument, data);
        }
        return ownerDocument;
      }

      /*--------------------------------------------------------------------------*/

      /**
       * The `html5` object is exposed so that more elements can be shived and
       * existing shiving can be detected on iframes.
       * @type Object
       * @example
       *
       * // options can be changed before the script is included
       * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
       */
      var html5 = {

        /**
         * An array or space separated string of node names of the elements to shiv.
         * @memberOf html5
         * @type Array|String
         */
        'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video',

        /**
         * A flag to indicate that the HTML5 style sheet should be inserted.
         * @memberOf html5
         * @type Boolean
         */
        'shivCSS': (options.shivCSS !== false),

        /**
         * Is equal to true if a browser supports creating unknown/HTML5 elements
         * @memberOf html5
         * @type boolean
         */
        'supportsUnknownElements': supportsUnknownElements,

        /**
         * A flag to indicate that the document's `createElement` and `createDocumentFragment`
         * methods should be overwritten.
         * @memberOf html5
         * @type Boolean
         */
        'shivMethods': (options.shivMethods !== false),

        /**
         * A string to describe the type of `html5` object ("default" or "default print").
         * @memberOf html5
         * @type String
         */
        'type': 'default',

        // shivs the document according to the specified `html5` object options
        'shivDocument': shivDocument,

        //creates a shived element
        createElement: createElement,

        //creates a shived documentFragment
        createDocumentFragment: createDocumentFragment
      };

      /*--------------------------------------------------------------------------*/

      // expose html5
      window.html5 = html5;

      // shiv the document
      shivDocument(document);

    }(this, document));
    /*>>shiv*/

    // Assign private properties to the return object with prefix
    Modernizr._version      = version;

    // expose these for the plugin API. Look in the source for how to join() them against your input
    /*>>prefixes*/
    Modernizr._prefixes     = prefixes;
    /*>>prefixes*/
    /*>>domprefixes*/
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;
    /*>>domprefixes*/

    /*>>mq*/
    // Modernizr.mq tests a given media query, live against the current state of the window
    // A few important notes:
    //   * If a browser does not support media queries at all (eg. oldIE) the mq() will always return false
    //   * A max-width or orientation query will be evaluated against the current state, which may change later.
    //   * You must specify values. Eg. If you are testing support for the min-width media query use:
    //       Modernizr.mq('(min-width:0)')
    // usage:
    // Modernizr.mq('only screen and (max-width:768)')
    Modernizr.mq            = testMediaQuery;
    /*>>mq*/

    /*>>hasevent*/
    // Modernizr.hasEvent() detects support for a given event, with an optional element to test on
    // Modernizr.hasEvent('gesturestart', elem)
    Modernizr.hasEvent      = isEventSupported;
    /*>>hasevent*/

    /*>>testprop*/
    // Modernizr.testProp() investigates whether a given style property is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testProp('pointerEvents')
    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };
    /*>>testprop*/

    /*>>testallprops*/
    // Modernizr.testAllProps() investigates whether a given style property,
    //   or any of its vendor-prefixed variants, is recognized
    // Note that the property names must be provided in the camelCase variant.
    // Modernizr.testAllProps('boxSizing')
    Modernizr.testAllProps  = testPropsAll;
    /*>>testallprops*/


    /*>>teststyles*/
    // Modernizr.testStyles() allows you to add custom styles to the document and test an element afterwards
    // Modernizr.testStyles('#modernizr { position:absolute }', function(elem, rule){ ... })
    Modernizr.testStyles    = injectElementWithStyles;
    /*>>teststyles*/


    /*>>prefixed*/
    // Modernizr.prefixed() returns the prefixed or nonprefixed property name variant of your input
    // Modernizr.prefixed('boxSizing') // 'MozBoxSizing'

    // Properties must be passed as dom-style camelcase, rather than `box-sizing` hypentated style.
    // Return values will also be the camelCase variant, if you need to translate that to hypenated style use:
    //
    //     str.replace(/([A-Z])/g, function(str,m1){ return '-' + m1.toLowerCase(); }).replace(/^ms-/,'-ms-');

    // If you're trying to ascertain which transition end event to bind to, you might do something like...
    //
    //     var transEndEventNames = {
    //       'WebkitTransition' : 'webkitTransitionEnd',
    //       'MozTransition'    : 'transitionend',
    //       'OTransition'      : 'oTransitionEnd',
    //       'msTransition'     : 'MSTransitionEnd',
    //       'transition'       : 'transitionend'
    //     },
    //     transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];

    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
        // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
        return testPropsAll(prop, obj, elem);
      }
    };
    /*>>prefixed*/


    /*>>cssclasses*/
    // Remove "no-js" class from <html> element, if it exists:
    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                            // Add the new classes to the <html> element.
                            (enableClasses ? ' js ' + classes.join(' ') : '');
    /*>>cssclasses*/

    return Modernizr;

})(this, this.document);

});

require.register("indefinido~advisable@master", function (exports, module) {
module.exports = require("indefinido~advisable@master/lib/advisable.js");

});

require.register("indefinido~advisable@master/lib/advisable.js", function (exports, module) {
var $, advice, mixin;

$ = require("component~jquery@1.9.1");

advice = {
  around: function(base, wrapped) {
    return function() {
      var args;

      args = $.makeArray(arguments);
      return wrapped.apply(this, [$.proxy(base, this)].concat(args));
    };
  },
  before: function(base, before) {
    return this.around(base, function() {
      var args, orig;

      args = $.makeArray(arguments);
      orig = args.shift();
      before.apply(this, args);
      return orig.apply(this, args);
    });
  },
  after: function(base, after) {
    return this.around(base, function() {
      var args, orig, res;

      args = $.makeArray(arguments);
      orig = args.shift();
      res = orig.apply(this, args);
      after.apply(this, args);
      return res;
    });
  }
};

mixin = {
  before: function(method, advicer) {
    if (typeof this[method] === 'function') {
      return this[method] = advice.before(this[method], advicer);
    }
    throw new TypeError("Can only advice functions, attribute " + method + " of " + this + " is of type " + (typeof this[method]));
  },
  after: function(method, advicer) {
    if (typeof this[method] === 'function') {
      return this[method] = advice.after(this[method], advicer);
    }
    throw new TypeError("Can only advice functions, attribute " + method + " of " + this + " is of type " + (typeof this[method]));
  },
  around: function(method, advicer) {
    if (typeof this[method] === 'function') {
      return this[method] = advice.around(this[method], advicer);
    }
    throw new TypeError("Can only advice functions, attribute " + method + " of " + this + " is of type " + (typeof this[method]));
  }
};

exports.mixin = function(object) {
  return $.extend(object, mixin);
};

});

require.register("mikeric~rivets@v0.5.12", function (exports, module) {
// Rivets.js
// version: 0.5.12
// author: Michael Richards
// license: MIT
(function() {
  var Rivets,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Rivets = {};

  if (!String.prototype.trim) {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }

  Rivets.Binding = (function() {
    function Binding(view, el, type, key, keypath, options) {
      var identifier, regexp, value, _ref;
      this.view = view;
      this.el = el;
      this.type = type;
      this.key = key;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.update = __bind(this.update, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.publish = __bind(this.publish, this);
      this.sync = __bind(this.sync, this);
      this.set = __bind(this.set, this);
      this.eventHandler = __bind(this.eventHandler, this);
      this.formattedValue = __bind(this.formattedValue, this);
      if (!(this.binder = this.view.binders[type])) {
        _ref = this.view.binders;
        for (identifier in _ref) {
          value = _ref[identifier];
          if (identifier !== '*' && identifier.indexOf('*') !== -1) {
            regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
            if (regexp.test(type)) {
              this.binder = value;
              this.args = new RegExp("^" + (identifier.replace('*', '(.+)')) + "$").exec(type);
              this.args.shift();
            }
          }
        }
      }
      this.binder || (this.binder = this.view.binders['*']);
      if (this.binder instanceof Function) {
        this.binder = {
          routine: this.binder
        };
      }
      this.formatters = this.options.formatters || [];
      this.model = this.key ? this.view.models[this.key] : this.view.models;
    }

    Binding.prototype.formattedValue = function(value) {
      var args, formatter, id, _i, _len, _ref;
      _ref = this.formatters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        formatter = this.model[id] instanceof Function ? this.model[id] : this.view.formatters[id];
        if ((formatter != null ? formatter.read : void 0) instanceof Function) {
          value = formatter.read.apply(formatter, [value].concat(__slice.call(args)));
        } else if (formatter instanceof Function) {
          value = formatter.apply(null, [value].concat(__slice.call(args)));
        }
      }
      return value;
    };

    Binding.prototype.eventHandler = function(fn) {
      var binding, handler;
      handler = (binding = this).view.config.handler;
      return function(ev) {
        return handler.call(fn, this, ev, binding);
      };
    };

    Binding.prototype.set = function(value) {
      var _ref;
      value = value instanceof Function && !this.binder["function"] ? this.formattedValue(value.call(this.model)) : this.formattedValue(value);
      return (_ref = this.binder.routine) != null ? _ref.call(this, this.el, value) : void 0;
    };

    Binding.prototype.sync = function() {
      return this.set(this.options.bypass ? this.model[this.keypath] : this.view.config.adapter.read(this.model, this.keypath));
    };

    Binding.prototype.publish = function() {
      var args, formatter, id, value, _i, _len, _ref, _ref1, _ref2;
      value = Rivets.Util.getInputValue(this.el);
      _ref = this.formatters.slice(0).reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        if ((_ref1 = this.view.formatters[id]) != null ? _ref1.publish : void 0) {
          value = (_ref2 = this.view.formatters[id]).publish.apply(_ref2, [value].concat(__slice.call(args)));
        }
      }
      return this.view.config.adapter.publish(this.model, this.keypath, value);
    };

    Binding.prototype.bind = function() {
      var dependency, keypath, model, _i, _len, _ref, _ref1, _ref2, _results;
      if ((_ref = this.binder.bind) != null) {
        _ref.call(this, this.el);
      }
      if (this.options.bypass) {
        this.sync();
      } else {
        this.view.config.adapter.subscribe(this.model, this.keypath, this.sync);
        if (this.view.config.preloadData) {
          this.sync();
        }
      }
      if ((_ref1 = this.options.dependencies) != null ? _ref1.length : void 0) {
        _ref2 = this.options.dependencies;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dependency = _ref2[_i];
          if (/^\./.test(dependency)) {
            model = this.model;
            keypath = dependency.substr(1);
          } else {
            dependency = dependency.split('.');
            model = this.view.models[dependency.shift()];
            keypath = dependency.join('.');
          }
          _results.push(this.view.config.adapter.subscribe(model, keypath, this.sync));
        }
        return _results;
      }
    };

    Binding.prototype.unbind = function() {
      var dependency, keypath, model, _i, _len, _ref, _ref1, _ref2, _results;
      if ((_ref = this.binder.unbind) != null) {
        _ref.call(this, this.el);
      }
      if (!this.options.bypass) {
        this.view.config.adapter.unsubscribe(this.model, this.keypath, this.sync);
      }
      if ((_ref1 = this.options.dependencies) != null ? _ref1.length : void 0) {
        _ref2 = this.options.dependencies;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dependency = _ref2[_i];
          if (/^\./.test(dependency)) {
            model = this.model;
            keypath = dependency.substr(1);
          } else {
            dependency = dependency.split('.');
            model = this.view.models[dependency.shift()];
            keypath = dependency.join('.');
          }
          _results.push(this.view.config.adapter.unsubscribe(model, keypath, this.sync));
        }
        return _results;
      }
    };

    Binding.prototype.update = function(models) {
      var _ref;
      if (models == null) {
        models = {};
      }
      if (this.key) {
        if (models[this.key]) {
          if (!this.options.bypass) {
            this.view.config.adapter.unsubscribe(this.model, this.keypath, this.sync);
          }
          this.model = models[this.key];
          if (this.options.bypass) {
            this.sync();
          } else {
            this.view.config.adapter.subscribe(this.model, this.keypath, this.sync);
            if (this.view.config.preloadData) {
              this.sync();
            }
          }
        }
      } else {
        this.sync();
      }
      return (_ref = this.binder.update) != null ? _ref.call(this, models) : void 0;
    };

    return Binding;

  })();

  Rivets.ComponentBinding = (function(_super) {
    __extends(ComponentBinding, _super);

    function ComponentBinding(view, el, type) {
      var attribute, _i, _len, _ref, _ref1;
      this.view = view;
      this.el = el;
      this.type = type;
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.update = __bind(this.update, this);
      this.locals = __bind(this.locals, this);
      this.component = Rivets.components[this.type];
      this.attributes = {};
      this.inflections = {};
      _ref = this.el.attributes || [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attribute = _ref[_i];
        if (_ref1 = attribute.name, __indexOf.call(this.component.attributes, _ref1) >= 0) {
          this.attributes[attribute.name] = attribute.value;
        } else {
          this.inflections[attribute.name] = attribute.value;
        }
      }
    }

    ComponentBinding.prototype.sync = function() {};

    ComponentBinding.prototype.locals = function(models) {
      var inverse, key, model, path, result, _i, _len, _ref, _ref1;
      if (models == null) {
        models = this.view.models;
      }
      result = {};
      _ref = this.inflections;
      for (key in _ref) {
        inverse = _ref[key];
        _ref1 = inverse.split('.');
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          path = _ref1[_i];
          result[key] = (result[key] || models)[path];
        }
      }
      for (key in models) {
        model = models[key];
        if (result[key] == null) {
          result[key] = model;
        }
      }
      return result;
    };

    ComponentBinding.prototype.update = function(models) {
      var _ref;
      return (_ref = this.componentView) != null ? _ref.update(this.locals(models)) : void 0;
    };

    ComponentBinding.prototype.bind = function() {
      var el, _ref;
      if (this.componentView != null) {
        return (_ref = this.componentView) != null ? _ref.bind() : void 0;
      } else {
        el = this.component.build.call(this.attributes);
        (this.componentView = new Rivets.View(el, this.locals(), this.view.options)).bind();
        return this.el.parentNode.replaceChild(el, this.el);
      }
    };

    ComponentBinding.prototype.unbind = function() {
      var _ref;
      return (_ref = this.componentView) != null ? _ref.unbind() : void 0;
    };

    return ComponentBinding;

  })(Rivets.Binding);

  Rivets.TextBinding = (function(_super) {
    __extends(TextBinding, _super);

    function TextBinding(view, el, type, key, keypath, options) {
      this.view = view;
      this.el = el;
      this.type = type;
      this.key = key;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.sync = __bind(this.sync, this);
      this.formatters = this.options.formatters || [];
      this.model = this.key ? this.view.models[this.key] : this.view.models;
    }

    TextBinding.prototype.binder = {
      routine: function(node, value) {
        return node.data = value != null ? value : '';
      }
    };

    TextBinding.prototype.sync = function() {
      return TextBinding.__super__.sync.apply(this, arguments);
    };

    return TextBinding;

  })(Rivets.Binding);

  Rivets.View = (function() {
    function View(els, models, options) {
      var k, option, v, _base, _i, _len, _ref, _ref1, _ref2;
      this.els = els;
      this.models = models;
      this.options = options != null ? options : {};
      this.update = __bind(this.update, this);
      this.publish = __bind(this.publish, this);
      this.sync = __bind(this.sync, this);
      this.unbind = __bind(this.unbind, this);
      this.bind = __bind(this.bind, this);
      this.select = __bind(this.select, this);
      this.build = __bind(this.build, this);
      this.componentRegExp = __bind(this.componentRegExp, this);
      this.bindingRegExp = __bind(this.bindingRegExp, this);
      if (!(this.els.jquery || this.els instanceof Array)) {
        this.els = [this.els];
      }
      _ref = ['config', 'binders', 'formatters'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        this[option] = {};
        if (this.options[option]) {
          _ref1 = this.options[option];
          for (k in _ref1) {
            v = _ref1[k];
            this[option][k] = v;
          }
        }
        _ref2 = Rivets[option];
        for (k in _ref2) {
          v = _ref2[k];
          if ((_base = this[option])[k] == null) {
            _base[k] = v;
          }
        }
      }
      this.build();
    }

    View.prototype.bindingRegExp = function() {
      var prefix;
      prefix = this.config.prefix;
      if (prefix) {
        return new RegExp("^data-" + prefix + "-");
      } else {
        return /^data-/;
      }
    };

    View.prototype.componentRegExp = function() {
      var _ref, _ref1;
      return new RegExp("^" + ((_ref = (_ref1 = this.config.prefix) != null ? _ref1.toUpperCase() : void 0) != null ? _ref : 'RV') + "-");
    };

    View.prototype.build = function() {
      var bindingRegExp, buildBinding, componentRegExp, el, parse, skipNodes, _i, _len, _ref,
        _this = this;
      this.bindings = [];
      skipNodes = [];
      bindingRegExp = this.bindingRegExp();
      componentRegExp = this.componentRegExp();
      buildBinding = function(binding, node, type, declaration) {
        var context, ctx, dependencies, key, keypath, options, path, pipe, pipes, splitPath;
        options = {};
        pipes = (function() {
          var _i, _len, _ref, _results;
          _ref = declaration.split('|');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            pipe = _ref[_i];
            _results.push(pipe.trim());
          }
          return _results;
        })();
        context = (function() {
          var _i, _len, _ref, _results;
          _ref = pipes.shift().split('<');
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            ctx = _ref[_i];
            _results.push(ctx.trim());
          }
          return _results;
        })();
        path = context.shift();
        splitPath = path.split(/\.|:/);
        options.formatters = pipes;
        options.bypass = path.indexOf(':') !== -1;
        if (splitPath[0]) {
          key = splitPath.shift();
        } else {
          key = null;
          splitPath.shift();
        }
        keypath = splitPath.join('.');
        if (dependencies = context.shift()) {
          options.dependencies = dependencies.split(/\s+/);
        }
        return _this.bindings.push(new Rivets[binding](_this, node, type, key, keypath, options));
      };
      parse = function(node) {
        var attribute, attributes, binder, childNode, delimiters, identifier, n, parser, regexp, restTokens, startToken, text, token, tokens, type, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _results;
        if (__indexOf.call(skipNodes, node) < 0) {
          if (node.nodeType === Node.TEXT_NODE) {
            parser = Rivets.TextTemplateParser;
            if (delimiters = _this.config.templateDelimiters) {
              if ((tokens = parser.parse(node.data, delimiters)).length) {
                if (!(tokens.length === 1 && tokens[0].type === parser.types.text)) {
                  startToken = tokens[0], restTokens = 2 <= tokens.length ? __slice.call(tokens, 1) : [];
                  node.data = startToken.value;
                  if (startToken.type === 0) {
                    node.data = startToken.value;
                  } else {
                    buildBinding('TextBinding', node, null, startToken.value);
                  }
                  for (_i = 0, _len = restTokens.length; _i < _len; _i++) {
                    token = restTokens[_i];
                    text = document.createTextNode(token.value);
                    node.parentNode.appendChild(text);
                    if (token.type === 1) {
                      buildBinding('TextBinding', text, null, token.value);
                    }
                  }
                }
              }
            }
          } else if (componentRegExp.test(node.tagName)) {
            type = node.tagName.replace(componentRegExp, '').toLowerCase();
            _this.bindings.push(new Rivets.ComponentBinding(_this, node, type));
          } else if (node.attributes != null) {
            _ref = node.attributes;
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              attribute = _ref[_j];
              if (bindingRegExp.test(attribute.name)) {
                type = attribute.name.replace(bindingRegExp, '');
                if (!(binder = _this.binders[type])) {
                  _ref1 = _this.binders;
                  for (identifier in _ref1) {
                    value = _ref1[identifier];
                    if (identifier !== '*' && identifier.indexOf('*') !== -1) {
                      regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
                      if (regexp.test(type)) {
                        binder = value;
                      }
                    }
                  }
                }
                binder || (binder = _this.binders['*']);
                if (binder.block) {
                  _ref2 = node.childNodes;
                  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                    n = _ref2[_k];
                    skipNodes.push(n);
                  }
                  attributes = [attribute];
                }
              }
            }
            _ref3 = attributes || node.attributes;
            for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
              attribute = _ref3[_l];
              if (bindingRegExp.test(attribute.name)) {
                type = attribute.name.replace(bindingRegExp, '');
                buildBinding('Binding', node, type, attribute.value);
              }
            }
          }
          _ref4 = node.childNodes;
          _results = [];
          for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
            childNode = _ref4[_m];
            _results.push(parse(childNode));
          }
          return _results;
        }
      };
      _ref = this.els;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        parse(el);
      }
    };

    View.prototype.select = function(fn) {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        if (fn(binding)) {
          _results.push(binding);
        }
      }
      return _results;
    };

    View.prototype.bind = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.bind());
      }
      return _results;
    };

    View.prototype.unbind = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.unbind());
      }
      return _results;
    };

    View.prototype.sync = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.sync());
      }
      return _results;
    };

    View.prototype.publish = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.select(function(b) {
        return b.binder.publishes;
      });
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.publish());
      }
      return _results;
    };

    View.prototype.update = function(models) {
      var binding, key, model, _i, _len, _ref, _results;
      if (models == null) {
        models = {};
      }
      for (key in models) {
        model = models[key];
        this.models[key] = model;
      }
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.update(models));
      }
      return _results;
    };

    return View;

  })();

  Rivets.TextTemplateParser = (function() {
    function TextTemplateParser() {}

    TextTemplateParser.types = {
      text: 0,
      binding: 1
    };

    TextTemplateParser.parse = function(template, delimiters) {
      var index, lastIndex, lastToken, length, substring, tokens, value;
      tokens = [];
      length = template.length;
      index = 0;
      lastIndex = 0;
      while (lastIndex < length) {
        index = template.indexOf(delimiters[0], lastIndex);
        if (index < 0) {
          tokens.push({
            type: this.types.text,
            value: template.slice(lastIndex)
          });
          break;
        } else {
          if (index > 0 && lastIndex < index) {
            tokens.push({
              type: this.types.text,
              value: template.slice(lastIndex, index)
            });
          }
          lastIndex = index + 2;
          index = template.indexOf(delimiters[1], lastIndex);
          if (index < 0) {
            substring = template.slice(lastIndex - 2);
            lastToken = tokens[tokens.length - 1];
            if ((lastToken != null ? lastToken.type : void 0) === this.types.text) {
              lastToken.value += substring;
            } else {
              tokens.push({
                type: this.types.text,
                value: substring
              });
            }
            break;
          }
          value = template.slice(lastIndex, index).trim();
          tokens.push({
            type: this.types.binding,
            value: value
          });
          lastIndex = index + 2;
        }
      }
      return tokens;
    };

    return TextTemplateParser;

  })();

  Rivets.Util = {
    bindEvent: function(el, event, handler) {
      if (window.jQuery != null) {
        el = jQuery(el);
        if (el.on != null) {
          return el.on(event, handler);
        } else {
          return el.bind(event, handler);
        }
      } else if (window.addEventListener != null) {
        return el.addEventListener(event, handler, false);
      } else {
        event = 'on' + event;
        return el.attachEvent(event, handler);
      }
    },
    unbindEvent: function(el, event, handler) {
      if (window.jQuery != null) {
        el = jQuery(el);
        if (el.off != null) {
          return el.off(event, handler);
        } else {
          return el.unbind(event, handler);
        }
      } else if (window.removeEventListener != null) {
        return el.removeEventListener(event, handler, false);
      } else {
        event = 'on' + event;
        return el.detachEvent(event, handler);
      }
    },
    getInputValue: function(el) {
      var o, _i, _len, _results;
      if (window.jQuery != null) {
        el = jQuery(el);
        switch (el[0].type) {
          case 'checkbox':
            return el.is(':checked');
          default:
            return el.val();
        }
      } else {
        switch (el.type) {
          case 'checkbox':
            return el.checked;
          case 'select-multiple':
            _results = [];
            for (_i = 0, _len = el.length; _i < _len; _i++) {
              o = el[_i];
              if (o.selected) {
                _results.push(o.value);
              }
            }
            return _results;
            break;
          default:
            return el.value;
        }
      }
    }
  };

  Rivets.binders = {
    enabled: function(el, value) {
      return el.disabled = !value;
    },
    disabled: function(el, value) {
      return el.disabled = !!value;
    },
    checked: {
      publishes: true,
      bind: function(el) {
        return Rivets.Util.bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return Rivets.Util.unbindEvent(el, 'change', this.publish);
      },
      routine: function(el, value) {
        var _ref;
        if (el.type === 'radio') {
          return el.checked = ((_ref = el.value) != null ? _ref.toString() : void 0) === (value != null ? value.toString() : void 0);
        } else {
          return el.checked = !!value;
        }
      }
    },
    unchecked: {
      publishes: true,
      bind: function(el) {
        return Rivets.Util.bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return Rivets.Util.unbindEvent(el, 'change', this.publish);
      },
      routine: function(el, value) {
        var _ref;
        if (el.type === 'radio') {
          return el.checked = ((_ref = el.value) != null ? _ref.toString() : void 0) !== (value != null ? value.toString() : void 0);
        } else {
          return el.checked = !value;
        }
      }
    },
    show: function(el, value) {
      return el.style.display = value ? '' : 'none';
    },
    hide: function(el, value) {
      return el.style.display = value ? 'none' : '';
    },
    html: function(el, value) {
      return el.innerHTML = value != null ? value : '';
    },
    value: {
      publishes: true,
      bind: function(el) {
        return Rivets.Util.bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return Rivets.Util.unbindEvent(el, 'change', this.publish);
      },
      routine: function(el, value) {
        var o, _i, _len, _ref, _ref1, _ref2, _results;
        if (window.jQuery != null) {
          el = jQuery(el);
          if ((value != null ? value.toString() : void 0) !== ((_ref = el.val()) != null ? _ref.toString() : void 0)) {
            return el.val(value != null ? value : '');
          }
        } else {
          if (el.type === 'select-multiple') {
            if (value != null) {
              _results = [];
              for (_i = 0, _len = el.length; _i < _len; _i++) {
                o = el[_i];
                _results.push(o.selected = (_ref1 = o.value, __indexOf.call(value, _ref1) >= 0));
              }
              return _results;
            }
          } else if ((value != null ? value.toString() : void 0) !== ((_ref2 = el.value) != null ? _ref2.toString() : void 0)) {
            return el.value = value != null ? value : '';
          }
        }
      }
    },
    text: function(el, value) {
      if (el.innerText != null) {
        return el.innerText = value != null ? value : '';
      } else {
        return el.textContent = value != null ? value : '';
      }
    },
    "if": {
      block: true,
      bind: function(el) {
        var attr, declaration;
        if (this.marker == null) {
          attr = ['data', this.view.config.prefix, this.type].join('-').replace('--', '-');
          declaration = el.getAttribute(attr);
          this.marker = document.createComment(" rivets: " + this.type + " " + declaration + " ");
          el.removeAttribute(attr);
          el.parentNode.insertBefore(this.marker, el);
          return el.parentNode.removeChild(el);
        }
      },
      unbind: function() {
        var _ref;
        return (_ref = this.nested) != null ? _ref.unbind() : void 0;
      },
      routine: function(el, value) {
        var key, model, models, options, _ref;
        if (!!value === (this.nested == null)) {
          if (value) {
            models = {};
            _ref = this.view.models;
            for (key in _ref) {
              model = _ref[key];
              models[key] = model;
            }
            options = {
              binders: this.view.options.binders,
              formatters: this.view.options.formatters,
              config: this.view.options.config
            };
            (this.nested = new Rivets.View(el, models, options)).bind();
            return this.marker.parentNode.insertBefore(el, this.marker.nextSibling);
          } else {
            el.parentNode.removeChild(el);
            this.nested.unbind();
            return delete this.nested;
          }
        }
      },
      update: function(models) {
        var _ref;
        return (_ref = this.nested) != null ? _ref.update(models) : void 0;
      }
    },
    unless: {
      block: true,
      bind: function(el) {
        return Rivets.binders["if"].bind.call(this, el);
      },
      unbind: function() {
        return Rivets.binders["if"].unbind.call(this);
      },
      routine: function(el, value) {
        return Rivets.binders["if"].routine.call(this, el, !value);
      },
      update: function(models) {
        return Rivets.binders["if"].update.call(this, models);
      }
    },
    "on-*": {
      "function": true,
      unbind: function(el) {
        if (this.handler) {
          return Rivets.Util.unbindEvent(el, this.args[0], this.handler);
        }
      },
      routine: function(el, value) {
        if (this.handler) {
          Rivets.Util.unbindEvent(el, this.args[0], this.handler);
        }
        return Rivets.Util.bindEvent(el, this.args[0], this.handler = this.eventHandler(value));
      }
    },
    "each-*": {
      block: true,
      bind: function(el) {
        var attr;
        if (this.marker == null) {
          attr = ['data', this.view.config.prefix, this.type].join('-').replace('--', '-');
          this.marker = document.createComment(" rivets: " + this.type + " ");
          this.iterated = [];
          el.removeAttribute(attr);
          el.parentNode.insertBefore(this.marker, el);
          return el.parentNode.removeChild(el);
        }
      },
      unbind: function(el) {
        var view, _i, _len, _ref, _results;
        if (this.iterated != null) {
          _ref = this.iterated;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            view = _ref[_i];
            _results.push(view.unbind());
          }
          return _results;
        }
      },
      routine: function(el, collection) {
        var data, i, index, k, key, model, modelName, options, previous, template, v, view, _i, _j, _len, _len1, _ref, _ref1, _ref2, _results;
        modelName = this.args[0];
        collection = collection || [];
        if (this.iterated.length > collection.length) {
          _ref = Array(this.iterated.length - collection.length);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            view = this.iterated.pop();
            view.unbind();
            this.marker.parentNode.removeChild(view.els[0]);
          }
        }
        _results = [];
        for (index = _j = 0, _len1 = collection.length; _j < _len1; index = ++_j) {
          model = collection[index];
          data = {};
          data[modelName] = model;
          if (this.iterated[index] == null) {
            _ref1 = this.view.models;
            for (key in _ref1) {
              model = _ref1[key];
              if (data[key] == null) {
                data[key] = model;
              }
            }
            previous = this.iterated.length ? this.iterated[this.iterated.length - 1].els[0] : this.marker;
            options = {
              binders: this.view.options.binders,
              formatters: this.view.options.formatters,
              config: {}
            };
            _ref2 = this.view.options.config;
            for (k in _ref2) {
              v = _ref2[k];
              options.config[k] = v;
            }
            options.config.preloadData = true;
            template = el.cloneNode(true);
            view = new Rivets.View(template, data, options);
            view.bind();
            this.iterated.push(view);
            _results.push(this.marker.parentNode.insertBefore(template, previous.nextSibling));
          } else if (this.iterated[index].models[modelName] !== model) {
            _results.push(this.iterated[index].update(data));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      },
      update: function(models) {
        var data, key, model, view, _i, _len, _ref, _results;
        data = {};
        for (key in models) {
          model = models[key];
          if (key !== this.args[0]) {
            data[key] = model;
          }
        }
        _ref = this.iterated;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          view = _ref[_i];
          _results.push(view.update(data));
        }
        return _results;
      }
    },
    "class-*": function(el, value) {
      var elClass;
      elClass = " " + el.className + " ";
      if (!value === (elClass.indexOf(" " + this.args[0] + " ") !== -1)) {
        return el.className = value ? "" + el.className + " " + this.args[0] : elClass.replace(" " + this.args[0] + " ", ' ').trim();
      }
    },
    "*": function(el, value) {
      if (value) {
        return el.setAttribute(this.type, value);
      } else {
        return el.removeAttribute(this.type);
      }
    }
  };

  Rivets.components = {};

  Rivets.config = {
    preloadData: true,
    handler: function(context, ev, binding) {
      return this.call(context, ev, binding.view.models);
    }
  };

  Rivets.formatters = {};

  Rivets.factory = function(exports) {
    exports._ = Rivets;
    exports.binders = Rivets.binders;
    exports.components = Rivets.components;
    exports.formatters = Rivets.formatters;
    exports.config = Rivets.config;
    exports.configure = function(options) {
      var property, value;
      if (options == null) {
        options = {};
      }
      for (property in options) {
        value = options[property];
        Rivets.config[property] = value;
      }
    };
    return exports.bind = function(el, models, options) {
      var view;
      if (models == null) {
        models = {};
      }
      if (options == null) {
        options = {};
      }
      view = new Rivets.View(el, models, options);
      view.bind();
      return view;
    };
  };

  if (typeof exports === 'object') {
    Rivets.factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      Rivets.factory(this.rivets = exports);
      return exports;
    });
  } else {
    Rivets.factory(this.rivets = {});
  }

}).call(this);

});

require.register("component~emitter@1.0.0", function (exports, module) {

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});

require.register("component~indexof@0.0.1", function (exports, module) {

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});

require.register("component~event@0.1.0", function (exports, module) {

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});

require.register("component~event@0.1.3", function (exports, module) {
var bind = window.addEventListener ? 'addEventListener' : 'attachEvent',
    unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent',
    prefix = bind !== 'addEventListener' ? 'on' : '';

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  el[bind](prefix + type, fn, capture || false);
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  el[unbind](prefix + type, fn, capture || false);
  return fn;
};
});

require.register("component~query@0.0.1", function (exports, module) {

function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
};

});

require.register("component~query@0.0.3", function (exports, module) {
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

});

require.register("component~matches-selector@0.1.2", function (exports, module) {
/**
 * Module dependencies.
 */

var query = require("component~query@0.0.3");

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});

require.register("component~delegate@0.1.0", function (exports, module) {

/**
 * Module dependencies.
 */

var matches = require("component~matches-selector@0.1.2")
  , event = require("component~event@0.1.3");

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    if (matches(e.target, selector)) fn(e);
  }, capture);
  return callback;
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});

require.register("component~domify@1.0.0", function (exports, module) {

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  var els = el.children;
  if (1 == els.length) {
    return el.removeChild(els[0]);
  }

  var fragment = document.createDocumentFragment();
  while (els.length) {
    fragment.appendChild(el.removeChild(els[0]));
  }

  return fragment;
}

});

require.register("component~domify@1.2.2", function (exports, module) {

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');
  
  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return document.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = document.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

});

require.register("component~classes@1.1.2", function (exports, module) {

/**
 * Module dependencies.
 */

var index = require("component~indexof@0.0.1");

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }
  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});

require.register("component~classes@1.2.1", function (exports, module) {
/**
 * Module dependencies.
 */

var index = require("component~indexof@0.0.1");

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el) throw new Error('A DOM element reference is required');
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`, can force state via `force`.
 *
 * For browsers that support classList, but do not support `force` yet,
 * the mistake will be detected and corrected.
 *
 * @param {String} name
 * @param {Boolean} force
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name, force){
  // classList
  if (this.list) {
    if ("undefined" !== typeof force) {
      if (force !== this.list.toggle(name, force)) {
        this.list.toggle(name); // toggle again to correct
      }
    } else {
      this.list.toggle(name);
    }
    return this;
  }

  // fallback
  if ("undefined" !== typeof force) {
    if (!force) {
      this.remove(name);
    } else {
      this.add(name);
    }
  } else {
    if (this.has(name)) {
      this.remove(name);
    } else {
      this.add(name);
    }
  }

  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});

require.register("component~css@0.0.2", function (exports, module) {

/**
 * Properties to ignore appending "px".
 */

var ignore = {
  columnCount: true,
  fillOpacity: true,
  fontWeight: true,
  lineHeight: true,
  opacity: true,
  orphans: true,
  widows: true,
  zIndex: true,
  zoom: true
};

/**
 * Set `el` css values.
 *
 * @param {Element} el
 * @param {Object} obj
 * @return {Element}
 * @api public
 */

module.exports = function(el, obj){
  for (var key in obj) {
    var val = obj[key];
    if ('number' == typeof val && !ignore[key]) val += 'px';
    el.style[key] = val;
  }
  return el;
};

});

require.register("component~sort@0.0.3", function (exports, module) {

/**
 * Expose `sort`.
 */

exports = module.exports = sort;

/**
 * Sort `el`'s children with the given `fn(a, b)`.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

function sort(el, fn) {
  var arr = [].slice.call(el.children).sort(fn);
  var frag = document.createDocumentFragment();
  for (var i = 0; i < arr.length; i++) {
    frag.appendChild(arr[i]);
  }
  el.appendChild(frag);
};

/**
 * Sort descending.
 *
 * @param {Element} el
 * @param {Function} fn
 * @api public
 */

exports.desc = function(el, fn){
  sort(el, function(a, b){
    return ~fn(a, b) + 1;
  });
};

/**
 * Sort ascending.
 */

exports.asc = sort;

});

require.register("component~value@1.1.0", function (exports, module) {

/**
 * Module dependencies.
 */

var typeOf = require("component~type@1.0.0");

/**
 * Set or get `el`'s' value.
 *
 * @param {Element} el
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

module.exports = function(el, val){
  if (2 == arguments.length) return set(el, val);
  return get(el);
};

/**
 * Get `el`'s value.
 */

function get(el) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (el.checked) {
        var attr = el.getAttribute('value');
        return null == attr ? true : attr;
      } else {
        return false;
      }
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        if (radio.checked) return radio.value;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        if (option.selected) return option.value;
      }
      break;
    default:
      return el.value;
  }
}

/**
 * Set `el`'s value.
 */

function set(el, val) {
  switch (type(el)) {
    case 'checkbox':
    case 'radio':
      if (val) {
        el.checked = true;
      } else {
        el.checked = false;
      }
      break;
    case 'radiogroup':
      for (var i = 0, radio; radio = el[i]; i++) {
        radio.checked = radio.value === val;
      }
      break;
    case 'select':
      for (var i = 0, option; option = el.options[i]; i++) {
        option.selected = option.value === val;
      }
      break;
    default:
      el.value = val;
  }
}

/**
 * Element type.
 */

function type(el) {
  var group = 'array' == typeOf(el) || 'object' == typeOf(el);
  if (group) el = el[0];
  var name = el.nodeName.toLowerCase();
  var type = el.getAttribute('type');

  if (group && type && 'radio' == type.toLowerCase()) return 'radiogroup';
  if ('input' == name && type && 'checkbox' == type.toLowerCase()) return 'checkbox';
  if ('input' == name && type && 'radio' == type.toLowerCase()) return 'radio';
  if ('select' == name) return 'select';
  return name;
}

});

require.register("component~dom@0.7.1", function (exports, module) {
/**
 * Module dependencies.
 */

var delegate = require("component~delegate@0.1.0");
var classes = require("component~classes@1.1.2");
var indexof = require("component~indexof@0.0.1");
var domify = require("component~domify@1.0.0");
var events = require("component~event@0.1.0");
var value = require("component~value@1.1.0");
var query = require("component~query@0.0.1");
var type = require("component~type@1.0.0");
var css = require("component~css@0.0.2");

/**
 * Attributes supported.
 */

var attrs = [
  'id',
  'src',
  'rel',
  'cols',
  'rows',
  'name',
  'href',
  'title',
  'style',
  'width',
  'height',
  'tabindex',
  'placeholder'
];

/**
 * Expose `dom()`.
 */

exports = module.exports = dom;

/**
 * Expose supported attrs.
 */

exports.attrs = attrs;

/**
 * Return a dom `List` for the given
 * `html`, selector, or element.
 *
 * @param {String|Element|List}
 * @return {List}
 * @api public
 */

function dom(selector, context) {
  // array
  if (Array.isArray(selector)) {
    return new List(selector);
  }

  // List
  if (selector instanceof List) {
    return selector;
  }

  // node
  if (selector.nodeName) {
    return new List([selector]);
  }

  if ('string' != typeof selector) {
    throw new TypeError('invalid selector');
  }

  // html
  if ('<' == selector.charAt(0)) {
    return new List([domify(selector)], selector);
  }

  // selector
  var ctx = context
    ? (context.els ? context.els[0] : context)
    : document;

  return new List(query.all(selector, ctx), selector);
}

/**
 * Expose `List` constructor.
 */

exports.List = List;

/**
 * Initialize a new `List` with the
 * given array-ish of `els` and `selector`
 * string.
 *
 * @param {Mixed} els
 * @param {String} selector
 * @api private
 */

function List(els, selector) {
  this.els = els || [];
  this.selector = selector;
}

/**
 * Enumerable iterator.
 */

List.prototype.__iterate__ = function(){
  var self = this;
  return {
    length: function(){ return self.els.length },
    get: function(i){ return new List([self.els[i]]) }
  }
};

/**
 * Remove elements from the DOM.
 *
 * @api public
 */

List.prototype.remove = function(){
  for (var i = 0; i < this.els.length; i++) {
    var el = this.els[i];
    var parent = el.parentNode;
    if (parent) parent.removeChild(el);
  }
};

/**
 * Set attribute `name` to `val`, or get attr `name`.
 *
 * @param {String} name
 * @param {String} [val]
 * @return {String|List} self
 * @api public
 */

List.prototype.attr = function(name, val){
  // get
  if (1 == arguments.length) {
    return this.els[0] && this.els[0].getAttribute(name);
  }

  // remove
  if (null == val) {
    return this.removeAttr(name);
  }

  // set
  return this.forEach(function(el){
    el.setAttribute(name, val);
  });
};

/**
 * Remove attribute `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

List.prototype.removeAttr = function(name){
  return this.forEach(function(el){
    el.removeAttribute(name);
  });
};

/**
 * Set property `name` to `val`, or get property `name`.
 *
 * @param {String} name
 * @param {String} [val]
 * @return {Object|List} self
 * @api public
 */

List.prototype.prop = function(name, val){
  if (1 == arguments.length) {
    return this.els[0] && this.els[0][name];
  }

  return this.forEach(function(el){
    el[name] = val;
  });
};

/**
 * Get the first element's value or set selected
 * element values to `val`.
 *
 * @param {Mixed} [val]
 * @return {Mixed}
 * @api public
 */

List.prototype.val =
List.prototype.value = function(val){
  if (0 == arguments.length) {
    return this.els[0]
      ? value(this.els[0])
      : undefined;
  }

  return this.forEach(function(el){
    value(el, val);
  });
};

/**
 * Return a cloned `List` with all elements cloned.
 *
 * @return {List}
 * @api public
 */

List.prototype.clone = function(){
  var arr = [];
  for (var i = 0, len = this.els.length; i < len; ++i) {
    arr.push(this.els[i].cloneNode(true));
  }
  return new List(arr);
};

/**
 * Prepend `val`.
 *
 * @param {String|Element|List} val
 * @return {List} new list
 * @api public
 */

List.prototype.prepend = function(val){
  var el = this.els[0];
  if (!el) return this;
  val = dom(val);
  for (var i = 0; i < val.els.length; ++i) {
    if (el.children.length) {
      el.insertBefore(val.els[i], el.firstChild);
    } else {
      el.appendChild(val.els[i]);
    }
  }
  return val;
};

/**
 * Append `val`.
 *
 * @param {String|Element|List} val
 * @return {List} new list
 * @api public
 */

List.prototype.append = function(val){
  var el = this.els[0];
  if (!el) return this;
  val = dom(val);
  for (var i = 0; i < val.els.length; ++i) {
    el.appendChild(val.els[i]);
  }
  return val;
};

/**
 * Append self's `el` to `val`
 *
 * @param {String|Element|List} val
 * @return {List} self
 * @api public
 */

List.prototype.appendTo = function(val){
  dom(val).append(this);
  return this;
};

/**
 * Return a `List` containing the element at `i`.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

List.prototype.at = function(i){
  return new List([this.els[i]], this.selector);
};

/**
 * Return a `List` containing the first element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

List.prototype.first = function(){
  return new List([this.els[0]], this.selector);
};

/**
 * Return a `List` containing the last element.
 *
 * @param {Number} i
 * @return {List}
 * @api public
 */

List.prototype.last = function(){
  return new List([this.els[this.els.length - 1]], this.selector);
};

/**
 * Return an `Element` at `i`.
 *
 * @param {Number} i
 * @return {Element}
 * @api public
 */

List.prototype.get = function(i){
  return this.els[i || 0];
};

/**
 * Return list length.
 *
 * @return {Number}
 * @api public
 */

List.prototype.length = function(){
  return this.els.length;
};

/**
 * Return element text.
 *
 * @param {String} str
 * @return {String|List}
 * @api public
 */

List.prototype.text = function(str){
  // TODO: real impl
  if (1 == arguments.length) {
    this.forEach(function(el){
      el.textContent = str;
    });
    return this;
  }

  var str = '';
  for (var i = 0; i < this.els.length; ++i) {
    str += this.els[i].textContent;
  }
  return str;
};

/**
 * Return element html.
 *
 * @return {String} html
 * @api public
 */

List.prototype.html = function(html){
  if (1 == arguments.length) {
    this.forEach(function(el){
      el.innerHTML = html;
    });
  }
  // TODO: real impl
  return this.els[0] && this.els[0].innerHTML;
};

/**
 * Bind to `event` and invoke `fn(e)`. When
 * a `selector` is given then events are delegated.
 *
 * @param {String} event
 * @param {String} [selector]
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {List}
 * @api public
 */

List.prototype.on = function(event, selector, fn, capture){
  if ('string' == typeof selector) {
    for (var i = 0; i < this.els.length; ++i) {
      fn._delegate = delegate.bind(this.els[i], selector, event, fn, capture);
    }
    return this;
  }

  capture = fn;
  fn = selector;

  for (var i = 0; i < this.els.length; ++i) {
    events.bind(this.els[i], event, fn, capture);
  }

  return this;
};

/**
 * Unbind to `event` and invoke `fn(e)`. When
 * a `selector` is given then delegated event
 * handlers are unbound.
 *
 * @param {String} event
 * @param {String} [selector]
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {List}
 * @api public
 */

List.prototype.off = function(event, selector, fn, capture){
  if ('string' == typeof selector) {
    for (var i = 0; i < this.els.length; ++i) {
      // TODO: add selector support back
      delegate.unbind(this.els[i], event, fn._delegate, capture);
    }
    return this;
  }

  capture = fn;
  fn = selector;

  for (var i = 0; i < this.els.length; ++i) {
    events.unbind(this.els[i], event, fn, capture);
  }
  return this;
};

/**
 * Iterate elements and invoke `fn(list, i)`.
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

List.prototype.each = function(fn){
  for (var i = 0; i < this.els.length; ++i) {
    fn(new List([this.els[i]], this.selector), i);
  }
  return this;
};

/**
 * Iterate elements and invoke `fn(el, i)`.
 *
 * @param {Function} fn
 * @return {List} self
 * @api public
 */

List.prototype.forEach = function(fn){
  for (var i = 0; i < this.els.length; ++i) {
    fn(this.els[i], i);
  }
  return this;
};

/**
 * Map elements invoking `fn(list, i)`.
 *
 * @param {Function} fn
 * @return {Array}
 * @api public
 */

List.prototype.map = function(fn){
  var arr = [];
  for (var i = 0; i < this.els.length; ++i) {
    arr.push(fn(new List([this.els[i]], this.selector), i));
  }
  return arr;
};

/**
 * Filter elements invoking `fn(list, i)`, returning
 * a new `List` of elements when a truthy value is returned.
 *
 * @param {Function} fn
 * @return {List}
 * @api public
 */

List.prototype.select =
List.prototype.filter = function(fn){
  var el;
  var list = new List([], this.selector);
  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    if (fn(new List([el], this.selector), i)) list.els.push(el);
  }
  return list;
};

/**
 * Filter elements invoking `fn(list, i)`, returning
 * a new `List` of elements when a falsey value is returned.
 *
 * @param {Function} fn
 * @return {List}
 * @api public
 */

List.prototype.reject = function(fn){
  var el;
  var list = new List([], this.selector);
  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    if (!fn(new List([el], this.selector), i)) list.els.push(el);
  }
  return list;
};

/**
 * Add the given class `name`.
 *
 * @param {String} name
 * @return {List} self
 * @api public
 */

List.prototype.addClass = function(name){
  var el;
  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    el._classes = el._classes || classes(el);
    el._classes.add(name);
  }
  return this;
};

/**
 * Remove the given class `name`.
 *
 * @param {String|RegExp} name
 * @return {List} self
 * @api public
 */

List.prototype.removeClass = function(name){
  var el;

  if ('regexp' == type(name)) {
    for (var i = 0; i < this.els.length; ++i) {
      el = this.els[i];
      el._classes = el._classes || classes(el);
      var arr = el._classes.array();
      for (var j = 0; j < arr.length; j++) {
        if (name.test(arr[j])) {
          el._classes.remove(arr[j]);
        }
      }
    }
    return this;
  }

  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    el._classes = el._classes || classes(el);
    el._classes.remove(name);
  }

  return this;
};

/**
 * Toggle the given class `name`,
 * optionally a `bool` may be given
 * to indicate that the class should
 * be added when truthy.
 *
 * @param {String} name
 * @param {Boolean} bool
 * @return {List} self
 * @api public
 */

List.prototype.toggleClass = function(name, bool){
  var el;
  var fn = 'toggle';

  // toggle with boolean
  if (2 == arguments.length) {
    fn = bool ? 'add' : 'remove';
  }

  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    el._classes = el._classes || classes(el);
    el._classes[fn](name);
  }

  return this;
};

/**
 * Check if the given class `name` is present.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

List.prototype.hasClass = function(name){
  var el;
  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    el._classes = el._classes || classes(el);
    if (el._classes.has(name)) return true;
  }
  return false;
};

/**
 * Set CSS `prop` to `val` or get `prop` value.
 * Also accepts an object (`prop`: `val`)
 *
 * @param {String} prop
 * @param {Mixed} val
 * @return {List|String}
 * @api public
 */

List.prototype.css = function(prop, val){
  if (2 == arguments.length) {
    var obj = {};
    obj[prop] = val;
    return this.setStyle(obj);
  }

  if ('object' == type(prop)) {
    return this.setStyle(prop);
  }

  return this.getStyle(prop);
};

/**
 * Set CSS `props`.
 *
 * @param {Object} props
 * @return {List} self
 * @api private
 */

List.prototype.setStyle = function(props){
  for (var i = 0; i < this.els.length; ++i) {
    css(this.els[i], props);
  }
  return this;
};

/**
 * Get CSS `prop` value.
 *
 * @param {String} prop
 * @return {String}
 * @api private
 */

List.prototype.getStyle = function(prop){
  var el = this.els[0];
  if (el) return el.style[prop];
};

/**
 * Find children matching the given `selector`.
 *
 * @param {String} selector
 * @return {List}
 * @api public
 */

List.prototype.find = function(selector){
  return dom(selector, this);
};

/**
 * Empty the dom list
 *
 * @return self
 * @api public
 */

List.prototype.empty = function(){
  var elem, el;

  for (var i = 0; i < this.els.length; ++i) {
    el = this.els[i];
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  return this;
}

/**
 * Attribute accessors.
 */

attrs.forEach(function(name){
  List.prototype[name] = function(val){
    if (0 == arguments.length) return this.attr(name);
    return this.attr(name, val);
  };
});


});

require.register("component~overlay@0.1.1", function (exports, module) {

/**
 * Module dependencies.
 */

var Emitter = require("component~emitter@1.0.0");
var tmpl = require("component~overlay@0.1.1/template.js");
var o = require("component~dom@0.7.1");

/**
 * Expose `overlay()`.
 */

exports = module.exports = overlay;

/**
 * Expose `Overlay`.
 */

exports.Overlay = Overlay;

/**
 * Return a new `Overlay` with the given `options`.
 *
 * @param {Object|Element} options
 * @return {Overlay}
 * @api public
 */

function overlay(options){
  options = options || {};

  // element
  if (options.nodeName) {
    options = { target: options };
  }

  return new Overlay(options);
};

/**
 * Initialize a new `Overlay`.
 *
 * @param {Object} options
 * @api public
 */

function Overlay(options) {
  Emitter.call(this);
  options = options || {};
  this.target = options.target || 'body';
  this.closable = options.closable;
  this.el = o(tmpl);
  this.el.appendTo(this.target);
  if (this.closable) this.el.on('click', this.hide.bind(this));
}

/**
 * Mixin emitter.
 */

Emitter(Overlay.prototype);

/**
 * Show the overlay.
 *
 * Emits "show" event.
 *
 * @return {Overlay}
 * @api public
 */

Overlay.prototype.show = function(){
  this.emit('show');
  this.el.removeClass('hide');
  return this;
};

/**
 * Hide the overlay.
 *
 * Emits "hide" event.
 *
 * @return {Overlay}
 * @api public
 */

Overlay.prototype.hide = function(){
  this.emit('hide');
  return this.remove();
};

/**
 * Hide the overlay without emitting "hide".
 *
 * Emits "close" event.
 *
 * @return {Overlay}
 * @api public
 */

Overlay.prototype.remove = function(){
  var self = this;
  this.emit('close');
  this.el.addClass('hide');
  setTimeout(function(){
    self.el.remove();
  }, 2000);
  return this;
};


});

require.register("component~overlay@0.1.1/template.js", function (exports, module) {
module.exports = '<div class="overlay hide"></div>\n';
});

require.register("component~dialog@0.2.0", function (exports, module) {

/**
 * Module dependencies.
 */

var Emitter = require("component~emitter@1.0.0")
  , overlay = require("component~overlay@0.1.1")
  , domify = require("component~domify@1.2.2")
  , events = require("component~event@0.1.3")
  , classes = require("component~classes@1.2.1")
  , query = require("component~query@0.0.3");

/**
 * Active dialog.
 */

var active;

/**
 * Expose `dialog()`.
 */

exports = module.exports = dialog;

/**
 * Expose `Dialog`.
 */

exports.Dialog = Dialog;

/**
 * Return a new `Dialog` with the given
 * (optional) `title` and `msg`.
 *
 * @param {String} title or msg
 * @param {String} msg
 * @return {Dialog}
 * @api public
 */

function dialog(title, msg){
  switch (arguments.length) {
    case 2:
      return new Dialog({ title: title, message: msg });
    case 1:
      return new Dialog({ message: title });
  }
};

/**
 * Initialize a new `Dialog`.
 *
 * Options:
 *
 *    - `title` dialog title
 *    - `message` a message to display
 *
 * Emits:
 *
 *    - `show` when visible
 *    - `hide` when hidden
 *
 * @param {Object} options
 * @api public
 */

function Dialog(options) {
  Emitter.call(this);
  options = options || {};
  this.template = require("component~dialog@0.2.0/template.html");
  this.el = domify(this.template);
  this._classes = classes(this.el);
  this.render(options);
  if (active && !active.hiding) active.hide();
  if (exports.effect) this.effect(exports.effect);
  this.on('escape', this.hide.bind(this));
  active = this;
};

/**
 * Inherit from `Emitter.prototype`.
 */

Dialog.prototype = new Emitter;

/**
 * Render with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

Dialog.prototype.render = function(options){
  var self = this
    , el = self.el
    , title = options.title
    , titleEl = query('.title', el)
    , pEl = query('p', el)
    , msg = options.message;

  events.bind(query('.close', el), 'click', function (ev) {
    ev.preventDefault();
    self.emit('close');
    self.hide();
  });

  if (titleEl) {
    if (!title) {
      titleEl.parentNode.removeChild(titleEl);
    } else {
      titleEl.textContent = title;
    }
  }

  // message
  if ('string' == typeof msg) {
    pEl.textContent = msg;
  } else if (msg) {
    pEl.parentNode.insertBefore(msg.el || msg, pEl);
    pEl.parentNode.removeChild(pEl);
  }
};

/**
 * Enable the dialog close link.
 *
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.closable = function(){
  return this.addClass('closable');
};

/**
 * Add class `name`.
 *
 * @param {String} name
 * @return {Dialog}
 * @api public
 */

Dialog.prototype.addClass = function(name){
  this._classes.add(name);
  return this;
};

/**
 * Set the effect to `type`.
 *
 * @param {String} type
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.effect = function(type){
  this._effect = type;
  this.addClass(type);
  return this;
};

/**
 * Make it modal!
 *
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.modal = function(){
  this._overlay = overlay();
  return this;
};

/**
 * Add an overlay.
 *
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.overlay = function(opts){
  var self = this;
  opts = opts || { closable: true };
  var o = overlay(opts);
  o.on('hide', function(){
    self._overlay = null;
    self.hide();
  });
  this._overlay = o;
  return this;
};

/**
 * Close the dialog when the escape key is pressed.
 *
 * @api public
 */

Dialog.prototype.escapable = function(){
  var self = this;
  // Save reference to remove listener later
  self._escKeyCallback = self._escKeyCallback || function (e) {
    e.which = e.which || e.keyCode;
    if (27 !== e.which) return;
    self.emit('escape');
  };
  events.bind(document, 'keydown', self._escKeyCallback);
  return this;
};

/**
 * Fixed dialogs position can be manipulated through CSS.
 *
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.fixed = function(){
  this._fixed = true;
  return this;
}

/**
 * Show the dialog.
 *
 * Emits "show" event.
 *
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.show = function(){
  var overlay = this._overlay;
  var self = this;

  // overlay
  if (overlay) {
    overlay.show();
    this._classes.add('modal');
  }

  // escape
  if (!overlay || overlay.closable) this.escapable();

  // position
  document.body.appendChild(this.el);
  if (!this._fixed) {
    setTimeout(function() {
      self.el.style.marginLeft = -(self.el.offsetWidth / 2) + 'px'
    }, 0);
  }
  this._classes.remove('hide');
  this.emit('show');
  return this;
};

/**
 * Hide the overlay.
 *
 * @api private
 */

Dialog.prototype.hideOverlay = function(){
  if (!this._overlay) return;
  this._overlay.remove();
  this._overlay = null;
};

/**
 * Hide the dialog with optional delay of `ms`,
 * otherwise the dialog is removed immediately.
 *
 * Emits "hide" event.
 *
 * @return {Number} ms
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.hide = function(ms){
  var self = this;

  if (self._escKeyCallback) {
    events.unbind(document, 'keydown', self._escKeyCallback);
  }

  // prevent thrashing - this isn't used
  self.hiding = true;

  // duration
  if (ms) {
    setTimeout(function(){
      self.hide();
    }, ms);
    return self;
  }

  // hide / remove
  self._classes.add('hide');
  if (self._effect) {
    setTimeout(function(){
      self.remove();
    }, 500);
  } else {
    self.remove();
  }

  // overlay
  self.hideOverlay();

  return self;
};
/**
 * Hide the dialog without potential animation.
 *
 * @return {Dialog} for chaining
 * @api public
 */

Dialog.prototype.remove = function(){
  if (this.el.parentNode) {
    this.emit('hide');
    this.el.parentNode.removeChild(this.el);
  }
  return this;
};

});

require.define("component~dialog@0.2.0/template.html", "<div id=\"dialog\" class=\"hide\">\n  <div class=\"content\">\n    <span class=\"title\">Title</span>\n    <a href=\"#\" class=\"close\">&times;<em>close</em></a>\n    <div class=\"body\">\n      <p>Message</p>\n    </div>\n  </div>\n</div>\n");

require.register("indefinido~observable@es6-modules", function (exports, module) {
module.exports = require("indefinido~observable@es6-modules/lib/observable.js");

});

require.register("indefinido~observable@es6-modules/lib/adapters/rivets.js", function (exports, module) {
var adapter;

adapter = {
  subscribe: function(record, attribute_path, callback) {
    if (record == null) {
      throw new TypeError('observable.adapters.rivets.subscribe: No record provided for subscription');
    }
    if (attribute_path) {
      return record.subscribe(attribute_path, callback);
    }
  },
  unsubscribe: function(record, attribute_path, callback) {
    if (record == null) {
      throw new TypeError('observable.adapters.rivets.unsubscribe: No record provided for subscription');
    }
    return record.unsubscribe(attribute_path, callback);
  },
  read: function(record, attribute_path) {
    if (record == null) {
      throw new TypeError('observable.adapters.rivets.read: No record provided for subscription');
    }
    if (attribute_path.indexOf('.') === -1) {
      return record[attribute_path];
    } else {
      return record.observation.observers[attribute_path].value_;
    }
  },
  publish: function(record, attribute_path, value) {
    if (record == null) {
      throw new TypeError('observable.adapters.rivets.publish: No record provided for subscription');
    }
    if (attribute_path.indexOf('.') === -1) {
      return record[attribute_path] = value;
    } else {
      return record.observation.observers[attribute_path].setValue(value);
    }
  }
};

module.exports = adapter;

});

require.register("indefinido~observable@es6-modules/lib/legacy/notifierable.js", function (exports, module) {
var jQuery = require("component~jquery@1.9.1");
var mutations, notifierable, subscribed_getter;

notifierable = {
  observe: function(object, keypath, callback) {
    return Object.defineProperty(object, keypath, {
      get: this.getter(object, keypath),
      set: this.setter(object, keypath, callback),
      enumerable: true
    });
  },
  storage_for: function(object) {
    var toJSON;

    toJSON = void 0;
    Object.defineProperty(object, "observed", {
      configurable: true,
      enumerable: false,
      value: {}
    });
    toJSON = object.json || object.toJSON;
    if (toJSON) {
      return Object.defineProperty(object, "toJSON", {
        enumerable: false,
        value: function() {
          var json;

          json = void 0;
          json = toJSON.apply(this, arguments);
          return observable.unobserve(_.omit(json, observable.ignores, ["toJSON", "observed"]));
        }
      });
    }
  },
  setter: function(object, keypath, callback) {
    var current, old_setter, setter, thread;

    setter = lookup.setter.call(object, keypath);
    this.observed[keypath] = lookup.getter.call(object, keypath) && lookup.getter.call(object, keypath)() || object[keypath];
    if (!setter) {
      setter = function(value) {
        return check.call(object, keypath, value) !== false && setter.callback_thread.call(object, value);
      };
    } else if (!setter.callback_thread) {
      old_setter = setter;
      setter = function(value) {
        return check.call(object, keypath, value) !== false && setter.callback_thread.call(object, value);
      };
      setter.callback_thread = old_setter;
    }
    current = setter.callback_thread || $.noop;
    setter.callback_thread = thread = function(value) {
      return current.call(object, value) !== false && callback.call(object, value);
    };
    if (requiresDomElement) {
      this.observed[keypath + "_setter"] = setter;
    }
    return setter;
  },
  getter: subscribed_getter = function(object, keypath) {
    var getter, root_getter;

    getter = lookup.getter.call(object, keypath) || (root_getter = function() {
      return object.observed[keypath];
    });
    if (requiresDomElement) {
      this.observed[keypath + "_getter"] = getter;
    }
    return getter;
  },
  mutations: function(keypath) {
    var array, setter;

    setter = lookup.setter.call(this, keypath);
    array = this[keypath];
    if (!setter) {
      this.observe.call(this, keypath, function(new_array) {
        var i, j, type;

        i = void 0;
        type = void 0;
        j = void 0;
        if ($.type(new_array) !== "array") {
          return;
        }
        if (new_array.object === array.object && new_array.thread === array.thread) {
          return;
        }
        i = new_array.length;
        j = new_array.length;
        new_array.thread = array.thread;
        new_array.object = array.object;
        new_array.key = keypath;
        while (i--) {
          type = $.type(new_array[i]);
          if (!new_array[i].observed && (type === "object" || type === "array")) {
            new_array[i] = observable(new_array[i]);
          }
        }
        new_array.length = j;
        $.extend(new_array, mutations.overrides);
      });
      setter = lookup.setter.call(this, keypath);
    }
    array.thread = setter.callback_thread;
    array.object = this;
    array.key = keypath;
    $.extend(array, mutations.overrides);
    if (!this.observed.mutate) {
      this.observed.mutate = mutations.mutate;
    }
  }
};

mutations = {
  mutate: function(thread, method, array) {
    array.method = method;
    thread.call(this, array);
    this.publish(array.key, array);
    delete array.method;
  },
  overrides: {
    push: function() {
      var i, operation;

      i = arguments.length;
      operation = void 0;
      while (i--) {
        !arguments[i].observed && $.type(arguments[i]) === "object" && (arguments[i] = observable(arguments[i]));
      }
      operation = Array.prototype.push.apply(this, arguments);
      this.object.observed.mutate.call(this.object, this.thread, "push", this);
      return operation;
    }
  }
};

jQuery("pop shift unshift".split(" ")).each(function(i, method) {
  return mutations.overrides[method] = function() {
    Array.prototype[method].apply(this, arguments);
    return this.object.observed.mutate.call(this.object, this.thread, method, this);
  };
});

module.exports = notifierable;

});

require.register("indefinido~observable@es6-modules/lib/legacy/schedulerable.js", function (exports, module) {
var lookup = require("indefinido~observable@es6-modules/lib/lookup.js");
var jQuery = require("component~jquery@1.9.1");
var scheduler, schedulerable;

scheduler = function(options) {
  var name, timeout, value;

  if (options == null) {
    options = {};
  }
  timeout = null;
  for (name in options) {
    value = options[name];
    options[name] = {
      value: value
    };
  }
  jQuery.extend(options, {
    schedulable_keypaths: {
      value: []
    },
    schedule: {
      value: function() {
        var deliver,
          _this = this;

        deliver = function() {
          return _this.deliver();
        };
        clearTimeout(timeout);
        return timeout = setTimeout(deliver, 20 || options.wait);
      }
    }
  });
  return Object.create(scheduler.methods, options);
};

jQuery.extend(scheduler, {
  methods: {
    schedulable: function(object, keypath) {
      var observer, observers, value;

      if (this.schedulable_keypaths.indexOf(keypath) !== -1) {
        return;
      }
      this.schedulable_keypaths.push(keypath);
      observers = object.observation.observers;
      observer = observers[keypath];
      value = observer.path_.getValueFrom(object);
      Object.defineProperty(object, keypath, {
        get: this.getter(object, keypath),
        set: this.setter(object, keypath),
        enumerable: true,
        configurable: true
      });
      if (value !== observer.path_.getValueFrom(object)) {
        observer.setValue(value);
        return object.observation.deliver();
      }
    },
    deliver: function() {
      return this.target.observation.deliver();
    },
    setter: function(object, keypath, callback) {
      var current_setter;

      current_setter = lookup.setter.call(object, keypath);
      if (current_setter) {
        return function(value) {
          current_setter.call(this, value);
          this.observed[keypath] = value;
          this.observation.scheduler.schedule();
          return value;
        };
      } else {
        return function(value) {
          this.observed[keypath] = value;
          this.observation.scheduler.schedule();
          return value;
        };
      }
    },
    getter: function(object, keypath) {
      var root_getter;

      return lookup.getter.call(object, keypath) || (root_getter = function() {
        return this.observed[keypath];
      });
    },
    destroy: function() {
      return this.target = null;
    }
  }
});

schedulerable = function(observable) {
  schedulerable.storage_for(observable);
  schedulerable.schedulable_observers();
  return schedulerable.augment(observable);
};

schedulerable.storage_for = function(observable) {};

schedulerable.schedulable_observers = function() {
  var Path = require("indefinido~observable@es6-modules/vendor/observe-js/observe.js").Path;
  var original;

  original = Path.prototype.setValueFrom;
  return Path.prototype.setValueFrom = function(object) {
    var changed;

    changed = original.apply(this, arguments);
    if (changed) {
      return object.observation.scheduler.schedule();
    }
  };
};

schedulerable.augment = function(observable) {
  var original;

  original = observable.methods.subscribe;
  observable.methods.subscribe = function(keypath, callback) {
    original.apply(this, arguments);
    if (typeof keypath !== 'function') {
      return this.observation.scheduler.schedulable(this, keypath);
    }
  };
  return jQuery.extend((function() {
    var object;

    object = observable.apply(this, arguments);
    object.observation.scheduler = scheduler({
      target: object
    });
    return object;
  }), observable);
};

module.exports = schedulerable;

});

require.register("indefinido~observable@es6-modules/lib/lookup.js", function (exports, module) {
var lookup;

lookup = {
  setter: Object.prototype.__lookupSetter__ || function(property) {
    return this.observed && this.observed[property + "_setter"];
  },
  getter: Object.prototype.__lookupGetter__ || function(property) {
    var default_getter;

    default_getter = void 0;
    return this.observed && this.observed[property + "_getter"] || ((default_getter = $.proxy(lookup.default_getter, this, property)) && (default_getter.is_default = true) && default_getter);
  },
  types: {
    undefined: undefined,
    "null": null,
    "true": true,
    "false": false,
    NaN: NaN
  },
  basic_types: [undefined, null],
  default_getter: function(property) {
    var possible_value;

    possible_value = this[property];
    if (possible_value && possible_value.hasOwnProperty("toString")) {
      if (possible_value.toString.is_default) {
        return this.observed[property];
      }
      return possible_value.toString.call(this);
    } else if (possible_value in lookup.types) {
      return lookup.types[possible_value];
    } else {
      return possible_value;
    }
  }
};

module.exports = lookup;

});

require.register("indefinido~observable@es6-modules/lib/observable.js", function (exports, module) {
require("indefinido~observable@es6-modules/lib/platform.js");
var jQuery = require("component~jquery@1.9.1");
var observation = require("indefinido~observable@es6-modules/lib/observable/observation.js");
var selection = require("indefinido~observable@es6-modules/lib/observable/selection.js");
var KeypathObserver = require("indefinido~observable@es6-modules/lib/observable/keypath_observer.js");
var SelfObserver = require("indefinido~observable@es6-modules/lib/observable/self_observer.js");
var observable;

observable = function() {
  var object;

  object = observable.select.apply(this, arguments);
  if (object.observation) {
    return object;
  }
  return jQuery.extend(observable.observe(object), observable.methods);
};

jQuery.extend(observable, {
  select: selection(observable),
  observe: function(object) {
    Object.defineProperty(object, "observation", {
      configurable: true,
      enumerable: false,
      value: observation(object)
    });
    return Object.defineProperty(object, "observed", {
      configurable: true,
      enumerable: false,
      value: {}
    });
  },
  self: function(object) {
    var observer, observers;

    observers = object.observation.observers;
    return observer = observers.self || (observers.self = new SelfObserver(object));
  },
  keypath: function(object, keypath) {
    var observer, observers;

    observers = object.observation.observers;
    return observer = observers[keypath] || (observers[keypath] = new KeypathObserver(object, keypath));
  },
  unobserve: function(object) {
    var name;

    if (!object.observation) {
      return object;
    }
    for (name in observable.methods) {
      delete object[name];
    }
    object.observation.destroy();
    object.observation.scheduler.destroy();
    delete object.observation;
    delete object.observed;
    return object;
  },
  methods: {
    subscribe: function(keypath_or_callback, callback) {
      var observer;

      switch (arguments.length) {
        case 1:
          observer = observable.self(this);
          return this.observation.add('self', keypath_or_callback);
        case 2:
          observable.keypath(this, keypath_or_callback);
          return this.observation.add(keypath_or_callback, callback);
      }
    },
    unsubscribe: function(keypath, callback) {
      return this.observation[callback ? 'remove' : 'mute'](keypath, callback);
    },
    publish: function(keypath, value) {
      return this[keypath] = value;
    }
  },
  ignores: []
});

if (!Object.observe) {
  var schedulerable = require("indefinido~observable@es6-modules/lib/legacy/schedulerable.js");
  observable = schedulerable(observable);
}

observable.mixin = observable;

module.exports = observable;

});

require.register("indefinido~observable@es6-modules/lib/observable/keypath_observer.js", function (exports, module) {
var PathObserver = require("indefinido~observable@es6-modules/vendor/observe-js/observe.js").PathObserver;
var Callbacks = require("component~jquery@1.9.1").Callbacks;
var KeypathObserver,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KeypathObserver = (function(_super) {
  __extends(KeypathObserver, _super);

  function KeypathObserver(object, keypath) {
    _super.call(this, object, keypath);
    this.callbacks = Callbacks();
    this.open((function() {
      return this.fireWith(object, arguments);
    }), this.callbacks);
  }

  KeypathObserver.prototype.add = function(callback) {
    return this.callbacks.add(callback);
  };

  KeypathObserver.prototype.remove = function() {
    var _ref;

    return (_ref = this.callbacks).remove.apply(_ref, arguments);
  };

  KeypathObserver.prototype.close = function() {
    KeypathObserver.__super__.close.apply(this, arguments);
    this.callbacks.empty();
    return delete this.callbacks;
  };

  return KeypathObserver;

})(PathObserver);

module.exports = KeypathObserver;

});

require.register("indefinido~observable@es6-modules/lib/observable/observation.js", function (exports, module) {
var observation, observationable;

observation = {
  add: function(keypath, callback) {
    return this.observers[keypath].add(callback);
  },
  remove: function(keypath, callback) {
    return this.observers[keypath].remove(callback);
  },
  deliver: function() {
    var keypath, observer, _ref, _results;

    _ref = this.observers;
    _results = [];
    for (keypath in _ref) {
      observer = _ref[keypath];
      _results.push(observer.deliver());
    }
    return _results;
  },
  mute: function(keypath) {
    this.observers[keypath].close();
    return delete this.observers[keypath];
  },
  destroy: function(keypath) {
    var observer, _ref;

    _ref = this.observers;
    for (keypath in _ref) {
      observer = _ref[keypath];
      observer.close();
    }
    return delete this.observers;
  }
};

observationable = function(object) {
  return Object.create(observation, {
    observers: {
      value: {}
    }
  });
};

module.exports = observationable;

});

require.register("indefinido~observable@es6-modules/lib/observable/selection.js", function (exports, module) {
var jQuery = require("component~jquery@1.9.1");
var requiresDomElement, selection;

requiresDomElement = Object.defineProperty.requiresDomElement;

selection = function(observable) {
  if (requiresDomElement) {
    selection.generate_ignores(observable);
    return selection.legacy;
  } else {
    return selection.from_call;
  }
};

selection.legacy = function() {
  var fix, object;

  object = selection.from_call.apply(this, arguments);
  if (!jQuery.isReady) {
    throw new Error("observable.call: For compatibility reasons, observable can only be called when dom is loaded.");
  }
  if (typeof object.nodeName !== "string") {
    fix = document.createElement("fix");
    document.body.appendChild(fix);
    object = jQuery.extend(fix, object);
  }
  return object;
};

selection.generate_ignores = function(observable) {
  var fix_ignores, ignores, property;

  ignores = document.createElement("fix");
  fix_ignores = [];
  property = void 0;
  for (property in ignores) {
    fix_ignores.push(property);
  }
  return observable.ignores = fix_ignores;
};

selection.from_call = function(param) {
  var object;

  if (this === window) {
    object = param || {};
  } else if (this !== window) {
    if (param) {
      throw new TypeError("Two objects provided! Call either with observable.call(object) or observable(object), not with observable.call(param, param)");
    } else {
      object = this;
    }
  }
  return object;
};

module.exports = selection;

});

require.register("indefinido~observable@es6-modules/lib/observable/self_observer.js", function (exports, module) {
var ObjectObserver = require("indefinido~observable@es6-modules/vendor/observe-js/observe.js").ObjectObserver;
var Callbacks = require("component~jquery@1.9.1").Callbacks;
var SelfObserver,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SelfObserver = (function(_super) {
  __extends(SelfObserver, _super);

  function SelfObserver(object) {
    _super.call(this, object);
    this.callbacks = Callbacks();
    this.open((function() {
      return this.fireWith(object, arguments);
    }), this.callbacks);
  }

  SelfObserver.prototype.add = function(callback) {
    return this.callbacks.add(callback);
  };

  SelfObserver.prototype.remove = function() {
    var _ref;

    return (_ref = this.callbacks).remove.apply(_ref, arguments);
  };

  SelfObserver.prototype.close = function() {
    SelfObserver.__super__.close.apply(this, arguments);
    this.callbacks.empty();
    return delete this.callbacks;
  };

  return SelfObserver;

})(ObjectObserver);

module.exports = SelfObserver;

});

require.register("indefinido~observable@es6-modules/lib/platform.js", function (exports, module) {
if (!Object.prototype.create) {
  require("indefinido~observable@es6-modules/vendor/shims/object.create.js");
}

if (!Array.prototype.indexOf) {
  require("indefinido~observable@es6-modules/vendor/shims/array.indexOf.js");
}

if (typeof require !== "undefined") {
  require("indefinido~observable@es6-modules/vendor/shims/accessors-legacy.js");
  require("indefinido~observable@es6-modules/vendor/shims/accessors.js");
}

});

require.register("indefinido~observable@es6-modules/vendor/observe-js/observe.js", function (exports, module) {
// Copyright 2012 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function(global) {
  'use strict';

  // Detect and do basic sanity checking on Object/Array.observe.
  function detectObjectObserve() {
    if (typeof Object.observe !== 'function' ||
        typeof Array.observe !== 'function') {
      return false;
    }

    var records = [];

    function callback(recs) {
      records = recs;
    }

    var test = {};
    var arr = [];
    Object.observe(test, callback);
    Array.observe(arr, callback);
    test.id = 1;
    test.id = 2;
    delete test.id;
    arr.push(1, 2);
    arr.length = 0;

    Object.deliverChangeRecords(callback);
    if (records.length !== 5)
      return false;

    if (records[0].type != 'add' ||
        records[1].type != 'update' ||
        records[2].type != 'delete' ||
        records[3].type != 'splice' ||
        records[4].type != 'splice') {
      return false;
    }

    Object.unobserve(test, callback);
    Array.unobserve(arr, callback);

    return true;
  }

  var hasObserve = detectObjectObserve();

  function detectEval() {
    // Don't test for eval if we're running in a Chrome App environment.
    // We check for APIs set that only exist in a Chrome App context.
    if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
      return false;
    }

    try {
      var f = new Function('', 'return true;');
      return f();
    } catch (ex) {
      return false;
    }
  }

  var hasEval = detectEval();

  function isIndex(s) {
    return +s === s >>> 0;
  }

  function toNumber(s) {
    return +s;
  }

  function isObject(obj) {
    return obj === Object(obj);
  }

  var numberIsNaN = Number.isNaN || function isNaN(value) {
    return typeof value === 'number' && global.isNaN(value);
  }

  function areSameValue(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    if (numberIsNaN(left) && numberIsNaN(right))
      return true;

    return left !== left && right !== right;
  }

  var createObject = ('__proto__' in {}) ?
    function(obj) { return obj; } :
    function(obj) {
      var proto = obj.__proto__;
      if (!proto)
        return obj;
      var newObject = Object.create(proto);
      Object.getOwnPropertyNames(obj).forEach(function(name) {
        Object.defineProperty(newObject, name,
                             Object.getOwnPropertyDescriptor(obj, name));
      });
      return newObject;
    };

  var identStart = '[\$_a-zA-Z]';
  var identPart = '[\$_a-zA-Z0-9]';
  var ident = identStart + '+' + identPart + '*';
  var elementIndex = '(?:[0-9]|[1-9]+[0-9]+)';
  var identOrElementIndex = '(?:' + ident + '|' + elementIndex + ')';
  var path = '(?:' + identOrElementIndex + ')(?:\\s*\\.\\s*' + identOrElementIndex + ')*';
  var pathRegExp = new RegExp('^' + path + '$');

  function isPathValid(s) {
    if (typeof s != 'string')
      return false;
    s = s.trim();

    if (s == '')
      return true;

    if (s[0] == '.')
      return false;

    return pathRegExp.test(s);
  }

  var constructorIsPrivate = {};

  function Path(s, privateToken) {
    if (privateToken !== constructorIsPrivate)
      throw Error('Use Path.get to retrieve path objects');

    if (s.trim() == '')
      return this;

    if (isIndex(s)) {
      this.push(s);
      return this;
    }

    s.split(/\s*\.\s*/).filter(function(part) {
      return part;
    }).forEach(function(part) {
      this.push(part);
    }, this);

    if (hasEval && this.length) {
      this.getValueFrom = this.compiledGetValueFromFn();
    }
  }

  // TODO(rafaelw): Make simple LRU cache
  var pathCache = {};

  function getPath(pathString) {
    if (pathString instanceof Path)
      return pathString;

    if (pathString == null)
      pathString = '';

    if (typeof pathString !== 'string')
      pathString = String(pathString);

    var path = pathCache[pathString];
    if (path)
      return path;
    if (!isPathValid(pathString))
      return invalidPath;
    var path = new Path(pathString, constructorIsPrivate);
    pathCache[pathString] = path;
    return path;
  }

  Path.get = getPath;

  Path.prototype = createObject({
    __proto__: [],
    valid: true,

    toString: function() {
      return this.join('.');
    },

    getValueFrom: function(obj, directObserver) {
      for (var i = 0; i < this.length; i++) {
        if (obj == null)
          return;
        obj = obj[this[i]];
      }
      return obj;
    },

    iterateObjects: function(obj, observe) {
      for (var i = 0; i < this.length; i++) {
        if (i)
          obj = obj[this[i - 1]];
        if (!isObject(obj))
          return;
        observe(obj, this[0]);
      }
    },

    compiledGetValueFromFn: function() {
      var accessors = this.map(function(ident) {
        return isIndex(ident) ? '["' + ident + '"]' : '.' + ident;
      });

      var str = '';
      var pathString = 'obj';
      str += 'if (obj != null';
      var i = 0;
      for (; i < (this.length - 1); i++) {
        var ident = this[i];
        pathString += accessors[i];
        str += ' &&\n     ' + pathString + ' != null';
      }
      str += ')\n';

      pathString += accessors[i];

      str += '  return ' + pathString + ';\nelse\n  return undefined;';
      return new Function('obj', str);
    },

    setValueFrom: function(obj, value) {
      if (!this.length)
        return false;

      for (var i = 0; i < this.length - 1; i++) {
        if (!isObject(obj))
          return false;
        obj = obj[this[i]];
      }

      if (!isObject(obj))
        return false;

      obj[this[i]] = value;
      return true;
    }
  });

  var invalidPath = new Path('', constructorIsPrivate);
  invalidPath.valid = false;
  invalidPath.getValueFrom = invalidPath.setValueFrom = function() {};

  var MAX_DIRTY_CHECK_CYCLES = 1000;

  function dirtyCheck(observer) {
    var cycles = 0;
    while (cycles < MAX_DIRTY_CHECK_CYCLES && observer.check_()) {
      cycles++;
    }
    if (global.testingExposeCycleCount)
      global.dirtyCheckCycleCount = cycles;

    return cycles > 0;
  }

  function objectIsEmpty(object) {
    for (var prop in object)
      return false;
    return true;
  }

  function diffIsEmpty(diff) {
    return objectIsEmpty(diff.added) &&
           objectIsEmpty(diff.removed) &&
           objectIsEmpty(diff.changed);
  }

  function diffObjectFromOldObject(object, oldObject) {
    var added = {};
    var removed = {};
    var changed = {};

    for (var prop in oldObject) {
      var newValue = object[prop];

      if (newValue !== undefined && newValue === oldObject[prop])
        continue;

      if (!(prop in object)) {
        removed[prop] = undefined;
        continue;
      }

      if (newValue !== oldObject[prop])
        changed[prop] = newValue;
    }

    for (var prop in object) {
      if (prop in oldObject)
        continue;

      added[prop] = object[prop];
    }

    if (Array.isArray(object) && object.length !== oldObject.length)
      changed.length = object.length;

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  }

  var eomTasks = [];
  function runEOMTasks() {
    if (!eomTasks.length)
      return false;

    for (var i = 0; i < eomTasks.length; i++) {
      eomTasks[i]();
    }
    eomTasks.length = 0;
    return true;
  }

  var runEOM = hasObserve ? (function(){
    var eomObj = { pingPong: true };
    var eomRunScheduled = false;

    Object.observe(eomObj, function() {
      runEOMTasks();
      eomRunScheduled = false;
    });

    return function(fn) {
      eomTasks.push(fn);
      if (!eomRunScheduled) {
        eomRunScheduled = true;
        eomObj.pingPong = !eomObj.pingPong;
      }
    };
  })() :
  (function() {
    return function(fn) {
      eomTasks.push(fn);
    };
  })();

  var observedObjectCache = [];

  function newObservedObject() {
    var observer;
    var object;
    var discardRecords = false;
    var first = true;

    function callback(records) {
      if (observer && observer.state_ === OPENED && !discardRecords)
        observer.check_(records);
    }

    return {
      open: function(obs) {
        if (observer)
          throw Error('ObservedObject in use');

        if (!first)
          Object.deliverChangeRecords(callback);

        observer = obs;
        first = false;
      },
      observe: function(obj, arrayObserve) {
        object = obj;
        if (arrayObserve)
          Array.observe(object, callback);
        else
          Object.observe(object, callback);
      },
      deliver: function(discard) {
        discardRecords = discard;
        Object.deliverChangeRecords(callback);
        discardRecords = false;
      },
      close: function() {
        observer = undefined;
        Object.unobserve(object, callback);
        observedObjectCache.push(this);
      }
    };
  }

  /*
   * The observedSet abstraction is a perf optimization which reduces the total
   * number of Object.observe observations of a set of objects. The idea is that
   * groups of Observers will have some object dependencies in common and this
   * observed set ensures that each object in the transitive closure of
   * dependencies is only observed once. The observedSet acts as a write barrier
   * such that whenever any change comes through, all Observers are checked for
   * changed values.
   *
   * Note that this optimization is explicitly moving work from setup-time to
   * change-time.
   *
   * TODO(rafaelw): Implement "garbage collection". In order to move work off
   * the critical path, when Observers are closed, their observed objects are
   * not Object.unobserve(d). As a result, it's possible that if the observedSet
   * is kept open, but some Observers have been closed, it could cause "leaks"
   * (prevent otherwise collectable objects from being collected). At some
   * point, we should implement incremental "gc" which keeps a list of
   * observedSets which may need clean-up and does small amounts of cleanup on a
   * timeout until all is clean.
   */

  function getObservedObject(observer, object, arrayObserve) {
    var dir = observedObjectCache.pop() || newObservedObject();
    dir.open(observer);
    dir.observe(object, arrayObserve);
    return dir;
  }

  var observedSetCache = [];

  function newObservedSet() {
    var observerCount = 0;
    var observers = [];
    var objects = [];
    var rootObj;
    var rootObjProps;

    function observe(obj, prop) {
      if (!obj)
        return;

      if (obj === rootObj)
        rootObjProps[prop] = true;

      if (objects.indexOf(obj) < 0) {
        objects.push(obj);
        Object.observe(obj, callback);
      }

      observe(Object.getPrototypeOf(obj), prop);
    }

    function allRootObjNonObservedProps(recs) {
      for (var i = 0; i < recs.length; i++) {
        var rec = recs[i];
        if (rec.object !== rootObj ||
            rootObjProps[rec.name] ||
            rec.type === 'setPrototype') {
          return false;
        }
      }
      return true;
    }

    function callback(recs) {
      if (allRootObjNonObservedProps(recs))
        return;

      var observer;
      for (var i = 0; i < observers.length; i++) {
        observer = observers[i];
        if (observer.state_ == OPENED) {
          observer.iterateObjects_(observe);
        }
      }

      for (var i = 0; i < observers.length; i++) {
        observer = observers[i];
        if (observer.state_ == OPENED) {
          observer.check_();
        }
      }
    }

    var record = {
      object: undefined,
      objects: objects,
      open: function(obs, object) {
        if (!rootObj) {
          rootObj = object;
          rootObjProps = {};
        }

        observers.push(obs);
        observerCount++;
        obs.iterateObjects_(observe);
      },
      close: function(obs) {
        observerCount--;
        if (observerCount > 0) {
          return;
        }

        for (var i = 0; i < objects.length; i++) {
          Object.unobserve(objects[i], callback);
          Observer.unobservedCount++;
        }

        observers.length = 0;
        objects.length = 0;
        rootObj = undefined;
        rootObjProps = undefined;
        observedSetCache.push(this);
      }
    };

    return record;
  }

  var lastObservedSet;

  function getObservedSet(observer, obj) {
    if (!lastObservedSet || lastObservedSet.object !== obj) {
      lastObservedSet = observedSetCache.pop() || newObservedSet();
      lastObservedSet.object = obj;
    }
    lastObservedSet.open(observer, obj);
    return lastObservedSet;
  }

  var UNOPENED = 0;
  var OPENED = 1;
  var CLOSED = 2;
  var RESETTING = 3;

  var nextObserverId = 1;

  function Observer() {
    this.state_ = UNOPENED;
    this.callback_ = undefined;
    this.target_ = undefined; // TODO(rafaelw): Should be WeakRef
    this.directObserver_ = undefined;
    this.value_ = undefined;
    this.id_ = nextObserverId++;
  }

  Observer.prototype = {
    open: function(callback, target) {
      if (this.state_ != UNOPENED)
        throw Error('Observer has already been opened.');

      addToAll(this);
      this.callback_ = callback;
      this.target_ = target;
      this.connect_();
      this.state_ = OPENED;
      return this.value_;
    },

    close: function() {
      if (this.state_ != OPENED)
        return;

      removeFromAll(this);
      this.disconnect_();
      this.value_ = undefined;
      this.callback_ = undefined;
      this.target_ = undefined;
      this.state_ = CLOSED;
    },

    deliver: function() {
      if (this.state_ != OPENED)
        return;

      dirtyCheck(this);
    },

    report_: function(changes) {
      try {
        this.callback_.apply(this.target_, changes);
      } catch (ex) {
        Observer._errorThrownDuringCallback = true;
        console.error('Exception caught during observer callback: ' +
                       (ex.stack || ex));
      }
    },

    discardChanges: function() {
      this.check_(undefined, true);
      return this.value_;
    }
  }

  var collectObservers = !hasObserve;
  var allObservers;
  Observer._allObserversCount = 0;

  if (collectObservers) {
    allObservers = [];
  }

  function addToAll(observer) {
    Observer._allObserversCount++;
    if (!collectObservers)
      return;

    allObservers.push(observer);
  }

  function removeFromAll(observer) {
    Observer._allObserversCount--;
  }

  var runningMicrotaskCheckpoint = false;

  var hasDebugForceFullDelivery = hasObserve && (function() {
    try {
      eval('%RunMicrotasks()');
      return true;
    } catch (ex) {
      return false;
    }
  })();

  global.Platform = global.Platform || {};

  global.Platform.performMicrotaskCheckpoint = function() {
    if (runningMicrotaskCheckpoint)
      return;

    if (hasDebugForceFullDelivery) {
      eval('%RunMicrotasks()');
      return;
    }

    if (!collectObservers)
      return;

    runningMicrotaskCheckpoint = true;

    var cycles = 0;
    var anyChanged, toCheck;

    do {
      cycles++;
      toCheck = allObservers;
      allObservers = [];
      anyChanged = false;

      for (var i = 0; i < toCheck.length; i++) {
        var observer = toCheck[i];
        if (observer.state_ != OPENED)
          continue;

        if (observer.check_())
          anyChanged = true;

        allObservers.push(observer);
      }
      if (runEOMTasks())
        anyChanged = true;
    } while (cycles < MAX_DIRTY_CHECK_CYCLES && anyChanged);

    if (global.testingExposeCycleCount)
      global.dirtyCheckCycleCount = cycles;

    runningMicrotaskCheckpoint = false;
  };

  if (collectObservers) {
    global.Platform.clearObservers = function() {
      allObservers = [];
    };
  }

  function ObjectObserver(object) {
    Observer.call(this);
    this.value_ = object;
    this.oldObject_ = undefined;
  }

  ObjectObserver.prototype = createObject({
    __proto__: Observer.prototype,

    arrayObserve: false,

    connect_: function(callback, target) {
      if (hasObserve) {
        this.directObserver_ = getObservedObject(this, this.value_,
                                                 this.arrayObserve);
      } else {
        this.oldObject_ = this.copyObject(this.value_);
      }

    },

    copyObject: function(object) {
      var copy = Array.isArray(object) ? [] : {};
      for (var prop in object) {
        copy[prop] = object[prop];
      };
      if (Array.isArray(object))
        copy.length = object.length;
      return copy;
    },

    check_: function(changeRecords, skipChanges) {
      var diff;
      var oldValues;
      if (hasObserve) {
        if (!changeRecords)
          return false;

        oldValues = {};
        diff = diffObjectFromChangeRecords(this.value_, changeRecords,
                                           oldValues);
      } else {
        oldValues = this.oldObject_;
        diff = diffObjectFromOldObject(this.value_, this.oldObject_);
      }

      if (diffIsEmpty(diff))
        return false;

      if (!hasObserve)
        this.oldObject_ = this.copyObject(this.value_);

      this.report_([
        diff.added || {},
        diff.removed || {},
        diff.changed || {},
        function(property) {
          return oldValues[property];
        }
      ]);

      return true;
    },

    disconnect_: function() {
      if (hasObserve) {
        this.directObserver_.close();
        this.directObserver_ = undefined;
      } else {
        this.oldObject_ = undefined;
      }
    },

    deliver: function() {
      if (this.state_ != OPENED)
        return;

      if (hasObserve)
        this.directObserver_.deliver(false);
      else
        dirtyCheck(this);
    },

    discardChanges: function() {
      if (this.directObserver_)
        this.directObserver_.deliver(true);
      else
        this.oldObject_ = this.copyObject(this.value_);

      return this.value_;
    }
  });

  function ArrayObserver(array) {
    if (!Array.isArray(array))
      throw Error('Provided object is not an Array');
    ObjectObserver.call(this, array);
  }

  ArrayObserver.prototype = createObject({

    __proto__: ObjectObserver.prototype,

    arrayObserve: true,

    copyObject: function(arr) {
      return arr.slice();
    },

    check_: function(changeRecords) {
      var splices;
      if (hasObserve) {
        if (!changeRecords)
          return false;
        splices = projectArraySplices(this.value_, changeRecords);
      } else {
        splices = calcSplices(this.value_, 0, this.value_.length,
                              this.oldObject_, 0, this.oldObject_.length);
      }

      if (!splices || !splices.length)
        return false;

      if (!hasObserve)
        this.oldObject_ = this.copyObject(this.value_);

      this.report_([splices]);
      return true;
    }
  });

  ArrayObserver.applySplices = function(previous, current, splices) {
    splices.forEach(function(splice) {
      var spliceArgs = [splice.index, splice.removed.length];
      var addIndex = splice.index;
      while (addIndex < splice.index + splice.addedCount) {
        spliceArgs.push(current[addIndex]);
        addIndex++;
      }

      Array.prototype.splice.apply(previous, spliceArgs);
    });
  };

  function PathObserver(object, path) {
    Observer.call(this);

    this.object_ = object;
    this.path_ = getPath(path);
    this.directObserver_ = undefined;
  }

  PathObserver.prototype = createObject({
    __proto__: Observer.prototype,

    connect_: function() {
      if (hasObserve)
        this.directObserver_ = getObservedSet(this, this.object_);

      this.check_(undefined, true);
    },

    disconnect_: function() {
      this.value_ = undefined;

      if (this.directObserver_) {
        this.directObserver_.close(this);
        this.directObserver_ = undefined;
      }
    },

    iterateObjects_: function(observe) {
      this.path_.iterateObjects(this.object_, observe);
    },

    check_: function(changeRecords, skipChanges) {
      var oldValue = this.value_;
      this.value_ = this.path_.getValueFrom(this.object_);
      if (skipChanges || areSameValue(this.value_, oldValue))
        return false;

      this.report_([this.value_, oldValue]);
      return true;
    },

    setValue: function(newValue) {
      if (this.path_)
        this.path_.setValueFrom(this.object_, newValue);
    }
  });

  function CompoundObserver(reportChangesOnOpen) {
    Observer.call(this);

    this.reportChangesOnOpen_ = reportChangesOnOpen;
    this.value_ = [];
    this.directObserver_ = undefined;
    this.observed_ = [];
  }

  var observerSentinel = {};

  CompoundObserver.prototype = createObject({
    __proto__: Observer.prototype,

    connect_: function() {
      if (hasObserve) {
        var object;
        var needsDirectObserver = false;
        for (var i = 0; i < this.observed_.length; i += 2) {
          object = this.observed_[i]
          if (object !== observerSentinel) {
            needsDirectObserver = true;
            break;
          }
        }

        if (needsDirectObserver)
          this.directObserver_ = getObservedSet(this, object);
      }

      this.check_(undefined, !this.reportChangesOnOpen_);
    },

    disconnect_: function() {
      for (var i = 0; i < this.observed_.length; i += 2) {
        if (this.observed_[i] === observerSentinel)
          this.observed_[i + 1].close();
      }
      this.observed_.length = 0;
      this.value_.length = 0;

      if (this.directObserver_) {
        this.directObserver_.close(this);
        this.directObserver_ = undefined;
      }
    },

    addPath: function(object, path) {
      if (this.state_ != UNOPENED && this.state_ != RESETTING)
        throw Error('Cannot add paths once started.');

      var path = getPath(path);
      this.observed_.push(object, path);
      if (!this.reportChangesOnOpen_)
        return;
      var index = this.observed_.length / 2 - 1;
      this.value_[index] = path.getValueFrom(object);
    },

    addObserver: function(observer) {
      if (this.state_ != UNOPENED && this.state_ != RESETTING)
        throw Error('Cannot add observers once started.');

      this.observed_.push(observerSentinel, observer);
      if (!this.reportChangesOnOpen_)
        return;
      var index = this.observed_.length / 2 - 1;
      this.value_[index] = observer.open(this.deliver, this);
    },

    startReset: function() {
      if (this.state_ != OPENED)
        throw Error('Can only reset while open');

      this.state_ = RESETTING;
      this.disconnect_();
    },

    finishReset: function() {
      if (this.state_ != RESETTING)
        throw Error('Can only finishReset after startReset');
      this.state_ = OPENED;
      this.connect_();

      return this.value_;
    },

    iterateObjects_: function(observe) {
      var object;
      for (var i = 0; i < this.observed_.length; i += 2) {
        object = this.observed_[i]
        if (object !== observerSentinel)
          this.observed_[i + 1].iterateObjects(object, observe)
      }
    },

    check_: function(changeRecords, skipChanges) {
      var oldValues;
      for (var i = 0; i < this.observed_.length; i += 2) {
        var object = this.observed_[i];
        var path = this.observed_[i+1];
        var value;
        if (object === observerSentinel) {
          var observable = path;
          value = this.state_ === UNOPENED ?
              observable.open(this.deliver, this) :
              observable.discardChanges();
        } else {
          value = path.getValueFrom(object);
        }

        if (skipChanges) {
          this.value_[i / 2] = value;
          continue;
        }

        if (areSameValue(value, this.value_[i / 2]))
          continue;

        oldValues = oldValues || [];
        oldValues[i / 2] = this.value_[i / 2];
        this.value_[i / 2] = value;
      }

      if (!oldValues)
        return false;

      // TODO(rafaelw): Having observed_ as the third callback arg here is
      // pretty lame API. Fix.
      this.report_([this.value_, oldValues, this.observed_]);
      return true;
    }
  });

  function identFn(value) { return value; }

  function ObserverTransform(observable, getValueFn, setValueFn,
                             dontPassThroughSet) {
    this.callback_ = undefined;
    this.target_ = undefined;
    this.value_ = undefined;
    this.observable_ = observable;
    this.getValueFn_ = getValueFn || identFn;
    this.setValueFn_ = setValueFn || identFn;
    // TODO(rafaelw): This is a temporary hack. PolymerExpressions needs this
    // at the moment because of a bug in it's dependency tracking.
    this.dontPassThroughSet_ = dontPassThroughSet;
  }

  ObserverTransform.prototype = {
    open: function(callback, target) {
      this.callback_ = callback;
      this.target_ = target;
      this.value_ =
          this.getValueFn_(this.observable_.open(this.observedCallback_, this));
      return this.value_;
    },

    observedCallback_: function(value) {
      value = this.getValueFn_(value);
      if (areSameValue(value, this.value_))
        return;
      var oldValue = this.value_;
      this.value_ = value;
      this.callback_.call(this.target_, this.value_, oldValue);
    },

    discardChanges: function() {
      this.value_ = this.getValueFn_(this.observable_.discardChanges());
      return this.value_;
    },

    deliver: function() {
      return this.observable_.deliver();
    },

    setValue: function(value) {
      value = this.setValueFn_(value);
      if (!this.dontPassThroughSet_ && this.observable_.setValue)
        return this.observable_.setValue(value);
    },

    close: function() {
      if (this.observable_)
        this.observable_.close();
      this.callback_ = undefined;
      this.target_ = undefined;
      this.observable_ = undefined;
      this.value_ = undefined;
      this.getValueFn_ = undefined;
      this.setValueFn_ = undefined;
    }
  }

  var expectedRecordTypes = {
    add: true,
    update: true,
    delete: true
  };

 var updateRecord = {
    object: undefined,
    type: 'update',
    name: undefined,
    oldValue: undefined
  };

  function notify(object, name, value, oldValue) {
    if (areSameValue(value, oldValue))
      return;

    // TODO(rafaelw): Hack hack hack. This entire code really needs to move
    // out of observe-js into polymer.
    if (typeof object.propertyChanged_ == 'function')
      object.propertyChanged_(name, value, oldValue);

    if (!hasObserve)
      return;

    var notifier = object.notifier_;
    if (!notifier)
      notifier = object.notifier_ = Object.getNotifier(object);

    updateRecord.object = object;
    updateRecord.name = name;
    updateRecord.oldValue = oldValue;

    notifier.notify(updateRecord);
  }

  Observer.createBindablePrototypeAccessor = function(proto, name) {
    var privateName = name + '_';
    var privateObservable  = name + 'Observable_';

    proto[privateName] = proto[name];

    Object.defineProperty(proto, name, {
      get: function() {
        var observable = this[privateObservable];
        if (observable)
          observable.deliver();

        return this[privateName];
      },
      set: function(value) {
        var observable = this[privateObservable];
        if (observable) {
          observable.setValue(value);
          return;
        }

        var oldValue = this[privateName];
        this[privateName] = value;
        notify(this, name, value, oldValue);

        return value;
      },
      configurable: true
    });
  }

  Observer.bindToInstance = function(instance, name, observable, resolveFn) {
    var privateName = name + '_';
    var privateObservable  = name + 'Observable_';

    instance[privateObservable] = observable;
    var oldValue = instance[privateName];
    var value = observable.open(function(value, oldValue) {
      instance[privateName] = value;
      notify(instance, name, value, oldValue);
    });

    if (resolveFn && !areSameValue(oldValue, value)) {
      var resolvedValue = resolveFn(oldValue, value);
      if (!areSameValue(value, resolvedValue)) {
        value = resolvedValue;
        if (observable.setValue)
          observable.setValue(value);
      }
    }

    instance[privateName] = value;
    notify(instance, name, value, oldValue);

    return {
      close: function() {
        observable.close();
        instance[privateObservable] = undefined;
      }
    };
  }

  function diffObjectFromChangeRecords(object, changeRecords, oldValues) {
    var added = {};
    var removed = {};

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      if (!expectedRecordTypes[record.type]) {
        console.error('Unknown changeRecord type: ' + record.type);
        console.error(record);
        continue;
      }

      if (!(record.name in oldValues))
        oldValues[record.name] = record.oldValue;

      if (record.type == 'update')
        continue;

      if (record.type == 'add') {
        if (record.name in removed)
          delete removed[record.name];
        else
          added[record.name] = true;

        continue;
      }

      // type = 'delete'
      if (record.name in added) {
        delete added[record.name];
        delete oldValues[record.name];
      } else {
        removed[record.name] = true;
      }
    }

    for (var prop in added)
      added[prop] = object[prop];

    for (var prop in removed)
      removed[prop] = undefined;

    var changed = {};
    for (var prop in oldValues) {
      if (prop in added || prop in removed)
        continue;

      var newValue = object[prop];
      if (oldValues[prop] !== newValue)
        changed[prop] = newValue;
    }

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  }

  function newSplice(index, removed, addedCount) {
    return {
      index: index,
      removed: removed,
      addedCount: addedCount
    };
  }

  var EDIT_LEAVE = 0;
  var EDIT_UPDATE = 1;
  var EDIT_ADD = 2;
  var EDIT_DELETE = 3;

  function ArraySplice() {}

  ArraySplice.prototype = {

    // Note: This function is *based* on the computation of the Levenshtein
    // "edit" distance. The one change is that "updates" are treated as two
    // edits - not one. With Array splices, an update is really a delete
    // followed by an add. By retaining this, we optimize for "keeping" the
    // maximum array items in the original array. For example:
    //
    //   'xxxx123' -> '123yyyy'
    //
    // With 1-edit updates, the shortest path would be just to update all seven
    // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
    // leaves the substring '123' intact.
    calcEditDistances: function(current, currentStart, currentEnd,
                                old, oldStart, oldEnd) {
      // "Deletion" columns
      var rowCount = oldEnd - oldStart + 1;
      var columnCount = currentEnd - currentStart + 1;
      var distances = new Array(rowCount);

      // "Addition" rows. Initialize null column.
      for (var i = 0; i < rowCount; i++) {
        distances[i] = new Array(columnCount);
        distances[i][0] = i;
      }

      // Initialize null row
      for (var j = 0; j < columnCount; j++)
        distances[0][j] = j;

      for (var i = 1; i < rowCount; i++) {
        for (var j = 1; j < columnCount; j++) {
          if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1]))
            distances[i][j] = distances[i - 1][j - 1];
          else {
            var north = distances[i - 1][j] + 1;
            var west = distances[i][j - 1] + 1;
            distances[i][j] = north < west ? north : west;
          }
        }
      }

      return distances;
    },

    // This starts at the final weight, and walks "backward" by finding
    // the minimum previous weight recursively until the origin of the weight
    // matrix.
    spliceOperationsFromEditDistances: function(distances) {
      var i = distances.length - 1;
      var j = distances[0].length - 1;
      var current = distances[i][j];
      var edits = [];
      while (i > 0 || j > 0) {
        if (i == 0) {
          edits.push(EDIT_ADD);
          j--;
          continue;
        }
        if (j == 0) {
          edits.push(EDIT_DELETE);
          i--;
          continue;
        }
        var northWest = distances[i - 1][j - 1];
        var west = distances[i - 1][j];
        var north = distances[i][j - 1];

        var min;
        if (west < north)
          min = west < northWest ? west : northWest;
        else
          min = north < northWest ? north : northWest;

        if (min == northWest) {
          if (northWest == current) {
            edits.push(EDIT_LEAVE);
          } else {
            edits.push(EDIT_UPDATE);
            current = northWest;
          }
          i--;
          j--;
        } else if (min == west) {
          edits.push(EDIT_DELETE);
          i--;
          current = west;
        } else {
          edits.push(EDIT_ADD);
          j--;
          current = north;
        }
      }

      edits.reverse();
      return edits;
    },

    /**
     * Splice Projection functions:
     *
     * A splice map is a representation of how a previous array of items
     * was transformed into a new array of items. Conceptually it is a list of
     * tuples of
     *
     *   <index, removed, addedCount>
     *
     * which are kept in ascending index order of. The tuple represents that at
     * the |index|, |removed| sequence of items were removed, and counting forward
     * from |index|, |addedCount| items were added.
     */

    /**
     * Lacking individual splice mutation information, the minimal set of
     * splices can be synthesized given the previous state and final state of an
     * array. The basic approach is to calculate the edit distance matrix and
     * choose the shortest path through it.
     *
     * Complexity: O(l * p)
     *   l: The length of the current array
     *   p: The length of the old array
     */
    calcSplices: function(current, currentStart, currentEnd,
                          old, oldStart, oldEnd) {
      var prefixCount = 0;
      var suffixCount = 0;

      var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
      if (currentStart == 0 && oldStart == 0)
        prefixCount = this.sharedPrefix(current, old, minLength);

      if (currentEnd == current.length && oldEnd == old.length)
        suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);

      currentStart += prefixCount;
      oldStart += prefixCount;
      currentEnd -= suffixCount;
      oldEnd -= suffixCount;

      if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
        return [];

      if (currentStart == currentEnd) {
        var splice = newSplice(currentStart, [], 0);
        while (oldStart < oldEnd)
          splice.removed.push(old[oldStart++]);

        return [ splice ];
      } else if (oldStart == oldEnd)
        return [ newSplice(currentStart, [], currentEnd - currentStart) ];

      var ops = this.spliceOperationsFromEditDistances(
          this.calcEditDistances(current, currentStart, currentEnd,
                                 old, oldStart, oldEnd));

      var splice = undefined;
      var splices = [];
      var index = currentStart;
      var oldIndex = oldStart;
      for (var i = 0; i < ops.length; i++) {
        switch(ops[i]) {
          case EDIT_LEAVE:
            if (splice) {
              splices.push(splice);
              splice = undefined;
            }

            index++;
            oldIndex++;
            break;
          case EDIT_UPDATE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
          case EDIT_ADD:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;
            break;
          case EDIT_DELETE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
        }
      }

      if (splice) {
        splices.push(splice);
      }
      return splices;
    },

    sharedPrefix: function(current, old, searchLength) {
      for (var i = 0; i < searchLength; i++)
        if (!this.equals(current[i], old[i]))
          return i;
      return searchLength;
    },

    sharedSuffix: function(current, old, searchLength) {
      var index1 = current.length;
      var index2 = old.length;
      var count = 0;
      while (count < searchLength && this.equals(current[--index1], old[--index2]))
        count++;

      return count;
    },

    calculateSplices: function(current, previous) {
      return this.calcSplices(current, 0, current.length, previous, 0,
                              previous.length);
    },

    equals: function(currentValue, previousValue) {
      return currentValue === previousValue;
    }
  };

  var arraySplice = new ArraySplice();

  function calcSplices(current, currentStart, currentEnd,
                       old, oldStart, oldEnd) {
    return arraySplice.calcSplices(current, currentStart, currentEnd,
                                   old, oldStart, oldEnd);
  }

  function intersect(start1, end1, start2, end2) {
    // Disjoint
    if (end1 < start2 || end2 < start1)
      return -1;

    // Adjacent
    if (end1 == start2 || end2 == start1)
      return 0;

    // Non-zero intersect, span1 first
    if (start1 < start2) {
      if (end1 < end2)
        return end1 - start2; // Overlap
      else
        return end2 - start2; // Contained
    } else {
      // Non-zero intersect, span2 first
      if (end2 < end1)
        return end2 - start1; // Overlap
      else
        return end1 - start1; // Contained
    }
  }

  function mergeSplice(splices, index, removed, addedCount) {

    var splice = newSplice(index, removed, addedCount);

    var inserted = false;
    var insertionOffset = 0;

    for (var i = 0; i < splices.length; i++) {
      var current = splices[i];
      current.index += insertionOffset;

      if (inserted)
        continue;

      var intersectCount = intersect(splice.index,
                                     splice.index + splice.removed.length,
                                     current.index,
                                     current.index + current.addedCount);

      if (intersectCount >= 0) {
        // Merge the two splices

        splices.splice(i, 1);
        i--;

        insertionOffset -= current.addedCount - current.removed.length;

        splice.addedCount += current.addedCount - intersectCount;
        var deleteCount = splice.removed.length +
                          current.removed.length - intersectCount;

        if (!splice.addedCount && !deleteCount) {
          // merged splice is a noop. discard.
          inserted = true;
        } else {
          var removed = current.removed;

          if (splice.index < current.index) {
            // some prefix of splice.removed is prepended to current.removed.
            var prepend = splice.removed.slice(0, current.index - splice.index);
            Array.prototype.push.apply(prepend, removed);
            removed = prepend;
          }

          if (splice.index + splice.removed.length > current.index + current.addedCount) {
            // some suffix of splice.removed is appended to current.removed.
            var append = splice.removed.slice(current.index + current.addedCount - splice.index);
            Array.prototype.push.apply(removed, append);
          }

          splice.removed = removed;
          if (current.index < splice.index) {
            splice.index = current.index;
          }
        }
      } else if (splice.index < current.index) {
        // Insert splice here.

        inserted = true;

        splices.splice(i, 0, splice);
        i++;

        var offset = splice.addedCount - splice.removed.length
        current.index += offset;
        insertionOffset += offset;
      }
    }

    if (!inserted)
      splices.push(splice);
  }

  function createInitialSplices(array, changeRecords) {
    var splices = [];

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      switch(record.type) {
        case 'splice':
          mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
          break;
        case 'add':
        case 'update':
        case 'delete':
          if (!isIndex(record.name))
            continue;
          var index = toNumber(record.name);
          if (index < 0)
            continue;
          mergeSplice(splices, index, [record.oldValue], 1);
          break;
        default:
          console.error('Unexpected record type: ' + JSON.stringify(record));
          break;
      }
    }

    return splices;
  }

  function projectArraySplices(array, changeRecords) {
    var splices = [];

    createInitialSplices(array, changeRecords).forEach(function(splice) {
      if (splice.addedCount == 1 && splice.removed.length == 1) {
        if (splice.removed[0] !== array[splice.index])
          splices.push(splice);

        return
      };

      splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount,
                                           splice.removed, 0, splice.removed.length));
    });

    return splices;
  }

  global.Observer = Observer;
  global.Observer.runEOM_ = runEOM;
  global.Observer.observerSentinel_ = observerSentinel; // for testing.
  global.Observer.hasObjectObserve = hasObserve;
  global.ArrayObserver = ArrayObserver;
  global.ArrayObserver.calculateSplices = function(current, previous) {
    return arraySplice.calculateSplices(current, previous);
  };

  global.ArraySplice = ArraySplice;
  global.ObjectObserver = ObjectObserver;
  global.PathObserver = PathObserver;
  global.CompoundObserver = CompoundObserver;
  global.Path = Path;
  global.ObserverTransform = ObserverTransform;
})(typeof global !== 'undefined' && global && typeof module !== 'undefined' && module ? exports || global : exports || this || window);

});

require.register("indefinido~observable@es6-modules/vendor/shims/accessors-legacy.js", function (exports, module) {
/*
 * Xccessors Legacy: Cross-browser legacy non-standard accessors
 * http://github.com/eligrey/Xccessors
 *
 * 2010-03-21
 *
 * By Elijah Grey, http://eligrey.com
 *
 * A shim that implements __defineGetter__, __defineSetter__, __lookupGetter__,
 * and __lookupSetter__
 * in browsers that have ECMAScript 5 accessor support but not the legacy methods.
 *
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
*/

/*global Element, Window, HTMLDocument */

/*jslint white: true, undef: true, nomen: true, eqeqeq: true, bitwise: true, regexp: true,
  strict: true, newcap: true, immed: true, maxlen: 90 */

/*! @source http://purl.eligrey.com/github/Xccessors/blob/master/xccessors-legacy.js*/

"use strict";

(function () {
    var
    defineProp = Object.defineProperty,
    getProp    = Object.getOwnPropertyDescriptor,

    // methods being implemented
    methods    = [
        "__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__"
    ],

    // objects to implement legacy methods onto their prototypes
    // Object.prototype[method] doesn't work on everything for IE
    extend     = [Object, String, Array, Function, Boolean, Number,
                 RegExp, Date, Error],
    len        = extend.length,
    proto      = "prototype",
    extendMethod = function (method, fun) {
        var i = len;
        if (!(method in {})) {
            while (i--) {
              defineProp(extend[i][proto], method, {value: fun, enumerable: false})
            }
        }
    };

    // IE8 Does not support enumerable key so we abort!
    // TODO Fix this without cluttering the prototype
    try {defineProp({}, 'domo', {value: true, enumerable: false})} catch (e) {return;}

    // IE7 Does not have Element, Window defined, so we check here
    if (typeof Element != 'undefined') extend.push(Element);
    if (typeof Window != 'undefined') extend.push(Window);

    // IE9 Does not have html document defined, so we check here
    if (typeof HTMLDocument != 'undefined') extend.push(HTMLDocument);


    if (defineProp) {
        extendMethod(methods[0], function (prop, fun) { // __defineGetter__
            defineProp(this, prop, { get: fun });
        });

        extendMethod(methods[1], function (prop, fun) { // __defineSetter__
            defineProp(this, prop, { set: fun });
        });
    }

    if (getProp && !defineProp.requiresDomElement) {
      extendMethod(methods[2], function (prop) { // __lookupGetter__
        var descriptor = getProp(this, prop);
        if (descriptor && descriptor.get) return descriptor.get;

         // look in prototype too
        descriptor = getProp(this.constructor[proto], prop);
        if (descriptor && descriptor.get) return descriptor.get;
      });

      extendMethod(methods[3], function (prop) { // __lookupSetter__
        var descriptor = getProp(this, prop);
        if (descriptor && descriptor.set) return descriptor.set;

        // look in prototype too
        descriptor = getProp(this.constructor[proto], prop);
        if (descriptor && descriptor.set) return descriptor.set;
      });
    }
}());

});

require.register("indefinido~observable@es6-modules/vendor/shims/accessors.js", function (exports, module) {
'use strict';

(function () {
  // Cache native objects for better performacy and easy to use
  // references
  var ObjectProto = Object.prototype,
  hasOwnProp = ObjectProto.hasOwnProperty,
  getProp    = Object.getOwnPropertyDescriptor,
  defineProp = Object.defineProperty,
  objectCreate = Object.create,
  toStrings = [],
  features = null,
  stack = [], detach,
  fixedOwnProperty,
   prototypeBase = [Object, String, Array, Function, Boolean, Number, RegExp, Date, Error];

  // IE7 Does not have Element and Window defined, so only add them if
  // they exists check here
  if (typeof Element != 'undefined') prototypeBase.push(Element);
  if (typeof Window  != 'undefined') prototypeBase.push(Window);

  features = {
    allowsNonEnumerableProperty: function () {
      var broken = false;
      try {
        defineProp({}, 'x', {})
      } catch(e) {
        broken = true;
      }

      return (!broken) && (!!defineProp);
    },
    supportsOnPropertyChangeEvent: function () {
      var test = document.createElement('domo');
      return 'onpropertychange' in test
    }
  }

  if (!features.allowsNonEnumerableProperty() && features.supportsOnPropertyChangeEvent()) {

    // Check if node is on document
    var inDocument = function inDocument (node) {
      var curr = node;
      while (curr != null) {
        curr = curr.parentNode;
        if (curr == document) return true;
      }
      return false;
    },

    // Generate property event handler for setting some property
    generate_setter = function generate_setter (object, property, descriptor) {
      var setter = function object_define_property_shim_change_listener (event) {
        var current_value, changed_value;
        if (
          // if we are setting this property
          event.propertyName == property

          // prevent firing setters again
          // by checking callstack
          && stack.indexOf(property) === -1
        ) {
          // Remove the event so it doesn't fire again and
          // create a loop
          object.detachEvent("onpropertychange", setter);

          // If detaching the current setter
          // just remove the event listener
          if (detach) return;

          // get the changed value, run it through the set function
          changed_value = object[property];
          descriptor.set.call(object, changed_value);

          // Restore get function if:
          //  it was mentioned on definition
          //  there's no falsey value, in that case we just need to return falsey value
          //  current toString is not the getter, to prevent further unecessary redefinitions
          if (descriptor.get && descriptor.value && descriptor.value.toString != descriptor.bound_getter) {
            // TODO if (descriptor.get + '' === 'undefined') descriptor.get = '';        // Handle undefined getter
            descriptor.value.toString = descriptor.bound_getter
          }

          // Update stored values
          object[property] = descriptor.value = changed_value;

          // restore the event handler
          object.attachEvent("onpropertychange", setter);

          // stack.pop();
          return false;
        }
      }

      return setter;
    };

    // Shim define property with apropriated fail cases exceptions
    Object.defineProperty = function (obj, prop, descriptor) {
      var fix;

      if (!prop)

      if (descriptor.set) {
        if (!obj.attachEvent) throw new TypeError('Object.defineProperty: First parameter must be a dom element. When descriptor has \'set\' property.');

        if (!fix && !inDocument(obj)) throw new TypeError('Object.defineProperty: Dom element must be attached in document.');
      }

      if (!descriptor) throw new TypeError('Object.defineProperty (object, property, descriptor): Descriptor must be an object, was \'' + descriptor + '\'.');

      // Store current value in descriptor
      // TODO only try to set descriptor value if it was passed as parameter
      descriptor.value = descriptor.value || (descriptor.get && descriptor.get.call(obj)) || obj[prop];

      if (descriptor.set) {
        // Detach old listeners if any
        detach = true;
        obj[prop] = 'detaching';
        detach = false;

        if (descriptor.get) {
          // TODO remove jquery dependency
          descriptor.bound_getter   = $.extend($.proxy(descriptor.get, obj), descriptor.get);

          // Why? we only bind the getter when we have a non falsey value
          if (descriptor.value) descriptor.value.toString = descriptor.bound_getter;

          // Although its not allowed for convention to have getters
          // and setters with the descriptor value, here we just reuse
          // the descriptor stored value
          obj[prop] = descriptor.value;
        }

        (fix || obj).attachEvent("onpropertychange", generate_setter(obj, prop, descriptor));

      } else if (descriptor.get) {
        descriptor.bound_getter   = $.extend($.proxy(descriptor.get, obj), descriptor.get);

        // Why? we only bind the getter when we have a non falsey value
        if (descriptor.value) descriptor.value.toString = descriptor.bound_getter;

        // Although its not allowed for convention to have getters
        // and setters with the descriptor value, here we just reuse
        // the descriptor stored value
        obj[prop] = descriptor.value;
      } else {
        obj[prop] = descriptor.value;
      }

      return obj;
    }

    // Allow others to check requirements for define property
    Object.defineProperty.requiresDomElement = true
  }


  // Since we shimed define property, we can also shim defineProperties
  if (!Object.defineProperties) {
    Object.defineProperties = function (obj, props) {
      for (var prop in props) {
        if (hasOwnProp.call(props, prop)) {
          Object.defineProperty(obj, prop, props[prop]);
        }
      }
    };

    baseElement      = document.createElement('fix');
    fixedOwnProperty = function (name) {
      if (name in baseElement) return false;
      return hasOwnProp.call(this, name);
    };


    Object.create = function (prototype, properties) {
      var complexDescriptor, fix, descriptor, name;

      for (name in properties) {
        descriptor = properties[name]
        if (descriptor instanceof Object) {
          complexDescriptor = !!(descriptor.get || descriptor.set)

          if (complexDescriptor) {
            break;
          }
        }
      }

      if (complexDescriptor || prototype.nodeName === 'fix' || properties && properties._shim) {
        properties && delete properties._shim;

        if (typeof object != 'function') {
          fix = document.createElement('fix');
          document.appendChild(fix);

          // Copy over prototype properties
          for (name in prototype) {
            try {
              if (name in baseElement) continue;
              fix[name] = prototype[name];
            } catch (e) {
              console.warn("Object.create: Invalid shimmed property: " + name + ", with error " + e);
            }
          }

          // Ensure most normalized for loops to work property, by
          // skiping the dom element properties on own property
          // checking.
          //
          // TODO ensure other own property methods checking
          fix.hasOwnProperty = fixedOwnProperty

          Object.defineProperties(fix, properties);
        } else {
          throw new TypeError('Functions with complex descriptors not implemented yet');
        }
        return fix;
      } else {
        return objectCreate(prototype, properties)
      }
    }
  };


  /* TODO Use define Property, and only define if
     non-enumerable properties are allowed

     also define __defineGetter__ and __defineSetter__
  if (!Object.defineProperty.requiresDomElement) {
    if (!Object.prototype.__lookupGetter__) {
      Object.__lookupGetter__ = function () {
      console && console.log('__lookupGetter__ not implemented yet');
        return null;
    }
  }

  if (!Object.__lookupSetter__) {
    Object.prototype.__lookupSetter__ = function () {
      console && console.log('__lookupSetter__ not implemented yet');
      return null;
      }
      }
    }
  */

})();


});

require.register("indefinido~observable@es6-modules/vendor/shims/array.indexOf.js", function (exports, module) {
if (!Array.prototype.indexOf) { 
    Array.prototype.indexOf = function(obj, start) {
         for (var i = (start || 0), j = this.length; i < j; i++) {
             if (this[i] === obj) { return i; }
         }
         return -1;
    }
}

});

require.register("indefinido~observable@es6-modules/vendor/shims/object.create.js", function (exports, module) {
// ES5 15.2.3.5
// http://es5.github.com/#x15.2.3.5
if (!Object.create) {

    // Contributed by Brandon Benvie, October, 2012
    var createEmpty;
    var supportsProto = Object.prototype.__proto__ === null;
    if (supportsProto || typeof document == 'undefined') {
        createEmpty = function () {
            return { "__proto__": null };
        };
    } else {
        // In old IE __proto__ can't be used to manually set `null`, nor does
        // any other method exist to make an object that inherits from nothing,
        // aside from Object.prototype itself. Instead, create a new global
        // object and *steal* its Object.prototype and strip it bare. This is
        // used as the prototype to create nullary objects.
        createEmpty = function () {
            var iframe = document.createElement('iframe');
            var parent = document.body || document.documentElement;
            iframe.style.display = 'none';
            parent.appendChild(iframe);
            iframe.src = 'javascript:';
            var empty = iframe.contentWindow.Object.prototype;
            parent.removeChild(iframe);
            iframe = null;
            delete empty.constructor;
            delete empty.hasOwnProperty;
            delete empty.propertyIsEnumerable;
            delete empty.isPrototypeOf;
            delete empty.toLocaleString;
            delete empty.toString;
            delete empty.valueOf;
            empty.__proto__ = null;

            function Empty() {}
            Empty.prototype = empty;
            // short-circuit future calls
            createEmpty = function () {
                return new Empty();
            };
            return new Empty();
        };
    }

    Object.create = function create(prototype, properties) {

        var object;
        function Type() {}  // An empty constructor.

        if (prototype === null) {
            object = createEmpty();
        } else {
            if (typeof prototype !== "object" && typeof prototype !== "function") {
                // In the native implementation `parent` can be `null`
                // OR *any* `instanceof Object`  (Object|Function|Array|RegExp|etc)
                // Use `typeof` tho, b/c in old IE, DOM elements are not `instanceof Object`
                // like they are in modern browsers. Using `Object.create` on DOM elements
                // is...err...probably inappropriate, but the native version allows for it.
                throw new TypeError("Object prototype may only be an Object or null"); // same msg as Chrome
            }
            Type.prototype = prototype;
            object = new Type();
            // IE has no built-in implementation of `Object.getPrototypeOf`
            // neither `__proto__`, but this manually setting `__proto__` will
            // guarantee that `Object.getPrototypeOf` will work as expected with
            // objects created using `Object.create`
            object.__proto__ = prototype;
        }

        if (properties !== void 0) {
            Object.defineProperties(object, properties);
        }

        return object;
    };
}

});

require.register("indefinido~indemma@master", function (exports, module) {
module.exports = require("indefinido~indemma@master/lib/record.js");

});

require.register("indefinido~indemma@master/lib/extensions/rivets.js", function (exports, module) {
var root;

root = typeof exports !== "undefined" && exports !== null ? exports : this;

model.rivets = function() {
  var model_extensions;

  model_extensions = {
    record: {
      tie: function(element) {
        var lasso;

        lasso = {};
        lasso[this.resource] = this;
        return rivets.bind(element, lasso);
      }
    },
    preloadData: true
  };
  return model.mix(function(modelable) {
    return $.extend(true, modelable, model_extensions);
  });
};

});

require.register("indefinido~indemma@master/lib/record.js", function (exports, module) {
var $, advisable, bind, extend, merge, observable, type,
  __slice = [].slice;

$ = require("component~jquery@1.9.1");

type = require("component~type@1.0.0");

bind = require("component~bind@0.0.1");

observable = require("indefinido~observable@es6-modules");

advisable = require("indefinido~advisable@master").mixin;

extend = require("pluma~assimilate@0.3.0");

merge = require("pluma~assimilate@0.3.0").withStrategy('deep');

this.model = (function() {
  var initialize_record, mixer, modelable;

  modelable = {
    after_mix: [],
    record: {
      after_initialize: [],
      before_initialize: []
    },
    every: function() {
      return this.cache;
    },
    create: function() {
      var params;

      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      throw 'model.create not implemented yet, try using the restful.model.create method';
    },
    where: function(conditions, first) {
      var record, results, _i, _len, _ref;

      if (first == null) {
        first = false;
      }
      results = [];
      if (type(conditions.id) !== 'array') {
        conditions.id = [conditions.id];
      }
      _ref = this.cache;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        record = _ref[_i];
        if (conditions.id.indexOf(record._id) !== -1) {
          if (first) {
            return record;
          } else {
            results.push(record);
          }
        }
      }
      if (first) {
        return null;
      } else {
        return results;
      }
    }
  };
  initialize_record = function(data) {
    var after_initialize, callback, creation, index, instance, _i, _j, _len, _len1, _ref, _ref1;

    if (data == null) {
      data = {
        resource: this.resource,
        parent_resource: this.parent_resource
      };
    }
    data.resource || (data.resource = this.resource);
    data.parent_resource || (data.parent_resource = this.resource.parent || this.parent_resource);
    data.route || (data.route = this.route);
    data.nested_attributes = this.nested_attributes || [];
    after_initialize = (data.after_initialize || []).concat(this.record.after_initialize);
    creation = extend(Object.create(data, {
      _shim: {}
    }), this.record, creation, {
      after_initialize: after_initialize
    });
    _ref = this.record.before_initialize;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      callback = _ref[index];
      callback.call(this, creation);
    }
    instance = record.call(creation);
    _ref1 = instance.after_initialize;
    for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
      callback = _ref1[index];
      callback.call(instance, instance);
    }
    delete instance.after_initialize;
    return instance;
  };
  mixer = function(options) {
    var after_initialize, callback, instance, _i, _len, _ref;

    if (this === window) {
      throw 'Model mixin called incorrectly call with model.call {} instead of model({})';
    }
    if (!mixer.stale) {
      mixer.stale = true;
    }
    if (this.record && this.record.after_initialize) {
      after_initialize = this.record.after_initialize.splice(0);
    } else {
      after_initialize = [];
    }
    instance = bind(this, initialize_record);
    extend(instance, merge(this, modelable));
    this.record = instance.record = merge({}, instance.record, modelable.record);
    this.record.after_initialize = instance.record.after_initialize = instance.record.after_initialize.concat(after_initialize);
    this.record.before_initialize = instance.record.before_initialize.concat([]);
    _ref = modelable.after_mix;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      callback = _ref[_i];
      callback.call(instance, instance);
    }
    return mixer[this.resource.name || this.resource.toString()] = instance;
  };
  mixer.mix = function(blender) {
    if (this.stale) {
      throw "Trying to change model mixin with " + object + " but model already used.\nCheck your configuration order";
    }
    return blender(modelable);
  };
  return mixer;
})();

this.record = (function() {
  var callbacks, recordable, that;

  callbacks = {
    dirtify: function() {}
  };
  recordable = {
    dirty: false,
    after_initialize: [callbacks.dirtify]
  };
  that = function(data) {
    var after_initialize;

    if (this === window) {
      throw "Mixin called incorrectly, call mixin with call method: record.call(object, data)";
    }
    data || (data = {});
    after_initialize = (this.after_initialize || []).concat(data.after_initialize || []).concat(recordable.after_initialize);
    return advisable(observable(extend(this, recordable, data, {
      after_initialize: after_initialize
    })));
  };
  that.mix = function(blender) {
    return blender(recordable);
  };
  return that;
})();

exports.record = this.record;

exports.model = this.model;

});

require.register("indefinido~indemma@master/lib/record/associable.js", function (exports, module) {
var $, associable, callbacks, descriptors, extend, model, plural, root, singular,
  __slice = [].slice;

root = window;

$ = require("component~jquery@1.9.1");

extend = require("pluma~assimilate@0.3.0");

require("indefinido~indemma@master/lib/record/resource.js");

plural = {
  add: function() {
    var attributes, params, _i, _len, _results;

    params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _results = [];
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      attributes = params[_i];
      _results.push(this.push(this.build(attributes)));
    }
    return _results;
  },
  create: function() {
    var attributes, params, record, _i, _len, _results;

    params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    _results = [];
    for (_i = 0, _len = params.length; _i < _len; _i++) {
      attributes = params[_i];
      record = this.build(attributes);
      this.push(record);
      _results.push(record.save());
    }
    return _results;
  },
  build: function(data) {
    var _name;

    if (data == null) {
      data = {};
    }
    data.parent_resource = this.parent_resource;
    if (this.parent != null) {
      data.route || (data.route = "" + this.parent.route + "/" + this.parent._id + "/" + (model.pluralize(this.resource.toString())));
    }
    if (this.route !== data.route && this.route) {
      throw "associable.has_many: cannot redefine route of association " + this.parent_resource + "." + this.resource + " from " + this.route + " to " + data.route;
    }
    data[_name = this.parent_resource] || (data[_name] = this.parent);
    return model[model.singularize(this.resource)](data);
  },
  push: function() {
    console.warn("" + this.resource + ".push is deprecated and will be removed, please use add instead");
    Array.prototype.push.apply(this, arguments);
    return arguments[0];
  },
  length: 0,
  json: function(methods, omissions) {
    var record, _i, _len, _results;

    _results = [];
    for (_i = 0, _len = this.length; _i < _len; _i++) {
      record = this[_i];
      _results.push(record.json(methods, omissions));
    }
    return _results;
  },
  find: function(id) {
    var resource, _i, _len;

    for (_i = 0, _len = this.length; _i < _len; _i++) {
      resource = this[_i];
      if (resource._id === id) {
        return resource;
      }
    }
  },
  filter: Array.prototype.filter || (typeof _ !== "undefined" && _ !== null ? _.filter : void 0)
};

singular = {
  create: function(data) {
    return model[this.resource].create(extend({}, this, data));
  },
  build: function(data) {
    return this.owner[this.resource.toString()] = model[this.resource.toString()](extend({}, this, data));
  }
};

descriptors = {
  belongs_to: {
    resource_id: {
      getter: function() {
        return this.owner.observed[this.resource + '_id'];
      },
      setter: function(resource_id) {
        var association_name, current_resource_id, _ref;

        association_name = this.resource.toString();
        if (!resource_id) {
          this.dirty = true;
          this.owner[association_name] = resource_id;
          return resource_id;
        }
        current_resource_id = (_ref = this.owner.observed[association_name]) != null ? _ref._id : void 0;
        if (resource_id !== current_resource_id) {
          this.owner.observed[association_name + '_id'] = resource_id;
          this.owner.observed[association_name] = null;
        }
        return resource_id;
      }
    },
    resource: {
      getter: function() {
        var associated, associated_id, association_name, resource;

        association_name = this.resource.toString();
        associated = this.owner.observed[association_name];
        associated_id = this.owner.observed[association_name + '_id'];
        if (!(((associated != null ? associated._id : void 0) != null) || associated_id)) {
          return associated;
        }
        if (associated != null ? associated.sustained : void 0) {
          return associated;
        }
        resource = model[association_name];
        if (!resource) {
          console.warn("descriptors.belongs_to.resource.getter: associated factory not found for model '" + association_name + "' belonging to '" + this.owner.resource + "'");
          return associated;
        }
        associated = resource.find(associated_id || associated._id);
        if (associated) {
          return this.owner.observed[association_name] = associated;
        }
        associated || (associated = resource({
          _id: associated_id
        }));
        associated.reload();
        return this.owner.observed[association_name] = associated;
      },
      setter: function(associated) {
        this.owner.observed[this.resource.toString()] = associated;
        return this.owner.observed[this.resource.toString() + '_id'] = associated ? associated._id : null;
      }
    }
  }
};

callbacks = {
  has_many: {
    nest_attributes: function() {
      var association, association_name, association_names, associations_attributes, message, _i, _len, _results;

      association_names = model[this.resource].has_many;
      if (association_names) {
        _results = [];
        for (_i = 0, _len = association_names.length; _i < _len; _i++) {
          association_name = association_names[_i];
          associations_attributes = this["" + association_name + "_attributes"];
          association = this[model.pluralize(association_name)];
          if (associations_attributes && associations_attributes.length) {
            if (!association) {
              message = "has_many.nest_attributes: Association not found for " + association_name + ". \n";
              message += "did you set it on model declaration? \n  has_many: " + association_name + " ";
              throw message;
            }
            association.resource = model.singularize(association.resource);
            association.add.apply(association, associations_attributes);
            _results.push(association.resource = model.pluralize(association.resource));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    },
    update_association: function(data) {
      var associated, association, association_name, id, pluralized_association, _i, _j, _len, _len1, _ref;

      id = this._id || data && (data._id || data.id);
      if (!id) {
        return;
      }
      _ref = model[this.resource.toString()].has_many;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        association_name = _ref[_i];
        pluralized_association = model.pluralize(association_name);
        association = this[pluralized_association];
        if (!association.route) {
          association.route = "/" + (model.pluralize(this.resource.toString())) + "/" + id + "/" + (model.pluralize(association.resource));
          for (_j = 0, _len1 = association.length; _j < _len1; _j++) {
            associated = association[_j];
            if (!associated.route && (associated.parent != null)) {
              associated.route = "/" + (model.pluralize(this.resource.toString())) + "/" + id + "/" + (model.pluralize(association.resource));
            }
          }
        }
      }
      return true;
    },
    autosave: function() {
      throw 'Not implemented yet';
    }
  },
  has_one: {
    nest_attributes: function() {
      var association_name, association_names, associations_attributes, _i, _len, _results;

      association_names = model[this.resource].has_one;
      if (association_names) {
        _results = [];
        for (_i = 0, _len = association_names.length; _i < _len; _i++) {
          association_name = association_names[_i];
          associations_attributes = this["" + association_name + "_attributes"];
          if (associations_attributes) {
            this[association_name] = this["build_" + association_name](associations_attributes);
            _results.push(delete this["" + association_name + "_attributes"]);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    }
  }
};

associable = {
  model: {
    blender: function(definition) {
      var model;

      model = associable.model;
      this.create_after_hooks = model.create_after_hooks;
      this.create_before_hooks = model.create_before_hooks;
      if (this.has_many && $.type(this.has_many) !== 'array') {
        this.has_many = [this.has_many];
      }
      if (this.has_one && $.type(this.has_one) !== 'array') {
        this.has_one = [this.has_one];
      }
      if (this.belongs_to && $.type(this.belongs_to) !== 'array') {
        this.belongs_to = [this.belongs_to];
      }
      this.has_many || (this.has_many = []);
      this.has_one || (this.has_one = []);
      this.belongs_to || (this.belongs_to = []);
      return true;
    },
    create_after_hooks: function(definition) {
      var association_attributes, association_name, association_proxy, old_dirty, old_resource_id, options, resource, _i, _j, _k, _len, _len1, _len2, _name, _ref, _ref1, _ref2, _results;

      options = model[this.resource.name || this.resource.toString()];
      if (options.has_many) {
        _ref = options.has_many;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          resource = _ref[_i];
          association_proxy = {
            resource: resource,
            parent_resource: this.resource,
            parent: this
          };
          association_name = model.pluralize(resource);
          association_attributes = this[association_name] || [];
          this[_name = "" + association_name + "_attributes"] || (this[_name] = []);
          if (association_attributes.length) {
            this["" + association_name + "_attributes"] = this["" + association_name + "_attributes"].concat(association_attributes);
          }
          this[association_name] = $.extend(association_proxy, plural);
        }
        this.after('saved', callbacks.has_many.update_association);
        callbacks.has_many.nest_attributes.call(this);
      }
      if (options.has_one) {
        _ref1 = options.has_one;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          resource = _ref1[_j];
          association_proxy = {
            resource: resource,
            parent_resource: this.resource,
            owner: this
          };
          association_proxy[this.resource.toString()] = this;
          this["build_" + resource] = $.proxy(singular.build, association_proxy);
          this["create_" + resource] = $.proxy(singular.create, association_proxy);
        }
        callbacks.has_one.nest_attributes.call(this);
      }
      if (options.belongs_to) {
        _ref2 = options.belongs_to;
        _results = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          resource = _ref2[_k];
          association_proxy = {
            resource: resource,
            parent_resource: this.resource,
            parent: this,
            owner: this
          };
          association_proxy[this.resource.toString()] = this;
          this["build_" + resource] = $.proxy(singular.build, association_proxy);
          this["create_" + resource] = $.proxy(singular.create, association_proxy);
          old_resource_id = this["" + resource + "_id"];
          old_dirty = this.dirty;
          this["" + resource + "_id"] = null;
          Object.defineProperty(this, "" + resource + "_id", {
            get: $.proxy(descriptors.belongs_to.resource_id.getter, association_proxy),
            set: $.proxy(descriptors.belongs_to.resource_id.setter, association_proxy),
            configurable: true
          });
          this["" + resource + "_id"] = old_resource_id;
          _results.push(this.dirty = old_dirty);
        }
        return _results;
      }
    },
    create_before_hooks: function(record) {
      var association_proxy, definition, old_resource, resource, _i, _len, _ref, _results;

      definition = this;
      if (definition.belongs_to) {
        _ref = definition.belongs_to;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          resource = _ref[_i];
          association_proxy = {
            resource: resource,
            parent_resource: this.resource,
            owner: record
          };
          old_resource = this[resource];
          Object.defineProperty(record, resource.toString(), {
            get: $.proxy(descriptors.belongs_to.resource.getter, association_proxy),
            set: $.proxy(descriptors.belongs_to.resource.setter, association_proxy),
            configurable: true
          });
          _results.push(this[resource] = old_resource);
        }
        return _results;
      }
    }
  },
  record: {
    after_initialize: function(attributes) {
      if (this.resource == null) {
        throw new Error('resource must be defined in order to associate');
      }
      return model[this.resource.name || this.resource.toString()].create_after_hooks.call(this);
    },
    before_initialize: function(creation) {
      if (!this.resource) {
        throw new Error('resource must be defined in order to associate');
      }
      return model[this.resource.name || this.resource.toString()].create_before_hooks(creation);
    }
  }
};

model = root.model;

model.mix(function(modelable) {
  modelable.after_mix.push(associable.model.blender);
  modelable.record.before_initialize.push(associable.record.before_initialize);
  return modelable.record.after_initialize.push(associable.record.after_initialize);
});

model.associable = {
  mix: function(blender) {
    return blender(singular, plural);
  }
};

});

require.register("indefinido~indemma@master/lib/record/dirtyable.js", function (exports, module) {
'use strict';
var dirtyable, model, record;

dirtyable = {
  ignores: ['dirty', 'resource', 'route', 'initial_route', 'after_initialize', 'before_initialize', 'parent_resource', 'nested_attributes', 'reloading', 'ready', 'saving', 'salvation', 'sustained', 'element', 'default', 'lock', 'validated', 'validation', 'errors', 'dirty'],
  change: function(name) {
    return dirtyable.ignores.indexOf(name) === -1;
  },
  descriptor: {
    get: function() {
      return this.observed.dirty;
    },
    set: function(value) {
      this.observed.dirty = value;
      this.observation.scheduler.schedule();
      return value;
    }
  },
  record: {
    after_initialize: function() {
      Object.defineProperty(this, 'dirty', dirtyable.descriptor);
      this.observed.dirty = !!this._id;
      return this.subscribe(function(added, removed, changed, past) {
        return this.dirty || (this.dirty = !!Object.keys(changed).filter(dirtyable.change).length);
      });
    }
  }
};

model = window.model;

record = window.record;

model.dirtyable = true;

record.mix(function(recordable) {
  return recordable.after_initialize.push(dirtyable.record.after_initialize);
});

model.mix(function(modelable) {});

module.exports = dirtyable;

});

require.register("indefinido~indemma@master/lib/record/errors.js", function (exports, module) {


});

require.register("indefinido~indemma@master/lib/record/maid.js", function (exports, module) {
var maid, model;

maid = {
  model: function() {
    if (this.washing != null) {
      return this.record.after_initialize.push(maid.record);
    }
  },
  record: function() {
    return this.subscribe('dirty', function(dirty) {
      var _this = this;

      return dirty && setTimeout(function() {
        return _this.save();
      }, 500);
    });
  }
};

model = window.model;

model.mix(function(modelable) {
  return modelable.after_mix.unshift(maid.model);
});

});

require.register("indefinido~indemma@master/lib/record/persistable.js", function (exports, module) {
var handlers, model, persistable, record;

require("indefinido~indemma@master/lib/record/queryable.js");

handlers = {
  store_after_saved: function() {
    var storage;

    storage = model[this.resource.toString()].storage;
    if (this._id) {
      return storage.store(this._id, this);
    }
  }
};

persistable = {
  record: {
    after_initialize: function() {
      var storage;

      if (this._id) {
        storage = model[this.resource.toString()].storage;
        return storage.store(this._id, this);
      } else {
        return this.after('saved', handlers.store_after_saved);
      }
    }
  }
};

model = window.model;

record = window.record;

model.persistable = true;

model.mix(function(modelable) {
  return modelable.record.after_initialize.push(persistable.record.after_initialize);
});

});

require.register("indefinido~indemma@master/lib/record/queryable.js", function (exports, module) {
var extend, model, queryable, record, stampit, storable;

extend = require("pluma~assimilate@0.3.0");

storable = require("indefinido~indemma@master/lib/record/storable.js");

stampit = require("indefinido~indemma@master/vendor/stampit.js");

queryable = {
  storage: storable(),
  find: function(key) {
    if (!key) {
      throw new TypeError("InvalidFind: resource.find was called with a falsey value");
    }
    return this.storage.store(key);
  },
  every: function(callback) {
    return callback(this.storage.values());
  },
  where: function() {
    throw new Error('queryable.where: Not implemented yet');
  }
};

model = window.model;

record = window.record;

model.queryable = true;

module.exports = queryable;

model.mix(function(modelable) {
  return extend(modelable, queryable);
});

});

require.register("indefinido~indemma@master/lib/record/resource.js", function (exports, module) {
var descriptors, model, resource, resourceable, stampit;

stampit = require("indefinido~indemma@master/vendor/stampit.js");

require("indefinido~indemma@master/vendor/owl/pluralize.js");

resource = stampit({
  toString: function() {
    return this.name;
  }
}, {
  name: 'unknown',
  scope: null,
  singular: false
}, function() {
  var _base;

  if (this.original_reference) {
    stampit.mixIn(this.original_reference, this);
    this.original_reference.toString = this.toString;
    (_base = this.original_reference).param_name || (_base.param_name = this.name);
    return this.original_reference;
  }
  this.param_name || (this.param_name = this.name);
  return this;
});

descriptors = {
  route: {
    get: function() {
      var route;

      if (typeof this.resource === 'string') {
        this.resource = {
          name: this.resource
        };
      }
      route = '/';
      if (this.parent != null) {
        route += ("" + this.parent.route + "/" + this.parent._id) + "/";
      }
      if (this.resource.scope != null) {
        route += this.resource.scope + '/';
      }
      route += this.resource.singular ? this.resource.name : model.pluralize(this.resource.name);
      return this.route = route;
    },
    configurable: true
  }
};

resourceable = {
  pluralize: function(word, count, plural) {
    if (!(word && word.length)) {
      throw new TypeError("Invalid string passed to pluralize '" + word + "'");
    }
    if (word.indexOf('s') !== word.length - 1) {
      return owl.pluralize(word, count, plural);
    } else {
      return word;
    }
  },
  singularize: function(word) {
    if (!(word && word.length)) {
      throw new TypeError("Invalid string passed to singularize '" + word + "'");
    }
    if (word.lastIndexOf('s') === word.length - 1) {
      return word.substring(0, word.length - 1);
    } else {
      return word;
    }
  },
  initialize: function() {
    var resource_definition, _ref;

    resource_definition = {};
    if (typeof this.resource === 'string') {
      resource_definition = {
        name: this.resource
      };
    }
    if (typeof this.resource === 'object') {
      this.resource.original_reference = this.resource;
      resource_definition = this.resource;
    }
    resource_definition.parent = this.parent_resource;
    this.resource = resource(resource_definition);
    return (_ref = this.route) != null ? _ref : Object.defineProperty(this, 'route', descriptors.route);
  }
};

model = window.model;

model.mix(function(modelable) {
  modelable.record.after_initialize.unshift(resourceable.initialize);
  return modelable.after_mix.unshift(resourceable.initialize);
});

model.singularize = resourceable.singularize;

model.pluralize = resourceable.pluralize;

});

require.register("indefinido~indemma@master/lib/record/rest.js", function (exports, module) {
var $, data_for, request;

$ = require("component~jquery@1.9.1");

module.exports = {
  get: function(data) {
    return request.call(this, 'get', (this._id ? "" + this.route + "/" + this._id : this.route), data);
  },
  put: function(data) {
    return request.call(this, 'put', (this._id ? "" + this.route + "/" + this._id : this.route), data);
  },
  post: function(data) {
    return request.call(this, 'post', this.route, data);
  },
  "delete": function(data) {
    return request.call(this, 'delete', (this._id ? "" + this.route + "/" + this._id : this.route), data);
  }
};

data_for = function(data) {
  var param_name;

  param_name = this.resource.param_name || this.resource.toString();
  if (!data && this.json) {
    data = {};
    data[param_name] = this.json();
  }
  if (data && data[param_name]) {
    delete data[param_name]['id'];
    delete data[param_name]['_id'];
  }
  return data;
};

request = function(method, url, data) {
  data = data_for.call(this, data);
  return $.ajax({
    url: url,
    data: data,
    type: method,
    dataType: 'json',
    context: this
  });
};

});

require.register("indefinido~indemma@master/lib/record/restfulable.js", function (exports, module) {
var $, merge, model, observable, record, rest, restful, root, type, util,
  __slice = [].slice;

merge = require("pluma~assimilate@0.3.0").withStrategy('deep');

type = require("component~type@1.0.0");

observable = require("indefinido~observable@es6-modules").mixin;

$ = require("component~jquery@1.9.1");

rest = require("indefinido~indemma@master/lib/record/rest.js");

root = typeof exports !== "undefined" && exports !== null ? exports : this;

require("indefinido~indemma@master/lib/record/dirtyable.js");

util = {
  model: {
    map: function(records) {
      var record, _i, _len, _results;

      _results = [];
      for (_i = 0, _len = records.length; _i < _len; _i++) {
        record = records[_i];
        _results.push(this(record));
      }
      return _results;
    }
  }
};

restful = {
  model: {
    create: function() {
      var attributes, callback, params, record, savings, _i, _j, _len;

      params = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), callback = arguments[_i++];
      if (!arguments.length) {
        throw new TypeError("No arguments provided for " + this.resource + ".create");
      }
      if (typeof callback !== 'function') {
        params.push(callback);
        callback = void 0;
      }
      if (!params.length) {
        params.unshift({});
      }
      savings = [];
      for (_j = 0, _len = params.length; _j < _len; _j++) {
        attributes = params[_j];
        record = this(attributes);
        record.dirty = true;
        savings.push(record.save(callback));
      }
      return $.when.apply($, savings);
    },
    every: function(conditions, doned, failed) {
      if (conditions == null) {
        conditions = {};
      }
      if (typeof conditions === 'function') {
        doned = conditions;
        conditions = {};
      }
      return $.when(rest.get.call(this, conditions)).then(util.model.map).done(doned).fail(failed);
    },
    first: function(conditions, callback) {
      var namespaced;

      if (conditions == null) {
        conditions = {};
      }
      if (typeof conditions === 'function') {
        callback = conditions;
        conditions = {};
      }
      namespaced = conditions[this.resource] || {};
      namespaced.limit = 1;
      namespaced.order = 'desc';
      return this.every(conditions, callback);
    },
    get: function(action, data) {
      var default_route, old_route, payload, promise, resource;

      if (data == null) {
        data = {};
      }
      old_route = this.route;
      default_route = '/';
      if (this.resource.scope != null) {
        default_route += this.resource.scope + '/';
      }
      default_route += this.resource.singular ? this.resource.name : model.pluralize(this.resource.name);
      if (default_route !== this.route) {
        this.route = default_route;
      }
      if (action) {
        Object.defineProperty(this, 'route', {
          value: "" + default_route + "/" + action,
          configurable: true
        });
      }
      resource = data.resource;
      if (data && data.json) {
        data = data.json();
      }
      if (resource != null) {
        payload = data;
        data = {};
        data[resource] = payload;
      }
      promise = rest.get.call(this, data);
      Object.defineProperty(this, 'route', {
        value: old_route,
        configurable: true
      });
      return promise;
    },
    put: rest.put,
    "delete": rest["delete"]
  },
  record: {
    ready: function(callback) {
      return callback.call(this);
    },
    reload: function() {
      var data, param, params, promise, _i, _len;

      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      data = params.pop();
      if (type(data) !== 'object') {
        params.push(data);
      }
      promise = rest.get.call(this, data || {});
      promise.done(this.assign_attributes);
      promise.fail(this.failed);
      this.reloading = promise;
      this.ready = function() {
        console.warn("resource.ready was deprecated, please use resource.reloading.done");
        return promise.done.apply(promise, arguments);
      };
      for (_i = 0, _len = params.length; _i < _len; _i++) {
        param = params[_i];
        promise.done(param);
      }
      return promise;
    },
    assign_attributes: function(attributes) {
      var associated, association, association_attributes, association_name, associations_attributes, attribute, message, name, singular_resource, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _results;

      _ref = model[this.resource.toString()].has_many;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        association_name = _ref[_i];
        associations_attributes = attributes[association_name + "_attributes"] || attributes[association_name];
        delete attributes[association_name];
        delete attributes[association_name + '_attributes'];
        association = this[association_name];
        if (association == null) {
          message = "Association '" + association_name + "' not found. \n";
          message += "For record with resource " + this.resource + ". \n";
          message += "Probably defined on server side but not on client side.\n";
          message += "Skipping association assignment!";
          console.warn(message);
          continue;
        }
        if (association.length) {
          Array.prototype.splice.call(association, 0);
        }
        if (!((associations_attributes != null) && associations_attributes.length)) {
          continue;
        }
        singular_resource = model.singularize(association_name);
        for (_j = 0, _len1 = associations_attributes.length; _j < _len1; _j++) {
          association_attributes = associations_attributes[_j];
          _ref1 = model[singular_resource].has_many;
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            association_name = _ref1[_k];
            association_attributes["" + association_name + "_attributes"] = association_attributes[association_name];
            delete association_attributes[association_name];
          }
        }
        association.add.apply(association, associations_attributes);
      }
      _ref2 = model[this.resource.toString()].has_one;
      for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
        association_name = _ref2[_l];
        association_attributes = attributes[association_name];
        delete attributes[association_name];
        delete attributes[association_name + "_attributes"];
        if (association_attributes) {
          associated = this[association_name] || this["build_" + association_name]();
          associated.assign_attributes(association_attributes);
          this[association_name] = associated;
        }
      }
      _ref3 = model[this.resource.toString()].belongs_to;
      for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
        association_name = _ref3[_m];
        association_attributes = (_ref4 = (_ref5 = attributes[association_name]) != null ? typeof _ref5.json === "function" ? _ref5.json() : void 0 : void 0) != null ? _ref4 : attributes[association_name];
        delete attributes[association_name];
        delete attributes[association_name + "_attributes"];
        if (association_attributes) {
          associated = this[association_name] || this["build_" + association_name]();
          associated.assign_attributes(association_attributes);
          this[association_name] = associated;
        }
      }
      _results = [];
      for (name in attributes) {
        attribute = attributes[name];
        if (attribute !== this[name]) {
          if (type(attribute) === 'object') {
            if (JSON.stringify(attribute) !== JSON.stringify(this[name])) {
              _results.push(this[name] = attributes[name]);
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(this[name] = attributes[name]);
          }
        }
      }
      return _results;
    },
    destroy: function(doned, failed, data) {
      var promise;

      if (!((this.id != null) || (this._id != null))) {
        throw new Error('Can\'t delete record without id!');
      }
      promise = rest["delete"].call(this, data);
      promise.done(this.destroyed);
      promise.fail(this.failed);
      promise.done(doned);
      promise.fail(failed);
      return promise;
    },
    saving: false,
    salvation: null,
    save: function(doned, failed, data) {
      var lock, salvation;

      lock = JSON.stringify(this.json());
      if (this.saving) {
        if (this.lock === lock) {
          return this.salvation;
        } else {
          this.salvation.abort();
        }
      }
      this.lock = lock;
      if (!this.dirty) {
        salvation = $.Deferred().resolveWith(this, null);
      }
      this.saving = true;
      salvation || (salvation = rest[this._id ? 'put' : 'post'].call(this, data));
      this.salvation = salvation;
      salvation.done(this.saved);
      salvation.fail(this.failed);
      salvation.always(function() {
        return this.saving = false;
      });
      salvation.done(doned);
      salvation.fail(failed);
      return salvation;
    },
    saved: function(data) {
      var callback, _i, _len, _ref, _results;

      if (this.lock === JSON.stringify(this.json())) {
        this.dirty = false;
        delete this.lock;
      }
      if (data != null) {
        this.assign_attributes(data);
      }
      if (this.after_save) {
        _ref = this.after_save;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          callback = _ref[_i];
          throw "Not supported after_save callback: " + callback;
        }
        return _results;
      }
    },
    failed: function(xhr, error, status) {
      var attribute_name, definition, e, message, messages, payload, _i, _len, _ref;

      payload = xhr.responseJSON;
      try {
        payload || (payload = JSON.parse(xhr.responseText));
      } catch (_error) {
        e = _error;
      }
      payload || (payload = xhr.responseText);
      switch (xhr.status) {
        case 0:
          message = status || xhr.statusText;
          switch (message) {
            case 'abort':
              console.info("salvation probably aborted");
              break;
            case 'error':
              console.info("server probably unreachable");
              break;
            default:
              throw new Error('Unhandled status code for xhr');
          }
          break;
        case 422:
          definition = model[this.resource.toString()];
          _ref = payload.errors;
          for (attribute_name in _ref) {
            messages = _ref[attribute_name];
            if (!definition.associations) {
              definition.associations = definition.has_one.concat(definition.has_many.concat(definition.belongs_to));
            }
            if (!(this.hasOwnProperty(attribute_name) || definition.hasOwnProperty(attribute_name) || definition.associations.indexOf(attribute_name) !== -1 || attribute_name === 'base')) {
              message = "Server returned an validation error message for a attribute that is not defined in your model.\n";
              message += "The attribute was '" + attribute_name + "', the model resource was '" + this.resource + "'.\n";
              message += "The model definition keys were '" + (JSON.stringify(Object.keys(definition))) + "'.\n";
              message += "Please remove server validation, or update your model definition.";
              throw new TypeError(message);
            }
            for (_i = 0, _len = messages.length; _i < _len; _i++) {
              message = messages[_i];
              this.errors.add(attribute_name, 'server', {
                server_message: message
              });
            }
          }
          break;
        default:
          message = "Fail in " + this.resource + ".save:\n";
          message += "Record: " + this + "\n";
          message += "Status: " + status + " (" + (payload || xhr).status + ")\n";
          message += "Error : " + (payload.error || payload.message || payload);
          console.log(message);
      }
      return this.saving = false;
    },
    toString: function() {
      var e, name, property, serialized;

      serialized = {};
      serialized[this.resource] = this.json();
      try {
        return JSON.stringify(serialized);
      } catch (_error) {
        e = _error;
        console.warn("restfulable.toString: Failed to stringify record: " + e.message + ". retrying...");
        for (name in serialized) {
          property = serialized[name];
          if (typeof property === 'object') {
            delete serialized[name];
          }
        }
        return JSON.stringify(serialized);
      }
    },
    json: function(options) {
      var definition, json, method, name, nature, nested, value, _ref, _ref1;

      if (options == null) {
        options = {};
      }
      json = {};
      definition = model[this.resource.toString()];
      for (name in this) {
        if (observable.ignores.indexOf(name) !== -1) {
          continue;
        }
        nested = this.nested_attributes.indexOf(name) !== -1;
        if (!nested && (definition.belongs_to.indexOf(name) !== -1 || definition.has_one.indexOf(name) !== -1 || definition.has_many.indexOf(name) !== -1)) {
          continue;
        }
        value = this[name];
        if (value == null) {
          continue;
        }
        nature = type(value);
        if (nature === 'function') {
          continue;
        }
        if (nature === 'object' || nature === 'element') {
          if (nested) {
            if (!value.json) {
              console.warn("json: Tryied to serialize nested attribute '" + name + "' without serialization method!");
              continue;
            }
            json["" + name + "_attributes"] = value.json(options[name]);
          } else if ((value.toJSON != null) || (value.json != null)) {
            if (value.resource) {
              continue;
            }
            if (value.json != null) {
              json[name] = value.json(options[name]);
            } else {
              json[name] = value.toJSON(options[name]);
            }
          } else {
            continue;
          }
        } else {
          json[name] = value;
        }
      }
      json = observable.unobserve(json);
      _ref1 = (_ref = options.methods) != null ? _ref : {};
      for (name in _ref1) {
        value = _ref1[name];
        method = this[name];
        if (typeof method === 'function') {
          json[name] = method();
        } else {
          json[name] = method;
        }
      }
      delete json.dirty;
      delete json.resource;
      delete json.route;
      delete json.initial_route;
      delete json.after_initialize;
      delete json.before_initialize;
      delete json.parent_resource;
      delete json.nested_attributes;
      delete json.reloading;
      delete json.ready;
      delete json.saving;
      delete json.salvation;
      delete json.sustained;
      delete json.element;
      delete json["default"];
      delete json.lock;
      delete json.validated;
      delete json.validation;
      delete json.errors;
      return json;
    }
  }
};

restful.toJSON = restful.json;

model = window.model;

record = window.record;

model.restfulable = true;

record.mix(function(recordable) {
  return merge(recordable, restful.record);
});

model.mix(function(modelable) {
  return merge(modelable, restful.model);
});

model.associable && model.associable.mix(function(singular_association, plural_association) {
  plural_association.get = function() {
    if (this.parent != null) {
      this.route || (this.route = "" + this.parent.route + "/" + this.parent._id + "/" + (model.pluralize(this.resource.name)));
    }
    return rest.get.apply(this, arguments);
  };
  return plural_association.post = function() {
    if (this.parent != null) {
      this.route || (this.route = "" + this.parent.route + "/" + this.parent._id + "/" + (model.pluralize(this.resource.name)));
    }
    return rest.post.apply(this, arguments);
  };
});

});

require.register("indefinido~indemma@master/lib/record/scopable.js", function (exports, module) {
var $, builders, defaults, extend, merge, model, observable, record, rest, scopable, stampit, util,
  __slice = [].slice;

require("indefinido~indemma@master/lib/record/restfulable.js");

require("indefinido~indemma@master/lib/record/resource.js");

stampit = require("indefinido~indemma@master/vendor/stampit.js");

extend = require("pluma~assimilate@0.3.0");

observable = require("indefinido~observable@es6-modules").mixin;

merge = extend.withStrategy('deep');

$ = require("component~jquery@1.9.1");

rest = require("indefinido~indemma@master/lib/record/rest.js");

util = {
  model: {
    map: function(records) {
      var index, record, _i, _len, _results;

      _results = [];
      for (index = _i = 0, _len = records.length; _i < _len; index = ++_i) {
        record = records[index];
        _results.push((this.build || this).call(this, record));
      }
      return _results;
    }
  }
};

scopable = {
  builder: stampit().enclose(function() {
    return stampit.mixIn(function(name, type) {
      var builder;

      if ($.type(type) === 'function') {
        this["$" + name] = type() || new type;
        type = $.type(this["$" + name]);
      } else {
        this["$" + name] = defaults[type] || type;
      }
      if ($.type(type) !== 'string') {
        type = $.type(type);
      }
      builder = builders[type];
      if (builder == null) {
        throw "Unknown scope type: '" + type + "', For model with resource: '" + this.resource + "'";
      }
      this.scope.declared.push(name);
      return this[name] = builder({
        name: name
      });
    }, {
      data: {},
      then: [],
      fail: [],
      declared: [],
      fetch: function(data, done, fail) {
        var deferred, method, scope;

        if (typeof data === 'function') {
          done = data;
          data = {};
        }
        scope = extend({}, this.scope.data);
        for (method in observable.methods) {
          delete scope[method];
        }
        if (scope.noned != null) {
          deferred = $.Deferred();
          deferred.resolveWith(this, [[]]);
        } else {
          deferred = rest.get.call(this, extend(scope, data));
        }
        deferred.then(util.model.map).done(this.scope.then.concat([done])).fail(this.scope.fail.concat([fail]));
        this.scope.clear();
        return deferred;
      },
      clear: function() {
        this.data = {};
        return this.callbacks = [];
      }
    });
  }),
  base: stampit().state({
    name: 'unamed_scope'
  }),
  record: {
    failed: function(xhr, error, status) {
      var e, message, payload;

      payload = xhr.responseJSON;
      try {
        payload || (payload = JSON.parse(xhr.responseText));
      } catch (_error) {
        e = _error;
      }
      payload || (payload = xhr.responseText);
      switch (xhr.status) {
        case 422:
          this.valid = false;
          return this.errors = payload.errors;
        default:
          message = "Fail in " + this.resource + ".save:\n";
          message += "Record: " + this + "\n";
          message += "Status: " + status + " (" + (payload.status || xhr.status) + ")\n";
          message += "Error : " + (payload.error || payload.message || payload);
      }
      return console.error(message);
    }
  },
  model: {
    none: function() {
      this.scope.data.noned = true;
      return this;
    },
    fetch: function(data, done, fail) {
      if (typeof data === 'function') {
        done = data;
        data = null;
      }
      return this.scope.fetch.call(this, data, done, fail);
    },
    forward_scopes_to_associations: function() {
      var associated_factory, associated_resource, association, association_name, factory, scope, _i, _j, _len, _len1, _ref, _ref1;

      factory = model[this.resource.name];
      _ref = factory.has_many;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        association_name = _ref[_i];
        associated_resource = model.singularize(association_name);
        associated_factory = model[associated_resource];
        if (!model[associated_resource]) {
          console.warn("Associated factory not found for associated resource: " + associated_resource);
          continue;
        }
        association = this[association_name];
        association.scope = scopable.builder(association);
        _ref1 = associated_factory.scope.declared;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          scope = _ref1[_j];
          association.scope(scope, associated_factory["$" + scope]);
        }
      }
      return true;
    }
  },
  after_mix: function() {
    var name, property, type, _results;

    this.scope = scopable.builder(this);
    _results = [];
    for (property in this) {
      type = this[property];
      if (property.charAt(0) === '$') {
        name = property.substring(1);
        _results.push(this.scope(name, type));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  }
};

builders = {
  string: stampit().enclose(function() {
    var base;

    base = scopable.base(this);
    return stampit.mixIn(function() {
      var callbacks, value, _base, _name;

      value = arguments[0], callbacks = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      callbacks.length && (this.scope.then = this.scope.then.concat(callbacks));
      (_base = this.scope.data)[_name = base.name] || (_base[_name] = value != null ? value : this["$" + base.name]);
      return this;
    });
  }),
  boolean: stampit().enclose(function() {
    var base;

    base = scopable.base(this);
    return stampit.mixIn(function() {
      var callbacks, value, _base, _name;

      value = arguments[0], callbacks = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      callbacks.length && (this.scope.then = this.scope.then.concat(callbacks));
      (_base = this.scope.data)[_name = base.name] || (_base[_name] = value != null ? value : this["$" + base.name]);
      return this;
    });
  }),
  array: stampit().enclose(function() {
    var base;

    base = scopable.base(this);
    return stampit.mixIn(function() {
      var values, _base, _name;

      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      (_base = this.scope.data)[_name = base.name] || (_base[_name] = values != null ? values : this["$" + base.name]);
      return this;
    });
  })
};

defaults = {
  boolean: true,
  array: []
};

model = window.model;

record = window.record;

model.scopable = true;

model.mix(function(modelable) {
  merge(modelable, scopable.model);
  return modelable.after_mix.push(scopable.after_mix);
});

if (model.associable) {
  model.mix(function(modelable) {
    return modelable.record.after_initialize.push(function() {
      return scopable.model.forward_scopes_to_associations.call(this);
    });
  });
  model.associable.mix(function(singular_association, plural_association) {
    plural_association.every = plural_association.reload = function(data, done, fail) {
      var promises, reload;

      if (this.parent != null) {
        this.route || (this.route = "" + this.parent.route + "/" + this.parent._id + "/" + (model.pluralize(this.resource)));
      }
      promises = [];
      if (typeof data === 'function') {
        done = data;
        data = void 0;
      }
      promises.push(this.scope.fetch.call(this, data, null, scopable.record.failed));
      reload = $.when.apply(jQuery, promises);
      reload.done(function(records, status) {
        var association_name, create, index, singular_resource, target, _i, _j, _k, _len, _len1, _len2, _ref;

        if (!records.length) {
          if (this.length) {
            Array.prototype.splice.call(this, 0);
          }
          return true;
        }
        singular_resource = model.singularize(this.resource);
        for (_i = 0, _len = records.length; _i < _len; _i++) {
          record = records[_i];
          _ref = model[singular_resource].has_many;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            association_name = _ref[_j];
            record["" + association_name + "_attributes"] = record[association_name];
            delete record[association_name];
          }
        }
        create = [];
        for (index = _k = 0, _len2 = records.length; _k < _len2; index = ++_k) {
          record = records[index];
          if (target = this.find(record._id)) {
            target.assign_attributes(record);
          } else {
            create.push(record);
          }
        }
        this.add.apply(this, create);
        records.splice(0);
        return records.push.apply(records, this);
      });
      reload.done(done);
      reload.fail(fail);
      return reload;
    };
    return plural_association.each = function(callback) {
      var _this = this;

      if (this.parent != null) {
        this.route || (this.route = "" + this.parent.route + "/" + this.parent._id + "/" + (model.pluralize(this.resource)));
      }
      return this.get().done(function(records) {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = _this.length; _i < _len; _i++) {
          record = _this[_i];
          _results.push(callback(record));
        }
        return _results;
      });
    };
  });
}

});

require.register("indefinido~indemma@master/lib/record/storable.js", function (exports, module) {
var extend, merge, model, record, stampit, storable;

extend = require("pluma~assimilate@0.3.0");

merge = extend.withStrategy('deep');

stampit = require("indefinido~indemma@master/vendor/stampit.js");

Object.values || (Object.values = (typeof _ !== "undefined" && _ !== null ? _.values : void 0) || function(object) {
  var key, value, _results;

  _results = [];
  for (key in object) {
    value = object[key];
    _results.push(value);
  }
  return _results;
});

storable = stampit({
  store: function(keypath, value, options) {
    var collection, entry, key, _i, _len;

    collection = this.database;
    keypath = keypath.toString().split('.');
    key = keypath.pop();
    for (_i = 0, _len = keypath.length; _i < _len; _i++) {
      entry = keypath[_i];
      collection[entry] || (collection[entry] = {});
      collection = collection[entry];
    }
    if (arguments.length === 1) {
      this.reads++;
      return collection[key];
    } else {
      this.writes++;
      value.sustained || (value.sustained = true);
      return collection[key] = value;
    }
  },
  values: function() {
    return Object.values(this.database);
  }
}, {
  type: 'object',
  writes: 0,
  reads: 0
}, function() {
  this.database || (this.database = {});
  return this;
});

model = window.model;

record = window.record;

model.storable = true;

module.exports = storable;

});

require.register("indefinido~indemma@master/lib/record/translationable.js", function (exports, module) {
var extend, extensions, root;

root = typeof exports !== "undefined" && exports !== null ? exports : window;

extend = require("pluma~assimilate@0.3.0");

extensions = {
  model: {
    human_attribute_name: function(attribute_name) {
      var _ref, _ref1;

      return ((_ref = this.translation) != null ? (_ref1 = _ref.attributes) != null ? _ref1[attribute_name] : void 0 : void 0) || attribute_name;
    }
  }
};

model.mix(function(modelable) {
  return extend(modelable, extensions.model);
});

});

require.register("indefinido~indemma@master/lib/record/validatable.js", function (exports, module) {
var errorsable, extensions, initializers, manager, messages, observable, root, stampit, type;

require("indefinido~indemma@master/lib/record/translationable.js");

root = typeof exports !== "undefined" && exports !== null ? exports : this;

stampit = require("indefinido~indemma@master/vendor/stampit.js");

observable = require("indefinido~observable@es6-modules");

type = require("component~type@1.0.0");

messages = {
  blank: function(attribute_name) {
    attribute_name = this.human_attribute_name(attribute_name);
    return "O campo " + attribute_name + " não pode ficar em branco.";
  },
  cpf: function(attribute_name) {
    attribute_name = this.human_attribute_name(attribute_name);
    return "O campo " + attribute_name + " não está válido.";
  },
  confirmation: function(attribute_name) {
    var confirmation_attribute_name;

    confirmation_attribute_name = this.human_attribute_name(attribute_name);
    attribute_name = this.human_attribute_name(attribute_name.replace('_confirmation', ''));
    return "O campo " + attribute_name + " não está de acordo com o campo " + confirmation_attribute_name + ".";
  },
  associated: function(attribute_name) {
    attribute_name = this.human_attribute_name(attribute_name);
    return "O registro associado " + attribute_name + " não é válido.";
  },
  server: function(attribute_name, options) {
    if (attribute_name === 'base') {
      return options.server_message;
    } else {
      attribute_name = this.human_attribute_name(attribute_name);
      return "" + attribute_name + " " + options.server_message + ".";
    }
  },
  type: function(attribute_name, options) {
    attribute_name = this.human_attribute_name(attribute_name);
    return "O campo " + attribute_name + " não está válido.";
  }
};

errorsable = stampit({
  add: function(attribute_name, message_key, options) {
    var translator;

    this.push([attribute_name, message_key, options]);
    this.messages[attribute_name] = '';
    translator = messages[message_key];
    if (translator != null) {
      return this.messages[attribute_name] += translator.call(this.model, attribute_name, options);
    } else {
      return this.messages[attribute_name] += message_key;
    }
  },
  clear: function() {
    var attribute_name, _results;

    if (this.length) {
      this.length = 0;
      _results = [];
      for (attribute_name in this.messages) {
        _results.push(this.messages[attribute_name] = null);
      }
      return _results;
    }
  },
  push: Array.prototype.push,
  splice: Array.prototype.splice,
  indexOf: Array.prototype.indexOf
}, {
  model: null,
  messages: null,
  length: 0
}, function() {
  this.messages = {};
  return this;
});

initializers = {
  define_triggers: function() {
    this.errors = errorsable({
      model: model[this.resource]
    });
    this.before('save', function() {
      if (this.save) {
        return this.validate();
      }
    });
    this.validated = false;
    this.validation = null;
    this.subscribe('dirty', function(value) {
      return value && (this.validated = false);
    });
    return Object.defineProperty(this, 'valid', {
      get: function() {
        this.validate();
        if (this.validation.state() === 'resolved') {
          return !this.errors.length;
        } else {
          return null;
        }
      },
      set: function() {
        throw new TypeError("You can't set the value for the valid property.");
      },
      enumerable: false
    });
  },
  create_validators: function(definitions) {
    var definition, name, validator, validator_options, _ref, _results;

    this.validators = [];
    _ref = manager.validators;
    _results = [];
    for (name in _ref) {
      validator = _ref[name];
      definition = definitions[validator.definition_key];
      if (definition) {
        if (type(definition) !== 'array') {
          definition = [definition];
        }
        _results.push((function() {
          var _i, _len, _results1;

          _results1 = [];
          for (_i = 0, _len = definition.length; _i < _len; _i++) {
            validator_options = definition[_i];
            if (type(validator_options) !== 'object') {
              validator_options = {
                attribute_name: validator_options
              };
            }
            validator_options.model = this;
            this.validators.push(validator(validator_options));
            _results1.push(delete definitions[validator.definition_key]);
          }
          return _results1;
        }).call(this));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  }
};

extensions = {
  model: {
    validators: null
  },
  record: {
    validate_attribute: function(attribute, doned, failed) {
      var results, validation, validator, _i, _len, _ref;

      this.errors.messages[attribute] = null;
      results = [this, attribute];
      _ref = model[this.resource.toString()].validators;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        validator = _ref[_i];
        if (validator.attribute_name === attribute) {
          results.push(validator.validate_each(this, validator.attribute_name, this[validator.attribute_name]));
        }
      }
      validation = jQuery.when.apply(jQuery, results);
      validation.done(doned);
      validation.fail(failed);
      return validation;
    },
    validate: function(doned, failed) {
      var results, validator, _i, _len, _ref;

      if (this.validated) {
        return this.validation;
      }
      this.errors.clear();
      results = [this];
      _ref = model[this.resource.toString()].validators;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        validator = _ref[_i];
        results.push(validator.validate_each(this, validator.attribute_name, this[validator.attribute_name]));
      }
      this.validation = jQuery.when.apply(jQuery, results);
      this.validation.done(doned);
      this.validation.fail(failed);
      return this.validation.done(function(record) {
        var old_dirty;

        old_dirty = record.dirty;
        record.dirty = null;
        record.validated || (record.validated = true);
        record.observed.dirty = old_dirty;
        return record;
      });
    }
  }
};

manager = {
  validators: {}
};

model.mix(function(modelable) {
  if (modelable.record.validate) {
    return;
  }
  jQuery.extend(modelable, extensions.model);
  jQuery.extend(modelable.record, extensions.record);
  modelable.after_mix.unshift(initializers.create_validators);
  modelable.record.after_initialize.push(initializers.define_triggers);
  return model.validators = manager.validators;
});

manager.validators.confirmation = require("indefinido~indemma@master/lib/record/validations/confirmation.js");

manager.validators.associated = require("indefinido~indemma@master/lib/record/validations/associated.js");

manager.validators.presence = require("indefinido~indemma@master/lib/record/validations/presence.js");

manager.validators.remote = require("indefinido~indemma@master/lib/record/validations/remote.js");

manager.validators.type = require("indefinido~indemma@master/lib/record/validations/type.js");

manager.validators.cpf = require("indefinido~indemma@master/lib/record/validations/cpf.js");

});

require.register("indefinido~indemma@master/lib/record/validations/associated.js", function (exports, module) {
var associationable, composed, stampit;

stampit = require("indefinido~indemma@master/vendor/stampit.js");

associationable = stampit({
  validate_each: function(record, attribute, value) {
    var associated, associated_validation;

    associated = record[attribute];
    if (associated) {
      if (model[record.resource].has_one.indexOf(attribute) === -1) {
        throw new Error('Only has_one associations are supported to validates_associated');
      }
      associated_validation = associated.validate();
      associated_validation.done(function() {
        if (associated.errors.length) {
          return record.errors.add(attribute, 'associated', this.options);
        }
      });
      return associated_validation;
    }
  }
});

composed = stampit.compose(require("indefinido~indemma@master/lib/record/validations/validatorable.js"), associationable);

composed.definition_key = 'validates_associated';

module.exports = composed;

});

require.register("indefinido~indemma@master/lib/record/validations/confirmation.js", function (exports, module) {
var composed, confirmationable, stampit;

stampit = require("indefinido~indemma@master/vendor/stampit.js");

confirmationable = stampit({
  validate_each: function(record, attribute, value) {
    if (record[attribute] !== record["" + attribute + "_confirmation"]) {
      return record.errors.add("" + attribute + "_confirmation", 'confirmation', this.options);
    }
  }
});

composed = stampit.compose(require("indefinido~indemma@master/lib/record/validations/validatorable.js"), confirmationable);

composed.definition_key = 'validates_confirmation_of';

module.exports = composed;

});

require.register("indefinido~indemma@master/lib/record/validations/cpf.js", function (exports, module) {
var composed, cpfable, stampit;

stampit = require("indefinido~indemma@master/vendor/stampit.js");

cpfable = stampit({
  validate_format: function(value) {
    var c, d1, dv, i, v, _i, _j;

    value = value.replace(/[\.\-]/g, "");
    if (value.length < 11) {
      return false;
    }
    if (value.match(/^(0+|1+|2+|3+|4+|5+|6+|7+|8+|9+)$/)) {
      return false;
    }
    c = value.substr(0, 9);
    dv = value.substr(9, 2);
    d1 = 0;
    v = false;
    i = 0;
    for (i = _i = 0; _i <= 9; i = ++_i) {
      d1 += c.charAt(i) * (10 - i);
    }
    if (d1 === 0) {
      return false;
    }
    d1 = 11 - (d1 % 11);
    if (d1 > 9) {
      d1 = 0;
    }
    if (+dv.charAt(0) !== d1) {
      return false;
    }
    d1 *= 2;
    for (i = _j = 0; _j <= 9; i = ++_j) {
      d1 += c.charAt(i) * (11 - i);
    }
    d1 = 11 - (d1 % 11);
    if (d1 > 9) {
      d1 = 0;
    }
    if (+dv.charAt(1) !== d1) {
      return false;
    }
    return true;
  },
  validate_each: function(record, attribute, value) {
    if (value && !this.validate_format(value)) {
      return record.errors.add(attribute, 'cpf', this.options);
    }
  }
});

composed = stampit.compose(require("indefinido~indemma@master/lib/record/validations/validatorable.js"), cpfable);

composed.definition_key = 'validates_cpf_format';

module.exports = composed;

});

require.register("indefinido~indemma@master/lib/record/validations/presence.js", function (exports, module) {
var composed, presenceable, stampit;

stampit = require("indefinido~indemma@master/vendor/stampit.js");

presenceable = stampit({
  validate_each: function(record, attribute, value) {
    if (value === null || value === '' || value === void 0) {
      return record.errors.add(attribute, 'blank', this.options);
    }
  }
});

composed = stampit.compose(require("indefinido~indemma@master/lib/record/validations/validatorable.js"), presenceable);

composed.definition_key = 'validates_presence_of';

module.exports = composed;

});

require.register("indefinido~indemma@master/lib/record/validations/remote.js", function (exports, module) {
var composed, remoteable, rest, stampit;

rest = require("indefinido~indemma@master/lib/record/rest.js");

stampit = require("indefinido~indemma@master/vendor/stampit.js");

remoteable = stampit({
  validate_each: function(record, attribute, value) {
    var data,
      _this = this;

    data = this.json(record);
    return this.post(data).done(function(json) {
      return _this.succeeded(json, record);
    });
  },
  json: function(record) {
    var data, param, _base;

    param = this.resource.param_name || this.resource.toString();
    data = {};
    data[param] = record.json();
    (_base = data[param]).id || (_base.id = data[param]._id);
    delete data[param]._id;
    return data;
  },
  post: function(data) {
    return jQuery.ajax({
      url: this.route,
      data: data,
      type: 'post',
      dataType: 'json',
      context: this
    });
  },
  succeeded: function(json, record) {
    var error_message, error_messages, _i, _len, _results;

    error_messages = json[this.attribute_name];
    if (!error_messages) {
      return;
    }
    _results = [];
    for (_i = 0, _len = error_messages.length; _i < _len; _i++) {
      error_message = error_messages[_i];
      _results.push(record.errors.add(this.attribute_name, 'server', {
        server_message: error_message
      }));
    }
    return _results;
  }
}, {
  message: "Remote validation failed",
  route: null
}, function() {
  var pluralized_resource;

  pluralized_resource = model.pluralize(this.model.resource.toString());
  this.resource = this.model.resource;
  this.route || (this.route = "/" + pluralized_resource + "/validate");
  return this;
});

composed = stampit.compose(require("indefinido~indemma@master/lib/record/validations/validatorable.js"), remoteable);

composed.definition_key = 'validates_remotely';

module.exports = composed;

});

require.register("indefinido~indemma@master/lib/record/validations/type.js", function (exports, module) {
var composed, stampit, typeable, validations;

validations = require("indefinido~indemma@master/lib/record/validatable.js");

stampit = require("indefinido~indemma@master/vendor/stampit.js");

typeable = stampit({
  validate_each: function(record, attribute, value) {
    this.type || (this.type = model[record.resource.toString()][attribute]);
    if (value) {
      if (value instanceof this.type) {
        this.type_name || (this.type_name = this.type.name);
        if (!value.valid) {
          return record.errors.add(attribute, 'type', {
            type_name: this.type_name != null
          });
        }
      } else {
        throw new Error("Invalid attribute value type! Found " + (typeof value) + " expected " + this.type.name);
      }
    }
  }
});

composed = stampit.compose(require("indefinido~indemma@master/lib/record/validations/validatorable.js"), typeable);

composed.definition_key = 'validates_type_of';

module.exports = composed;

});

require.register("indefinido~indemma@master/lib/record/validations/validatorable.js", function (exports, module) {
var stampit;

stampit = require("indefinido~indemma@master/vendor/stampit.js");

module.exports = stampit({
  validate: function() {
    throw new Error('Composed factory must override the validate method');
  },
  validate_each: function() {
    throw new Error('Composed factory must override the validate each method');
  }
});

});

require.register("indefinido~indemma@master/vendor/stampit.js", function (exports, module) {
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.stampit=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var forIn = _dereq_('mout/object/forIn');

function copyProp(val, key){
    this[key] = val;
}

module.exports = function mixInChain(target, objects){
    var i = 0,
        n = arguments.length,
        obj;
    while(++i < n){
        obj = arguments[i];
        if (obj != null) {
            forIn(obj, copyProp, target);
        }
    }
    return target;
};

},{"mout/object/forIn":14}],2:[function(_dereq_,module,exports){


    /**
     * Array forEach
     */
    function forEach(arr, callback, thisObj) {
        if (arr == null) {
            return;
        }
        var i = -1,
            len = arr.length;
        while (++i < len) {
            // we iterate over sparse items since there is no way to make it
            // work properly on IE 7-8. see #64
            if ( callback.call(thisObj, arr[i], i, arr) === false ) {
                break;
            }
        }
    }

    module.exports = forEach;



},{}],3:[function(_dereq_,module,exports){
var forEach = _dereq_('./forEach');
var makeIterator = _dereq_('../function/makeIterator_');

    /**
     * Array map
     */
    function map(arr, callback, thisObj) {
        callback = makeIterator(callback, thisObj);
        var results = [];
        if (arr == null){
            return results;
        }

        var i = -1, len = arr.length;
        while (++i < len) {
            results[i] = callback(arr[i], i, arr);
        }

        return results;
    }

     module.exports = map;


},{"../function/makeIterator_":4,"./forEach":2}],4:[function(_dereq_,module,exports){
var prop = _dereq_('./prop');
var deepMatches = _dereq_('../object/deepMatches');

    /**
     * Converts argument into a valid iterator.
     * Used internally on most array/object/collection methods that receives a
     * callback/iterator providing a shortcut syntax.
     */
    function makeIterator(src, thisObj){
        switch(typeof src) {
            case 'object':
                // typeof null == "object"
                return (src != null)? function(val, key, target){
                    return deepMatches(val, src);
                } : src;
            case 'string':
            case 'number':
                return prop(src);
            case 'function':
                if (typeof thisObj === 'undefined') {
                    return src;
                } else {
                    return function(val, i, arr){
                        return src.call(thisObj, val, i, arr);
                    };
                }
            default:
                return src;
        }
    }

    module.exports = makeIterator;



},{"../object/deepMatches":13,"./prop":5}],5:[function(_dereq_,module,exports){


    /**
     * Returns a function that gets a property of the passed object
     */
    function prop(name){
        return function(obj){
            return obj[name];
        };
    }

    module.exports = prop;



},{}],6:[function(_dereq_,module,exports){
var kindOf = _dereq_('./kindOf');
var isPlainObject = _dereq_('./isPlainObject');
var mixIn = _dereq_('../object/mixIn');

    /**
     * Clone native types.
     */
    function clone(val){
        switch (kindOf(val)) {
            case 'Object':
                return cloneObject(val);
            case 'Array':
                return cloneArray(val);
            case 'RegExp':
                return cloneRegExp(val);
            case 'Date':
                return cloneDate(val);
            default:
                return val;
        }
    }

    function cloneObject(source) {
        if (isPlainObject(source)) {
            return mixIn({}, source);
        } else {
            return source;
        }
    }

    function cloneRegExp(r) {
        var flags = '';
        flags += r.multiline ? 'm' : '';
        flags += r.global ? 'g' : '';
        flags += r.ignorecase ? 'i' : '';
        return new RegExp(r.source, flags);
    }

    function cloneDate(date) {
        return new Date(+date);
    }

    function cloneArray(arr) {
        return arr.slice();
    }

    module.exports = clone;



},{"../object/mixIn":18,"./isPlainObject":11,"./kindOf":12}],7:[function(_dereq_,module,exports){
var clone = _dereq_('./clone');
var forOwn = _dereq_('../object/forOwn');
var kindOf = _dereq_('./kindOf');
var isPlainObject = _dereq_('./isPlainObject');

    /**
     * Recursively clone native types.
     */
    function deepClone(val, instanceClone) {
        switch ( kindOf(val) ) {
            case 'Object':
                return cloneObject(val, instanceClone);
            case 'Array':
                return cloneArray(val, instanceClone);
            default:
                return clone(val);
        }
    }

    function cloneObject(source, instanceClone) {
        if (isPlainObject(source)) {
            var out = {};
            forOwn(source, function(val, key) {
                this[key] = deepClone(val, instanceClone);
            }, out);
            return out;
        } else if (instanceClone) {
            return instanceClone(source);
        } else {
            return source;
        }
    }

    function cloneArray(arr, instanceClone) {
        var out = [],
            i = -1,
            n = arr.length,
            val;
        while (++i < n) {
            out[i] = deepClone(arr[i], instanceClone);
        }
        return out;
    }

    module.exports = deepClone;




},{"../object/forOwn":15,"./clone":6,"./isPlainObject":11,"./kindOf":12}],8:[function(_dereq_,module,exports){
var isKind = _dereq_('./isKind');
    /**
     */
    var isArray = Array.isArray || function (val) {
        return isKind(val, 'Array');
    };
    module.exports = isArray;


},{"./isKind":9}],9:[function(_dereq_,module,exports){
var kindOf = _dereq_('./kindOf');
    /**
     * Check if value is from a specific "kind".
     */
    function isKind(val, kind){
        return kindOf(val) === kind;
    }
    module.exports = isKind;


},{"./kindOf":12}],10:[function(_dereq_,module,exports){
var isKind = _dereq_('./isKind');
    /**
     */
    function isObject(val) {
        return isKind(val, 'Object');
    }
    module.exports = isObject;


},{"./isKind":9}],11:[function(_dereq_,module,exports){


    /**
     * Checks if the value is created by the `Object` constructor.
     */
    function isPlainObject(value) {
        return (!!value
            && typeof value === 'object'
            && value.constructor === Object);
    }

    module.exports = isPlainObject;



},{}],12:[function(_dereq_,module,exports){


    var _rKind = /^\[object (.*)\]$/,
        _toString = Object.prototype.toString,
        UNDEF;

    /**
     * Gets the "kind" of value. (e.g. "String", "Number", etc)
     */
    function kindOf(val) {
        if (val === null) {
            return 'Null';
        } else if (val === UNDEF) {
            return 'Undefined';
        } else {
            return _rKind.exec( _toString.call(val) )[1];
        }
    }
    module.exports = kindOf;


},{}],13:[function(_dereq_,module,exports){
var forOwn = _dereq_('./forOwn');
var isArray = _dereq_('../lang/isArray');

    function containsMatch(array, pattern) {
        var i = -1, length = array.length;
        while (++i < length) {
            if (deepMatches(array[i], pattern)) {
                return true;
            }
        }

        return false;
    }

    function matchArray(target, pattern) {
        var i = -1, patternLength = pattern.length;
        while (++i < patternLength) {
            if (!containsMatch(target, pattern[i])) {
                return false;
            }
        }

        return true;
    }

    function matchObject(target, pattern) {
        var result = true;
        forOwn(pattern, function(val, key) {
            if (!deepMatches(target[key], val)) {
                // Return false to break out of forOwn early
                return (result = false);
            }
        });

        return result;
    }

    /**
     * Recursively check if the objects match.
     */
    function deepMatches(target, pattern){
        if (target && typeof target === 'object') {
            if (isArray(target) && isArray(pattern)) {
                return matchArray(target, pattern);
            } else {
                return matchObject(target, pattern);
            }
        } else {
            return target === pattern;
        }
    }

    module.exports = deepMatches;



},{"../lang/isArray":8,"./forOwn":15}],14:[function(_dereq_,module,exports){


    var _hasDontEnumBug,
        _dontEnums;

    function checkDontEnum(){
        _dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];

        _hasDontEnumBug = true;

        for (var key in {'toString': null}) {
            _hasDontEnumBug = false;
        }
    }

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forIn(obj, fn, thisObj){
        var key, i = 0;
        // no need to check if argument is a real object that way we can use
        // it for arrays, functions, date, etc.

        //post-pone check till needed
        if (_hasDontEnumBug == null) checkDontEnum();

        for (key in obj) {
            if (exec(fn, obj, key, thisObj) === false) {
                break;
            }
        }

        if (_hasDontEnumBug) {
            while (key = _dontEnums[i++]) {
                // since we aren't using hasOwn check we need to make sure the
                // property was overwritten
                if (obj[key] !== Object.prototype[key]) {
                    if (exec(fn, obj, key, thisObj) === false) {
                        break;
                    }
                }
            }
        }
    }

    function exec(fn, obj, key, thisObj){
        return fn.call(thisObj, obj[key], key, obj);
    }

    module.exports = forIn;



},{}],15:[function(_dereq_,module,exports){
var hasOwn = _dereq_('./hasOwn');
var forIn = _dereq_('./forIn');

    /**
     * Similar to Array/forEach but works over object properties and fixes Don't
     * Enum bug on IE.
     * based on: http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
     */
    function forOwn(obj, fn, thisObj){
        forIn(obj, function(val, key){
            if (hasOwn(obj, key)) {
                return fn.call(thisObj, obj[key], key, obj);
            }
        });
    }

    module.exports = forOwn;



},{"./forIn":14,"./hasOwn":16}],16:[function(_dereq_,module,exports){


    /**
     * Safer Object.hasOwnProperty
     */
     function hasOwn(obj, prop){
         return Object.prototype.hasOwnProperty.call(obj, prop);
     }

     module.exports = hasOwn;



},{}],17:[function(_dereq_,module,exports){
var hasOwn = _dereq_('./hasOwn');
var deepClone = _dereq_('../lang/deepClone');
var isObject = _dereq_('../lang/isObject');

    /**
     * Deep merge objects.
     */
    function merge() {
        var i = 1,
            key, val, obj, target;

        // make sure we don't modify source element and it's properties
        // objects are passed by reference
        target = deepClone( arguments[0] );

        while (obj = arguments[i++]) {
            for (key in obj) {
                if ( ! hasOwn(obj, key) ) {
                    continue;
                }

                val = obj[key];

                if ( isObject(val) && isObject(target[key]) ){
                    // inception, deep merge objects
                    target[key] = merge(target[key], val);
                } else {
                    // make sure arrays, regexp, date, objects are cloned
                    target[key] = deepClone(val);
                }

            }
        }

        return target;
    }

    module.exports = merge;



},{"../lang/deepClone":7,"../lang/isObject":10,"./hasOwn":16}],18:[function(_dereq_,module,exports){
var forOwn = _dereq_('./forOwn');

    /**
    * Combine properties from all the objects into first one.
    * - This method affects target object in place, if you want to create a new Object pass an empty object as first param.
    * @param {object} target    Target Object
    * @param {...object} objects    Objects to be combined (0...n objects).
    * @return {object} Target Object.
    */
    function mixIn(target, objects){
        var i = 0,
            n = arguments.length,
            obj;
        while(++i < n){
            obj = arguments[i];
            if (obj != null) {
                forOwn(obj, copyProp, target);
            }
        }
        return target;
    }

    function copyProp(val, key){
        this[key] = val;
    }

    module.exports = mixIn;


},{"./forOwn":15}],19:[function(_dereq_,module,exports){
/**
 * Stampit
 **
 * Create objects from reusable, composable behaviors.
 **
 * Copyright (c) 2013 Eric Elliott
 * http://opensource.org/licenses/MIT
 **/
'use strict';
var forEach = _dereq_('mout/array/forEach');
var mixIn = _dereq_('mout/object/mixIn');
var merge = _dereq_('mout/object/merge');
var map = _dereq_('mout/array/map');
var forOwn = _dereq_('mout/object/forOwn');
var mixInChain = _dereq_('./mixinchain.js');
var slice = [].slice;

var create = function (o) {
  if (arguments.length > 1) {
    throw new Error('Object.create implementation only accepts the first parameter.');
  }
  function F() {}
  F.prototype = o;
  return new F();
};

if(!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}

var extractFunctions = function extractFunctions(arg) {
  var arr = [],
    args = [].slice.call(arguments);

  if (typeof arg === 'function') {
    arr = map(args, function (fn) {
      if (typeof fn === 'function') {
        return fn;
      }
    });
  } else if (typeof arg === 'object') {
    forEach(args, function (obj) {
      forOwn(obj, function (fn) {
        arr.push(fn);
      });
    });
  } else if ( Array.isArray(arg) ) {
    forEach(arg, function (fn) {
      arr.push(fn);
    });
  }
  return arr;
};

/**
 * Return a factory function that will produce new objects using the
 * prototypes that are passed in or composed.
 *
 * @param  {Object} [methods] A map of method names and bodies for delegation.
 * @param  {Object} [state]   A map of property names and values to clone for each new object.
 * @param  {Function} [enclose] A closure (function) used to create private data and privileged methods.
 * @return {Function} factory A factory to produce objects using the given prototypes.
 * @return {Function} factory.create Just like calling the factory function.
 * @return {Object} factory.fixed An object map containing the fixed prototypes.
 * @return {Function} factory.methods Add methods to the methods prototype. Chainable.
 * @return {Function} factory.state Add properties to the state prototype. Chainable.
 * @return {Function} factory.enclose Add or replace the closure prototype. Not chainable.
 */
var stampit = function stampit(methods, state, enclose) {
  var fixed = {
      methods: methods || {},
      state: state,
      enclose: extractFunctions(enclose)
    },

    factory = function factory(properties) {
      var state = merge({}, fixed.state),
        instance = mixIn(create(fixed.methods || {}),
          state, properties),
        closures = fixed.enclose,
        args = slice.call(arguments, 1);

      forEach(closures, function (fn) {
        if (typeof fn === 'function') {
          instance = fn.apply(instance, args) || instance;
        }
      });

      return instance;
    };

  return mixIn(factory, {
    create: factory,
    fixed: fixed,
    /**
     * Take n objects and add them to the methods prototype.
     * @return {Object} stamp  The factory in question (`this`).
     */
    methods: function stampMethods() {
      var obj = fixed.methods || {},
        args = [obj].concat([].slice.call(arguments));
      fixed.methods = mixInChain.apply(this, args);
      return this;
    },
    /**
     * Take n objects and add them to the state prototype.
     * @return {Object} stamp  The factory in question (`this`).
     */
    state: function stampState() {
      var obj = fixed.state || {},
        args = [obj].concat([].slice.call(arguments));
      fixed.state = mixIn.apply(this, args);
      return this;
    },
    /**
     * Take n functions, an array of functions, or n objects and add
     * the functions to the enclose prototype.
     * @return {Object} stamp  The factory in question (`this`).
     */
    enclose: function stampEnclose() {
      fixed.enclose = fixed.enclose
        .concat( extractFunctions.apply(null, arguments) );
      return this;
    }
  });
};

/**
 * Take two or more factories produced from stampit() and
 * combine them to produce a new factory. Combining overrides
 * properties with last-in priority.
 *
 * @param {...Function} factory A factory produced by stampit().
 * @return {Function} A new stampit factory composed from arguments.
 */
var compose = function compose() {
  var args = [].slice.call(arguments),
    obj = stampit();

  forEach(args, function (source) {
    if (source) {
      if (source.fixed.methods) {
        obj.fixed.methods = mixInChain({}, obj.fixed.methods,
          source.fixed.methods);
      }

      if (source.fixed.state) {
        obj.fixed.state = mixIn({}, obj.fixed.state,
          source.fixed.state);
      }

      if (source.fixed.enclose) {
        obj.fixed.enclose = obj.fixed.enclose
          .concat(source.fixed.enclose);
      }
    }
  });

  return stampit(obj.fixed.methods, obj.fixed.state,
    obj.fixed.enclose);
};

/**
 * Take an old-fashioned JS constructor and return a stampit stamp
 * that you can freely compose with other stamps.
 * @param  {Function} Constructor 
 * @return {Function}             A composable stampit factory
 *                                (aka stamp).
 */
var convertConstructor = function convertConstructor(Constructor) {
  return stampit().methods(Constructor.prototype).enclose(Constructor);
};

module.exports = mixIn(stampit, {
  compose: compose,
  /**
   * Alias for mixIn
   */
  extend: mixIn,
  /**
   * Take a destination object followed by one or more source objects,
   * and copy the source object properties to the destination object,
   * with last in priority overrides.
   * @param {Object} destination An object to copy properties to.
   * @param {...Object} source An object to copy properties from.
   * @returns {Object}
   */
  mixIn: mixIn,

  convertConstructor: convertConstructor
});

},{"./mixinchain.js":1,"mout/array/forEach":2,"mout/array/map":3,"mout/object/forOwn":15,"mout/object/merge":17,"mout/object/mixIn":18}]},{},[19])
(19)
});
});

require.register("indefinido~indemma@master/vendor/owl/pluralize.js", function (exports, module) {
/* This file is part of OWL Pluralization.

OWL Pluralization is free software: you can redistribute it and/or 
modify it under the terms of the GNU Lesser General Public License
as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

OWL Pluralization is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public 
License along with OWL Pluralization.  If not, see 
<http://www.gnu.org/licenses/>.
*/

// prepare the owl namespace.
if ( typeof owl === 'undefined' ) owl = {};

owl.pluralize = (function() {
	var userDefined = {};

	function capitalizeSame(word, sampleWord) {
		if ( sampleWord.match(/^[A-Z]/) ) {
			return word.charAt(0).toUpperCase() + word.slice(1);
		} else {
			return word;
		}
	}

	// returns a plain Object having the given keys,
	// all with value 1, which can be used for fast lookups.
	function toKeys(keys) {
		keys = keys.split(',');
		var keysLength = keys.length;
		var table = {};
		for ( var i=0; i < keysLength; i++ ) {
			table[ keys[i] ] = 1;
		}
		return table;
	}

	// words that are always singular, always plural, or the same in both forms.
	var uninflected = toKeys("aircraft,advice,blues,corn,molasses,equipment,gold,information,cotton,jewelry,kin,legislation,luck,luggage,moose,music,offspring,rice,silver,trousers,wheat,bison,bream,breeches,britches,carp,chassis,clippers,cod,contretemps,corps,debris,diabetes,djinn,eland,elk,flounder,gallows,graffiti,headquarters,herpes,high,homework,innings,jackanapes,mackerel,measles,mews,mumps,news,pincers,pliers,proceedings,rabies,salmon,scissors,sea,series,shears,species,swine,trout,tuna,whiting,wildebeest,pike,oats,tongs,dregs,snuffers,victuals,tweezers,vespers,pinchers,bellows,cattle");

	var irregular = {
		// pronouns
		I: 'we',
		you: 'you',
		he: 'they',
		it: 'they',  // or them
		me: 'us',
		you: 'you',
		him: 'them',
		them: 'them',
		myself: 'ourselves',
		yourself: 'yourselves',
		himself: 'themselves',
		herself: 'themselves',
		itself: 'themselves',
		themself: 'themselves',
		oneself: 'oneselves',

		child: 'children',
		dwarf: 'dwarfs',  // dwarfs are real; dwarves are fantasy.
		mongoose: 'mongooses',
		mythos: 'mythoi',
		ox: 'oxen',
		soliloquy: 'soliloquies',
		trilby: 'trilbys',
		person: 'people',
		forum: 'forums', // fora is ok but uncommon.

		// latin plural in popular usage.
		syllabus: 'syllabi',
		alumnus: 'alumni', 
		genus: 'genera',
		viscus: 'viscera',
		stigma: 'stigmata'
	};

	var suffixRules = [
		// common suffixes
		[ /man$/i, 'men' ],
		[ /([lm])ouse$/i, '$1ice' ],
		[ /tooth$/i, 'teeth' ],
		[ /goose$/i, 'geese' ],
		[ /foot$/i, 'feet' ],
		[ /zoon$/i, 'zoa' ],
		[ /([tcsx])is$/i, '$1es' ],

		// fully assimilated suffixes
		[ /ix$/i, 'ices' ],
		[ /^(cod|mur|sil|vert)ex$/i, '$1ices' ],
		[ /^(agend|addend|memorand|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi)um$/i, '$1a' ],
		[ /^(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|\w+hedr)on$/i, '$1a' ],
		[ /^(alumn|alg|vertebr)a$/i, '$1ae' ],
		
		// churches, classes, boxes, etc.
		[ /([cs]h|ss|x)$/i, '$1es' ],

		// words with -ves plural form
		[ /([aeo]l|[^d]ea|ar)f$/i, '$1ves' ],
		[ /([nlw]i)fe$/i, '$1ves' ],

		// -y
		[ /([aeiou])y$/i, '$1ys' ],
		[ /(^[A-Z][a-z]*)y$/, '$1ys' ], // case sensitive!
		[ /y$/i, 'ies' ],

		// -o
		[ /([aeiou])o$/i, '$1os' ],
		[ /^(pian|portic|albin|generalissim|manifest|archipelag|ghett|medic|armadill|guan|octav|command|infern|phot|ditt|jumb|pr|dynam|ling|quart|embry|lumbag|rhin|fiasc|magnet|styl|alt|contralt|sopran|bass|crescend|temp|cant|sol|kimon)o$/i, '$1os' ],
		[ /o$/i, 'oes' ],

		// words ending in s...
		[ /s$/i, 'ses' ]
	];

	// pluralizes the given singular noun.  There are three ways to call it:
	//   pluralize(noun) -> pluralNoun
	//     Returns the plural of the given noun.
	//   Example: 
	//     pluralize("person") -> "people"
	//     pluralize("me") -> "us"
	//
	//   pluralize(noun, count) -> plural or singular noun
	//   Inflect the noun according to the count, returning the singular noun
	//   if the count is 1.
	//   Examples:
	//     pluralize("person", 3) -> "people"
	//     pluralize("person", 1) -> "person"
	//     pluralize("person", 0) -> "people"
	//
	//   pluralize(noun, count, plural) -> plural or singular noun
	//   you can provide an irregular plural yourself as the 3rd argument.
	//   Example:
	//     pluralize("château", 2 "châteaux") -> "châteaux"
	function pluralize(word, count, plural) {
		// handle the empty string reasonably.
		if ( word === '' ) return '';

		// singular case.
		if ( count === 1 ) return word;

		// life is very easy if an explicit plural was provided.
		if ( typeof plural === 'string' ) return plural;

		var lowerWord = word.toLowerCase();

		// user defined rules have the highest priority.
		if ( lowerWord in userDefined ) {
			return capitalizeSame(userDefined[lowerWord], word);
		}

		// single letters are pluralized with 's, "I got five A's on
		// my report card."
		if ( word.match(/^[A-Z]$/) ) return word + "'s";

		// some word don't change form when plural.
		if ( word.match(/fish$|ois$|sheep$|deer$|pox$|itis$/i) ) return word;
		if ( word.match(/^[A-Z][a-z]*ese$/) ) return word;  // Nationalities.
		if ( lowerWord in uninflected ) return word;

		// there's a known set of words with irregular plural forms.
		if ( lowerWord in irregular ) {
			return capitalizeSame(irregular[lowerWord], word);
		}
		
		// try to pluralize the word depending on its suffix.
		var suffixRulesLength = suffixRules.length;
		for ( var i=0; i < suffixRulesLength; i++ ) {
			var rule = suffixRules[i];
			if ( word.match(rule[0]) ) {
				return word.replace(rule[0], rule[1]);
			}
		}

		// if all else fails, just add s.
		return word + 's';
	}

	pluralize.define = function(word, plural) {
		userDefined[word.toLowerCase()] = plural;
	}

	return pluralize;

})();

});

require.register("ende", function (exports, module) {
/*!
 * accounting.js v0.3.2
 * Copyright 2011, Joss Crowcroft
 *
 * Freely distributable under the MIT license.
 * Portions of accounting.js are inspired or borrowed from underscore.js
 *
 * Full details and documentation:
 * http://josscrowcroft.github.com/accounting.js/
 */

(function(root, undefined) {

    /* --- Setup --- */

    // Create the local library object, to be exported or referenced globally later
    var lib = {};

    // Current version
    lib.version = '0.3.2';


    /* --- Exposed settings --- */

    // The library's settings configuration object. Contains default parameters for
    // currency and number formatting
    lib.settings = {
        currency: {
            symbol : "$",		// default currency symbol is '$'
            format : "%s%v",	// controls output: %s = symbol, %v = value (can be object, see docs)
            decimal : ".",		// decimal point separator
            thousand : ",",		// thousands separator
            precision : 2,		// decimal places
            grouping : 3		// digit grouping (not implemented yet)
        },
        number: {
            precision : 0,		// default precision on numbers is 0
            grouping : 3,		// digit grouping (not implemented yet)
            thousand : ",",
            decimal : "."
        }
    };


    /* --- Internal Helper Methods --- */

    // Store reference to possibly-available ECMAScript 5 methods for later
    var nativeMap = Array.prototype.map,
        nativeIsArray = Array.isArray,
        toString = Object.prototype.toString;

    /**
     * Tests whether supplied parameter is a string
     * from underscore.js
     */
    function isString(obj) {
        return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
    }

    /**
     * Tests whether supplied parameter is a string
     * from underscore.js, delegates to ECMA5's native Array.isArray
     */
    function isArray(obj) {
        return nativeIsArray ? nativeIsArray(obj) : toString.call(obj) === '[object Array]';
    }

    /**
     * Tests whether supplied parameter is a true object
     */
    function isObject(obj) {
        return obj && toString.call(obj) === '[object Object]';
    }

    /**
     * Extends an object with a defaults object, similar to underscore's _.defaults
     *
     * Used for abstracting parameter handling from API methods
     */
    function defaults(object, defs) {
        var key;
        object = object || {};
        defs = defs || {};
        // Iterate over object non-prototype properties:
        for (key in defs) {
            if (defs.hasOwnProperty(key)) {
                // Replace values with defaults only if undefined (allow empty/zero values):
                if (object[key] == null) object[key] = defs[key];
            }
        }
        return object;
    }

    /**
     * Implementation of `Array.map()` for iteration loops
     *
     * Returns a new Array as a result of calling `iterator` on each array value.
     * Defers to native Array.map if available
     */
    function map(obj, iterator, context) {
        var results = [], i, j;

        if (!obj) return results;

        // Use native .map method if it exists:
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);

        // Fallback for native .map:
        for (i = 0, j = obj.length; i < j; i++ ) {
            results[i] = iterator.call(context, obj[i], i, obj);
        }
        return results;
    }

    /**
     * Check and normalise the value of precision (must be positive integer)
     */
    function checkPrecision(val, base) {
        val = Math.round(Math.abs(val));
        return isNaN(val)? base : val;
    }


    /**
     * Parses a format string or object and returns format obj for use in rendering
     *
     * `format` is either a string with the default (positive) format, or object
     * containing `pos` (required), `neg` and `zero` values (or a function returning
     * either a string or object)
     *
     * Either string or format.pos must contain "%v" (value) to be valid
     */
    function checkCurrencyFormat(format) {
        var defaults = lib.settings.currency.format;

        // Allow function as format parameter (should return string or object):
        if ( typeof format === "function" ) format = format();

        // Format can be a string, in which case `value` ("%v") must be present:
        if ( isString( format ) && format.match("%v") ) {

            // Create and return positive, negative and zero formats:
            return {
                pos : format,
                neg : format.replace("-", "").replace("%v", "-%v"),
                zero : format
            };

        // If no format, or object is missing valid positive value, use defaults:
        } else if ( !format || !format.pos || !format.pos.match("%v") ) {

            // If defaults is a string, casts it to an object for faster checking next time:
            return ( !isString( defaults ) ) ? defaults : lib.settings.currency.format = {
                pos : defaults,
                neg : defaults.replace("%v", "-%v"),
                zero : defaults
            };

        }
        // Otherwise, assume format was fine:
        return format;
    }


    /* --- API Methods --- */

    /**
     * Takes a string/array of strings, removes all formatting/cruft and returns the raw float value
     * alias: accounting.`parse(string)`
     *
     * Decimal must be included in the regular expression to match floats (defaults to
     * accounting.settings.number.decimal), so if the number uses a non-standard decimal
     * separator, provide it as the second argument.
     *
     * Also matches bracketed negatives (eg. "$ (1.99)" => -1.99)
     *
     * Doesn't throw any errors (`NaN`s become 0) but this may change in future
     */
    var unformat = lib.unformat = lib.parse = function(value, decimal) {
        // Recursively unformat arrays:
        if (isArray(value)) {
            return map(value, function(val) {
                return unformat(val, decimal);
            });
        }

        // Fails silently (need decent errors):
        value = value || 0;

        // Return the value as-is if it's already a number:
        if (typeof value === "number") return value;

        // Default decimal point comes from settings, but could be set to eg. "," in opts:
        decimal = decimal || lib.settings.number.decimal;

         // Build regex to strip out everything except digits, decimal point and minus sign:
        var regex = new RegExp("[^0-9-" + decimal + "]", ["g"]),
            unformatted = parseFloat(
                ("" + value)
                .replace(/\((.*)\)/, "-$1") // replace bracketed values with negatives
                .replace(regex, '')         // strip out any cruft
                .replace(decimal, '.')      // make sure decimal point is standard
            );

        // This will fail silently which may cause trouble, let's wait and see:
        return !isNaN(unformatted) ? unformatted : 0;
    };


    /**
     * Implementation of toFixed() that treats floats more like decimals
     *
     * Fixes binary rounding issues (eg. (0.615).toFixed(2) === "0.61") that present
     * problems for accounting- and finance-related software.
     */
    var toFixed = lib.toFixed = function(value, precision) {
        precision = checkPrecision(precision, lib.settings.number.precision);
        var power = Math.pow(10, precision);

        // Multiply up by precision, round accurately, then divide and use native toFixed():
        return (Math.round(lib.unformat(value) * power) / power).toFixed(precision);
    };


    /**
     * Format a number, with comma-separated thousands and custom precision/decimal places
     *
     * Localise by overriding the precision and thousand / decimal separators
     * 2nd parameter `precision` can be an object matching `settings.number`
     */
    var formatNumber = lib.formatNumber = function(number, precision, thousand, decimal) {
        // Resursively format arrays:
        if (isArray(number)) {
            return map(number, function(val) {
                return formatNumber(val, precision, thousand, decimal);
            });
        }

        // Clean up number:
        number = unformat(number);

        // Build options object from second param (if object) or all params, extending defaults:
        var opts = defaults(
                (isObject(precision) ? precision : {
                    precision : precision,
                    thousand : thousand,
                    decimal : decimal
                }),
                lib.settings.number
            ),

            // Clean up precision
            usePrecision = checkPrecision(opts.precision),

            // Do some calc:
            negative = number < 0 ? "-" : "",
            base = parseInt(toFixed(Math.abs(number || 0), usePrecision), 10) + "",
            mod = base.length > 3 ? base.length % 3 : 0;

        // Format the number:
        return negative + (mod ? base.substr(0, mod) + opts.thousand : "") + base.substr(mod).replace(/(\d{3})(?=\d)/g, "$1" + opts.thousand) + (usePrecision ? opts.decimal + toFixed(Math.abs(number), usePrecision).split('.')[1] : "");
    };


    /**
     * Format a number into currency
     *
     * Usage: accounting.formatMoney(number, symbol, precision, thousandsSep, decimalSep, format)
     * defaults: (0, "$", 2, ",", ".", "%s%v")
     *
     * Localise by overriding the symbol, precision, thousand / decimal separators and format
     * Second param can be an object matching `settings.currency` which is the easiest way.
     *
     * To do: tidy up the parameters
     */
    var formatMoney = lib.formatMoney = function(number, symbol, precision, thousand, decimal, format) {
        // Resursively format arrays:
        if (isArray(number)) {
            return map(number, function(val){
                return formatMoney(val, symbol, precision, thousand, decimal, format);
            });
        }

        // Clean up number:
        number = unformat(number);

        // Build options object from second param (if object) or all params, extending defaults:
        var opts = defaults(
                (isObject(symbol) ? symbol : {
                    symbol : symbol,
                    precision : precision,
                    thousand : thousand,
                    decimal : decimal,
                    format : format
                }),
                lib.settings.currency
            ),

            // Check format (returns object with pos, neg and zero):
            formats = checkCurrencyFormat(opts.format),

            // Choose which format to use for this value:
            useFormat = number > 0 ? formats.pos : number < 0 ? formats.neg : formats.zero;

        // Return with currency symbol added:
        return useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(number), checkPrecision(opts.precision), opts.thousand, opts.decimal));
    };


    /**
     * Format a list of numbers into an accounting column, padding with whitespace
     * to line up currency symbols, thousand separators and decimals places
     *
     * List should be an array of numbers
     * Second parameter can be an object containing keys that match the params
     *
     * Returns array of accouting-formatted number strings of same length
     *
     * NB: `white-space:pre` CSS rule is required on the list container to prevent
     * browsers from collapsing the whitespace in the output strings.
     */
    lib.formatColumn = function(list, symbol, precision, thousand, decimal, format) {
        if (!list) return [];

        // Build options object from second param (if object) or all params, extending defaults:
        var opts = defaults(
                (isObject(symbol) ? symbol : {
                    symbol : symbol,
                    precision : precision,
                    thousand : thousand,
                    decimal : decimal,
                    format : format
                }),
                lib.settings.currency
            ),

            // Check format (returns object with pos, neg and zero), only need pos for now:
            formats = checkCurrencyFormat(opts.format),

            // Whether to pad at start of string or after currency symbol:
            padAfterSymbol = formats.pos.indexOf("%s") < formats.pos.indexOf("%v") ? true : false,

            // Store value for the length of the longest string in the column:
            maxLength = 0,

            // Format the list according to options, store the length of the longest string:
            formatted = map(list, function(val, i) {
                if (isArray(val)) {
                    // Recursively format columns if list is a multi-dimensional array:
                    return lib.formatColumn(val, opts);
                } else {
                    // Clean up the value
                    val = unformat(val);

                    // Choose which format to use for this value (pos, neg or zero):
                    var useFormat = val > 0 ? formats.pos : val < 0 ? formats.neg : formats.zero,

                        // Format this value, push into formatted list and save the length:
                        fVal = useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(val), checkPrecision(opts.precision), opts.thousand, opts.decimal));

                    if (fVal.length > maxLength) maxLength = fVal.length;
                    return fVal;
                }
            });

        // Pad each number in the list and send back the column of numbers:
        return map(formatted, function(val, i) {
            // Only if this is a string (not a nested array, which would have already been padded):
            if (isString(val) && val.length < maxLength) {
                // Depending on symbol position, pad after symbol or at index 0:
                return padAfterSymbol ? val.replace(opts.symbol, opts.symbol+(new Array(maxLength - val.length + 1).join(" "))) : (new Array(maxLength - val.length + 1).join(" ")) + val;
            }
            return val;
        });
    };


    /* --- Module Definition --- */

    // Export accounting for CommonJS. If being loaded as an AMD module, define it as such.
    // Otherwise, just add `accounting` to the global object
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = lib;
        }
        exports.accounting = lib;
    } else if (typeof define === 'function' && define.amd) {
        // Return the library as an AMD module:
        define('vendor/accounting', [], function() {
            return lib;
        });
    } else {
        // Use accounting.noConflict to restore `accounting` back to its original value.
        // Returns a reference to the library's `accounting` object;
        // e.g. `var numbers = accounting.noConflict();`
        lib.noConflict = (function(oldAccounting) {
            return function() {
                // Reset the value of the root's `accounting` variable:
                root.accounting = oldAccounting;
                // Delete the noConflict method:
                lib.noConflict = undefined;
                // Return reference to the library to re-assign it:
                return lib;
            };
        })(root.accounting);

        // Declare `fx` on the root (global/window) object:
        root['accounting'] = lib;
    }

    // Root will be `window` in browser or `global` on the server:
}(this));

});

require.register("ende/vendor/assets/javascripts/jquery/inputmask.extensions.js", function (exports, module) {
/*
Input Mask plugin extensions
http://github.com/RobinHerbots/jquery.inputmask
Copyright (c) 2010 - 2014 Robin Herbots
Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
Version: 0.0.0

Optional extensions on the jquery.inputmask base
*/
(function ($) {
    //extra definitions
    $.extend($.inputmask.defaults.definitions, {
        'A': {
            validator: "[A-Za-z]",
            cardinality: 1,
            casing: "upper" //auto uppercasing
        },
        '#': {
            validator: "[A-Za-z\u0410-\u044F\u0401\u04510-9]",
            cardinality: 1,
            casing: "upper"
        }
    });
    $.extend($.inputmask.defaults.aliases, {
        'url': {
            mask: "ir",
            placeholder: "",
            separator: "",
            defaultPrefix: "http://",
            regex: {
                urlpre1: new RegExp("[fh]"),
                urlpre2: new RegExp("(ft|ht)"),
                urlpre3: new RegExp("(ftp|htt)"),
                urlpre4: new RegExp("(ftp:|http|ftps)"),
                urlpre5: new RegExp("(ftp:/|ftps:|http:|https)"),
                urlpre6: new RegExp("(ftp://|ftps:/|http:/|https:)"),
                urlpre7: new RegExp("(ftp://|ftps://|http://|https:/)"),
                urlpre8: new RegExp("(ftp://|ftps://|http://|https://)")
            },
            definitions: {
                'i': {
                    validator: function (chrs, buffer, pos, strict, opts) {
                        return true;
                    },
                    cardinality: 8,
                    prevalidator: (function () {
                        var result = [], prefixLimit = 8;
                        for (var i = 0; i < prefixLimit; i++) {
                            result[i] = (function () {
                                var j = i;
                                return {
                                    validator: function (chrs, buffer, pos, strict, opts) {
                                        if (opts.regex["urlpre" + (j + 1)]) {
                                            var tmp = chrs, k;
                                            if (((j + 1) - chrs.length) > 0) {
                                                tmp = buffer.join('').substring(0, ((j + 1) - chrs.length)) + "" + tmp;
                                            }
                                            var isValid = opts.regex["urlpre" + (j + 1)].test(tmp);
                                            if (!strict && !isValid) {
                                                pos = pos - j;
                                                for (k = 0; k < opts.defaultPrefix.length; k++) {
                                                    buffer[pos] = opts.defaultPrefix[k]; pos++;
                                                }
                                                for (k = 0; k < tmp.length - 1; k++) {
                                                    buffer[pos] = tmp[k]; pos++;
                                                }
                                                return { "pos": pos };
                                            }
                                            return isValid;
                                        } else {
                                            return false;
                                        }
                                    }, cardinality: j
                                };
                            })();
                        }
                        return result;
                    })()
                },
                "r": {
                    validator: ".",
                    cardinality: 50
                }
            },
            insertMode: false,
            autoUnmask: false
        },
        "ip": { //ip-address mask
            mask: ["[[x]y]z.[[x]y]z.[[x]y]z.x[yz]", "[[x]y]z.[[x]y]z.[[x]y]z.[[x]y][z]"],
            definitions: {
                'x': {
                    validator: "[012]",
                    cardinality: 1,
                    definitionSymbol: "i"
                },
                'y': {
                    validator: function (chrs, buffer, pos, strict, opts) {
                        if (pos - 1 > -1 && buffer[pos - 1] != ".")
                            chrs = buffer[pos - 1] + chrs;
                        else chrs = "0" + chrs;
                        return new RegExp("2[0-5]|[01][0-9]").test(chrs);
                    },
                    cardinality: 1,
                    definitionSymbol: "i"
                },
                'z': {
                    validator: function (chrs, buffer, pos, strict, opts) {
                        if (pos - 1 > -1 && buffer[pos - 1] != ".") {
                            chrs = buffer[pos - 1] + chrs;
                            if (pos - 2 > -1 && buffer[pos - 2] != ".") {
                                chrs = buffer[pos - 2] + chrs;
                            } else chrs = "0" + chrs;
                        } else chrs = "00" + chrs;
                        return new RegExp("25[0-5]|2[0-4][0-9]|[01][0-9][0-9]").test(chrs);
                    },
                    cardinality: 1,
                    definitionSymbol: "i"
                }
            }
        }
    });
})(jQuery);
});

require.register("ende/vendor/assets/javascripts/jquery/inputmask.js", function (exports, module) {
/**
* @license Input Mask plugin for jquery
* http://github.com/RobinHerbots/jquery.inputmask
* Copyright (c) 2010 - 2014 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 0.0.0
*/

(function ($) {
    if ($.fn.inputmask === undefined) {
        //helper functions    
        function isInputEventSupported(eventName) {
            var el = document.createElement('input'),
            eventName = 'on' + eventName,
            isSupported = (eventName in el);
            if (!isSupported) {
                el.setAttribute(eventName, 'return;');
                isSupported = typeof el[eventName] == 'function';
            }
            el = null;
            return isSupported;
        }

        function resolveAlias(aliasStr, options, opts) {
            var aliasDefinition = opts.aliases[aliasStr];
            if (aliasDefinition) {
                if (aliasDefinition.alias) resolveAlias(aliasDefinition.alias, undefined, opts); //alias is another alias
                $.extend(true, opts, aliasDefinition);  //merge alias definition in the options
                $.extend(true, opts, options);  //reapply extra given options
                return true;
            }
            return false;
        }


        function generateMaskSets(opts) {
            var ms = [];
            var genmasks = []; //used to keep track of the masks that where processed, to avoid duplicates
            function getMaskTemplate(mask) {
                if (opts.numericInput) {
                    mask = mask.split('').reverse().join('');
                }
                var escaped = false, outCount = 0, greedy = opts.greedy, repeat = opts.repeat;
                if (repeat == "*") greedy = false;
                //if (greedy == true && opts.placeholder == "") opts.placeholder = " ";
                if (mask.length == 1 && greedy == false && repeat != 0) { opts.placeholder = ""; } //hide placeholder with single non-greedy mask
                var singleMask = $.map(mask.split(""), function (element, index) {
                    var outElem = [];
                    if (element == opts.escapeChar) {
                        escaped = true;
                    }
                    else if ((element != opts.optionalmarker.start && element != opts.optionalmarker.end) || escaped) {
                        var maskdef = opts.definitions[element];
                        if (maskdef && !escaped) {
                            for (var i = 0; i < maskdef.cardinality; i++) {
                                outElem.push(opts.placeholder.charAt((outCount + i) % opts.placeholder.length));
                            }
                        } else {
                            outElem.push(element);
                            escaped = false;
                        }
                        outCount += outElem.length;
                        return outElem;
                    }
                });

                //allocate repetitions
                var repeatedMask = singleMask.slice();
                for (var i = 1; i < repeat && greedy; i++) {
                    repeatedMask = repeatedMask.concat(singleMask.slice());
                }

                return { "mask": repeatedMask, "repeat": repeat, "greedy": greedy };
            }
            //test definition => {fn: RegExp/function, cardinality: int, optionality: bool, newBlockMarker: bool, offset: int, casing: null/upper/lower, def: definitionSymbol}
            function getTestingChain(mask) {
                if (opts.numericInput) {
                    mask = mask.split('').reverse().join('');
                }
                var isOptional = false, escaped = false;
                var newBlockMarker = false; //indicates wheter the begin/ending of a block should be indicated

                return $.map(mask.split(""), function (element, index) {
                    var outElem = [];

                    if (element == opts.escapeChar) {
                        escaped = true;
                    } else if (element == opts.optionalmarker.start && !escaped) {
                        isOptional = true;
                        newBlockMarker = true;
                    }
                    else if (element == opts.optionalmarker.end && !escaped) {
                        isOptional = false;
                        newBlockMarker = true;
                    }
                    else {
                        var maskdef = opts.definitions[element];
                        if (maskdef && !escaped) {
                            var prevalidators = maskdef["prevalidator"], prevalidatorsL = prevalidators ? prevalidators.length : 0;
                            for (var i = 1; i < maskdef.cardinality; i++) {
                                var prevalidator = prevalidatorsL >= i ? prevalidators[i - 1] : [], validator = prevalidator["validator"], cardinality = prevalidator["cardinality"];
                                outElem.push({ fn: validator ? typeof validator == 'string' ? new RegExp(validator) : new function () { this.test = validator; } : new RegExp("."), cardinality: cardinality ? cardinality : 1, optionality: isOptional, newBlockMarker: isOptional == true ? newBlockMarker : false, offset: 0, casing: maskdef["casing"], def: maskdef["definitionSymbol"] || element });
                                if (isOptional == true) //reset newBlockMarker
                                    newBlockMarker = false;
                            }
                            outElem.push({ fn: maskdef.validator ? typeof maskdef.validator == 'string' ? new RegExp(maskdef.validator) : new function () { this.test = maskdef.validator; } : new RegExp("."), cardinality: maskdef.cardinality, optionality: isOptional, newBlockMarker: newBlockMarker, offset: 0, casing: maskdef["casing"], def: maskdef["definitionSymbol"] || element });
                        } else {
                            outElem.push({ fn: null, cardinality: 0, optionality: isOptional, newBlockMarker: newBlockMarker, offset: 0, casing: null, def: element });
                            escaped = false;
                        }
                        //reset newBlockMarker
                        newBlockMarker = false;
                        return outElem;
                    }
                });
            }
            function markOptional(maskPart) { //needed for the clearOptionalTail functionality
                return opts.optionalmarker.start + maskPart + opts.optionalmarker.end;
            }
            function splitFirstOptionalEndPart(maskPart) {
                var optionalStartMarkers = 0, optionalEndMarkers = 0, mpl = maskPart.length;
                for (var i = 0; i < mpl; i++) {
                    if (maskPart.charAt(i) == opts.optionalmarker.start) {
                        optionalStartMarkers++;
                    }
                    if (maskPart.charAt(i) == opts.optionalmarker.end) {
                        optionalEndMarkers++;
                    }
                    if (optionalStartMarkers > 0 && optionalStartMarkers == optionalEndMarkers)
                        break;
                }
                var maskParts = [maskPart.substring(0, i)];
                if (i < mpl) {
                    maskParts.push(maskPart.substring(i + 1, mpl));
                }
                return maskParts;
            }
            function splitFirstOptionalStartPart(maskPart) {
                var mpl = maskPart.length;
                for (var i = 0; i < mpl; i++) {
                    if (maskPart.charAt(i) == opts.optionalmarker.start) {
                        break;
                    }
                }
                var maskParts = [maskPart.substring(0, i)];
                if (i < mpl) {
                    maskParts.push(maskPart.substring(i + 1, mpl));
                }
                return maskParts;
            }
            function generateMask(maskPrefix, maskPart, metadata) {
                var maskParts = splitFirstOptionalEndPart(maskPart);
                var newMask, maskTemplate;

                var masks = splitFirstOptionalStartPart(maskParts[0]);
                if (masks.length > 1) {
                    newMask = maskPrefix + masks[0] + markOptional(masks[1]) + (maskParts.length > 1 ? maskParts[1] : "");
                    if ($.inArray(newMask, genmasks) == -1 && newMask != "") {
                        genmasks.push(newMask);
                        maskTemplate = getMaskTemplate(newMask);
                        ms.push({
                            "mask": newMask,
                            "_buffer": maskTemplate["mask"],
                            "buffer": maskTemplate["mask"].slice(),
                            "tests": getTestingChain(newMask),
                            "lastValidPosition": -1,
                            "greedy": maskTemplate["greedy"],
                            "repeat": maskTemplate["repeat"],
                            "metadata": metadata
                        });
                    }
                    newMask = maskPrefix + masks[0] + (maskParts.length > 1 ? maskParts[1] : "");
                    if ($.inArray(newMask, genmasks) == -1 && newMask != "") {
                        genmasks.push(newMask);
                        maskTemplate = getMaskTemplate(newMask);
                        ms.push({
                            "mask": newMask,
                            "_buffer": maskTemplate["mask"],
                            "buffer": maskTemplate["mask"].slice(),
                            "tests": getTestingChain(newMask),
                            "lastValidPosition": -1,
                            "greedy": maskTemplate["greedy"],
                            "repeat": maskTemplate["repeat"],
                            "metadata": metadata
                        });
                    }
                    if (splitFirstOptionalStartPart(masks[1]).length > 1) { //optional contains another optional
                        generateMask(maskPrefix + masks[0], masks[1] + maskParts[1], metadata);
                    }
                    if (maskParts.length > 1 && splitFirstOptionalStartPart(maskParts[1]).length > 1) {
                        generateMask(maskPrefix + masks[0] + markOptional(masks[1]), maskParts[1], metadata);
                        generateMask(maskPrefix + masks[0], maskParts[1], metadata);
                    }
                }
                else {
                    newMask = maskPrefix + maskParts;
                    if ($.inArray(newMask, genmasks) == -1 && newMask != "") {
                        genmasks.push(newMask);
                        maskTemplate = getMaskTemplate(newMask);
                        ms.push({
                            "mask": newMask,
                            "_buffer": maskTemplate["mask"],
                            "buffer": maskTemplate["mask"].slice(),
                            "tests": getTestingChain(newMask),
                            "lastValidPosition": -1,
                            "greedy": maskTemplate["greedy"],
                            "repeat": maskTemplate["repeat"],
                            "metadata": metadata
                        });
                    }
                }

            }

            if ($.isFunction(opts.mask)) { //allow mask to be a preprocessing fn - should return a valid mask
                opts.mask = opts.mask.call(this, opts);
            }
            if ($.isArray(opts.mask)) {
                $.each(opts.mask, function (ndx, msk) {
                    if (msk["mask"] != undefined) {
                        generateMask("", msk["mask"].toString(), msk);
                    } else
                        generateMask("", msk.toString());
                });
            } else generateMask("", opts.mask.toString());

            return opts.greedy ? ms : ms.sort(function (a, b) { return a["mask"].length - b["mask"].length; });
        }


        var msie10 = navigator.userAgent.match(new RegExp("msie 10", "i")) !== null,
            iphone = navigator.userAgent.match(new RegExp("iphone", "i")) !== null,
            android = navigator.userAgent.match(new RegExp("android.*safari.*", "i")) !== null,
            androidchrome = navigator.userAgent.match(new RegExp("android.*chrome.*", "i")) !== null,
            pasteEvent = isInputEventSupported('paste') && !msie10 ? 'paste' : isInputEventSupported('input') ? 'input' : "propertychange";


        //masking scope

        function maskScope(masksets, activeMasksetIndex, opts) {
            var isRTL = false,
                valueOnFocus = getActiveBuffer().join(''),
                $el, chromeValueOnInput;

            //maskset helperfunctions

            function getActiveMaskSet() {
                return masksets[activeMasksetIndex];
            }

            function getActiveTests() {
                return getActiveMaskSet()['tests'];
            }

            function getActiveBufferTemplate() {
                return getActiveMaskSet()['_buffer'];
            }

            function getActiveBuffer() {
                return getActiveMaskSet()['buffer'];
            }

            function isValid(pos, c, strict) { //strict true ~ no correction or autofill
                strict = strict === true; //always set a value to strict to prevent possible strange behavior in the extensions 

                function _isValid(position, activeMaskset, c, strict) {
                    var testPos = determineTestPosition(position), loopend = c ? 1 : 0, chrs = '', buffer = activeMaskset["buffer"];
                    for (var i = activeMaskset['tests'][testPos].cardinality; i > loopend; i--) {
                        chrs += getBufferElement(buffer, testPos - (i - 1));
                    }

                    if (c) {
                        chrs += c;
                    }

                    //return is false or a json object => { pos: ??, c: ??} or true
                    return activeMaskset['tests'][testPos].fn != null ?
                        activeMaskset['tests'][testPos].fn.test(chrs, buffer, position, strict, opts)
                        : (c == getBufferElement(activeMaskset['_buffer'], position, true) || c == opts.skipOptionalPartCharacter) ?
                            { "refresh": true, c: getBufferElement(activeMaskset['_buffer'], position, true), pos: position }
                            : false;
                }

                function PostProcessResults(maskForwards, results) {
                    var hasValidActual = false;
                    $.each(results, function (ndx, rslt) {
                        hasValidActual = $.inArray(rslt["activeMasksetIndex"], maskForwards) == -1 && rslt["result"] !== false;
                        if (hasValidActual) return false;
                    });
                    if (hasValidActual) { //strip maskforwards
                        results = $.map(results, function (rslt, ndx) {
                            if ($.inArray(rslt["activeMasksetIndex"], maskForwards) == -1) {
                                return rslt;
                            } else {
                                masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = actualLVP;
                            }
                        });
                    } else { //keep maskforwards with the least forward
                        var lowestPos = -1, lowestIndex = -1, rsltValid;
                        $.each(results, function (ndx, rslt) {
                            if ($.inArray(rslt["activeMasksetIndex"], maskForwards) != -1 && rslt["result"] !== false & (lowestPos == -1 || lowestPos > rslt["result"]["pos"])) {
                                lowestPos = rslt["result"]["pos"];
                                lowestIndex = rslt["activeMasksetIndex"];
                            }
                        });
                        results = $.map(results, function (rslt, ndx) {
                            if ($.inArray(rslt["activeMasksetIndex"], maskForwards) != -1) {
                                if (rslt["result"]["pos"] == lowestPos) {
                                    return rslt;
                                } else if (rslt["result"] !== false) {
                                    for (var i = pos; i < lowestPos; i++) {
                                        rsltValid = _isValid(i, masksets[rslt["activeMasksetIndex"]], masksets[lowestIndex]["buffer"][i], true);
                                        if (rsltValid === false) {
                                            masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = lowestPos - 1;
                                            break;
                                        } else {
                                            setBufferElement(masksets[rslt["activeMasksetIndex"]]["buffer"], i, masksets[lowestIndex]["buffer"][i], true);
                                            masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = i;
                                        }
                                    }
                                    //also check check for the lowestpos with the new input
                                    rsltValid = _isValid(lowestPos, masksets[rslt["activeMasksetIndex"]], c, true);
                                    if (rsltValid !== false) {
                                        setBufferElement(masksets[rslt["activeMasksetIndex"]]["buffer"], lowestPos, c, true);
                                        masksets[rslt["activeMasksetIndex"]]["lastValidPosition"] = lowestPos;
                                    }
                                    //console.log("ndx " + rslt["activeMasksetIndex"] + " validate " + masksets[rslt["activeMasksetIndex"]]["buffer"].join('') + " lv " + masksets[rslt["activeMasksetIndex"]]['lastValidPosition']);
                                    return rslt;
                                }
                            }
                        });
                    }
                    return results;
                }

                if (strict) {
                    var result = _isValid(pos, getActiveMaskSet(), c, strict); //only check validity in current mask when validating strict
                    if (result === true) {
                        result = { "pos": pos }; //always take a possible corrected maskposition into account
                    }
                    return result;
                }

                var results = [], result = false, currentActiveMasksetIndex = activeMasksetIndex,
                    actualBuffer = getActiveBuffer().slice(), actualLVP = getActiveMaskSet()["lastValidPosition"],
                    actualPrevious = seekPrevious(pos),
                    maskForwards = [];
                $.each(masksets, function (index, value) {
                    if (typeof (value) == "object") {
                        activeMasksetIndex = index;

                        var maskPos = pos;
                        var lvp = getActiveMaskSet()['lastValidPosition'],
                            rsltValid;
                        if (lvp == actualLVP) {
                            if ((maskPos - actualLVP) > 1) {
                                for (var i = lvp == -1 ? 0 : lvp; i < maskPos; i++) {
                                    rsltValid = _isValid(i, getActiveMaskSet(), actualBuffer[i], true);
                                    if (rsltValid === false) {
                                        break;
                                    } else {
                                        setBufferElement(getActiveBuffer(), i, actualBuffer[i], true);
                                        if (rsltValid === true) {
                                            rsltValid = { "pos": i }; //always take a possible corrected maskposition into account
                                        }
                                        var newValidPosition = rsltValid.pos || i;
                                        if (getActiveMaskSet()['lastValidPosition'] < newValidPosition)
                                            getActiveMaskSet()['lastValidPosition'] = newValidPosition; //set new position from isValid
                                    }
                                }
                            }
                            //does the input match on a further position?
                            if (!isMask(maskPos) && !_isValid(maskPos, getActiveMaskSet(), c, strict)) {
                                var maxForward = seekNext(maskPos) - maskPos;
                                for (var fw = 0; fw < maxForward; fw++) {
                                    if (_isValid(++maskPos, getActiveMaskSet(), c, strict) !== false)
                                        break;
                                }
                                maskForwards.push(activeMasksetIndex);
                                //console.log('maskforward ' + activeMasksetIndex + " pos " + pos + " maskPos " + maskPos);
                            }
                        }

                        if (getActiveMaskSet()['lastValidPosition'] >= actualLVP || activeMasksetIndex == currentActiveMasksetIndex) {
                            if (maskPos >= 0 && maskPos < getMaskLength()) {
                                result = _isValid(maskPos, getActiveMaskSet(), c, strict);
                                if (result !== false) {
                                    if (result === true) {
                                        result = { "pos": maskPos }; //always take a possible corrected maskposition into account
                                    }
                                    var newValidPosition = result.pos || maskPos;
                                    if (getActiveMaskSet()['lastValidPosition'] < newValidPosition)
                                        getActiveMaskSet()['lastValidPosition'] = newValidPosition; //set new position from isValid
                                }
                                //console.log("pos " + pos + " ndx " + activeMasksetIndex + " validate " + getActiveBuffer().join('') + " lv " + getActiveMaskSet()['lastValidPosition']);
                                results.push({ "activeMasksetIndex": index, "result": result });
                            }
                        }
                    }
                });
                activeMasksetIndex = currentActiveMasksetIndex; //reset activeMasksetIndex

                return PostProcessResults(maskForwards, results); //return results of the multiple mask validations
            }

            function determineActiveMasksetIndex() {
                var currentMasksetIndex = activeMasksetIndex,
                    highestValid = { "activeMasksetIndex": 0, "lastValidPosition": -1, "next": -1 };
                $.each(masksets, function (index, value) {
                    if (typeof (value) == "object") {
                        activeMasksetIndex = index;
                        if (getActiveMaskSet()['lastValidPosition'] > highestValid['lastValidPosition']) {
                            highestValid["activeMasksetIndex"] = index;
                            highestValid["lastValidPosition"] = getActiveMaskSet()['lastValidPosition'];
                            highestValid["next"] = seekNext(getActiveMaskSet()['lastValidPosition']);
                        } else if (getActiveMaskSet()['lastValidPosition'] == highestValid['lastValidPosition'] &&
                            (highestValid['next'] == -1 || highestValid['next'] > seekNext(getActiveMaskSet()['lastValidPosition']))) {
                            highestValid["activeMasksetIndex"] = index;
                            highestValid["lastValidPosition"] = getActiveMaskSet()['lastValidPosition'];
                            highestValid["next"] = seekNext(getActiveMaskSet()['lastValidPosition']);
                        }
                    }
                });

                activeMasksetIndex = highestValid["lastValidPosition"] != -1 && masksets[currentMasksetIndex]["lastValidPosition"] == highestValid["lastValidPosition"] ? currentMasksetIndex : highestValid["activeMasksetIndex"];
                if (currentMasksetIndex != activeMasksetIndex) {
                    clearBuffer(getActiveBuffer(), seekNext(highestValid["lastValidPosition"]), getMaskLength());
                    getActiveMaskSet()["writeOutBuffer"] = true;
                }
                $el.data('_inputmask')['activeMasksetIndex'] = activeMasksetIndex; //store the activeMasksetIndex
            }

            function isMask(pos) {
                var testPos = determineTestPosition(pos);
                var test = getActiveTests()[testPos];

                return test != undefined ? test.fn : false;
            }

            function determineTestPosition(pos) {
                return pos % getActiveTests().length;
            }

            function getMaskLength() {
                return opts.getMaskLength(getActiveBufferTemplate(), getActiveMaskSet()['greedy'], getActiveMaskSet()['repeat'], getActiveBuffer(), opts);
            }

            //pos: from position

            function seekNext(pos) {
                var maskL = getMaskLength();
                if (pos >= maskL) return maskL;
                var position = pos;
                while (++position < maskL && !isMask(position)) {
                }
                return position;
            }

            //pos: from position

            function seekPrevious(pos) {
                var position = pos;
                if (position <= 0) return 0;

                while (--position > 0 && !isMask(position)) {
                }
                ;
                return position;
            }

            function setBufferElement(buffer, position, element, autoPrepare) {
                if (autoPrepare) position = prepareBuffer(buffer, position);

                var test = getActiveTests()[determineTestPosition(position)];
                var elem = element;
                if (elem != undefined && test != undefined) {
                    switch (test.casing) {
                        case "upper":
                            elem = element.toUpperCase();
                            break;
                        case "lower":
                            elem = element.toLowerCase();
                            break;
                    }
                }

                buffer[position] = elem;
            }

            function getBufferElement(buffer, position, autoPrepare) {
                if (autoPrepare) position = prepareBuffer(buffer, position);
                return buffer[position];
            }

            //needed to handle the non-greedy mask repetitions

            function prepareBuffer(buffer, position) {
                var j;
                while (buffer[position] == undefined && buffer.length < getMaskLength()) {
                    j = 0;
                    while (getActiveBufferTemplate()[j] !== undefined) { //add a new buffer
                        buffer.push(getActiveBufferTemplate()[j++]);
                    }
                }

                return position;
            }

            function writeBuffer(input, buffer, caretPos) {
                input._valueSet(buffer.join(''));
                if (caretPos != undefined) {
                    caret(input, caretPos);
                }
            }

            function clearBuffer(buffer, start, end, stripNomasks) {
                for (var i = start, maskL = getMaskLength() ; i < end && i < maskL; i++) {
                    if (stripNomasks === true) {
                        if (!isMask(i))
                            setBufferElement(buffer, i, "");
                    } else
                        setBufferElement(buffer, i, getBufferElement(getActiveBufferTemplate().slice(), i, true));
                }
            }

            function setReTargetPlaceHolder(buffer, pos) {
                var testPos = determineTestPosition(pos);
                setBufferElement(buffer, pos, getBufferElement(getActiveBufferTemplate(), testPos));
            }

            function getPlaceHolder(pos) {
                return opts.placeholder.charAt(pos % opts.placeholder.length);
            }

            function checkVal(input, writeOut, strict, nptvl, intelliCheck) {
                var inputValue = nptvl != undefined ? nptvl.slice() : truncateInput(input._valueGet()).split('');

                $.each(masksets, function (ndx, ms) {
                    if (typeof (ms) == "object") {
                        ms["buffer"] = ms["_buffer"].slice();
                        ms["lastValidPosition"] = -1;
                        ms["p"] = -1;
                    }
                });
                if (strict !== true) activeMasksetIndex = 0;
                if (writeOut) input._valueSet(""); //initial clear
                var ml = getMaskLength();
                $.each(inputValue, function (ndx, charCode) {
                    if (intelliCheck === true) {
                        var p = getActiveMaskSet()["p"], lvp = p == -1 ? p : seekPrevious(p),
                            pos = lvp == -1 ? ndx : seekNext(lvp);
                        if ($.inArray(charCode, getActiveBufferTemplate().slice(lvp + 1, pos)) == -1) {
                            $(input).trigger("_keypress", [true, charCode.charCodeAt(0), writeOut, strict, ndx]);
                        }
                    } else {
                        $(input).trigger("_keypress", [true, charCode.charCodeAt(0), writeOut, strict, ndx]);
                    }
                });

                if (strict === true && getActiveMaskSet()["p"] != -1) {
                    getActiveMaskSet()["lastValidPosition"] = seekPrevious(getActiveMaskSet()["p"]);
                }
            }

            function escapeRegex(str) {
                return $.inputmask.escapeRegex.call(this, str);
            }

            function truncateInput(inputValue) {
                return inputValue.replace(new RegExp("(" + escapeRegex(getActiveBufferTemplate().join('')) + ")*$"), "");
            }

            function clearOptionalTail(input) {
                var buffer = getActiveBuffer(), tmpBuffer = buffer.slice(), testPos, pos;
                for (var pos = tmpBuffer.length - 1; pos >= 0; pos--) {
                    var testPos = determineTestPosition(pos);
                    if (getActiveTests()[testPos].optionality) {
                        if (!isMask(pos) || !isValid(pos, buffer[pos], true))
                            tmpBuffer.pop();
                        else break;
                    } else break;
                }
                writeBuffer(input, tmpBuffer);
            }

            function unmaskedvalue($input, skipDatepickerCheck) {
                if (getActiveTests() && (skipDatepickerCheck === true || !$input.hasClass('hasDatepicker'))) {
                    //checkVal(input, false, true);
                    var umValue = $.map(getActiveBuffer(), function (element, index) {
                        return isMask(index) && isValid(index, element, true) ? element : null;
                    });
                    var unmaskedValue = (isRTL ? umValue.reverse() : umValue).join('');
                    return opts.onUnMask != undefined ? opts.onUnMask.call(this, getActiveBuffer().join(''), unmaskedValue) : unmaskedValue;
                } else {
                    return $input[0]._valueGet();
                }
            }

            function TranslatePosition(pos) {
                if (isRTL && typeof pos == 'number' && (!opts.greedy || opts.placeholder != "")) {
                    var bffrLght = getActiveBuffer().length;
                    pos = bffrLght - pos;
                }
                return pos;
            }

            function caret(input, begin, end) {
                var npt = input.jquery && input.length > 0 ? input[0] : input, range;
                if (typeof begin == 'number') {
                    begin = TranslatePosition(begin);
                    end = TranslatePosition(end);
                    if (!$(input).is(':visible')) {
                        return;
                    }
                    end = (typeof end == 'number') ? end : begin;
                    npt.scrollLeft = npt.scrollWidth;
                    if (opts.insertMode == false && begin == end) end++; //set visualization for insert/overwrite mode
                    if (npt.setSelectionRange) {
                        npt.selectionStart = begin;
                        npt.selectionEnd = android ? begin : end;

                    } else if (npt.createTextRange) {
                        range = npt.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', end);
                        range.moveStart('character', begin);
                        range.select();
                    }
                } else {
                    if (!$(input).is(':visible')) {
                        return { "begin": 0, "end": 0 };
                    }
                    if (npt.setSelectionRange) {
                        begin = npt.selectionStart;
                        end = npt.selectionEnd;
                    } else if (document.selection && document.selection.createRange) {
                        range = document.selection.createRange();
                        begin = 0 - range.duplicate().moveStart('character', -100000);
                        end = begin + range.text.length;
                    }
                    begin = TranslatePosition(begin);
                    end = TranslatePosition(end);
                    return { "begin": begin, "end": end };
                }
            }

            function isComplete(buffer) { //return true / false / undefined (repeat *)
                if (opts.repeat == "*") return undefined;
                var complete = false, highestValidPosition = 0, currentActiveMasksetIndex = activeMasksetIndex;
                $.each(masksets, function (ndx, ms) {
                    if (typeof (ms) == "object") {
                        activeMasksetIndex = ndx;
                        var aml = seekPrevious(getMaskLength());
                        if (ms["lastValidPosition"] >= highestValidPosition && ms["lastValidPosition"] == aml) {
                            var msComplete = true;
                            for (var i = 0; i <= aml; i++) {
                                var mask = isMask(i), testPos = determineTestPosition(i);
                                if ((mask && (buffer[i] == undefined || buffer[i] == getPlaceHolder(i))) || (!mask && buffer[i] != getActiveBufferTemplate()[testPos])) {
                                    msComplete = false;
                                    break;
                                }
                            }
                            complete = complete || msComplete;
                            if (complete) //break loop
                                return false;
                        }
                        highestValidPosition = ms["lastValidPosition"];
                    }
                });
                activeMasksetIndex = currentActiveMasksetIndex; //reset activeMaskset
                return complete;
            }

            function isSelection(begin, end) {
                return isRTL ? (begin - end) > 1 || ((begin - end) == 1 && opts.insertMode) :
                    (end - begin) > 1 || ((end - begin) == 1 && opts.insertMode);
            }

            function mask(el) {
                $el = $(el);
                if (!$el.is(":input")) return;

                //store tests & original buffer in the input element - used to get the unmasked value
                $el.data('_inputmask', {
                    'masksets': masksets,
                    'activeMasksetIndex': activeMasksetIndex,
                    'opts': opts,
                    'isRTL': false
                });

                //show tooltip
                if (opts.showTooltip) {
                    $el.prop("title", getActiveMaskSet()["mask"]);
                }

                //correct greedy setting if needed
                getActiveMaskSet()['greedy'] = getActiveMaskSet()['greedy'] ? getActiveMaskSet()['greedy'] : getActiveMaskSet()['repeat'] == 0;

                //handle maxlength attribute
                if ($el.attr("maxLength") != null) //only when the attribute is set
                {
                    var maxLength = $el.prop('maxLength');
                    if (maxLength > -1) { //handle *-repeat
                        $.each(masksets, function (ndx, ms) {
                            if (typeof (ms) == "object") {
                                if (ms["repeat"] == "*") {
                                    ms["repeat"] = maxLength;
                                }
                            }
                        });
                    }
                    if (getMaskLength() >= maxLength && maxLength > -1) { //FF sets no defined max length to -1 
                        if (maxLength < getActiveBufferTemplate().length) getActiveBufferTemplate().length = maxLength;
                        if (getActiveMaskSet()['greedy'] == false) {
                            getActiveMaskSet()['repeat'] = Math.round(maxLength / getActiveBufferTemplate().length);
                        }
                        $el.prop('maxLength', getMaskLength() * 2);
                    }
                }

                patchValueProperty(el);

                //init vars
                var skipKeyPressEvent = false, //Safari 5.1.x - modal dialog fires keypress twice workaround
                    skipInputEvent = false, //skip when triggered from within inputmask
                    ignorable = false;

                if (opts.numericInput) opts.isNumeric = opts.numericInput;
                if (el.dir == "rtl" || (opts.numericInput && opts.rightAlignNumerics) || (opts.isNumeric && opts.rightAlignNumerics))
                    $el.css("text-align", "right");

                if (el.dir == "rtl" || opts.numericInput) {
                    el.dir = "ltr";
                    $el.removeAttr("dir");
                    var inputData = $el.data('_inputmask');
                    inputData['isRTL'] = true;
                    $el.data('_inputmask', inputData);
                    isRTL = true;
                }

                //unbind all events - to make sure that no other mask will interfere when re-masking
                $el.unbind(".inputmask");
                $el.removeClass('focus.inputmask');
                //bind events
                $el.closest('form').bind("submit", function () { //trigger change on submit if any
                    if (valueOnFocus != getActiveBuffer().join('')) {
                        $el.change();
                    }
                }).bind('reset', function () {
                    setTimeout(function () {
                        $el.trigger("setvalue");
                    }, 0);
                });
                $el.bind("mouseenter.inputmask", function () {
                    var $input = $(this), input = this;
                    if (!$input.hasClass('focus.inputmask') && opts.showMaskOnHover) {
                        if (input._valueGet() != getActiveBuffer().join('')) {
                            writeBuffer(input, getActiveBuffer());
                        }
                    }
                }).bind("blur.inputmask", function () {
                    var $input = $(this), input = this, nptValue = input._valueGet(), buffer = getActiveBuffer();
                    $input.removeClass('focus.inputmask');
                    if (valueOnFocus != getActiveBuffer().join('')) {
                        $input.change();
                    }
                    if (opts.clearMaskOnLostFocus && nptValue != '') {
                        if (nptValue == getActiveBufferTemplate().join(''))
                            input._valueSet('');
                        else { //clearout optional tail of the mask
                            clearOptionalTail(input);
                        }
                    }
                    if (isComplete(buffer) === false) {
                        $input.trigger("incomplete");
                        if (opts.clearIncomplete) {
                            $.each(masksets, function (ndx, ms) {
                                if (typeof (ms) == "object") {
                                    ms["buffer"] = ms["_buffer"].slice();
                                    ms["lastValidPosition"] = -1;
                                }
                            });
                            activeMasksetIndex = 0;
                            if (opts.clearMaskOnLostFocus)
                                input._valueSet('');
                            else {
                                buffer = getActiveBufferTemplate().slice();
                                writeBuffer(input, buffer);
                            }
                        }
                    }
                }).bind("focus.inputmask", function () {
                    var $input = $(this), input = this, nptValue = input._valueGet();
                    if (opts.showMaskOnFocus && !$input.hasClass('focus.inputmask') && (!opts.showMaskOnHover || (opts.showMaskOnHover && nptValue == ''))) {
                        if (input._valueGet() != getActiveBuffer().join('')) {
                            writeBuffer(input, getActiveBuffer(), seekNext(getActiveMaskSet()["lastValidPosition"]));
                        }
                    }
                    $input.addClass('focus.inputmask');
                    valueOnFocus = getActiveBuffer().join('');
                }).bind("mouseleave.inputmask", function () {
                    var $input = $(this), input = this;
                    if (opts.clearMaskOnLostFocus) {
                        if (!$input.hasClass('focus.inputmask') && input._valueGet() != $input.attr("placeholder")) {
                            if (input._valueGet() == getActiveBufferTemplate().join('') || input._valueGet() == '')
                                input._valueSet('');
                            else { //clearout optional tail of the mask
                                clearOptionalTail(input);
                            }
                        }
                    }
                }).bind("click.inputmask", function () {
                    var input = this;
                    setTimeout(function () {
                        var selectedCaret = caret(input), buffer = getActiveBuffer();
                        if (selectedCaret.begin == selectedCaret.end) {
                            var clickPosition = opts.isRTL ? TranslatePosition(selectedCaret.begin) : selectedCaret.begin,
                                lvp = getActiveMaskSet()["lastValidPosition"],
                                lastPosition;
                            if (opts.isNumeric) {
                                lastPosition = opts.skipRadixDance === false && opts.radixPoint != "" && $.inArray(opts.radixPoint, buffer) != -1 ?
                                    (opts.numericInput ? seekNext($.inArray(opts.radixPoint, buffer)) : $.inArray(opts.radixPoint, buffer)) :
                                    seekNext(lvp);
                            } else {
                                lastPosition = seekNext(lvp);
                            }
                            if (clickPosition < lastPosition) {
                                if (isMask(clickPosition))
                                    caret(input, clickPosition);
                                else caret(input, seekNext(clickPosition));
                            } else
                                caret(input, lastPosition);
                        }
                    }, 0);
                }).bind('dblclick.inputmask', function () {
                    var input = this;
                    setTimeout(function () {
                        caret(input, 0, seekNext(getActiveMaskSet()["lastValidPosition"]));
                    }, 0);
                }).bind(pasteEvent + ".inputmask dragdrop.inputmask drop.inputmask", function (e) {
                    if (skipInputEvent === true) {
                        skipInputEvent = false;
                        return true;
                    }
                    var input = this, $input = $(input);

                    //paste event for IE8 and lower I guess ;-)
                    if (e.type == "propertychange" && input._valueGet().length <= getMaskLength()) {
                        return true;
                    }
                    setTimeout(function () {
                        var pasteValue = opts.onBeforePaste != undefined ? opts.onBeforePaste.call(this, input._valueGet()) : input._valueGet();
                        checkVal(input, true, false, pasteValue.split(''), true);
                        if (isComplete(getActiveBuffer()) === true)
                            $input.trigger("complete");
                        $input.click();
                    }, 0);
                }).bind('setvalue.inputmask', function () {
                    var input = this;
                    checkVal(input, true);
                    valueOnFocus = getActiveBuffer().join('');
                    if (input._valueGet() == getActiveBufferTemplate().join(''))
                        input._valueSet('');
                }).bind("_keypress.inputmask", keypressEvent //will be skipped be the eventruler
                ).bind('complete.inputmask', opts.oncomplete
                ).bind('incomplete.inputmask', opts.onincomplete
                ).bind('cleared.inputmask', opts.oncleared
                ).bind("keyup.inputmask", keyupEvent);

                if (androidchrome) {
                    $el.bind("input.inputmask", function (e) {
                        if (skipInputEvent === true) {
                            skipInputEvent = false;
                            return true;
                        }
                        var input = this, $input = $(input);

                        chromeValueOnInput = getActiveBuffer().join('');
                        checkVal(input, false, false);
                        writeBuffer(input, getActiveBuffer());
                        if (isComplete(getActiveBuffer()) === true)
                            $input.trigger("complete");
                        $input.click();
                    });
                } else {
                    $el.bind("keydown.inputmask", keydownEvent
                    ).bind("keypress.inputmask", keypressEvent);
                }

                //apply mask
                checkVal(el, true, false);
                valueOnFocus = getActiveBuffer().join('');
                // Wrap document.activeElement in a try/catch block since IE9 throw "Unspecified error" if document.activeElement is undefined when we are in an IFrame.
                var activeElement;
                try {
                    activeElement = document.activeElement;
                } catch (e) {
                }
                if (activeElement === el) { //position the caret when in focus
                    $el.addClass('focus.inputmask');
                    caret(el, seekNext(getActiveMaskSet()["lastValidPosition"]));
                } else if (opts.clearMaskOnLostFocus) {
                    if (getActiveBuffer().join('') == getActiveBufferTemplate().join('')) {
                        el._valueSet('');
                    } else {
                        clearOptionalTail(el);
                    }
                } else {
                    writeBuffer(el, getActiveBuffer());
                }

                installEventRuler(el);

                //private functions

                function installEventRuler(npt) {
                    var events = $._data(npt).events;

                    $.each(events, function (eventType, eventHandlers) {
                        $.each(eventHandlers, function (ndx, eventHandler) {
                            if (eventHandler.namespace == "inputmask") {
                                if (eventHandler.type != "setvalue" && eventHandler.type != "_keypress") {
                                    var handler = eventHandler.handler;
                                    eventHandler.handler = function (e) {
                                        if (this.readOnly || this.disabled)
                                            e.preventDefault;
                                        else
                                            return handler.apply(this, arguments);
                                    };
                                }
                            }
                        });
                    });
                }

                function patchValueProperty(npt) {
                    var valueProperty;
                    if (Object.getOwnPropertyDescriptor)
                        valueProperty = Object.getOwnPropertyDescriptor(npt, "value");
                    if (valueProperty && valueProperty.get) {
                        if (!npt._valueGet) {
                            var valueGet = valueProperty.get;
                            var valueSet = valueProperty.set;
                            npt._valueGet = function () {
                                return isRTL ? valueGet.call(this).split('').reverse().join('') : valueGet.call(this);
                            };
                            npt._valueSet = function (value) {
                                valueSet.call(this, isRTL ? value.split('').reverse().join('') : value);
                            };

                            Object.defineProperty(npt, "value", {
                                get: function () {
                                    var $self = $(this), inputData = $(this).data('_inputmask'), masksets = inputData['masksets'],
                                        activeMasksetIndex = inputData['activeMasksetIndex'];
                                    return inputData && inputData['opts'].autoUnmask ? $self.inputmask('unmaskedvalue') : valueGet.call(this) != masksets[activeMasksetIndex]['_buffer'].join('') ? valueGet.call(this) : '';
                                },
                                set: function (value) {
                                    valueSet.call(this, value);
                                    $(this).triggerHandler('setvalue.inputmask');
                                }
                            });
                        }
                    } else if (document.__lookupGetter__ && npt.__lookupGetter__("value")) {
                        if (!npt._valueGet) {
                            var valueGet = npt.__lookupGetter__("value");
                            var valueSet = npt.__lookupSetter__("value");
                            npt._valueGet = function () {
                                return isRTL ? valueGet.call(this).split('').reverse().join('') : valueGet.call(this);
                            };
                            npt._valueSet = function (value) {
                                valueSet.call(this, isRTL ? value.split('').reverse().join('') : value);
                            };

                            npt.__defineGetter__("value", function () {
                                var $self = $(this), inputData = $(this).data('_inputmask'), masksets = inputData['masksets'],
                                    activeMasksetIndex = inputData['activeMasksetIndex'];
                                return inputData && inputData['opts'].autoUnmask ? $self.inputmask('unmaskedvalue') : valueGet.call(this) != masksets[activeMasksetIndex]['_buffer'].join('') ? valueGet.call(this) : '';
                            });
                            npt.__defineSetter__("value", function (value) {
                                valueSet.call(this, value);
                                $(this).triggerHandler('setvalue.inputmask');
                            });
                        }
                    } else {
                        if (!npt._valueGet) {
                            npt._valueGet = function () { return isRTL ? this.value.split('').reverse().join('') : this.value; };
                            npt._valueSet = function (value) { this.value = isRTL ? value.split('').reverse().join('') : value; };
                        }
                        if ($.valHooks.text == undefined || $.valHooks.text.inputmaskpatch != true) {
                            var valueGet = $.valHooks.text && $.valHooks.text.get ? $.valHooks.text.get : function (elem) { return elem.value; };
                            var valueSet = $.valHooks.text && $.valHooks.text.set ? $.valHooks.text.set : function (elem, value) {
                                elem.value = value;
                                return elem;
                            };

                            jQuery.extend($.valHooks, {
                                text: {
                                    get: function (elem) {
                                        var $elem = $(elem);
                                        if ($elem.data('_inputmask')) {
                                            if ($elem.data('_inputmask')['opts'].autoUnmask)
                                                return $elem.inputmask('unmaskedvalue');
                                            else {
                                                var result = valueGet(elem),
                                                    inputData = $elem.data('_inputmask'), masksets = inputData['masksets'],
                                                    activeMasksetIndex = inputData['activeMasksetIndex'];
                                                return result != masksets[activeMasksetIndex]['_buffer'].join('') ? result : '';
                                            }
                                        } else return valueGet(elem);
                                    },
                                    set: function (elem, value) {
                                        var $elem = $(elem);
                                        var result = valueSet(elem, value);
                                        if ($elem.data('_inputmask')) $elem.triggerHandler('setvalue.inputmask');
                                        return result;
                                    },
                                    inputmaskpatch: true
                                }
                            });
                        }
                    }
                }

                //shift chars to left from start to end and put c at end position if defined

                function shiftL(start, end, c, maskJumps) {
                    var buffer = getActiveBuffer();
                    if (maskJumps !== false) //jumping over nonmask position
                        while (!isMask(start) && start - 1 >= 0) start--;
                    for (var i = start; i < end && i < getMaskLength() ; i++) {
                        if (isMask(i)) {
                            setReTargetPlaceHolder(buffer, i);
                            var j = seekNext(i);
                            var p = getBufferElement(buffer, j);
                            if (p != getPlaceHolder(j)) {
                                if (j < getMaskLength() && isValid(i, p, true) !== false && getActiveTests()[determineTestPosition(i)].def == getActiveTests()[determineTestPosition(j)].def) {
                                    setBufferElement(buffer, i, p, true);
                                } else {
                                    if (isMask(i))
                                        break;
                                }
                            }
                        } else {
                            setReTargetPlaceHolder(buffer, i);
                        }
                    }
                    if (c != undefined)
                        setBufferElement(buffer, seekPrevious(end), c);

                    if (getActiveMaskSet()["greedy"] == false) {
                        var trbuffer = truncateInput(buffer.join('')).split('');
                        buffer.length = trbuffer.length;
                        for (var i = 0, bl = buffer.length; i < bl; i++) {
                            buffer[i] = trbuffer[i];
                        }
                        if (buffer.length == 0) getActiveMaskSet()["buffer"] = getActiveBufferTemplate().slice();
                    }
                    return start; //return the used start position
                }

                function shiftR(start, end, c) {
                    var buffer = getActiveBuffer();
                    if (getBufferElement(buffer, start, true) != getPlaceHolder(start)) {
                        for (var i = seekPrevious(end) ; i > start && i >= 0; i--) {
                            if (isMask(i)) {
                                var j = seekPrevious(i);
                                var t = getBufferElement(buffer, j);
                                if (t != getPlaceHolder(j)) {
                                    if (isValid(j, t, true) !== false && getActiveTests()[determineTestPosition(i)].def == getActiveTests()[determineTestPosition(j)].def) {
                                        setBufferElement(buffer, i, t, true);
                                        setReTargetPlaceHolder(buffer, j);
                                    } //else break;
                                }
                            } else
                                setReTargetPlaceHolder(buffer, i);
                        }
                    }
                    if (c != undefined && getBufferElement(buffer, start) == getPlaceHolder(start))
                        setBufferElement(buffer, start, c);
                    var lengthBefore = buffer.length;
                    if (getActiveMaskSet()["greedy"] == false) {
                        var trbuffer = truncateInput(buffer.join('')).split('');
                        buffer.length = trbuffer.length;
                        for (var i = 0, bl = buffer.length; i < bl; i++) {
                            buffer[i] = trbuffer[i];
                        }
                        if (buffer.length == 0) getActiveMaskSet()["buffer"] = getActiveBufferTemplate().slice();
                    }
                    return end - (lengthBefore - buffer.length); //return new start position
                }

                ;


                function HandleRemove(input, k, pos) {
                    if (opts.numericInput || isRTL) {
                        switch (k) {
                            case opts.keyCode.BACKSPACE:
                                k = opts.keyCode.DELETE;
                                break;
                            case opts.keyCode.DELETE:
                                k = opts.keyCode.BACKSPACE;
                                break;
                        }
                        if (isRTL) {
                            var pend = pos.end;
                            pos.end = pos.begin;
                            pos.begin = pend;
                        }
                    }

                    var isSelection = true;
                    if (pos.begin == pos.end) {
                        var posBegin = k == opts.keyCode.BACKSPACE ? pos.begin - 1 : pos.begin;
                        if (opts.isNumeric && opts.radixPoint != "" && getActiveBuffer()[posBegin] == opts.radixPoint) {
                            pos.begin = (getActiveBuffer().length - 1 == posBegin) /* radixPoint is latest? delete it */ ? pos.begin : k == opts.keyCode.BACKSPACE ? posBegin : seekNext(posBegin);
                            pos.end = pos.begin;
                        }
                        isSelection = false;
                        if (k == opts.keyCode.BACKSPACE)
                            pos.begin--;
                        else if (k == opts.keyCode.DELETE)
                            pos.end++;
                    } else if (pos.end - pos.begin == 1 && !opts.insertMode) {
                        isSelection = false;
                        if (k == opts.keyCode.BACKSPACE)
                            pos.begin--;
                    }

                    clearBuffer(getActiveBuffer(), pos.begin, pos.end);

                    var ml = getMaskLength();
                    if (opts.greedy == false) {
                        shiftL(pos.begin, ml, undefined, !isRTL && (k == opts.keyCode.BACKSPACE && !isSelection));
                    } else {
                        var newpos = pos.begin;
                        for (var i = pos.begin; i < pos.end; i++) { //seeknext to skip placeholders at start in selection
                            if (isMask(i) || !isSelection)
                                newpos = shiftL(pos.begin, ml, undefined, !isRTL && (k == opts.keyCode.BACKSPACE && !isSelection));
                        }
                        if (!isSelection) pos.begin = newpos;
                    }
                    var firstMaskPos = seekNext(-1);
                    clearBuffer(getActiveBuffer(), pos.begin, pos.end, true);
                    checkVal(input, false, masksets[1] == undefined || firstMaskPos >= pos.end, getActiveBuffer());
                    if (getActiveMaskSet()['lastValidPosition'] < firstMaskPos) {
                        getActiveMaskSet()["lastValidPosition"] = -1;
                        getActiveMaskSet()["p"] = firstMaskPos;
                    } else {
                        getActiveMaskSet()["p"] = pos.begin;
                    }
                }

                function keydownEvent(e) {
                    //Safari 5.1.x - modal dialog fires keypress twice workaround
                    skipKeyPressEvent = false;
                    var input = this, $input = $(input), k = e.keyCode, pos = caret(input);

                    //backspace, delete, and escape get special treatment
                    if (k == opts.keyCode.BACKSPACE || k == opts.keyCode.DELETE || (iphone && k == 127) || e.ctrlKey && k == 88) { //backspace/delete
                        e.preventDefault(); //stop default action but allow propagation
                        if (k == 88) valueOnFocus = getActiveBuffer().join('');
                        HandleRemove(input, k, pos);
                        determineActiveMasksetIndex();
                        writeBuffer(input, getActiveBuffer(), getActiveMaskSet()["p"]);
                        if (input._valueGet() == getActiveBufferTemplate().join(''))
                            $input.trigger('cleared');

                        if (opts.showTooltip) { //update tooltip
                            $input.prop("title", getActiveMaskSet()["mask"]);
                        }
                    } else if (k == opts.keyCode.END || k == opts.keyCode.PAGE_DOWN) { //when END or PAGE_DOWN pressed set position at lastmatch
                        setTimeout(function () {
                            var caretPos = seekNext(getActiveMaskSet()["lastValidPosition"]);
                            if (!opts.insertMode && caretPos == getMaskLength() && !e.shiftKey) caretPos--;
                            caret(input, e.shiftKey ? pos.begin : caretPos, caretPos);
                        }, 0);
                    } else if ((k == opts.keyCode.HOME && !e.shiftKey) || k == opts.keyCode.PAGE_UP) { //Home or page_up
                        caret(input, 0, e.shiftKey ? pos.begin : 0);
                    } else if (k == opts.keyCode.ESCAPE || (k == 90 && e.ctrlKey)) { //escape && undo
                        checkVal(input, true, false, valueOnFocus.split(''));
                        $input.click();
                    } else if (k == opts.keyCode.INSERT && !(e.shiftKey || e.ctrlKey)) { //insert
                        opts.insertMode = !opts.insertMode;
                        caret(input, !opts.insertMode && pos.begin == getMaskLength() ? pos.begin - 1 : pos.begin);
                    } else if (opts.insertMode == false && !e.shiftKey) {
                        if (k == opts.keyCode.RIGHT) {
                            setTimeout(function () {
                                var caretPos = caret(input);
                                caret(input, caretPos.begin);
                            }, 0);
                        } else if (k == opts.keyCode.LEFT) {
                            setTimeout(function () {
                                var caretPos = caret(input);
                                caret(input, caretPos.begin - 1);
                            }, 0);
                        }
                    }

                    var currentCaretPos = caret(input);
                    if (opts.onKeyDown.call(this, e, getActiveBuffer(), opts) === true) //extra stuff to execute on keydown
                        caret(input, currentCaretPos.begin, currentCaretPos.end);
                    ignorable = $.inArray(k, opts.ignorables) != -1;
                }


                function keypressEvent(e, checkval, k, writeOut, strict, ndx) {
                    //Safari 5.1.x - modal dialog fires keypress twice workaround
                    if (k == undefined && skipKeyPressEvent) return false;
                    skipKeyPressEvent = true;

                    var input = this, $input = $(input);

                    e = e || window.event;
                    var k = k || e.which || e.charCode || e.keyCode;

                    if ((!(e.ctrlKey && e.altKey) && (e.ctrlKey || e.metaKey || ignorable)) && checkval !== true) {
                        return true;
                    } else {
                        if (k) {
                            //special treat the decimal separator
                            if (checkval !== true && k == 46 && e.shiftKey == false && opts.radixPoint == ",") k = 44;

                            var pos, results, result, c = String.fromCharCode(k);
                            if (checkval) {
                                var pcaret = strict ? ndx : getActiveMaskSet()["lastValidPosition"] + 1;
                                pos = { begin: pcaret, end: pcaret };
                            } else {
                                pos = caret(input);
                            }

                            //should we clear a possible selection??
                            var isSlctn = isSelection(pos.begin, pos.end), redetermineLVP = false,
                                initialIndex = activeMasksetIndex;
                            if (isSlctn) {
                                activeMasksetIndex = initialIndex;
                                $.each(masksets, function (ndx, lmnt) { //init undobuffer for recovery when not valid
                                    if (typeof (lmnt) == "object") {
                                        activeMasksetIndex = ndx;
                                        getActiveMaskSet()["undoBuffer"] = getActiveBuffer().join('');
                                    }
                                });
                                HandleRemove(input, opts.keyCode.DELETE, pos);
                                if (!opts.insertMode) { //preserve some space
                                    $.each(masksets, function (ndx, lmnt) {
                                        if (typeof (lmnt) == "object") {
                                            activeMasksetIndex = ndx;
                                            shiftR(pos.begin, getMaskLength());
                                            getActiveMaskSet()["lastValidPosition"] = seekNext(getActiveMaskSet()["lastValidPosition"]);
                                        }
                                    });
                                }
                                activeMasksetIndex = initialIndex; //restore index
                            }

                            var radixPosition = getActiveBuffer().join('').indexOf(opts.radixPoint);
                            if (opts.isNumeric && checkval !== true && radixPosition != -1) {
                                if (opts.greedy && pos.begin <= radixPosition) {
                                    pos.begin = seekPrevious(pos.begin);
                                    pos.end = pos.begin;
                                } else if (c == opts.radixPoint) {
                                    pos.begin = radixPosition;
                                    pos.end = pos.begin;
                                }
                            }


                            var p = pos.begin;
                            results = isValid(p, c, strict);
                            if (strict === true) results = [{ "activeMasksetIndex": activeMasksetIndex, "result": results }];
                            var minimalForwardPosition = -1;
                            $.each(results, function (index, result) {
                                activeMasksetIndex = result["activeMasksetIndex"];
                                getActiveMaskSet()["writeOutBuffer"] = true;
                                var np = result["result"];
                                if (np !== false) {
                                    var refresh = false, buffer = getActiveBuffer();
                                    if (np !== true) {
                                        refresh = np["refresh"]; //only rewrite buffer from isValid
                                        p = np.pos != undefined ? np.pos : p; //set new position from isValid
                                        c = np.c != undefined ? np.c : c; //set new char from isValid
                                    }
                                    if (refresh !== true) {
                                        if (opts.insertMode == true) {
                                            var lastUnmaskedPosition = getMaskLength();
                                            var bfrClone = buffer.slice();
                                            while (getBufferElement(bfrClone, lastUnmaskedPosition, true) != getPlaceHolder(lastUnmaskedPosition) && lastUnmaskedPosition >= p) {
                                                lastUnmaskedPosition = lastUnmaskedPosition == 0 ? -1 : seekPrevious(lastUnmaskedPosition);
                                            }
                                            if (lastUnmaskedPosition >= p) {
                                                shiftR(p, getMaskLength(), c);
                                                //shift the lvp if needed
                                                var lvp = getActiveMaskSet()["lastValidPosition"], nlvp = seekNext(lvp);
                                                if (nlvp != getMaskLength() && lvp >= p && (getBufferElement(getActiveBuffer(), nlvp, true) != getPlaceHolder(nlvp))) {
                                                    getActiveMaskSet()["lastValidPosition"] = nlvp;
                                                }
                                            } else getActiveMaskSet()["writeOutBuffer"] = false;
                                        } else setBufferElement(buffer, p, c, true);
                                        if (minimalForwardPosition == -1 || minimalForwardPosition > seekNext(p)) {
                                            minimalForwardPosition = seekNext(p);
                                        }
                                    } else if (!strict) {
                                        var nextPos = p < getMaskLength() ? p + 1 : p;
                                        if (minimalForwardPosition == -1 || minimalForwardPosition > nextPos) {
                                            minimalForwardPosition = nextPos;
                                        }
                                    }
                                    if (minimalForwardPosition > getActiveMaskSet()["p"])
                                        getActiveMaskSet()["p"] = minimalForwardPosition; //needed for checkval strict 
                                }
                            });

                            if (strict !== true) {
                                activeMasksetIndex = initialIndex;
                                determineActiveMasksetIndex();
                            }
                            if (writeOut !== false) {
                                $.each(results, function (ndx, rslt) {
                                    if (rslt["activeMasksetIndex"] == activeMasksetIndex) {
                                        result = rslt;
                                        return false;
                                    }
                                });
                                if (result != undefined) {
                                    var self = this;
                                    setTimeout(function () { opts.onKeyValidation.call(self, result["result"], opts); }, 0);
                                    if (getActiveMaskSet()["writeOutBuffer"] && result["result"] !== false) {
                                        var buffer = getActiveBuffer();

                                        var newCaretPosition;
                                        if (checkval) {
                                            newCaretPosition = undefined;
                                        } else if (opts.numericInput) {
                                            if (p > radixPosition) {
                                                newCaretPosition = seekPrevious(minimalForwardPosition);
                                            } else if (c == opts.radixPoint) {
                                                newCaretPosition = minimalForwardPosition - 1;
                                            } else newCaretPosition = seekPrevious(minimalForwardPosition - 1);
                                        } else {
                                            newCaretPosition = minimalForwardPosition;
                                        }

                                        writeBuffer(input, buffer, newCaretPosition);
                                        if (checkval !== true) {
                                            setTimeout(function () { //timeout needed for IE
                                                if (isComplete(buffer) === true)
                                                    $input.trigger("complete");
                                                skipInputEvent = true;
                                                $input.trigger("input");
                                            }, 0);
                                        }
                                    } else if (isSlctn) {
                                        getActiveMaskSet()["buffer"] = getActiveMaskSet()["undoBuffer"].split('');
                                    }
                                }
                            }

                            if (opts.showTooltip) { //update tooltip
                                $input.prop("title", getActiveMaskSet()["mask"]);
                            }
                            e.preventDefault();
                        }
                    }
                }

                function keyupEvent(e) {
                    var $input = $(this), input = this, k = e.keyCode, buffer = getActiveBuffer();

                    if (androidchrome && k == opts.keyCode.BACKSPACE) {
                        if (chromeValueOnInput == input._valueGet())
                            keydownEvent.call(this, e);
                    }

                    opts.onKeyUp.call(this, e, buffer, opts); //extra stuff to execute on keyup
                    if (k == opts.keyCode.TAB && opts.showMaskOnFocus) {
                        if ($input.hasClass('focus.inputmask') && input._valueGet().length == 0) {
                            buffer = getActiveBufferTemplate().slice();
                            writeBuffer(input, buffer);
                            caret(input, 0);
                            valueOnFocus = getActiveBuffer().join('');
                        } else {
                            writeBuffer(input, buffer);
                            if (buffer.join('') == getActiveBufferTemplate().join('') && $.inArray(opts.radixPoint, buffer) != -1) {
                                caret(input, TranslatePosition(0));
                                $input.click();
                            } else
                                caret(input, TranslatePosition(0), TranslatePosition(getMaskLength()));
                        }
                    }
                }
            }

            return {
                isComplete: function (buffer) {
                    return isComplete(buffer);
                },
                unmaskedvalue: function ($input, skipDatepickerCheck) {
                    isRTL = $input.data('_inputmask')['isRTL'];
                    return unmaskedvalue($input, skipDatepickerCheck);
                },
                mask: function (el) {
                    mask(el);
                }
            };
        };

        $.inputmask = {
            //options default
            defaults: {
                placeholder: "_",
                optionalmarker: { start: "[", end: "]" },
                quantifiermarker: { start: "{", end: "}" },
                groupmarker: { start: "(", end: ")" },
                escapeChar: "\\",
                mask: null,
                oncomplete: $.noop, //executes when the mask is complete
                onincomplete: $.noop, //executes when the mask is incomplete and focus is lost
                oncleared: $.noop, //executes when the mask is cleared
                repeat: 0, //repetitions of the mask: * ~ forever, otherwise specify an integer
                greedy: true, //true: allocated buffer for the mask and repetitions - false: allocate only if needed
                autoUnmask: false, //automatically unmask when retrieving the value with $.fn.val or value if the browser supports __lookupGetter__ or getOwnPropertyDescriptor
                clearMaskOnLostFocus: true,
                insertMode: true, //insert the input or overwrite the input
                clearIncomplete: false, //clear the incomplete input on blur
                aliases: {}, //aliases definitions => see jquery.inputmask.extensions.js
                onKeyUp: $.noop, //override to implement autocomplete on certain keys for example
                onKeyDown: $.noop, //override to implement autocomplete on certain keys for example
                onBeforePaste: undefined, //executes before masking the pasted value to allow preprocessing of the pasted value.  args => pastedValue => return processedValue
                onUnMask: undefined, //executes after unmasking to allow postprocessing of the unmaskedvalue.  args => maskedValue, unmaskedValue
                showMaskOnFocus: true, //show the mask-placeholder when the input has focus
                showMaskOnHover: true, //show the mask-placeholder when hovering the empty input
                onKeyValidation: $.noop, //executes on every key-press with the result of isValid. Params: result, opts
                skipOptionalPartCharacter: " ", //a character which can be used to skip an optional part of a mask
                showTooltip: false, //show the activemask as tooltip
                numericInput: false, //numericInput input direction style (input shifts to the left while holding the caret position)
                //numeric basic properties
                isNumeric: false, //enable numeric features
                radixPoint: "", //".", // | ","
                skipRadixDance: false, //disable radixpoint caret positioning
                rightAlignNumerics: true, //align numerics to the right
                //numeric basic properties
                definitions: {
                    '9': {
                        validator: "[0-9]",
                        cardinality: 1
                    },
                    'a': {
                        validator: "[A-Za-z\u0410-\u044F\u0401\u0451]",
                        cardinality: 1
                    },
                    '*': {
                        validator: "[A-Za-z\u0410-\u044F\u0401\u04510-9]",
                        cardinality: 1
                    }
                },
                keyCode: {
                    ALT: 18, BACKSPACE: 8, CAPS_LOCK: 20, COMMA: 188, COMMAND: 91, COMMAND_LEFT: 91, COMMAND_RIGHT: 93, CONTROL: 17, DELETE: 46, DOWN: 40, END: 35, ENTER: 13, ESCAPE: 27, HOME: 36, INSERT: 45, LEFT: 37, MENU: 93, NUMPAD_ADD: 107, NUMPAD_DECIMAL: 110, NUMPAD_DIVIDE: 111, NUMPAD_ENTER: 108,
                    NUMPAD_MULTIPLY: 106, NUMPAD_SUBTRACT: 109, PAGE_DOWN: 34, PAGE_UP: 33, PERIOD: 190, RIGHT: 39, SHIFT: 16, SPACE: 32, TAB: 9, UP: 38, WINDOWS: 91
                },
                //specify keycodes which should not be considered in the keypress event, otherwise the preventDefault will stop their default behavior especially in FF
                ignorables: [8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123],
                getMaskLength: function (buffer, greedy, repeat, currentBuffer, opts) {
                    var calculatedLength = buffer.length;
                    if (!greedy) {
                        if (repeat == "*") {
                            calculatedLength = currentBuffer.length + 1;
                        } else if (repeat > 1) {
                            calculatedLength += (buffer.length * (repeat - 1));
                        }
                    }
                    return calculatedLength;
                }
            },
            escapeRegex: function (str) {
                var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
                return str.replace(new RegExp('(\\' + specials.join('|\\') + ')', 'gim'), '\\$1');
            },
            format: function (value, opts) {

            }
        };

        $.fn.inputmask = function (fn, options) {
            var opts = $.extend(true, {}, $.inputmask.defaults, options),
            	masksets,
                activeMasksetIndex = 0;

            if (typeof fn === "string") {
                switch (fn) {
                    case "mask":
                        //resolve possible aliases given by options
                        resolveAlias(opts.alias, options, opts);
                        masksets = generateMaskSets(opts);
                        if (masksets.length == 0) { return this; }

                        return this.each(function () {
                            maskScope($.extend(true, {}, masksets), 0, opts).mask(this);
                        });
                    case "unmaskedvalue":
                        var $input = $(this), input = this;
                        if ($input.data('_inputmask')) {
                            masksets = $input.data('_inputmask')['masksets'];
                            activeMasksetIndex = $input.data('_inputmask')['activeMasksetIndex'];
                            opts = $input.data('_inputmask')['opts'];
                            return maskScope(masksets, activeMasksetIndex, opts).unmaskedvalue($input);
                        } else return $input.val();
                    case "remove":
                        return this.each(function () {
                            var $input = $(this), input = this;
                            if ($input.data('_inputmask')) {
                                masksets = $input.data('_inputmask')['masksets'];
                                activeMasksetIndex = $input.data('_inputmask')['activeMasksetIndex'];
                                opts = $input.data('_inputmask')['opts'];
                                //writeout the unmaskedvalue
                                input._valueSet(maskScope(masksets, activeMasksetIndex, opts).unmaskedvalue($input, true));
                                //clear data
                                $input.removeData('_inputmask');
                                //unbind all events
                                $input.unbind(".inputmask");
                                $input.removeClass('focus.inputmask');
                                //restore the value property
                                var valueProperty;
                                if (Object.getOwnPropertyDescriptor)
                                    valueProperty = Object.getOwnPropertyDescriptor(input, "value");
                                if (valueProperty && valueProperty.get) {
                                    if (input._valueGet) {
                                        Object.defineProperty(input, "value", {
                                            get: input._valueGet,
                                            set: input._valueSet
                                        });
                                    }
                                } else if (document.__lookupGetter__ && input.__lookupGetter__("value")) {
                                    if (input._valueGet) {
                                        input.__defineGetter__("value", input._valueGet);
                                        input.__defineSetter__("value", input._valueSet);
                                    }
                                }
                                try { //try catch needed for IE7 as it does not supports deleting fns
                                    delete input._valueGet;
                                    delete input._valueSet;
                                } catch (e) {
                                    input._valueGet = undefined;
                                    input._valueSet = undefined;

                                }
                            }
                        });
                        break;
                    case "getemptymask": //return the default (empty) mask value, usefull for setting the default value in validation
                        if (this.data('_inputmask')) {
                            masksets = this.data('_inputmask')['masksets'];
                            activeMasksetIndex = this.data('_inputmask')['activeMasksetIndex'];
                            return masksets[activeMasksetIndex]['_buffer'].join('');
                        }
                        else return "";
                    case "hasMaskedValue": //check wheter the returned value is masked or not; currently only works reliable when using jquery.val fn to retrieve the value 
                        return this.data('_inputmask') ? !this.data('_inputmask')['opts'].autoUnmask : false;
                    case "isComplete":
                        masksets = this.data('_inputmask')['masksets'];
                        activeMasksetIndex = this.data('_inputmask')['activeMasksetIndex'];
                        opts = this.data('_inputmask')['opts'];
                        return maskScope(masksets, activeMasksetIndex, opts).isComplete(this[0]._valueGet().split(''));
                    case "getmetadata": //return mask metadata if exists
                        if (this.data('_inputmask')) {
                            masksets = this.data('_inputmask')['masksets'];
                            activeMasksetIndex = this.data('_inputmask')['activeMasksetIndex'];
                            return masksets[activeMasksetIndex]['metadata'];
                        }
                        else return undefined;
                    default:
                        //check if the fn is an alias
                        if (!resolveAlias(fn, options, opts)) {
                            //maybe fn is a mask so we try
                            //set mask
                            opts.mask = fn;
                        }
                        masksets = generateMaskSets(opts);
                        if (masksets.length == 0) { return this; }
                        return this.each(function () {
                            maskScope($.extend(true, {}, masksets), activeMasksetIndex, opts).mask(this);
                        });

                        break;
                }
            } else if (typeof fn == "object") {
                opts = $.extend(true, {}, $.inputmask.defaults, fn);

                resolveAlias(opts.alias, fn, opts); //resolve aliases
                masksets = generateMaskSets(opts);
                if (masksets.length == 0) { return this; }
                return this.each(function () {
                    maskScope($.extend(true, {}, masksets), activeMasksetIndex, opts).mask(this);
                });
            } else if (fn == undefined) {
                //look for data-inputmask atribute - the attribute should only contain optipns
                return this.each(function () {
                    var attrOptions = $(this).attr("data-inputmask");
                    if (attrOptions && attrOptions != "") {
                        try {
                            attrOptions = attrOptions.replace(new RegExp("'", "g"), '"');
                            var dataoptions = $.parseJSON("{" + attrOptions + "}");
                            $.extend(true, dataoptions, options);
                            opts = $.extend(true, {}, $.inputmask.defaults, dataoptions);
                            resolveAlias(opts.alias, dataoptions, opts);
                            opts.alias = undefined;
                            $(this).inputmask(opts);
                        } catch (ex) { } //need a more relax parseJSON
                    }
                });
            }
        };
    }
})(jQuery);

});

require.register("ende/vendor/assets/javascripts/jquery/inputmask.numeric.extensions.js", function (exports, module) {
/*
Input Mask plugin extensions
http://github.com/RobinHerbots/jquery.inputmask
Copyright (c) 2010 - 2014 Robin Herbots
Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
Version: 0.0.0

Optional extensions on the jquery.inputmask base
*/
(function ($) {
    //number aliases
    $.extend($.inputmask.defaults.aliases, {
        'decimal': {
            mask: "~",
            placeholder: "",
            repeat: "*",
            greedy: false,
            numericInput: false,
            isNumeric: true,
            digits: "*", //number of fractionalDigits
            groupSeparator: "",//",", // | "."
            radixPoint: ".",
            groupSize: 3,
            autoGroup: false,
            allowPlus: true,
            allowMinus: true,
            //todo
            integerDigits: "*", //number of integerDigits
            defaultValue: "",
            prefix: "",
            suffix: "",

            //todo
            getMaskLength: function (buffer, greedy, repeat, currentBuffer, opts) { //custom getMaskLength to take the groupSeparator into account
                var calculatedLength = buffer.length;

                if (!greedy) {
                    if (repeat == "*") {
                        calculatedLength = currentBuffer.length + 1;
                    } else if (repeat > 1) {
                        calculatedLength += (buffer.length * (repeat - 1));
                    }
                }

                var escapedGroupSeparator = $.inputmask.escapeRegex.call(this, opts.groupSeparator);
                var escapedRadixPoint = $.inputmask.escapeRegex.call(this, opts.radixPoint);
                var currentBufferStr = currentBuffer.join(''), strippedBufferStr = currentBufferStr.replace(new RegExp(escapedGroupSeparator, "g"), "").replace(new RegExp(escapedRadixPoint), ""),
                groupOffset = currentBufferStr.length - strippedBufferStr.length;
                return calculatedLength + groupOffset;
            },
            postFormat: function (buffer, pos, reformatOnly, opts) {
                if (opts.groupSeparator == "") return pos;
                var cbuf = buffer.slice(),
                    radixPos = $.inArray(opts.radixPoint, buffer);
                if (!reformatOnly) {
                    cbuf.splice(pos, 0, "?"); //set position indicator
                }
                var bufVal = cbuf.join('');
                if (opts.autoGroup || (reformatOnly && bufVal.indexOf(opts.groupSeparator) != -1)) {
                    var escapedGroupSeparator = $.inputmask.escapeRegex.call(this, opts.groupSeparator);
                    bufVal = bufVal.replace(new RegExp(escapedGroupSeparator, "g"), '');
                    var radixSplit = bufVal.split(opts.radixPoint);
                    bufVal = radixSplit[0];
                    var reg = new RegExp('([-\+]?[\\d\?]+)([\\d\?]{' + opts.groupSize + '})');
                    while (reg.test(bufVal)) {
                        bufVal = bufVal.replace(reg, '$1' + opts.groupSeparator + '$2');
                        bufVal = bufVal.replace(opts.groupSeparator + opts.groupSeparator, opts.groupSeparator);
                    }
                    if (radixSplit.length > 1)
                        bufVal += opts.radixPoint + radixSplit[1];
                }
                buffer.length = bufVal.length; //align the length
                for (var i = 0, l = bufVal.length; i < l; i++) {
                    buffer[i] = bufVal.charAt(i);
                }
                var newPos = $.inArray("?", buffer);
                if (!reformatOnly) buffer.splice(newPos, 1);

                return reformatOnly ? pos : newPos;
            },
            regex: {
                number: function (opts) {
                    var escapedGroupSeparator = $.inputmask.escapeRegex.call(this, opts.groupSeparator);
                    var escapedRadixPoint = $.inputmask.escapeRegex.call(this, opts.radixPoint);
                    var digitExpression = isNaN(opts.digits) ? opts.digits : '{0,' + opts.digits + '}';
                    var signedExpression = opts.allowPlus || opts.allowMinus ? "[" + (opts.allowPlus ? "\+" : "") + (opts.allowMinus ? "-" : "") + "]?" : "";
                    return new RegExp("^" + signedExpression + "(\\d+|\\d{1," + opts.groupSize + "}((" + escapedGroupSeparator + "\\d{" + opts.groupSize + "})?)+)(" + escapedRadixPoint + "\\d" + digitExpression + ")?$");
                }
            },
            onKeyDown: function (e, buffer, opts) {
                var $input = $(this), input = this;
                if (e.keyCode == opts.keyCode.TAB) {
                    var radixPosition = $.inArray(opts.radixPoint, buffer);
                    if (radixPosition != -1) {
                        var masksets = $input.data('_inputmask')['masksets'];
                        var activeMasksetIndex = $input.data('_inputmask')['activeMasksetIndex'];
                        for (var i = 1; i <= opts.digits && i < opts.getMaskLength(masksets[activeMasksetIndex]["_buffer"], masksets[activeMasksetIndex]["greedy"], masksets[activeMasksetIndex]["repeat"], buffer, opts) ; i++) {
                            if (buffer[radixPosition + i] == undefined || buffer[radixPosition + i] == "") buffer[radixPosition + i] = "0";
                        }
                        input._valueSet(buffer.join(''));
                    }
                } else if (e.keyCode == opts.keyCode.DELETE || e.keyCode == opts.keyCode.BACKSPACE) {
                    opts.postFormat(buffer, 0, true, opts);
                    input._valueSet(buffer.join(''));
                    return true;
                }
            },
            definitions: {
                '~': { //real number
                    validator: function (chrs, buffer, pos, strict, opts) {
                        if (chrs == "") return false;
                        if (!strict && pos <= 1 && buffer[0] === '0' && new RegExp("[\\d-]").test(chrs) && buffer.join('').length == 1) { //handle first char
                            buffer[0] = "";
                            return { "pos": 0 };
                        }

                        var cbuf = strict ? buffer.slice(0, pos) : buffer.slice();

                        cbuf.splice(pos, 0, chrs);
                        var bufferStr = cbuf.join('');

                        //strip groupseparator
                        var escapedGroupSeparator = $.inputmask.escapeRegex.call(this, opts.groupSeparator);
                        bufferStr = bufferStr.replace(new RegExp(escapedGroupSeparator, "g"), '');

                        var isValid = opts.regex.number(opts).test(bufferStr);
                        if (!isValid) {
                            //let's help the regex a bit
                            bufferStr += "0";
                            isValid = opts.regex.number(opts).test(bufferStr);
                            if (!isValid) {
                                //make a valid group
                                var lastGroupSeparator = bufferStr.lastIndexOf(opts.groupSeparator);
                                for (var i = bufferStr.length - lastGroupSeparator; i <= 3; i++) {
                                    bufferStr += "0";
                                }

                                isValid = opts.regex.number(opts).test(bufferStr);
                                if (!isValid && !strict) {
                                    if (chrs == opts.radixPoint) {
                                        isValid = opts.regex.number(opts).test("0" + bufferStr + "0");
                                        if (isValid) {
                                            buffer[pos] = "0";
                                            pos++;
                                            return { "pos": pos };
                                        }
                                    }
                                }
                            }
                        }

                        if (isValid != false && !strict && chrs != opts.radixPoint) {
                            var newPos = opts.postFormat(buffer, pos, false, opts);
                            return { "pos": newPos };
                        }

                        return isValid;
                    },
                    cardinality: 1,
                    prevalidator: null
                }
            },
            insertMode: true,
            autoUnmask: false
        },
        'integer': {
            regex: {
                number: function (opts) {
                    var escapedGroupSeparator = $.inputmask.escapeRegex.call(this, opts.groupSeparator);
                    var signedExpression = opts.allowPlus || opts.allowMinus ? "[" + (opts.allowPlus ? "\+" : "") + (opts.allowMinus ? "-" : "") + "]?" : "";
                    return new RegExp("^" + signedExpression + "(\\d+|\\d{1," + opts.groupSize + "}((" + escapedGroupSeparator + "\\d{" + opts.groupSize + "})?)+)$");
                }
            },
            alias: "decimal"
        }
    });
})(jQuery);
});

require.register("ende/vendor/assets/javascripts/jquery/inview.js", function (exports, module) {
/**
 * author Christopher Blum
 *    - based on the idea of Remy Sharp, http://remysharp.com/2009/01/26/element-in-view-event-plugin/
 *    - forked from http://github.com/zuk/jquery.inview/
 */
(function ($) {
  var inviewObjects = {}, viewportSize, viewportOffset,
      d = document, w = window, documentElement = d.documentElement, expando = $.expando;

  $.event.special.inview = {
    add: function(data) {
      inviewObjects[data.guid + "-" + this[expando]] = { data: data, $element: $(this) };
    },

    remove: function(data) {
      try { delete inviewObjects[data.guid + "-" + this[expando]]; } catch(e) {}
    }
  };

  function getViewportSize() {
    var mode, domObject, size = { height: w.innerHeight, width: w.innerWidth };

    // if this is correct then return it. iPad has compat Mode, so will
    // go into check clientHeight/clientWidth (which has the wrong value).
    if (!size.height) {
      mode = d.compatMode;
      if (mode || !$.support.boxModel) { // IE, Gecko
        domObject = mode === 'CSS1Compat' ?
          documentElement : // Standards
          d.body; // Quirks
        size = {
          height: domObject.clientHeight,
          width:  domObject.clientWidth
        };
      }
    }

    return size;
  }

  function getViewportOffset() {
    return {
      top:  w.pageYOffset || documentElement.scrollTop   || d.body.scrollTop,
      left: w.pageXOffset || documentElement.scrollLeft  || d.body.scrollLeft
    };
  }

  function checkInView() {
    var $elements = $(), elementsLength, i = 0;

    $.each(inviewObjects, function(i, inviewObject) {
      var selector  = inviewObject.data.selector,
          $element  = inviewObject.$element;
      $elements = $elements.add(selector ? $element.find(selector) : $element);
    });

    elementsLength = $elements.length;
    if (elementsLength) {
      viewportSize   = viewportSize   || getViewportSize();
      viewportOffset = viewportOffset || getViewportOffset();

      for (; i<elementsLength; i++) {
        // Ignore elements that are not in the DOM tree
        if (!$.contains(documentElement, $elements[i])) {
          continue;
        }

        var $element      = $($elements[i]),
            elementSize   = { height: $element.height(), width: $element.width() },
            elementOffset = $element.offset(),
            inView        = $element.data('inview'),
            visiblePartX,
            visiblePartY,
            visiblePartsMerged;
        
        // Don't ask me why because I haven't figured out yet:
        // viewportOffset and viewportSize are sometimes suddenly null in Firefox 5.
        // Even though it sounds weird:
        // It seems that the execution of this function is interferred by the onresize/onscroll event
        // where viewportOffset and viewportSize are unset
        if (!viewportOffset || !viewportSize) {
          return;
        }
        
        if (elementOffset.top + elementSize.height > viewportOffset.top &&
            elementOffset.top < viewportOffset.top + viewportSize.height &&
            elementOffset.left + elementSize.width > viewportOffset.left &&
            elementOffset.left < viewportOffset.left + viewportSize.width) {
          visiblePartX = (viewportOffset.left > elementOffset.left ?
            'right' : (viewportOffset.left + viewportSize.width) < (elementOffset.left + elementSize.width) ?
            'left' : 'both');
          visiblePartY = (viewportOffset.top > elementOffset.top ?
            'bottom' : (viewportOffset.top + viewportSize.height) < (elementOffset.top + elementSize.height) ?
            'top' : 'both');
          visiblePartsMerged = visiblePartX + "-" + visiblePartY;
          if (!inView || inView !== visiblePartsMerged) {
            $element.data('inview', visiblePartsMerged).trigger('inview', [true, visiblePartX, visiblePartY]);
          }
        } else if (inView) {
          $element.data('inview', false).trigger('inview', [false]);
        }
      }
    }
  }

  $(w).bind("scroll resize", function() {
    viewportSize = viewportOffset = null;
  });
  
  // IE < 9 scrolls to focused elements without firing the "scroll" event
  if (!documentElement.addEventListener && documentElement.attachEvent) {
    documentElement.attachEvent("onfocusin", function() {
      viewportOffset = null;
    });
  }

  // Use setInterval in order to also make sure this captures elements within
  // "overflow:scroll" elements or elements that appeared in the dom tree due to
  // dom manipulation and reflow
  // old: $(window).scroll(checkInView);
  //
  // By the way, iOS (iPad, iPhone, ...) seems to not execute, or at least delays
  // intervals while the user scrolls. Therefore the inview event might fire a bit late there
  setInterval(checkInView, 250);
})(jQuery);
});

require.register("ende/vendor/assets/javascripts/lennon/lennon.js", function (exports, module) {
/*!
 * Lennon v0.1
 *
 * An extremely lightweight router that uses the History API and falls back to hash.
 *
 * @author Gabe Hayes <gabriel.hayes@gmail.com>
 * @copyright 2013, Gabe Hayes
 */
(function(window, $, Modernizr, undefined) {

    'use strict';

    return window.Lennon = function(opts) {

        var current_route,
            initialized = false,

            options = $.extend({

                //-- determines whether or not the history api is enabled
                historyEnabled: Modernizr.history,

                //-- a jQuery selector for links that will have routing behavior applied to them
                linkSelector: 'a[target!=_blank]:not([href^=http])',

                //-- the logger requires error, info and warn methods
                logger: window.console,

                //-- the publish event that will dispatch the registered event name
                publishEvent: null

            }, opts),

            routes = [],

            initialize = function(router) {

                var processRoute = function() {
                        router.process();
                    };

                if ( !initialized ) {

                    router.routes = routes

                    $(document).on('click', options.linkSelector, function() {
                        var $this = $(this),
                            href = $this.attr('href');

                        //-- Use pushstate on anchor clicks
                        if ( options.historyEnabled ) {
                            window.history.pushState(null, null, href);
                            processRoute();
                            return false;

                        //-- Hashify internal links if history is not available
                        } else {
                            if ( !$this.data('lennonized') ) {
                                $this.attr('href', '/#!' + href).data('lennonized', true);
                            }
                        }
                    });

                    $(window).on(options.historyEnabled? 'popstate' : 'hashchange', processRoute);
                    initialized = true;
                }

            };

        return (function() {

            return {
                define: function(pathName, eventName, exitEventName) {

                    var occurence = pathName.match(/:/g) || [],
                        pattern = new RegExp('^' + pathName.replace(/\//g, "\\/").replace(/:(\w*)/g,"(\\w*)") + '$'),
                        route = {
                            eventName: eventName,
                            exitEventName: exitEventName,
                            paramCount: occurence.length,
                            path: pathName,
                            pattern: pattern
                        };

                    //-- If the eventName is a string, we require a publishEvent
                    if ( 'string' === typeof eventName && !options.publishEvent ) {
                        throw new Error('Cannot publish the event "' + eventName + '" for the route "' + pathName + '". No publishEvent has been provided.');
                    }

                    //-- Add the route
                    options.logger.info('Adding route', pathName, route);
                    routes.push(route);

                    //-- Make sure we have initialized
                    initialize(this);
                },

                dispatch: function(route, context) {
                    var e;

                    options.logger.info('Dispatching', route.path, 'with', context);

                    //-- Execute the callback
                    if ( 'function' === typeof route.eventName ) {
                        e = route.eventName(context || {});

                    //-- Run the publish event
                    } else {
                        e = options.publishEvent(route.eventName, context || {});
                    }

                    return e;
                },

                process: function() {
                    var context = {},
                        i, j,
                        paramKeys,
                        params,
                        path = options.historyEnabled? window.location.pathname : window.location.hash.replace('#!', '') || '/';

                    //-- If we land on the page with a hash value and history is enabled, redirect to the non-hash page
                    if ( window.location.hash.indexOf('#!') != -1 && options.historyEnabled ) {
                        window.location.href = window.location.hash.replace('#!', '');

                    //-- If we land on the page with a path and history is disabled, redirect to the hash page
                    } else if ( '/' !== window.location.pathname && !options.historyEnabled ) {
                        window.location.href = '/#!' + window.location.pathname;
                    }

                    //-- Process the route
                    options.logger.info('Processing path', path);
                    for ( i in routes ) {

                        //-- See if the currently evaluated route matches the current path
                        params = path.match(routes[i].pattern);

                        //-- If there is a match, extract the path values and match them to their variable names for context
                        if ( params ) {
                            paramKeys = routes[i].path.match(/:(\w*)/g,"(\\w*)");
                            for ( j = 1; j <= routes[i].paramCount; j++ ) {
                                context[paramKeys[j - 1].replace(/:/g, '')] = params[j];
                            }

                            if ( current_route ) {

                                //-- Don't dispatch the route we are already on
                                if ( current_route.path === routes[i].path && current_route.search === window.location.search) {
                                    return false;
                                }

                                //-- Dispatch the exit event for the route we are leaving
                                if (  current_route.exitEventName ) {

                                    options.logger.info('Exiting', current_route.path, 'with', context || {});

                                    //-- Execute the callback
                                    if ( 'function' === typeof current_route.exitEventName ) {
                                        current_route.exitEventName(context || {});
                                    //-- Run the publish event
                                    } else {
                                        options.publishEvent(current_route.exitEventName, context || {});
                                    }
                                }
                            }

                            //-- Update the current route
                            current_route = routes[i];

                            //-- Update the current route search string
                            current_route.search = window.location.search

                            //-- Dispatch
                            return this.dispatch(routes[i], context);
                        }

                    }

                    //-- No route has been found, hence, nothing dispatched
                    options.logger.warn('No route dispatched');
                }
            };
        }());
    };
}(this, jQuery, Modernizr));

if ( typeof define === "function" && define.amd ) {
    define( "Lennon", [], function () { return Lennon; } );
}

});

require.register("ende/vendor/assets/javascripts/polyfills/es5-shim.js", function (exports, module) {
/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2014 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */

// vim: ts=4 sts=4 sw=4 expandtab

//Add semicolon to prevent IIFE from being passed as argument to concated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {

/**
 * Brings an environment as close to ECMAScript 5 compliance
 * as is possible with the facilities of erstwhile engines.
 *
 * Annotated ES5: http://es5.github.com/ (specific links below)
 * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
 * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
 */

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

function Empty() {}

if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) { // .length is 1
        // 1. Let Target be the this value.
        var target = this;
        // 2. If IsCallable(Target) is false, throw a TypeError exception.
        if (typeof target != "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        // 3. Let A be a new (possibly empty) internal list of all of the
        //   argument values provided after thisArg (arg1, arg2 etc), in order.
        // XXX slicedArgs will stand in for "A" if used
        var args = _Array_slice_.call(arguments, 1); // for normal call
        // 4. Let F be a new native ECMAScript object.
        // 11. Set the [[Prototype]] internal property of F to the standard
        //   built-in Function prototype object as specified in 15.3.3.1.
        // 12. Set the [[Call]] internal property of F as described in
        //   15.3.4.5.1.
        // 13. Set the [[Construct]] internal property of F as described in
        //   15.3.4.5.2.
        // 14. Set the [[HasInstance]] internal property of F as described in
        //   15.3.4.5.3.
        var binder = function () {

            if (this instanceof bound) {
                // 15.3.4.5.2 [[Construct]]
                // When the [[Construct]] internal method of a function object,
                // F that was created using the bind function is called with a
                // list of arguments ExtraArgs, the following steps are taken:
                // 1. Let target be the value of F's [[TargetFunction]]
                //   internal property.
                // 2. If target has no [[Construct]] internal method, a
                //   TypeError exception is thrown.
                // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Construct]] internal
                //   method of target providing args as the arguments.

                var result = target.apply(
                    this,
                    args.concat(_Array_slice_.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                // 15.3.4.5.1 [[Call]]
                // When the [[Call]] internal method of a function object, F,
                // which was created using the bind function is called with a
                // this value and a list of arguments ExtraArgs, the following
                // steps are taken:
                // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                //   property.
                // 2. Let boundThis be the value of F's [[BoundThis]] internal
                //   property.
                // 3. Let target be the value of F's [[TargetFunction]] internal
                //   property.
                // 4. Let args be a new list containing the same values as the
                //   list boundArgs in the same order followed by the same
                //   values as the list ExtraArgs in the same order.
                // 5. Return the result of calling the [[Call]] internal method
                //   of target providing boundThis as the this value and
                //   providing args as the arguments.

                // equiv: target.call(this, ...boundArgs, ...args)
                return target.apply(
                    that,
                    args.concat(_Array_slice_.call(arguments))
                );

            }

        };

        // 15. If the [[Class]] internal property of Target is "Function", then
        //     a. Let L be the length property of Target minus the length of A.
        //     b. Set the length own property of F to either 0 or L, whichever is
        //       larger.
        // 16. Else set the length own property of F to 0.

        var boundLength = Math.max(0, target.length - args.length);

        // 17. Set the attributes of the length own property of F to the values
        //   specified in 15.3.5.1.
        var boundArgs = [];
        for (var i = 0; i < boundLength; i++) {
            boundArgs.push("$" + i);
        }

        // XXX Build a dynamic function with desired amount of arguments is the only 
        // way to set the length property of a function. 
        // In environments where Content Security Policies enabled (Chrome extensions, 
        // for ex.) all use of eval or Function costructor throws an exception. 
        // However in all of these environments Function.prototype.bind exists 
        // and so this code will never be executed.
        var bound = Function("binder", "return function(" + boundArgs.join(",") + "){return binder.apply(this,arguments)}")(binder);

        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            // Clean up dangling references.
            Empty.prototype = null;
        }

        // TODO
        // 18. Set the [[Extensible]] internal property of F to true.

        // TODO
        // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
        // 20. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
        //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
        //   false.
        // 21. Call the [[DefineOwnProperty]] internal method of F with
        //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
        //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
        //   and false.

        // TODO
        // NOTE Function objects created using Function.prototype.bind do not
        // have a prototype property or the [[Code]], [[FormalParameters]], and
        // [[Scope]] internal properties.
        // XXX can't delete prototype in pure-js.

        // 22. Return F.
        return bound;
    };
}

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally.
// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// us it in defining shortcuts.
var call = Function.prototype.call;
var prototypeOfArray = Array.prototype;
var prototypeOfObject = Object.prototype;
var _Array_slice_ = prototypeOfArray.slice;
// Having a toString local variable name breaks in Opera so use _toString.
var _toString = call.bind(prototypeOfObject.toString);
var owns = call.bind(prototypeOfObject.hasOwnProperty);

// If JS engine supports accessors creating shortcuts.
var defineGetter;
var defineSetter;
var lookupGetter;
var lookupSetter;
var supportsAccessors;
if ((supportsAccessors = owns(prototypeOfObject, "__defineGetter__"))) {
    defineGetter = call.bind(prototypeOfObject.__defineGetter__);
    defineSetter = call.bind(prototypeOfObject.__defineSetter__);
    lookupGetter = call.bind(prototypeOfObject.__lookupGetter__);
    lookupSetter = call.bind(prototypeOfObject.__lookupSetter__);
}

//
// Array
// =====
//

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.12
// Default value for second param
// [bugfix, ielt9, old browsers]
// IE < 9 bug: [1,2].splice(0).join("") == "" but should be "12"
if ([1,2].splice(0).length != 2) {
    var array_splice = Array.prototype.splice;
    var array_push = Array.prototype.push;
    var array_unshift = Array.prototype.unshift;

    if (function() { // test IE < 9 to splice bug - see issue #138
        function makeArray(l) {
            var a = [];
            while (l--) {
                a.unshift(l)
            }
            return a
        }

        var array = []
            , lengthBefore
        ;

        array.splice.bind(array, 0, 0).apply(null, makeArray(20));
        array.splice.bind(array, 0, 0).apply(null, makeArray(26));

        lengthBefore = array.length; //20
        array.splice(5, 0, "XXX"); // add one element

        if (lengthBefore + 1 == array.length) {
            return true;// has right splice implementation without bugs
        }
        // else {
        //    IE8 bug
        // }
    }()) {//IE 6/7
        Array.prototype.splice = function(start, deleteCount) {
            if (!arguments.length) {
                return [];
            } else {
                return array_splice.apply(this, [
                    start === void 0 ? 0 : start,
                    deleteCount === void 0 ? (this.length - start) : deleteCount
                ].concat(_Array_slice_.call(arguments, 2)))
            }
        };
    }
    else {//IE8
        Array.prototype.splice = function(start, deleteCount) {
            var result
                , args = _Array_slice_.call(arguments, 2)
                , addElementsCount = args.length
            ;

            if (!arguments.length) {
                return [];
            }

            if (start === void 0) { // default
                start = 0;
            }
            if (deleteCount === void 0) { // default
                deleteCount = this.length - start;
            }

            if (addElementsCount > 0) {
                if (deleteCount <= 0) {
                    if (start == this.length) { // tiny optimisation #1
                        array_push.apply(this, args);
                        return [];
                    }

                    if (start == 0) { // tiny optimisation #2
                        array_unshift.apply(this, args);
                        return [];
                    }
                }

                // Array.prototype.splice implementation
                result = _Array_slice_.call(this, start, start + deleteCount);// delete part
                args.push.apply(args, _Array_slice_.call(this, start + deleteCount, this.length));// right part
                args.unshift.apply(args, _Array_slice_.call(this, 0, start));// left part

                // delete all items from this array and replace it to 'left part' + _Array_slice_.call(arguments, 2) + 'right part'
                args.unshift(0, this.length);

                array_splice.apply(this, args);

                return result;
            }

            return array_splice.call(this, start, deleteCount);
        }

    }
}

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.13
// Return len+argCount.
// [bugfix, ielt8]
// IE < 8 bug: [].unshift(0) == undefined but should be "1"
if ([].unshift(0) != 1) {
    var array_unshift = Array.prototype.unshift;
    Array.prototype.unshift = function() {
        array_unshift.apply(this, arguments);
        return this.length;
    };
}

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function isArray(obj) {
        return _toString(obj) == "[object Array]";
    };
}

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach


// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
var boxedString = Object("a");
var splitString = boxedString[0] != "a" || !(0 in boxedString);

var properlyBoxesContext = function properlyBoxed(method) {
    // Check node 0.6.21 bug where third parameter is not boxed
    var properlyBoxes = true;
    if (method) {
        method.call('foo', function (item, index, context) {
            if (typeof context !== 'object') { properlyBoxes = false; }
        });
    }
    return !!method && properlyBoxes;
};

if (!Array.prototype.forEach || !properlyBoxesContext(Array.prototype.forEach)) {
    Array.prototype.forEach = function forEach(fun /*, thisp*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            thisp = arguments[1],
            i = -1,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(); // TODO message
        }

        while (++i < length) {
            if (i in self) {
                // Invoke the callback function with call, passing arguments:
                // context, property value, property key, thisArg object
                // context
                fun.call(thisp, self[i], i, object);
            }
        }
    };
}

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
if (!Array.prototype.map || !properlyBoxesContext(Array.prototype.map)) {
    Array.prototype.map = function map(fun /*, thisp*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            result = Array(length),
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self)
                result[i] = fun.call(thisp, self[i], i, object);
        }
        return result;
    };
}

// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
if (!Array.prototype.filter || !properlyBoxesContext(Array.prototype.filter)) {
    Array.prototype.filter = function filter(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                    object,
            length = self.length >>> 0,
            result = [],
            value,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self) {
                value = self[i];
                if (fun.call(thisp, value, i, object)) {
                    result.push(value);
                }
            }
        }
        return result;
    };
}

// ES5 15.4.4.16
// http://es5.github.com/#x15.4.4.16
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
if (!Array.prototype.every || !properlyBoxesContext(Array.prototype.every)) {
    Array.prototype.every = function every(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && !fun.call(thisp, self[i], i, object)) {
                return false;
            }
        }
        return true;
    };
}

// ES5 15.4.4.17
// http://es5.github.com/#x15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some || !properlyBoxesContext(Array.prototype.some)) {
    Array.prototype.some = function some(fun /*, thisp */) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0,
            thisp = arguments[1];

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        for (var i = 0; i < length; i++) {
            if (i in self && fun.call(thisp, self[i], i, object)) {
                return true;
            }
        }
        return false;
    };
}

// ES5 15.4.4.21
// http://es5.github.com/#x15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function reduce(fun /*, initial*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        // no value to return if no initial value and an empty array
        if (!length && arguments.length == 1) {
            throw new TypeError("reduce of empty array with no initial value");
        }

        var i = 0;
        var result;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i++];
                    break;
                }

                // if array contains no values, no initial value to return
                if (++i >= length) {
                    throw new TypeError("reduce of empty array with no initial value");
                }
            } while (true);
        }

        for (; i < length; i++) {
            if (i in self) {
                result = fun.call(void 0, result, self[i], i, object);
            }
        }

        return result;
    };
}

// ES5 15.4.4.22
// http://es5.github.com/#x15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function reduceRight(fun /*, initial*/) {
        var object = toObject(this),
            self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                object,
            length = self.length >>> 0;

        // If no callback function or if callback is not a callable function
        if (_toString(fun) != "[object Function]") {
            throw new TypeError(fun + " is not a function");
        }

        // no value to return if no initial value, empty array
        if (!length && arguments.length == 1) {
            throw new TypeError("reduceRight of empty array with no initial value");
        }

        var result, i = length - 1;
        if (arguments.length >= 2) {
            result = arguments[1];
        } else {
            do {
                if (i in self) {
                    result = self[i--];
                    break;
                }

                // if array contains no values, no initial value to return
                if (--i < 0) {
                    throw new TypeError("reduceRight of empty array with no initial value");
                }
            } while (true);
        }

        if (i < 0) {
            return result;
        }

        do {
            if (i in this) {
                result = fun.call(void 0, result, self[i], i, object);
            }
        } while (i--);

        return result;
    };
}

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
if (!Array.prototype.indexOf || ([0, 1].indexOf(1, 2) != -1)) {
    Array.prototype.indexOf = function indexOf(sought /*, fromIndex */ ) {
        var self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }

        var i = 0;
        if (arguments.length > 1) {
            i = toInteger(arguments[1]);
        }

        // handle negative indices
        i = i >= 0 ? i : Math.max(0, length + i);
        for (; i < length; i++) {
            if (i in self && self[i] === sought) {
                return i;
            }
        }
        return -1;
    };
}

// ES5 15.4.4.15
// http://es5.github.com/#x15.4.4.15
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
if (!Array.prototype.lastIndexOf || ([0, 1].lastIndexOf(0, -3) != -1)) {
    Array.prototype.lastIndexOf = function lastIndexOf(sought /*, fromIndex */) {
        var self = splitString && _toString(this) == "[object String]" ?
                this.split("") :
                toObject(this),
            length = self.length >>> 0;

        if (!length) {
            return -1;
        }
        var i = length - 1;
        if (arguments.length > 1) {
            i = Math.min(i, toInteger(arguments[1]));
        }
        // handle negative indices
        i = i >= 0 ? i : length - Math.abs(i);
        for (; i >= 0; i--) {
            if (i in self && sought === self[i]) {
                return i;
            }
        }
        return -1;
    };
}

//
// Object
// ======
//

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14
if (!Object.keys) {
    // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    var hasDontEnumBug = true,
        hasProtoEnumBug = (function () {}).propertyIsEnumerable('prototype'),
        dontEnums = [
            "toString",
            "toLocaleString",
            "valueOf",
            "hasOwnProperty",
            "isPrototypeOf",
            "propertyIsEnumerable",
            "constructor"
        ],
        dontEnumsLength = dontEnums.length;

    for (var key in {"toString": null}) {
        hasDontEnumBug = false;
    }

    Object.keys = function keys(object) {
        var isFunction = _toString(object) === '[object Function]',
            isObject = object !== null && typeof object === 'object';

        if (!isObject && !isFunction) {
            throw new TypeError("Object.keys called on a non-object");
        }

        var keys = [],
            skipProto = hasProtoEnumBug && isFunction;
        for (var name in object) {
            if (!(skipProto && name === 'prototype') && owns(object, name)) {
                keys.push(name);
            }
        }

        if (hasDontEnumBug) {
            var ctor = object.constructor,
                skipConstructor = ctor && ctor.prototype === object;
            for (var i = 0; i < dontEnumsLength; i++) {
                var dontEnum = dontEnums[i];
                if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
                    keys.push(dontEnum);
                }
            }
        }
        return keys;
    };

}

//
// Date
// ====
//

// ES5 15.9.5.43
// http://es5.github.com/#x15.9.5.43
// This function returns a String value represent the instance in time
// represented by this Date object. The format of the String is the Date Time
// string format defined in 15.9.1.15. All fields are present in the String.
// The time zone is always UTC, denoted by the suffix Z. If the time value of
// this object is not a finite Number a RangeError exception is thrown.
var negativeDate = -62198755200000,
    negativeYearString = "-000001";
if (
    !Date.prototype.toISOString ||
    (new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1)
) {
    Date.prototype.toISOString = function toISOString() {
        var result, length, value, year, month;
        if (!isFinite(this)) {
            throw new RangeError("Date.prototype.toISOString called on non-finite value.");
        }

        year = this.getUTCFullYear();

        month = this.getUTCMonth();
        // see https://github.com/es-shims/es5-shim/issues/111
        year += Math.floor(month / 12);
        month = (month % 12 + 12) % 12;

        // the date time string format is specified in 15.9.1.15.
        result = [month + 1, this.getUTCDate(),
            this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds()];
        year = (
            (year < 0 ? "-" : (year > 9999 ? "+" : "")) +
            ("00000" + Math.abs(year))
            .slice(0 <= year && year <= 9999 ? -4 : -6)
        );

        length = result.length;
        while (length--) {
            value = result[length];
            // pad months, days, hours, minutes, and seconds to have two
            // digits.
            if (value < 10) {
                result[length] = "0" + value;
            }
        }
        // pad milliseconds to have three digits.
        return (
            year + "-" + result.slice(0, 2).join("-") +
            "T" + result.slice(2).join(":") + "." +
            ("000" + this.getUTCMilliseconds()).slice(-3) + "Z"
        );
    };
}


// ES5 15.9.5.44
// http://es5.github.com/#x15.9.5.44
// This function provides a String representation of a Date object for use by
// JSON.stringify (15.12.3).
var dateToJSONIsSupported = false;
try {
    dateToJSONIsSupported = (
        Date.prototype.toJSON &&
        new Date(NaN).toJSON() === null &&
        new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
        Date.prototype.toJSON.call({ // generic
            toISOString: function () {
                return true;
            }
        })
    );
} catch (e) {
}
if (!dateToJSONIsSupported) {
    Date.prototype.toJSON = function toJSON(key) {
        // When the toJSON method is called with argument key, the following
        // steps are taken:

        // 1.  Let O be the result of calling ToObject, giving it the this
        // value as its argument.
        // 2. Let tv be toPrimitive(O, hint Number).
        var o = Object(this),
            tv = toPrimitive(o),
            toISO;
        // 3. If tv is a Number and is not finite, return null.
        if (typeof tv === "number" && !isFinite(tv)) {
            return null;
        }
        // 4. Let toISO be the result of calling the [[Get]] internal method of
        // O with argument "toISOString".
        toISO = o.toISOString;
        // 5. If IsCallable(toISO) is false, throw a TypeError exception.
        if (typeof toISO != "function") {
            throw new TypeError("toISOString property is not callable");
        }
        // 6. Return the result of calling the [[Call]] internal method of
        //  toISO with O as the this value and an empty argument list.
        return toISO.call(o);

        // NOTE 1 The argument is ignored.

        // NOTE 2 The toJSON function is intentionally generic; it does not
        // require that its this value be a Date object. Therefore, it can be
        // transferred to other kinds of objects for use as a method. However,
        // it does require that any such object have a toISOString method. An
        // object is free to use the argument key to filter its
        // stringification.
    };
}

// ES5 15.9.4.2
// http://es5.github.com/#x15.9.4.2
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
if (!Date.parse || "Date.parse is buggy") {
    // XXX global assignment won't work in embeddings that use
    // an alternate object for the context.
    Date = (function(NativeDate) {

        // Date.length === 7
        function Date(Y, M, D, h, m, s, ms) {
            var length = arguments.length;
            if (this instanceof NativeDate) {
                var date = length == 1 && String(Y) === Y ? // isString(Y)
                    // We explicitly pass it through parse:
                    new NativeDate(Date.parse(Y)) :
                    // We have to manually make calls depending on argument
                    // length here
                    length >= 7 ? new NativeDate(Y, M, D, h, m, s, ms) :
                    length >= 6 ? new NativeDate(Y, M, D, h, m, s) :
                    length >= 5 ? new NativeDate(Y, M, D, h, m) :
                    length >= 4 ? new NativeDate(Y, M, D, h) :
                    length >= 3 ? new NativeDate(Y, M, D) :
                    length >= 2 ? new NativeDate(Y, M) :
                    length >= 1 ? new NativeDate(Y) :
                                  new NativeDate();
                // Prevent mixups with unfixed Date object
                date.constructor = Date;
                return date;
            }
            return NativeDate.apply(this, arguments);
        };

        // 15.9.1.15 Date Time String Format.
        var isoDateExpression = new RegExp("^" +
            "(\\d{4}|[\+\-]\\d{6})" + // four-digit year capture or sign +
                                      // 6-digit extended year
            "(?:-(\\d{2})" + // optional month capture
            "(?:-(\\d{2})" + // optional day capture
            "(?:" + // capture hours:minutes:seconds.milliseconds
                "T(\\d{2})" + // hours capture
                ":(\\d{2})" + // minutes capture
                "(?:" + // optional :seconds.milliseconds
                    ":(\\d{2})" + // seconds capture
                    "(?:(\\.\\d{1,}))?" + // milliseconds capture
                ")?" +
            "(" + // capture UTC offset component
                "Z|" + // UTC capture
                "(?:" + // offset specifier +/-hours:minutes
                    "([-+])" + // sign capture
                    "(\\d{2})" + // hours offset capture
                    ":(\\d{2})" + // minutes offset capture
                ")" +
            ")?)?)?)?" +
        "$");

        var months = [
            0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365
        ];

        function dayFromMonth(year, month) {
            var t = month > 1 ? 1 : 0;
            return (
                months[month] +
                Math.floor((year - 1969 + t) / 4) -
                Math.floor((year - 1901 + t) / 100) +
                Math.floor((year - 1601 + t) / 400) +
                365 * (year - 1970)
            );
        }

        function toUTC(t) {
            return Number(new NativeDate(1970, 0, 1, 0, 0, 0, t));
        }

        // Copy any custom methods a 3rd party library may have added
        for (var key in NativeDate) {
            Date[key] = NativeDate[key];
        }

        // Copy "native" methods explicitly; they may be non-enumerable
        Date.now = NativeDate.now;
        Date.UTC = NativeDate.UTC;
        Date.prototype = NativeDate.prototype;
        Date.prototype.constructor = Date;

        // Upgrade Date.parse to handle simplified ISO 8601 strings
        Date.parse = function parse(string) {
            var match = isoDateExpression.exec(string);
            if (match) {
                // parse months, days, hours, minutes, seconds, and milliseconds
                // provide default values if necessary
                // parse the UTC offset component
                var year = Number(match[1]),
                    month = Number(match[2] || 1) - 1,
                    day = Number(match[3] || 1) - 1,
                    hour = Number(match[4] || 0),
                    minute = Number(match[5] || 0),
                    second = Number(match[6] || 0),
                    millisecond = Math.floor(Number(match[7] || 0) * 1000),
                    // When time zone is missed, local offset should be used
                    // (ES 5.1 bug)
                    // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                    isLocalTime = Boolean(match[4] && !match[8]),
                    signOffset = match[9] === "-" ? 1 : -1,
                    hourOffset = Number(match[10] || 0),
                    minuteOffset = Number(match[11] || 0),
                    result;
                if (
                    hour < (
                        minute > 0 || second > 0 || millisecond > 0 ?
                        24 : 25
                    ) &&
                    minute < 60 && second < 60 && millisecond < 1000 &&
                    month > -1 && month < 12 && hourOffset < 24 &&
                    minuteOffset < 60 && // detect invalid offsets
                    day > -1 &&
                    day < (
                        dayFromMonth(year, month + 1) -
                        dayFromMonth(year, month)
                    )
                ) {
                    result = (
                        (dayFromMonth(year, month) + day) * 24 +
                        hour +
                        hourOffset * signOffset
                    ) * 60;
                    result = (
                        (result + minute + minuteOffset * signOffset) * 60 +
                        second
                    ) * 1000 + millisecond;
                    if (isLocalTime) {
                        result = toUTC(result);
                    }
                    if (-8.64e15 <= result && result <= 8.64e15) {
                        return result;
                    }
                }
                return NaN;
            }
            return NativeDate.parse.apply(this, arguments);
        };

        return Date;
    })(Date);
}

// ES5 15.9.4.4
// http://es5.github.com/#x15.9.4.4
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}


//
// Number
// ======
//

// ES5.1 15.7.4.5
// http://es5.github.com/#x15.7.4.5
if (!Number.prototype.toFixed || (0.00008).toFixed(3) !== '0.000' || (0.9).toFixed(0) === '0' || (1.255).toFixed(2) !== '1.25' || (1000000000000000128).toFixed(0) !== "1000000000000000128") {
    // Hide these variables and functions
    (function () {
        var base, size, data, i;

        base = 1e7;
        size = 6;
        data = [0, 0, 0, 0, 0, 0];

        function multiply(n, c) {
            var i = -1;
            while (++i < size) {
                c += n * data[i];
                data[i] = c % base;
                c = Math.floor(c / base);
            }
        }

        function divide(n) {
            var i = size, c = 0;
            while (--i >= 0) {
                c += data[i];
                data[i] = Math.floor(c / n);
                c = (c % n) * base;
            }
        }

        function toString() {
            var i = size;
            var s = '';
            while (--i >= 0) {
                if (s !== '' || i === 0 || data[i] !== 0) {
                    var t = String(data[i]);
                    if (s === '') {
                        s = t;
                    } else {
                        s += '0000000'.slice(0, 7 - t.length) + t;
                    }
                }
            }
            return s;
        }

        function pow(x, n, acc) {
            return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
        }

        function log(x) {
            var n = 0;
            while (x >= 4096) {
                n += 12;
                x /= 4096;
            }
            while (x >= 2) {
                n += 1;
                x /= 2;
            }
            return n;
        }

        Number.prototype.toFixed = function (fractionDigits) {
            var f, x, s, m, e, z, j, k;

            // Test for NaN and round fractionDigits down
            f = Number(fractionDigits);
            f = f !== f ? 0 : Math.floor(f);

            if (f < 0 || f > 20) {
                throw new RangeError("Number.toFixed called with invalid number of decimals");
            }

            x = Number(this);

            // Test for NaN
            if (x !== x) {
                return "NaN";
            }

            // If it is too big or small, return the string value of the number
            if (x <= -1e21 || x >= 1e21) {
                return String(x);
            }

            s = "";

            if (x < 0) {
                s = "-";
                x = -x;
            }

            m = "0";

            if (x > 1e-21) {
                // 1e-21 < x < 1e21
                // -70 < log2(x) < 70
                e = log(x * pow(2, 69, 1)) - 69;
                z = (e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1));
                z *= 0x10000000000000; // Math.pow(2, 52);
                e = 52 - e;

                // -18 < e < 122
                // x = z / 2 ^ e
                if (e > 0) {
                    multiply(0, z);
                    j = f;

                    while (j >= 7) {
                        multiply(1e7, 0);
                        j -= 7;
                    }

                    multiply(pow(10, j, 1), 0);
                    j = e - 1;

                    while (j >= 23) {
                        divide(1 << 23);
                        j -= 23;
                    }

                    divide(1 << j);
                    multiply(1, 1);
                    divide(2);
                    m = toString();
                } else {
                    multiply(0, z);
                    multiply(1 << (-e), 0);
                    m = toString() + '0.00000000000000000000'.slice(2, 2 + f);
                }
            }

            if (f > 0) {
                k = m.length;

                if (k <= f) {
                    m = s + '0.0000000000000000000'.slice(0, f - k + 2) + m;
                } else {
                    m = s + m.slice(0, k - f) + '.' + m.slice(k - f);
                }
            } else {
                m = s + m;
            }

            return m;
        }
    }());
}


//
// String
// ======
//


// ES5 15.5.4.14
// http://es5.github.com/#x15.5.4.14

// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
// Many browsers do not split properly with regular expressions or they
// do not perform the split correctly under obscure conditions.
// See http://blog.stevenlevithan.com/archives/cross-browser-split
// I've tested in many browsers and this seems to cover the deviant ones:
//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
//       [undefined, "t", undefined, "e", ...]
//    ''.split(/.?/) should be [], not [""]
//    '.'.split(/()()/) should be ["."], not ["", "", "."]

var string_split = String.prototype.split;
if (
    'ab'.split(/(?:ab)*/).length !== 2 ||
    '.'.split(/(.?)(.?)/).length !== 4 ||
    'tesst'.split(/(s)*/)[1] === "t" ||
    ''.split(/.?/).length ||
    '.'.split(/()()/).length > 1
) {
    (function () {
        var compliantExecNpcg = /()??/.exec("")[1] === void 0; // NPCG: nonparticipating capturing group

        String.prototype.split = function (separator, limit) {
            var string = this;
            if (separator === void 0 && limit === 0)
                return [];

            // If `separator` is not a regex, use native split
            if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
                return string_split.apply(this, arguments);
            }

            var output = [],
                flags = (separator.ignoreCase ? "i" : "") +
                        (separator.multiline  ? "m" : "") +
                        (separator.extended   ? "x" : "") + // Proposed for ES6
                        (separator.sticky     ? "y" : ""), // Firefox 3+
                lastLastIndex = 0,
                // Make `global` and avoid `lastIndex` issues by working with a copy
                separator = new RegExp(separator.source, flags + "g"),
                separator2, match, lastIndex, lastLength;
            string += ""; // Type-convert
            if (!compliantExecNpcg) {
                // Doesn't need flags gy, but they don't hurt
                separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
            }
            /* Values for `limit`, per the spec:
             * If undefined: 4294967295 // Math.pow(2, 32) - 1
             * If 0, Infinity, or NaN: 0
             * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
             * If negative number: 4294967296 - Math.floor(Math.abs(limit))
             * If other: Type-convert, then use the above rules
             */
            limit = limit === void 0 ?
                -1 >>> 0 : // Math.pow(2, 32) - 1
                limit >>> 0; // ToUint32(limit)
            while (match = separator.exec(string)) {
                // `separator.lastIndex` is not reliable cross-browser
                lastIndex = match.index + match[0].length;
                if (lastIndex > lastLastIndex) {
                    output.push(string.slice(lastLastIndex, match.index));
                    // Fix browsers whose `exec` methods don't consistently return `undefined` for
                    // nonparticipating capturing groups
                    if (!compliantExecNpcg && match.length > 1) {
                        match[0].replace(separator2, function () {
                            for (var i = 1; i < arguments.length - 2; i++) {
                                if (arguments[i] === void 0) {
                                    match[i] = void 0;
                                }
                            }
                        });
                    }
                    if (match.length > 1 && match.index < string.length) {
                        Array.prototype.push.apply(output, match.slice(1));
                    }
                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;
                    if (output.length >= limit) {
                        break;
                    }
                }
                if (separator.lastIndex === match.index) {
                    separator.lastIndex++; // Avoid an infinite loop
                }
            }
            if (lastLastIndex === string.length) {
                if (lastLength || !separator.test("")) {
                    output.push("");
                }
            } else {
                output.push(string.slice(lastLastIndex));
            }
            return output.length > limit ? output.slice(0, limit) : output;
        };
    }());

// [bugfix, chrome]
// If separator is undefined, then the result array contains just one String,
// which is the this value (converted to a String). If limit is not undefined,
// then the output array is truncated so that it contains no more than limit
// elements.
// "0".split(undefined, 0) -> []
} else if ("0".split(void 0, 0).length) {
    String.prototype.split = function(separator, limit) {
        if (separator === void 0 && limit === 0) return [];
        return string_split.apply(this, arguments);
    }
}


// ECMA-262, 3rd B.2.3
// Note an ECMAScript standart, although ECMAScript 3rd Edition has a
// non-normative section suggesting uniform semantics and it should be
// normalized across all browsers
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
if ("".substr && "0b".substr(-1) !== "b") {
    var string_substr = String.prototype.substr;
    /**
     *  Get the substring of a string
     *  @param  {integer}  start   where to start the substring
     *  @param  {integer}  length  how many characters to return
     *  @return {string}
     */
    String.prototype.substr = function(start, length) {
        return string_substr.call(
            this,
            start < 0 ? ((start = this.length + start) < 0 ? 0 : start) : start,
            length
        );
    }
}

// ES5 15.5.4.20
// whitespace from: http://es5.github.io/#x15.5.4.20
var ws = "\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003" +
    "\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028" +
    "\u2029\uFEFF";
if (!String.prototype.trim || ws.trim()) {
    // http://blog.stevenlevithan.com/archives/faster-trim-javascript
    // http://perfectionkills.com/whitespace-deviations/
    ws = "[" + ws + "]";
    var trimBeginRegexp = new RegExp("^" + ws + ws + "*"),
        trimEndRegexp = new RegExp(ws + ws + "*$");
    String.prototype.trim = function trim() {
        if (this === void 0 || this === null) {
            throw new TypeError("can't convert "+this+" to object");
        }
        return String(this)
            .replace(trimBeginRegexp, "")
            .replace(trimEndRegexp, "");
    };
}

// ES-5 15.1.2.2
if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {
    parseInt = (function (origParseInt) {
        var hexRegex = /^0[xX]/;
        return function parseIntES5(str, radix) {
            str = String(str).trim();
            if (!+radix) {
                radix = hexRegex.test(str) ? 16 : 10;
            }
            return origParseInt(str, radix);
        };
    }(parseInt));
}

//
// Util
// ======
//

// ES5 9.4
// http://es5.github.com/#x9.4
// http://jsperf.com/to-integer

function toInteger(n) {
    n = +n;
    if (n !== n) { // isNaN
        n = 0;
    } else if (n !== 0 && n !== (1/0) && n !== -(1/0)) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }
    return n;
}

function isPrimitive(input) {
    var type = typeof input;
    return (
        input === null ||
        type === "undefined" ||
        type === "boolean" ||
        type === "number" ||
        type === "string"
    );
}

function toPrimitive(input) {
    var val, valueOf, toString;
    if (isPrimitive(input)) {
        return input;
    }
    valueOf = input.valueOf;
    if (typeof valueOf === "function") {
        val = valueOf.call(input);
        if (isPrimitive(val)) {
            return val;
        }
    }
    toString = input.toString;
    if (typeof toString === "function") {
        val = toString.call(input);
        if (isPrimitive(val)) {
            return val;
        }
    }
    throw new TypeError();
}

// ES5 9.9
// http://es5.github.com/#x9.9
var toObject = function (o) {
    if (o == null) { // this matches both null and undefined
        throw new TypeError("can't convert "+o+" to object");
    }
    return Object(o);
};

}));

});

require.register("ende/vendor/assets/javascripts/polyfills/es6-map-shim.js", function (exports, module) {
/**
 * Copyright 2012 Eric Wendelin - MIT License
 *
 * es6-map-shim.js is a DESTRUCTIVE shim that follows the latest Map specification
 * as closely as possible. It is destructive in the sense that it overrides native implementations.
 *
 * IMPORTANT: Currently, get(), set(), has() and delete() are all O(n) operations.
 * Normally, they would be O(1). Therefore it is NOT recommended to use this with
 * a large dataset or in any production environment.
 *
 * This library assumes ES5 functionality: Object.create, Object.defineProperty,
 * Array.indexOf, Function.bind and others.
 */
(function(module) {
    function Map(iterable) {
        var _items = [];
        var _keys = [];
        var _values = [];

        // Object.is polyfill, courtesy of @WebReflection
        var is = Object.is || function(a, b) {
            return a === b ?
                a !== 0 || 1 / a == 1 / b :
                a != a && b != b;
        };

        // More reliable indexOf, courtesy of @WebReflection
        var betterIndexOf = function(value) {
            if(value != value || value === 0) {
                for(var i = this.length; i-- && !is(this[i], value););
            } else {
                i = [].indexOf.call(this, value);
            }
            return i;
        };

        /**
         * MapIterator used for iterating over all entries in given map.
         *
         * @param map {Map} to iterate
         * @param kind {String} identifying what to yield. Possible values
         *      are 'keys', 'values' and 'keys+values'
         * @constructor
         */
        var MapIterator = function MapIterator(map, kind) {
            var _index = 0;

            return Object.create({}, {
                next: {
                    value: function() {
                        // check if index is within bounds
                        if (_index < map.items().length) {
                            switch(kind) {
                                case 'keys': return map.keys()[_index++];
                                case 'values': return map.values()[_index++];
                                case 'keys+values': return [].slice.call(map.items()[_index++]);
                                default: throw new TypeError('Invalid iterator type');
                            }
                        }
                        // TODO: make sure I'm interpreting the spec correctly here
                        throw new Error('Stop Iteration');
                    }
                },
                iterator: {
                    value: function() {
                        return this;
                    }
                },
                toString: {
                    value: function() {
                        return '[object Map Iterator]';
                    }
                }
            });
        };

        var _set = function(key, value) {
            // check if key exists and overwrite
            var index = betterIndexOf.call(_keys, key);
            if (index > -1) {
                _items[index] = value;
                _values[index] = value;
            } else {
                _items.push([key, value]);
                _keys.push(key);
                _values.push(value);
            }
        };

        var setItem = function(item) {
            if (item.length !== 2) {
                throw new TypeError('Invalid iterable passed to Map constructor');
            }

            _set(item[0], item[1]);
        };

        // FIXME: accommodate any class that defines an @@iterator method that returns
        //      an iterator object that produces two element array-like objects
        if (Array.isArray(iterable)) {
            iterable.forEach(setItem);
        } else if (iterable !== undefined) {
            throw new TypeError('Invalid Map');
        }

        return Object.create(MapPrototype, {
            /**
             * @return {Array} all entries in the Map, in order
             */
            items:{
                value:function() {
                    return [].slice.call(_items);
                }
            },
            /**
             * @return {Array} all keys in the Map, in order
             */
            keys:{
                value:function() {
                    return [].slice.call(_keys);
                }
            },
            /**
             * @return {Array} all values in the Map, in order
             */
            values:{
                value:function() {
                    return [].slice.call(_values);
                }
            },
            /**
             * Given a key, indicate whether that key exists in this Map.
             *
             * @param key {Object} expected key
             * @return {Boolean} true if key in Map
             */
            has:{
                value:function(key) {
                    // TODO: double-check how spec reads about null values
                    var index = betterIndexOf.call(_keys, key);
                    return index > -1;
                }
            },
            /**
             * Given a key, retrieve the value associated with that key (or undefined).
             *
             * @param key {Object}
             * @return {Object} value associated with key or undefined
             */
            get:{
                value:function(key) {
                    var index = betterIndexOf.call(_keys, key);
                    return index > -1 ? _values[index] : undefined;
                }
            },
            /**
             * Add or overwrite entry associating key with value. Always returns undefined.
             *
             * @param key {Object} anything
             * @param value {Object} also anything
             */
            set:{
                value: _set
            },
            /**
             * Return the number of entries in this Map.
             *
             * @return {Number} number of entries
             */
            size:{
                get:function() {
                    return _items.length;
                }
            },
            /**
             * Remove all entries in this Map. Returns undefined.
             */
            clear:{
                value:function() {
                    _keys.length = _values.length = _items.length = 0;
                }
            },
            /**
             * Delete entry with given key, if it exists.
             *
             * @param key {Object} any possible key
             * @return {Boolean} true if an entry was deleted
             */
            'delete':{
                value:function(key) {
                    var index = betterIndexOf.call(_keys, key);
                    if (index > -1) {
                        _keys.splice(index, 1);
                        _values.splice(index, 1);
                        _items.splice(index, 1);
                        return true;
                    }
                    return false;
                }
            },
            /**
             * Given a callback function and optional context, invoke the callback on all
             * entries in this Map.
             *
             * @param callbackFn {Function}
             */
            forEach:{
                value:function(callbackfn /*, thisArg*/) {
                    if (typeof callbackfn != 'function') {
                        throw new TypeError('Invalid callback function given to forEach');
                    }

                    function tryNext() {
                        try {
                            return iter.next();
                        } catch(e) {
                            return undefined;
                        }
                    }

                    var iter = this.iterator();
                    var current = tryNext();
                    var next = tryNext();
                    while(current !== undefined) {
                        callbackfn.apply(arguments[1], [current[1], current[0], this]);
                        current = next;
                        next = tryNext();
                    }
                }
            },
            /**
             * Return a MapIterator object for this map.
             */
            iterator:{
                value: function() {
                    return new MapIterator(this, 'keys+values');
                }
            },
            toString:{
                value: function() {
                    return '[Object Map]';
                }
            }
        });
    }

    var notInNode = !!module;
    var window = notInNode ? this : global;
    var module = notInNode ? {} : exports;
    var MapPrototype = Map.prototype;

    Map.prototype = MapPrototype = Map();

    window.Map = module.Map = window.Map || Map;
}.call(this, window));

});

require.register("ende/vendor/assets/javascripts/spin/spin.js", function (exports, module) {
//fgnass.github.com/spin.js#v1.3

/**
 * Copyright (c) 2011-2013 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

  /* CommonJS */
  if (typeof exports == 'object')  module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}
(this, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    if(s[prop] !== undefined) return prop
    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = { x:el.offsetLeft, y:el.offsetTop }
    while((el = el.offsetParent))
      o.x+=el.offsetLeft, o.y+=el.offsetTop

    return o
  }

  // Built-in defaults

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: 'auto',          // center vertically
    left: 'auto',         // center horizontally
    position: 'relative'  // element position
  }

  /** The constructor */
  function Spinner(o) {
    if (typeof this == 'undefined') return new Spinner(o)
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {

    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
        , mid = o.radius+o.length+o.width
        , ep // element position
        , tp // target position

      if (target) {
        target.insertBefore(el, target.firstChild||null)
        tp = pos(target)
        ep = pos(el)
        css(el, {
          left: (o.left == 'auto' ? tp.x-ep.x + (target.offsetWidth >> 1) : parseInt(o.left, 10) + mid) + 'px',
          top: (o.top == 'auto' ? tp.y-ep.y + (target.offsetHeight >> 1) : parseInt(o.top, 10) + mid)  + 'px'
        })
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))

        ins(el, ins(seg, fill(o.color, '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: o.color, opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner

}));

});

require("ende")
