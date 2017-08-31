var path             = require('path');
var mime             = require('mime');
var fs               = require('fs');

const Router = require('express').Router;
const News             = require('../models/news');
const StaticPages      = require('../models/static_pages');
var config           = require('../../config');
const m = require('../middleware')

const router = new Router()
module.exports = router;

// STATIC PAGES FUNCTIONALITY (here be dragons)
function render_static_page_with_sidebar(req, res, page_key, news=null){
    StaticPages.findOne({key: 'Sidebar'}, function(err,sidebar) {
        if (err) { res.redirect('/'); }
        render_static_page(req, res, page_key, sidebar, news)
    });
}

function render_static_page_with_news_and_sidebar(req, res, page_key){
    News.find({})
        .limit(3)
        .skip(0)
        .sort('-order')
        .exec( function(error, news) {
        if (error) {
            console.error(error);
        } else {
            render_static_page_with_sidebar(req, res, page_key, news)
        }
    });
}

function render_static_page(req, res, page_key, sidebar=null, news=null){
    var adminUser = null;
    if (req.isAuthenticated() && req.user.isAdmin)
        adminUser = req.user;
    StaticPages.findOrCreate({key: page_key}, function(err, page, created) {
        res.render('pages/static_page', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', pageName: page_key, page: page, sidebar: sidebar, news: news, adminUser: adminUser } );
    });
}

router.get('/', function(req, res) {
    render_static_page_with_news_and_sidebar(req, res, 'Home');
});

router.get('/description', function(req, res) {
    render_static_page_with_sidebar(req, res, 'Description');
});

router.get('/public_dissemination', function(req, res) {
    render_static_page_with_sidebar(req, res, 'Dissemination');
});

router.get('/participants', function(req, res) {
    render_static_page_with_sidebar(req, res, 'Participants');
});

router.get('/sidebar', m.isLoggedInAdmin, function(req, res) {
    render_static_page(req, res, 'Sidebar');
});

  router.get('/issue_tracking', m.isLoggedIn, function(req, res) {
      res.render('pages/issue_tracking', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'Issues' } );
  });


router.post('/staticpage-update', m.isLoggedInAdmin, function(req, res) {
    var key = req.body.key;
    if (key == undefined || key == null || key == "") {
        var page = new StaticPages({
            key: req.body.key,
            title: req.body.title,
            body: req.body.body
        });

        page.save(function (err) {
            if (err) { console.log(err); }
            // saved!
            console.log('saved');
        });

    } else {
        var query = { key: key };
        StaticPages.findOneAndUpdate(query, {
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

