import lookup from '../lookup.js';
import jQuery from 'jquery';
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
    keypaths: {
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
    property: function(object, keypath) {
      var observer, observers, value;

      if (this.keypaths.indexOf(keypath) !== -1) {
        return;
      }
      this.keypaths.push(keypath);
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
        return observer.setValue(value);
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
          return this.observation.scheduler.schedule();
        };
      } else {
        return function(value) {
          this.observed[keypath] = value;
          return this.observation.scheduler.schedule();
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
  var original;

  original = observable.methods.subscribe;
  observable.methods.subscribe = function(keypath, callback) {
    original.apply(this, arguments);
    if (typeof keypath !== 'function') {
      return this.observation.scheduler.property(this, keypath);
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

export default schedulerable;
