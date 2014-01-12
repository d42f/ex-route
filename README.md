# ex-route

  Node.JS route manager.

## Installation

npm:

    $ npm install ex-route

## Options

    var route = require('ex-route');
    route(app, {
      src: require('path').join(__dirname, '/routes'),
      help: '/api/help',
      debug: true
    }, callback);

## Examples

### Routes

    module.exports = [
      /**
       * Get users list
       * @name /api/users
       * @method get
       * @return {Array}
       * @authentication
       */
      {
        method: 'get',
        options: '/api/users',
        callback: function (req, res) {
          res.send([{name: 'respond with a resource'}]);
      },
      /**
       * Get user object by id
       * @name /api/users/:id
       * @method get
       * @param {{id:Integer}} UserId
       * @param {{name:Integer}} UserName
       * @return {Object}
       * @authentication
       */
      {
        method: 'post',
        options: '/api/users',
        callback: function (req, res) {
          res.send({id: req.params.id, name: 'username' + req.params.id});
        }
      }
    ];

## Running Tests

    $ npm run-script test
