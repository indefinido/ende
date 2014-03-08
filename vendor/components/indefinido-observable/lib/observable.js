// TODO Better keypath support
// TODO Convert to coffeescript

// Shim older browsers
if (!Object.create          ) require('../vendor/shims/object.create');
if (!Array.prototype.indexOf) require('../vendor/shims/array.indexOf');

// Object.defineProperty (for ie5+)
if (typeof require != 'undefined') {
  // __lookup*__ and __define*__ for browsers with defineProperty support
  // TODO Figure out why gives an infinity loop
  require('../vendor/shims/accessors-legacy.js');

  // Creates Object.defineProperty
  require('../vendor/shims/accessors.js');
}

// Require Dependencies
if (!window['jQuery']) jQuery = $ = require('jquery');

// Observable Implementation
var observable, requiresDomElement, check, lookup, mixin, generator, mutations;

// Support objects

// TODO implement Object.getOwnPropertyDescriptor
lookup = {
  setter: Object.prototype.__lookupSetter__ || function (property) {
    return this.observed && this.observed[property + '_setter'];
  },
  getter: Object.prototype.__lookupGetter__ || function (property) {
    var default_getter;
    return this.observed && this.observed[property + '_getter'] || (
      (default_getter = $.proxy(lookup.default_getter, this, property)) &&
      (default_getter.is_default = true) &&
      (default_getter)
    );
  },
  types: {
    'undefined': undefined,
    'null': null,
    'true': true,
    'false': false,
    'NaN': NaN
  },
  // overrides: [Object.prototype.toString, String.prototype.toString, Array.prototype.toString, Number.prototype.toString],
  basic_types: [undefined, null],
  default_getter: function (property) {
    var possible_value = this[property];

    // Getter is the toString property of object
    if (possible_value && possible_value.hasOwnProperty('toString')) {

      if (possible_value.toString.is_default) return this.observed[property];

      return possible_value.toString.call(this);

    } else if (possible_value in lookup.types) {

      return lookup.types[possible_value];

    } else return possible_value;
  }
};


// Core Implementation

requiresDomElement = Object.defineProperty['requiresDomElement'];

mixin = {
  subscribe: function observable_subscribe (keypath, callback) {
    if (keypath == 'observed') throw new TypeError('observable.subscribe: cannot observe reserved property observed');
    if ($.isArray(this[keypath])) generator.mutations.call(this, keypath);
    generator.observe.call(this, keypath, callback);
    return true;
  },
  unsubscribe: function (object, keypath, callback) {
    console.error("observable.unsubscribe not implemented yet.");
    console.log(object, keypath, callback);
  },
  publish: function observable_publish (keypath, value) {
    // TODO actually call callbacks
    return this[keypath] = value;
  }
};


if (requiresDomElement) {

  observable = function (object) {
    var fix;

    // observable() or observable(object)
    if (this.document && this.location) {
      if (!object) {
        object = {};
      }
      // observable.call(...)
    } else {
      // observable.call(param, param)
      if (object) {
        throw new TypeError('Two objects provided! Call either with observable.call(object) or observable(object), not with observable.call(param, param)');
        // observable.call(object)
      } else {
        object = this;
      }
    }

    // TODO better documentation
    if (!jQuery.isReady) throw new Error('observable.call: For compatibility reasons, observable can only be called when dom is loaded.');

    // Create dom element if object isn't one
    if (!(typeof object.nodeName === 'string')) {
      fix = document.createElement('fix');

      if (!jQuery.isReady) $(function () {document.body.appendChild(fix);});
      else document.body.appendChild(fix);

      // Replace object with dom node
      object = $.extend(fix, object);
    }

    // Observe element if it is not observed
    // TODO remove jquery dependency
    if (!object.observed) {
      generator.observable_for(object);
      object = $.extend(object, mixin);
    }

    return object;
  };

  var ignores = document.createElement('fix'), fix_ignores = [], property;

  for (property in ignores) {
    fix_ignores.push(property);
  }

  observable.ignores = fix_ignores;

} else {

  observable = function (object) {
    // observable() or observable(object)
    if (this === window) {
      if (!object) {
        object = {};
      }
    // observable.call(...)
    } else if (this !== window) {
      // observable.call(param, param)
      if (object) {
        throw new TypeError('Two objects provided! Call either with observable.call(object) or observable(object), not with observable.call(param, param)');
      // observable.call(object)
      } else {
        object = this;
      }
    }

    if (!object.observed) generator.observable_for(object);

    return $.extend(object, mixin);
  };

  observable.ignores = [];
}

observable.unobserve = function (object) {
  var name, value, subname, unobserved = {};

  // TODO remove root setter and root getter and callbacks from
  // callback thread

  // Remove mixed in properties
  for (name in mixin) {
    delete object[name];
  }

  // Remove array properties overrides
  for (name in object) {
    value = object[name];

    if ($.type(value) == 'array') {
      delete value.thread;
      delete value.object;
      delete value.key;

      for (subname in mutations.overrides) {
        delete value[subname];
      }
    }
  }

  for (name in object) {
    // TODO put Array.indexOf as a dependency
    if (observable.ignores && observable.ignores.indexOf(name) == -1) {
      unobserved[name] = object[name];
    }
  }

  delete object.observed;

  return unobserved;
};

check = function (keypath, value) {
  this.observed[keypath] = value;

  // TODO implement subscription to any change, using Object.observe
  (this.dirty === false && keypath != 'dirty') && (this.dirty = true);
  return true;
};

generator = {
  // TODO pass object as parameter
  observe: function (keypath, callback) {
    return Object.defineProperty(this, keypath, {
      get: generator.getter.call(this, keypath),
      set: generator.setter.call(this, keypath, callback),
      enumerable: true
    });
  },

  observable_for: function (object) {
    Object.defineProperty(object, 'observed', {
      configurable: true,
      enumerable: false,
      value: {}
    });

    // TODO call the current object.toJSON after this method
    return Object.defineProperty(object, 'toJSON', {
      enumerable: false,
      value: function () {
        // TODO remove underscore dependency
        return observable.unobserve(_.omit(this, observable.ignores));
        // old_to_json()
      }
    });
  },

  // TODO improve readability
  // TODO implement linked list
  setter: function subscribed_setter (keypath, callback) {
    var setter = lookup.setter.call(this, keypath), current, getter, old_setter;

    // Set value
    this.observed[keypath] = lookup.getter.call(this, keypath) && lookup.getter.call(this, keypath)() || this[keypath];

    // First time subscribing
    if (!setter) {
      setter = function setter (value) {
        check.call(this, keypath, value) !== false && setter.callback_thread.call(this, value);
      };

      // First time subscribing but does not have callback_thread associated
    } else if (!setter.callback_thread) {
      old_setter = setter;
      setter = function setter (value) {
        check.call(this, keypath, value) !== false && setter.callback_thread.call(this, value);
      };

      setter.callback_thread = old_setter;
    }

    current = setter.callback_thread || $.noop;

    setter.callback_thread = function thread (value) {
      current.call(this, value) !== false && callback.call(this, value);
    };

    // TODO better implementation of loookup setter / lookup getter on accessors shim
    if (requiresDomElement) this.observed[keypath + '_setter'] = setter;

    return setter;
  },
  getter: function subscribed_getter (keypath) {
    var object = this, getter;

    getter = lookup.getter.call(this, keypath) || function root_getter () {
      return object.observed[keypath];
    };

    // TODO better implementation of loookup setter / lookup getter on accessors shim
    if (requiresDomElement) this.observed[keypath + '_getter'] = getter;

    return getter;
  },
  mutations: function(keypath) {
    var setter = lookup.setter.call(this, keypath),
    array = this[keypath];

    // First time subscribing, and it is an array
    if (!setter) {
      // TODO use this.subscribe instead of generator.observe.call
      generator.observe.call(this, keypath, function(new_array) {
        var i, type, j;

        // Avoid non push operations!
        // TODO remove jquery dependency
        if ($.type(new_array) !== 'array') return;

        // Skip this if it is not the first time
        if (new_array.object === array.object && new_array.thread === array.thread) return;
        i = new_array.length;
        j = new_array.length;

        new_array.thread = array.thread;
        new_array.object = array.object;
        new_array.key    = keypath;

        while (i--) {
          // TODO remove jquery dependency
          type = $.type(new_array[i]);
          if (!new_array[i].observed

              // Recursivelly convert objects and arrays to observables
              && (type == 'object' || type == 'array')) {

            new_array[i] = observable(new_array[i]);

          }
        }

        new_array.length = j;

        // Update internal property value
        $.extend(new_array, mutations.overrides);
      });

      setter = lookup.setter.call(this, keypath);
    }

    // TODO Transform this code to define property
    array.thread = setter.callback_thread;
    array.object = this;
    array.key = keypath;

    // Override default array methods
    $.extend(array, mutations.overrides);

    if (!this.observed.mutate) this.observed.mutate = mutations.mutate;
  }
};

mutations = {
  mutate: function(thread, method, array) {
    array.method = method;
    thread.call(this, array);
    this.publish(array.key, array); // TODO ver se é uma boa
    delete array.method;
  },
  overrides: {
    push: function() {
      var i = arguments.length, operation;

      while (i--) {
        !arguments[i].observed && $.type(arguments[i]) == 'object' && (arguments[i] = observable(arguments[i]));
      }

      operation = Array.prototype.push.apply(this, arguments); // TODO Convert arguments for real array
      this.object.observed.mutate.call(this.object, this.thread, 'push', this);
      return operation;
    }
  }
};

$('pop shift unshift'.split(' ')).each(function (i, method) {
  mutations.overrides[method] = function () {
    Array.prototype[method].apply(this, arguments);
    this.object.observed.mutate.call(this.object, this.thread, method, this);
  };
});

if (typeof exports != 'undefined') {
  exports.mixin = observable;
} else {
  window.observable = observable;
}
