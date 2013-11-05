var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    ejs = require('ejs'),
    doctrine = require('doctrine');

var defaultParams = {
        tpl: path.join(path.dirname(module.filename), 'tpl.ejs'),
        help: '/api/help'
    },
    timeoutInterval = 100,
    noop = function () {},
    tpl = '',
    apiDocs = {};

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

function readdoc (file, callback) {
    fs.readFile(file, function (err, data) {
        if (err) {
            callback(err);
        }

        var js = data.toString(),
            regex = /\/\*\*([\s\S]*?)\*\//gm,
            fragments = js.match(regex) || [],
            docs = [];

        for (var ind = 0, len = fragments.length; ind < len; ind++) {
            var fragment = fragments[ind];
            var doc = doctrine.parse(fragment, {unwrap: true});
            docs.push(doc);
        }
        docs.length && typeof callback === 'function' && callback(null, docs);
    });
}

function tpldata (data) {
    for (var key in data) if (data.hasOwnProperty(key)) {
        if (!util.isArray(data[key])) {
            delete data[key];
            continue;
        }
        var docs = data[key];
        for (var docsInd = 0, docsLen = docs.length; docsInd < docsLen; docsInd++) {
            var doc = docs[docsInd];
            console.log(doc);
            if (util.isArray(doc.tags)) {
                //for (var ind = 0, len = doc.tags.length; ind < len; ind++) {
                //    console.log(key, docs.tags[ind]);
                //}
            }
        }
    }
    return {};
}

function renderhelp (str, data, res) {
    res.end(ejs.render((str || '').toString(), data || {}));
}

module.exports = function (app, params, callback) {
    callback = typeof callback === 'function' ? callback : noop;

    params = params || defaultParams;
    params.tpl = params.tpl || defaultParams.tpl;
    params.help = params.help || defaultParams.help;

    if (!params.src) {
        throw new Error('invalid params');
        return undefined;
    }

    if (params.debug === true) {
        app.get(params.help, function (req, res) {
            if (!tpl || true) {
                fs.readFile(params.tpl, function (err, data) {
                    if (err) {
                        return callback(err);
                    }
                    tpl = data;
                    renderhelp(tpl, tpldata(apiDocs), res);
                });
                return undefined;
            }
            renderhelp(tpl, {}, res);
        });
    }

    readdirext(
        params.src,
        function (err, file) {
            if (err) {
                return callback(err);
            }

            if (module.filename === file || path.extname(file) !== '.js') {
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

            if (params.debug === true) {
                readdoc(file, function (err, docs) {
                    if (err) {
                        return callback(err);
                    }
                    docs.length ? apiDocs[file.replace(params.src, '')] = docs : null;
                });
            }
        },
        function () {
            typeof callback === 'function' && callback(null);
        }
    );
};
