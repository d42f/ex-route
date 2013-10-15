
/*
 * GET home page.
 */

module.exports = {
  method: 'get',
  options: '/',
  callback:  function (req, res) {
    res.end('Hello! Index.');
  }
};