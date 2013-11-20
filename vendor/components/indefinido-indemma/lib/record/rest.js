var $, request;

$ = require('jquery');

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
    return request.call(this, 'delete', this.route, data);
  }
};

request = function(method, url, data) {
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
  return $.ajax({
    url: url,
    data: data,
    type: method,
    dataType: 'json',
    context: this
  });
};
