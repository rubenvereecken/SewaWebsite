/**
 * Created with JetBrains WebStorm.
 * User: MojoManyana
 * Date: 18.12.14.
 * Time: 16.17
 * To change this template use File | Settings | File Templates.
 */

var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
    email               : String,
    password            : String,
    isAdmin             : Boolean,
    isDeliverableEditor : Boolean
});

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return password == this.password;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema, 'User');
