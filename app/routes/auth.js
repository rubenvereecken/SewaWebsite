const Router   = require('express').Router;
const passport = require('passport');
const config   = require('../../config');

const router = new Router()
module.exports = router;


router.get('/login', function(req, res) {
    res.render('pages/login', {
      pageTitle:'Sewa project',
      pageDescription:'Sewa project description',
      pageName:'Home',
      message: req.flash('loginMessage')
    });
});

// process the login form
router.post('/login', passport.authenticate('local-login', {
    successRedirect : '/user-check', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

router.get('/user-check', function(req, res) {
    if (req.user.isAdmin) { return res.redirect('/news'); }
    res.redirect(req.session.returnTo || '/deliverables');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});
