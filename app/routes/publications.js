var path             = require('path');
var mime             = require('mime');
var fs               = require('fs');

const Router   = require('express').Router;
const config   = require('../../config');
const m = require('../middleware')
const { GuidCreate, uploadFile } = require('../common')

const StaticPages      = require('../models/static_pages');
const Publications     = require('../models/publications');

const router = new Router()
module.exports = router;

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

router.get('/', function(req, res) {
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

router.post('/create', m.isLoggedInAdmin, function(req, res) {

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
        download = uploadFile(file, filename)
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

router.post('/delete', m.isLoggedInAdmin, function(req, res) {
    var publicationId = req.body.publicationId;

    if (publicationId == undefined || publicationId == null || publicationId == "") {
        res.end('Done');
    } else {
        Publications.find({ _id: publicationId }).remove().exec();
    }

    res.end('Done');
});
