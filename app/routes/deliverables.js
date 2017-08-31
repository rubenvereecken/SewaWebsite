const Router   = require('express').Router;
const config   = require('../../config');
const m = require('../middleware')
const { GuidCreate, uploadFile } = require('../common')

const StaticPages      = require('../models/static_pages');
const Deliverables     = require('../models/deliverables');

const router = new Router()
module.exports = router;


router.get('/', function(req, res) {
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

router.post('/create', m.isLoggedInAdminOrDeliverableEditor, function(req, res) {

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
        uploadFile(file, filename)
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

router.post('/delete', m.isLoggedInAdminOrDeliverableEditor, function(req, res) {
    var deliverableId = req.body.deliverableId;

    if (deliverableId == undefined || deliverableId == null || deliverableId == "") {
        res.end('Done');
    } else {
        Deliverables.find({ _id: deliverableId }).remove().exec();
    }

    res.end('Done');
});

