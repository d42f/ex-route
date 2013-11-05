
/*
 * GET users listing.
 */

module.exports = [
    /**
     * /users
     * @return {Array} list of users
     */
    {
        method: 'get',
        options: '/api/users',
        callback: function (req, res) {
            res.send([{id: 1, name: 'respond with a resource'}]);
        }
    },
    /**
     * /users/:id
     * @param {{id:Integer}} UserId
     * @return {Object} user object
     */
    {
        method: 'get',
        options: '/api/users/:id',
        callback: function (req, res) {
            res.send({id: req.params.id, name: 'username' + req.params.id});
        }
    }
];