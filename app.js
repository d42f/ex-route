var express = require('express');

var app = express();

require('./ex-route')(app, {
  src: require('path').join(__dirname, '/routes')
});

require('http').createServer(app).listen(3000, function () {
  console.log('Express server listening on port');
});