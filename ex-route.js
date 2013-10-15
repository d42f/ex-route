var fs = require('fs')
  , path = require('path')
  , util = require('util');

var timeoutInterval = 100
  , noop = function () {};

function fn (dir, items, o, itemCallback, callback) {
  clearTimeout(o.to);
  dir = path.join(dir);
  fs.readdir(dir, function (err, files) {
    if (err && err.errno === 27) {
      return undefined;
    }
    clearTimeout(o.to);
    if (err) {
      return callback(err);
    }
    for (var ind = 0, len = files.length; ind < len; ind++) {
      var file = path.join(dir, files[ind]);
      itemCallback(null, file);
      items.push(file);
      fn(file, items, o, itemCallback, callback);
    }
    o.to = setTimeout(o.success, timeoutInterval);
  });
}

function readdirext (dir, itemCallback, callback) {
  var items = [];
  fn(dir, items, {to: 0, success: function () {callback(null, items)}}, itemCallback, callback);
}

module.exports = function (app, params, callback) {
  params = params || {};
  callback = typeof callback === 'function' ? callback : noop;

  if (!params.src) {
      throw new Error('invalid params');
      return undefined;
  }

  readdirext(
    params.src,
    function (err, file) {
      if (err) {
        return callback(err);
      }

      if (module.filename === file || file.substr(-3) !== '.js') {
        return undefined;
      }

      var routes = require(file);
      routes = !util.isArray(routes) ? [routes] : routes;
      for (var ind = 0, len = routes.length; ind < len; ind++) {
        var route = routes[ind];
        if (route && typeof route === 'object') {
          typeof app[route['method']] === 'function' && app[route.method](route.options || {}, route.callback || noop);
        }
      }
    }, function () {
      typeof callback === 'function' && callback();
    }
  );
};
