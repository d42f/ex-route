var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    crypto = require('crypto'),
    async = require('async'),
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
        if (files.length === 0) {
            o.to = setTimeout(o.success, timeoutInterval);
            return undefined;
        }

        var tasks = [];
        for (var ind = 0, len = files.length; ind < len; ind++) {
            var file = path.join(dir, files[ind]);
            items.push(file);
            itemCallback(null, file);

            tasks.push((function (file) {
                return function (cb) {
                    fs.stat(file, function (err, stats) {
                        if (err) {
                            return cb(err);
                        }
                        cb(null, {file: file, stats: stats});
                    });
                };
            })(file));
        }
        async.parallel(tasks, function (err, results) {
            if (err) {
                return callback(err);
            }
            o.to = setTimeout(o.success, timeoutInterval);
            for (var ind = 0, len = results.length; ind < len; ind++) {
                if (results[ind].stats.isDirectory()) {
                    clearTimeout(o.to);
                    fn(results[ind].file, items, o, itemCallback, callback);
                }
            }
        });
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
    function getTypeName (o) {
        return o ? o.name : '';
    }
    function getParamType (o) {
        var type = 'String';
        if (o && util.isArray(o.fields) && o.fields.length) {
            type = o.fields[0].value.name;
        }
        return type;
    }
    function getParamKey (o) {
        var key = '';
        if (o && util.isArray(o.fields) && o.fields.length) {
            key = o.fields[0].key;
        }
        return key;
    }

    for (var key in data) if (data.hasOwnProperty(key)) {
        data[key] = util.isArray(data[key]) ? {docs: data[key]} : data[key];
        data[key].hash = crypto.createHash('sha1').update(key).digest('hex');

        if (!util.isArray(data[key].docs)) {
            delete data[key];
            continue;
        }

        var docs = data[key].docs;
        for (var docsInd = 0, docsLen = docs.length; docsInd < docsLen; docsInd++) {
            var doc = docs[docsInd];
            doc.hash = crypto.createHash('sha1').update(doc.description).digest('hex');
            doc.params = [];
            if (util.isArray(doc.tags)) {
                for (var ind = 0, len = doc.tags.length; ind < len; ind++) {
                    switch ((doc.tags[ind].title || '').toLowerCase()) {
                        case 'return':
                            doc.return = {
                                description: doc.tags[ind].description || '',
                                type: getTypeName(doc.tags[ind].type)
                            }
                            break;
                        case 'param':
                            doc.params.push({
                                name: doc.tags[ind].name,
                                key: getParamKey(doc.tags[ind].type),
                                type: getParamType(doc.tags[ind].type)
                            });
                            break;
                        case 'name':
                            doc.name = doc.tags[ind].description || doc.description;
                            break;
                        case 'method':
                            doc.method = (doc.tags[ind].description || 'GET').toUpperCase();
                            break;
                        case 'authentication':
                            doc.isAuthenticationRequired = true;
                            break;
                        case 'deprecated':
                            doc.isDeprecated = true;
                            break;
                    }
                }
            }
        }
    }
    return {items: data};
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
            renderhelp(tpl, tpldata(apiDocs), res);
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
        function (err, files) {
            if (err) {
                return callback(err);
            }
            callback(null, files);
        }
    );
};
