var path             = require('path');
var mime             = require('mime');
var fs               = require('fs');

const Router   = require('express').Router;
const config   = require('../../config');
const m = require('../middleware')
const { GuidCreate } = require('../common')

const StaticPages      = require('../models/static_pages');
const Workshops        = require('../models/workshops');

const router = new Router()
module.exports = router;


router.get('/', m.isLoggedInAdmin, function(req, res) {
    var pageIndex = (req.param("page") != undefined && req.param("page") != null && req.param("page") != NaN) ? req.param("page") : 0;
    var adminUser = null;
    if (req.isAuthenticated() && req.user.isAdmin)
        adminUser = req.user;

    Workshops.count({}, function (error, count) {
        Workshops.find({})
            .limit(5)
            .skip(pageIndex * 5)
            .exec( function(error, paginatedResults) {
                if (error) {
                    console.error(error);
                } else {
                    var numberOfPages = count / 5 + ((count % 5 > 0) ? 1 : 0);
                    res.render('pages/workshops', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', countNews: count,  pageName: 'Workshops', workshops: paginatedResults, currentPage: pageIndex, numberOfPages: numberOfPages, adminUser: adminUser } );
                }
            });
    });
});

router.get('/:key', function(req, res) {
    var adminUser = null;
    if (req.isAuthenticated() && req.user.isAdmin)
        adminUser = req.user;

    Workshops.findOne({key: key}, function(err,workshop) {
        if (err) {
            res.redirect('/');
        }

        res.render('pages/workshop', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', pageName: 'Workshops', workshop: workshop, adminUser: adminUser } );
    });
});

router.post('/update', m.isLoggedInAdmin, function(req, res) {

    var key = req.body.key;

    if (key == undefined || key == null || key == "") {
        var workshop = new Workshops({
            key: req.body.key,
            title: req.body.title,
            body: req.body.body
        });

        workshop.save(function (err) {
            if (err) { console.log(err); }
            // saved!
            console.log('saved');
        });

    } else {
        var query = { key: key };
        Workshops.findOneAndUpdate(query, {
            title: req.body.title,
            body: req.body.body
        }, { upsert: true }, function (err) {
            if (err) { console.log(err); }
            // saved!
            console.log('updated');
        });
    }

    res.end('Done');
});

router.post('/delete', m.isLoggedInAdmin, function(req, res) {
    var key = req.body.key;

    if (key == undefined || key == null || key == "") {
        res.end('Done');
    } else {
        Workshops.find({ key: key }).remove().exec();
    }

    res.end('Done');
});


