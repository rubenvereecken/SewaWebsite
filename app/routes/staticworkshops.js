const Router   = require('express').Router;
const config   = require('../../config');
const m = require('../middleware')
const { GuidCreate } = require('../common')

const StaticPages      = require('../models/static_pages');
const Workshops        = require('../models/workshops');

const router = new Router()
module.exports = router;


router.get('/wasa15', function(req, res) {

    var adminUser = null;
    if (req.isAuthenticated() && req.user.isAdmin)
        adminUser = req.user;

    Workshops.findOrCreate({key: 'wasa15'}, function(err, workshop, created) {
        res.render('pages/wasa15', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', pageName: 'Workshops', workshop: workshop, adminUser: adminUser } );
    });
});

router.get('/wasa17', function(req, res) {

    var adminUser = null;
    if (req.isAuthenticated() && req.user.isAdmin)
        adminUser = req.user;

    Workshops.findOrCreate({key: 'wasa17'}, function(err, workshop, created) {
        res.render('pages/wasa17', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', pageName: 'Workshops', workshop: workshop, adminUser: adminUser } );
    });
});

router.get('/ibmsewa15', function(req, res) {

    var adminUser = null;
    if (req.isAuthenticated() && req.user.isAdmin)
        adminUser = req.user;

    Workshops.findOrCreate({key: 'ibmsewa15'}, function(err, workshop, created) {
        res.render('pages/ibmsewa15', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', pageName: 'Workshops', workshop: workshop, adminUser: adminUser } );
    });
});
