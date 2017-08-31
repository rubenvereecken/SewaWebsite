/**
 * Created with JetBrains WebStorm.
 * User: MojoManyana
 * Date: 18.12.14.
 * Time: 16.06
 * To change this template use File | Settings | File Templates.
 */

var path             = require('path');
var mime             = require('mime');
var fs               = require('fs');
var url              = require('url');
var email            = require("emailjs");
var emailserver      = email.server.connect({
                        user:    "someemail",
                        password:"somepassword",
                        host:    "smtp.gmail.com",
                        ssl:     true
                     });
var News             = require('../app/models/news');
var Users            = require('../app/models/user');
var Publications     = require('../app/models/publications');
var Resources        = require('../app/models/resources');
var Deliverables     = require('../app/models/deliverables');
var Workshops        = require('../app/models/workshops');
var StaticPages      = require('../app/models/static_pages');

// app/routes.js
module.exports = function(app, passport) {

    app.get('/login', function(req, res) {
        res.render('pages/login', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'Home', message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/user-check', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/user-check', function(req, res) {
        if (req.user.isAdmin) { return res.redirect('/news'); }
        res.redirect(req.session.returnTo || '/deliverables');
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


    // DEPRECATED OLD HARDCODED PAGES
/*
    app.get('/', function(req, res) {
        News.find({})
            .limit(3)
            .skip(0)
            .sort('-order')
            .exec( function(error, paginatedResults) {
            if (error) {
                console.error(error);
            } else {
                res.render('pages/index', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'Home', news:paginatedResults } );
            }
        });
    });

    app.get('/description', function(req, res) {
        res.render('pages/description', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'Description' } );
    });

    app.get('/public_dissemination', function(req, res) {
        res.render('pages/public_dissemination', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'Dissemination' } );
    });


    app.get('/contact', function(req, res) {
        res.render('pages/contact', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'Contact' } );
    });

    app.post('/contact', function(req, res) {
        var fullnameElement=req.body.fullnameElement;
        var messageElement=req.body.messageElement;
        var emailElement=req.body.emailElement;
        emailserver.send({
            text:    messageElement,
            from:    "Sewa <nemanjaalavanja@gmail.com>",
            to:      "<info@anaii.com>",
            subject: "Contact request SEWA project - name: " + fullnameElement + " email: " + emailElement
        }, function(err, message) {
            if (err == undefined || err == null) {
                // Success
                res.end("done");
            } else {
                // Error
                res.end("error");
            }
        });
    });

    app.get('/participants', function(req, res) {
        res.render('pages/participants', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'Participants' } );
    });
*/



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

    app.get('/', function(req, res) {
        render_static_page_with_news_and_sidebar(req, res, 'Home');
    });

    app.get('/description', function(req, res) {
        render_static_page_with_sidebar(req, res, 'Description');
    });

    app.get('/public_dissemination', function(req, res) {
        render_static_page_with_sidebar(req, res, 'Dissemination');
    });

    app.get('/participants', function(req, res) {
        render_static_page_with_sidebar(req, res, 'Participants');
    });

    app.get('/sidebar', isLoggedInAdmin, function(req, res) {
        render_static_page(req, res, 'Sidebar');
    });

// static page over view not needed
/*
    app.get('/static_pages*', isLoggedInAdmin, function(req, res) {
        var pageIndex = (req.param("page") != undefined && req.param("page") != null && req.param("page") != NaN) ? req.param("page") : 0;
        var adminUser = null;
        if (req.isAuthenticated() && req.user.isAdmin)
            adminUser = req.user;

        StaticPages.count({}, function (error, count) {
            StaticPages.find({})
                .limit(5)
                .skip(pageIndex * 5)
                .exec( function(error, paginatedResults) {
                    if (error) {
                        console.error(error);
                    } else {
                        var numberOfPages = count / 5 + ((count % 5 > 0) ? 1 : 0);
                        res.render('pages/static_pages', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', countNews: count,  pageName: 'Static pages', static_pages: paginatedResults, currentPage: pageIndex, numberOfPages: numberOfPages, adminUser: adminUser } );
                    }
                });
        });
    });
*/

    app.post('/staticpage-update', isLoggedInAdmin, function(req, res) {
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

    // END OF STATIC PAGE FUNCTIONALITY



    // SOME RANDOM JUNK??
    app.get('/qa', function(req, res) {
        res.render('pages/qa', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'Dissemination' } );
    });
    app.get('/valorization_signed_letters', isLoggedIn, function(req, res) {
        res.render('pages/valorization_signed_letters', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'FileServe' } );
    });

    app.get('/valorization_signed_letters', isLoggedIn, function(req, res) {
        res.render('pages/valorization_signed_letters', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'FileServe' } );
    });
    app.get('/valorization_board_files', isLoggedIn, function(req, res) {
        res.render('pages/valorization_board_files', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'FileServe' } );
    });




    // NEWS
    app.get('/news*', function(req, res) {
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

    app.post('/news-create', isLoggedInAdmin, function(req, res) {
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

    app.post('/news-delete', isLoggedInAdmin, function(req, res) {
        var newsId = req.body.newsId;

        if (newsId == undefined || newsId == null || newsId == "") {
            res.end('Done');
        } else {
            News.find({ _id: newsId }).remove().exec();
        }

        res.end('Done');
    });

    // PUBLICATIONS
    app.get('/publications', function(req, res) {
        var adminUser = null;
        if (req.isAuthenticated() && req.user.isAdmin)
            adminUser = req.user;

        StaticPages.findOne({key: 'Sidebar'}, function(err,sidebar) {
            if (err) { res.redirect('/'); }
            Publications.count({}, function (error, count) {
                Publications.find({})
                    .limit(1000000)
                    .skip(0)
                    .sort([['year', -1],['order', -1]])
                    .exec( function(error, paginatedResults) {
                        if (error) {
                            console.error(error);
                        } else {
                            var years = paginatedResults.map(function(elem) { return elem.year; }).filter(onlyUnique);;
                            res.render('pages/publications', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', years: years, pageName: 'Publications', publications: paginatedResults,  adminUser: adminUser, sidebar: sidebar } );
                        }
                    });
            });
        });
    });

    app.post('/publications-create', isLoggedInAdmin, function(req, res) {

        var publications = new Publications({ });
        var publicationId, title, text, year, download, bibtex, endnote, fstream, order;
        req.busboy.on('field', function(fieldname, val) {
            console.log(fieldname + "with value: " + val);
            if (fieldname == 'publicationstitle')
                title = val;
            else if (fieldname == 'publicationdescription')
                text = val;
            else if (fieldname == 'publicationyear')
                year = val;
            else if (fieldname == 'bibtexreference')
                bibtex = val;
            else if (fieldname == 'endnotereference')
                endnote = val;
            else if (fieldname == 'publicationsid')
                publicationId = val;
            else if (fieldname == 'order')
                order = val;
        });
        req.busboy.on('file', function (fieldname, file, filename) {
            download = '/files/' + GuidCreate() + path.extname(filename);
            console.log("Uploading: " + filename);
            fstream = fs.createWriteStream(global.appRoot + download);
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Uploaded: " + filename);
            });
        });
        req.busboy.on('finish', function () {
            if (publicationId == undefined || publicationId == null || publicationId == "") {
                publications.title = title;
                publications.year = year;
                publications.download = download;
                publications.text = text;
                publications.bibtex = bibtex;
                publications.endnote = endnote;
                publications.order = order;
                publications.save(function (err) {
                    if (err) { console.log(err); }
                    // saved!
                    console.log('saved');
                    res.end('Done');
                });
            } else {
                var query = { _id: publicationId };
                Publications.findOneAndUpdate(query, {
                    text: text,
                    title: title,
                    year: year,
                    bibtex: bibtex,
                    endnote: endnote,
                    order: order
                }, { upsert: true }, function (err) {
                    if (err) { console.log(err); }
                    // saved!
                    console.log('updated');
                    res.end('Done');
                });
            }
            //next();
        });

        req.pipe(req.busboy);
    });

    app.post('/publications-delete', isLoggedInAdmin, function(req, res) {
        var publicationId = req.body.publicationId;

        if (publicationId == undefined || publicationId == null || publicationId == "") {
            res.end('Done');
        } else {
            Publications.find({ _id: publicationId }).remove().exec();
        }

        res.end('Done');
    });

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }

    function GuidCreate() {
        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    }


    // DELIVERABLES
    app.get('/deliverables', function(req, res) {
        var adminUser = null;
        if (req.isAuthenticated() && (req.user.isAdmin || req.user.isDeliverableEditor))
            adminUser = req.user;

        StaticPages.findOne({key: 'Sidebar'}, function(err,sidebar) {
            if (err) { res.redirect('/'); }
            Deliverables.count({}, function (error, count) {
                Deliverables.find({})
                    .limit(1000000)
                    .skip(0)
                    .sort([['order', -1]])
                    .exec( function(error, paginatedResults) {
                        if (error) {
                            console.error(error);
                        } else {
                            res.render('pages/deliverables', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', pageName: 'Deliverables', deliverables: paginatedResults, adminUser: adminUser, sidebar:sidebar } );
                        }
                    });
            });
        });
    });

    app.post('/deliverables-create', isLoggedInAdminOrDeliverableEditor, function(req, res) {

        var deliverables = new Deliverables({ });
        var deliverableId, title, text, download, fstream, isInternal, isFirstReview, order;
        req.busboy.on('field', function(fieldname, val) {
            if (fieldname == 'deliverablestitle')
                title = val;
            else if (fieldname == 'deliverabledescription')
                text = val;
            else if (fieldname == 'deliverablesid')
                deliverableId = val;
            else if (fieldname == 'isInternalDeliverable')
                isInternal = val;
            else if (fieldname == 'isFirstReviewDeliverable')
                isFirstReview = val;
            else if (fieldname == 'order')
                order = val;

        });
        req.busboy.on('file', function (fieldname, file, filename) {
            download = '/files/' + GuidCreate() + path.extname(filename);
            console.log("Uploading: " + filename);
            fstream = fs.createWriteStream(global.appRoot + download);
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Uploaded: " + filename);
            });
        });
        req.busboy.on('finish', function () {
            if (deliverableId == undefined || deliverableId == null || deliverableId == "") {
                deliverables.title = title;
                deliverables.text = text;
                deliverables.download = download;
                deliverables.isInternal = isInternal;
                deliverables.isFirstReviewMeeting = isFirstReview;
                deliverables.order = order;
                deliverables.save(function (err) {
                    if (err) { console.log(err); }
                    // saved!
                    console.log('saved');
                    res.end('Done');
                });
            } else {
                var query = { _id: deliverableId };
                Deliverables.findOneAndUpdate(query, {
                    text: text,
                    title: title,
                    isInternal : isInternal,
                    isFirstReviewMeeting : isFirstReview,
                    order: order
                }, { upsert: true }, function (err) {
                    if (err) { console.log(err); }
                    // saved!
                    console.log('updated');
                    res.end('Done');
                });
            }
            //next();
        });

        req.pipe(req.busboy);
    });

    app.post('/deliverables-delete', isLoggedInAdminOrDeliverableEditor, function(req, res) {
        var deliverableId = req.body.deliverableId;

        if (deliverableId == undefined || deliverableId == null || deliverableId == "") {
            res.end('Done');
        } else {
            Deliverables.find({ _id: deliverableId }).remove().exec();
        }

        res.end('Done');
    });

    // RESOURCES
    app.get('/resources', function(req, res) {
        var adminUser = null;
        if (req.isAuthenticated() && req.user.isAdmin)
            adminUser = req.user;

        StaticPages.findOne({key: 'Sidebar'}, function(err,sidebar) {
            if (err) { res.redirect('/'); }
            Resources.count({}, function (error, count) {
                Resources.find({})
                    .limit(1000000)
                    .skip(0)
                    .exec( function(error, paginatedResults) {
                        if (error) {
                            console.error(error);
                        } else {
                            res.render('pages/resources', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', pageName: 'Resources', dataSet: paginatedResults.filter(function(elem){ return elem.type == 1}), tools: paginatedResults.filter(function(elem){ return elem.type == 2}),  adminUser: adminUser, sidebar:sidebar } );
                        }
                    });
            });
        });
    });

    app.post('/resources-create', isLoggedInAdmin, function(req, res) {

        var resources = new Resources({ });
        var resourceId, title, text, type, download, fstream;
        req.busboy.on('field', function(fieldname, val) {
            if (fieldname == 'resourcestitle')
                title = val;
            else if (fieldname == 'resourcedescription')
                text = val;
            else if (fieldname == 'resourcetype')
                type = val;
            else if (fieldname == 'resourcesid')
                resourceId = val;
        });
        req.busboy.on('file', function (fieldname, file, filename) {
            download = '/files/' + GuidCreate() + path.extname(filename);
            console.log("Uploading: " + filename);
            fstream = fs.createWriteStream(global.appRoot + download);
            file.pipe(fstream);
            fstream.on('close', function () {
                console.log("Uploaded: " + filename);
            });
        });
        req.busboy.on('finish', function () {
            if (resourceId == undefined || resourceId == null || resourceId == "") {
                resources.title = title;
                resources.text = text;
                resources.download = download;
                resources.type = type;
                resources.save(function (err) {
                    if (err) { console.log(err); }
                    // saved!
                    console.log('saved');
                    res.end('Done');
                });
            } else {
                var query = { _id: resourceId };
                Resources.findOneAndUpdate(query, {
                    text: text,
                    title: title,
                    type: type
                }, { upsert: true }, function (err) {
                    if (err) { console.log(err); }
                    // saved!
                    console.log('updated');
                    res.end('Done');
                });
            }
            //next();
        });

        req.pipe(req.busboy);
    });

    app.post('/resources-delete', isLoggedInAdmin, function(req, res) {
        var resourceId = req.body.resourceId;

        if (resourceId == undefined || resourceId == null || resourceId == "") {
            res.end('Done');
        } else {
            Resources.find({ _id: resourceId }).remove().exec();
        }

        res.end('Done');
    });

    // WORKSHOPS
    app.get('/workshops*', isLoggedInAdmin, function(req, res) {
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

    app.get('/workshop/*', function(req, res) {
        var tmpkey = req.url.substring(req.url.lastIndexOf('/')+1);
        var adminUser = null;
        if (req.isAuthenticated() && req.user.isAdmin)
            adminUser = req.user;

        Workshops.findOne({key: tmpkey}, function(err,workshop) {
            if (err) {
                res.redirect('/');
            }

            res.render('pages/workshop', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', pageName: 'Workshops', workshop: workshop, adminUser: adminUser } );
        });
    });

    app.post('/workshop-update', isLoggedInAdmin, function(req, res) {

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

    app.post('/workshop-delete', isLoggedInAdmin, function(req, res) {
        var key = req.body.key;

        if (key == undefined || key == null || key == "") {
            res.end('Done');
        } else {
            Workshops.find({ key: key }).remove().exec();
        }

        res.end('Done');
    });

    app.get('/issue_tracking', isLoggedIn, function(req, res) {
        res.render('pages/issue_tracking', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'Issues' } );
    });

    app.get('/images/*', function(req, res) {
        var request = url.parse(req.url, true);
        var action = request.pathname;
        res.sendFile(appRoot + action);
    });

    app.get('/css/*', function(req, res) {
        var request = url.parse(req.url, true);
        var action = request.pathname;
        res.sendFile(appRoot + action);
    });

    app.get('/files/*', function(req, res) {
        var request = url.parse(req.url, true);
        var action = request.pathname;
        //res.download(appRoot + action);

        var stat = fs.statSync(appRoot + action);
        res.writeHeader(200,{"Content-Length":stat.size});
        var fReadStream = fs.createReadStream(appRoot + action);
        fReadStream.on('data', function (chunk) {
            res.write(chunk);
        });
        fReadStream.on('end', function () {
            res.end();
        });
    });

    app.get('/fonts/*', function(req, res) {
        var request = url.parse(req.url, true);
        var action = request.pathname;
        res.sendFile(appRoot + action);
    });

    app.get('/scripts/*', function(req, res) {
        var request = url.parse(req.url, true);
        var action = request.pathname;
        res.sendFile(appRoot + action);
    });

    app.get('/wasa15', function(req, res) {

        var adminUser = null;
        if (req.isAuthenticated() && req.user.isAdmin)
            adminUser = req.user;

        Workshops.findOrCreate({key: 'wasa15'}, function(err, workshop, created) {
            res.render('pages/wasa15', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', pageName: 'Workshops', workshop: workshop, adminUser: adminUser } );
        });
    });

    app.get('/wasa17', function(req, res) {

        var adminUser = null;
        if (req.isAuthenticated() && req.user.isAdmin)
            adminUser = req.user;

        Workshops.findOrCreate({key: 'wasa17'}, function(err, workshop, created) {
            res.render('pages/wasa17', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', pageName: 'Workshops', workshop: workshop, adminUser: adminUser } );
        });
    });

    app.get('/ibmsewa15', function(req, res) {

        var adminUser = null;
        if (req.isAuthenticated() && req.user.isAdmin)
            adminUser = req.user;

        Workshops.findOrCreate({key: 'ibmsewa15'}, function(err, workshop, created) {
            res.render('pages/ibmsewa15', { pageTitle: 'Sewa project', pageDescription: 'Sewa project description', pageName: 'Workshops', workshop: workshop, adminUser: adminUser } );
        });
    });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    req.session.returnTo = req.path;
    // if they aren't redirect them to the home page
    res.redirect('/login');
}

function isLoggedInAdmin(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated() && req.user.isAdmin)
        return next();

    req.session.returnTo = req.path;
    // if they aren't redirect them to the home page
    res.redirect('/login');
}

function isLoggedInAdminOrDeliverableEditor(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated() && (req.user.isAdmin || req.user.isDeliverableEditor))
        return next();

    req.session.returnTo = req.path;
    // if they aren't redirect them to the home page
    res.redirect('/login');
}
