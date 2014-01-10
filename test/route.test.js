var expect = require('chai').expect,
    request = require('supertest'),
    app = require('../app'),
    route = require('../ex-route'),
    routeOptions = {
        src: require('path').join(__dirname, '/../routes'),
        help: '/api/help',
        debug: true
    };

describe('ex-route', function () {
    it('should export function', function () {
        expect(route).to.be.a('function');
    });

    it('should init routes', function (done) {
        route(app, routeOptions, done);
    });

    it('check help', function (done) {
        request(app).get('/api/help')
            .expect('Content-Type', /text\/html/)
            .expect(200, done);
    });

    it('route [/] with html', function (done) {
        request(app).get('/')
            .expect('Content-Type', /text\/html/)
            .expect(200, done);
    });

    it('route [/pages] with html', function (done) {
        request(app).get('/pages')
            .expect('Content-Type', /text\/html/)
            .expect(200, done);
    });

    it('route [/pages:id] with html', function (done) {
        request(app).get('/pages/1')
            .expect('Content-Type', /text\/html/)
            .expect(200, done);
    });

    it('route [/users] with json', function (done) {
        request(app)
            .get('/api/users')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });
});