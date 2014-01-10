
/*
 * GET home page.
 */

module.exports = {
  method: 'get',
  options: '/',
  callback:  function (req, res) {
    res.set('Content-Type', 'text/html').end('Hello! Index page.');
  }
};