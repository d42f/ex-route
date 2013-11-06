
/*
 * GET users listing.
 */

module.exports = [
    /**
     * Get users list
     * @title /users
     * @method get
     * @return {Array} list of users
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
     * @title /users/:id
     * @method get
     * @param {{id:Integer}} UserId
     * @param {{sid:Integer}} StateId
     * @return {Object} user object
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