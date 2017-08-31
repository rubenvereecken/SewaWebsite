const Router   = require('express').Router;
const config   = require('../../config');
const m = require('../middleware')

const router = new Router()
module.exports = router;


router.get('/qa', function(req, res) {
    res.render('pages/qa', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'Dissemination' } );
});
router.get('/valorization_signed_letters', m.isLoggedIn, function(req, res) {
    res.render('pages/valorization_signed_letters', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'FileServe' } );
});

router.get('/valorization_signed_letters', m.isLoggedIn, function(req, res) {
    res.render('pages/valorization_signed_letters', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'FileServe' } );
});

router.get('/valorization_board_files', m.isLoggedIn, function(req, res) {
    res.render('pages/valorization_board_files', { pageTitle:'Sewa project', pageDescription:'Sewa project description', pageName:'FileServe' } );
});
