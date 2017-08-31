/**
 * Created by MojoManyana on 2.3.2015.
 */

var mongoose     = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

// define the schema for our user model
var workshopsSchema = mongoose.Schema({
    title        : String,
    body         : String,
    key          : String
});
workshopsSchema.plugin(findOrCreate);

module.exports = mongoose.model('Workshops', workshopsSchema, 'Workshops');