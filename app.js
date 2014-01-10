var express = require('express');

var app = express();

if (!module.parent) {
    require('./ex-route')(app, {
        src: require('path').join(__dirname, '/routes'),
        help: '/api/help',
        debug: true
    }, function () {
        console.log('Server routes complete');
    });

    require('http').createServer(app).listen(3000, function () {
        console.log('Express server listening on port');
    });
} else {
    module.exports = app;
}