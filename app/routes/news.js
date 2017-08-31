const Router   = require('express').Router;
const config   = require('../../config');
const m = require('../middleware')

const News             = require('../models/news');

const router = new Router()
module.exports = router;


router.get('/', function(req, res) {
    var pageIndex = (req.param("page") != undefined && req.param("page") != null && req.param("page") != NaN) ? req.param("page") : 0;
    var adminUser = null;
    if (req.isAuthenticated() && req.user.isAdmin)
        adminUser = req.user;

    News.count({}, function (error, count) {
        News.find({})
            .limit(5)
            .skip(pageIndex * 5)
            .sort('-order')
            .exec( function(error, paginatedResults) {
                if (error) {
                    console.error(error);
                } else {
                    var numberOfPages = count / 5 + ((count % 5 > 0) ? 1 : 0);
                    res.render('pages/news', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', countNews: count,  pageName: 'News', news: paginatedResults, currentPage: pageIndex, numberOfPages: numberOfPages, adminUser: adminUser } );
                }
            });
    });
});


// TODO really should RESTify all these endpoints
router.post('/create', m.isLoggedInAdmin, function(req, res) {
    var newsId = req.body.newsId;

    if (newsId == undefined || newsId == null || newsId == "") {
        var news = new News({
            short: req.body.short,
            title: req.body.title,
            full: req.body.full,
            order: req.body.order,
            date: req.body.date
        });

        news.save(function (err) {
            if (err) { console.log(err); }
            // saved!
            console.log('saved');
        });

    } else {
        var query = { _id: newsId };
        News.findOneAndUpdate(query, {
            short: req.body.short,
            title: req.body.title,
            full: req.body.full,
            order: req.body.order,
            date: req.body.date
        }, { upsert: true }, function (err) {
            if (err) { console.log(err); }
            // saved!
            console.log('updated');
        });
    }

    res.end('Done');
});


router.post('/delete', m.isLoggedInAdmin, function(req, res) {
    var newsId = req.body.newsId;

    if (newsId == undefined || newsId == null || newsId == "") {
        res.end('Done');
    } else {
        News.find({ _id: newsId }).remove().exec();
    }

    res.end('Done');
});
