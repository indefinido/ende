var composed, remoteable, rest, stampit;

rest = require('../rest');

stampit = require('../../../vendor/stampit');

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

composed = stampit.compose(require('./validatorable'), remoteable);

composed.definition_key = 'validates_remotely';

module.exports = composed;
