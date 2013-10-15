
/*
 * GET users listing.
 */

module.exports = [
  {
    method: 'get',
    options: '/pages',
    callback: function (req, res) {
      res.end('Hello! Pages.');
    }
  },
  {
    method: 'get',
    options: '/pages/:id',
    callback: function (req, res) {
      res.end('Hello! Page ' + req.params.id + '.');
    }
  }
];