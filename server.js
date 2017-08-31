/**
 * Created with JetBrains WebStorm.
 * User: MojoManyana
 * Date: 14.12.14.
 * Time: 12.32
 * To change this template use File | Settings | File Templates.
 */
var express      = require('express');
var app          = express();
var mongo        = require('mongodb');
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var configDB     = require('./config/database.js')
var path         = require('path');
global.appRoot   = path.resolve(__dirname);
var fs           = require('fs');
var busboy       = require('connect-busboy');

mongoose.connect(configDB.url);

require('./config/passport')(passport);

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(busboy());
app.use(bodyParser.json({ limit:'100mb' })); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true, limit:'100mb' }));
//app.use('/files', express.static('files'));
app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'sewahash2211key' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(function(req, res, next) {
    res.locals.currentrequest = req;
    next();
});

app.use(require('./app/routes'));

var port = process.env.PORT || 3210;
app.listen(port);
console.log(`Server running on port ${port}!`);
