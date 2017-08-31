var mongoose = require('mongoose');

// define the schema for our user model
var publicationsSchema = mongoose.Schema({
    year         : Number,
    text         : String,
    title        : String,
    download     : String,
    bibtex        : String,
    endnote      : String,
    order        : String
});

module.exports = mongoose.model('Publications', publicationsSchema, 'Publications');