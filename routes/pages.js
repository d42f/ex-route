
/*
 * GET users listing.
 */

module.exports = [
    {
        method: 'get',
        options: '/pages',
        callback: function (req, res) {
            res.set('Content-Type', 'text/html').end('Hello! Pages.');
        }
    },
    {
        method: 'get',
        options: '/pages/:id',
        callback: function (req, res) {
            res.set('Content-Type', 'text/html').end('Hello! Page ' + req.params.id + '.');
        }
    }
];