var path             = require('path');
var mime             = require('mime');
var fs               = require('fs');
var url              = require('url');

const Router = require('express').Router;
const News             = require('../models/news');
const StaticPages      = require('../models/static_pages');
const config           = require('../../config');

const router = new Router()
module.exports = router;


router.get('/images/*', function(req, res) {
    var request = url.parse(req.url, true);
    var action = request.pathname;
    res.sendFile(config.staticpath + action);
});

router.get('/css/*', function(req, res) {
    var request = url.parse(req.url, true);
    var action = request.pathname;
    res.sendFile(config.staticpath + action);
});

router.get('/files/*', function(req, res) {
    var request = url.parse(req.url, true);
    var action = request.pathname;
    filepath = config.filepath + action

    try {
      var stat = fs.statSync(filepath);
      var fReadStream = fs.createReadStream(filepath);
    } catch (e) {
      return res.status(404).end()
    }
    res.writeHeader(200,{"Content-Length":stat.size});
    fReadStream.on('data', function (chunk) {
        res.write(chunk);
    });
    fReadStream.on('end', function () {
        res.end();
    });
});

router.get('/fonts/*', function(req, res) {
    var request = url.parse(req.url, true);
    var action = request.pathname;
    res.sendFile(config.staticpath + action);
});

router.get('/scripts/*', function(req, res) {
    var request = url.parse(req.url, true);
    var action = request.pathname;
    res.sendFile(config.staticpath + action);
});
