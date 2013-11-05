
/*
 * GET users listing.
 */

module.exports = [
    /**
      @users
     * users description
     * resourcePath: /api/users
     * description: All about API
     */
    {
        method: 'get',
        options: '/api/users',
        callback: function (req, res) {
            res.send([{id: 1, name: 'respond with a resource'}]);
        }
    },
    /**
     * This function comment /users/:id
     * @param {{id:Integer}} UserId
     */
    {
        method: 'get',
        options: '/api/users/:id',
        callback: function (req, res) {
            res.send({id: req.params.id, name: 'username' + req.params.id});
        }
    }
];