var path             = require('path');
var mime             = require('mime');
var fs               = require('fs');

const Router   = require('express').Router;
const config   = require('../../config');
const m = require('../middleware')
const { GuidCreate } = require('../common')

const StaticPages      = require('../models/static_pages');
const Resources        = require('../models/resources');

const router = new Router()
module.exports = router;


router.get('/', function(req, res) {
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

router.post('/create', m.isLoggedInAdmin, function(req, res) {

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
        download = GuidCreate() + path.extname(filename);
        filepath = path.join(config.filepath, download)
        console.log(`Uploading ${filename} to ${filepath}`);
        fstream = fs.createWriteStream(filepath);
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log(`Uploaded ${filename}`);
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

router.post('/delete', m.isLoggedInAdmin, function(req, res) {
    var resourceId = req.body.resourceId;

    if (resourceId == undefined || resourceId == null || resourceId == "") {
        res.end('Done');
    } else {
        Resources.find({ _id: resourceId }).remove().exec();
    }

    res.end('Done');
});


