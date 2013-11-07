
/*
 * GET users listing.
 */

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
            res.send([{id: 1, name: 'respond with a resource'}]);
        }
    },
    /**
     * Get user object by id
     * @name /api/users/:id
     * @method get
     * @param {{id:Integer}} UserId
     * @param {{sid:Integer}} StateId
     * @return {Object}
     * @authentication
     */
    {
        method: 'get',
        options: '/api/users/:id',
        callback: function (req, res) {
            res.send({id: req.params.id, name: 'username' + req.params.id});
        }
    }
];