var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

// define the schema for our user model
var pagesSchema = mongoose.Schema({
    title        : String,
    body         : String,
    key          : String
});
pagesSchema.plugin(findOrCreate);

module.exports = mongoose.model('StaticPages', pagesSchema, 'StaticPages');
