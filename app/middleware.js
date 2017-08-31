
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

module.exports = {
  isLoggedIn, isLoggedInAdmin, isLoggedInAdminOrDeliverableEditor
}
