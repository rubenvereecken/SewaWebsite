
var mongoose = require('mongoose');

// define the schema for our user model
var newsSchema = mongoose.Schema({
    title        : String,
    short        : String,
    full         : String,
    date         : String,
    order        : String
});

module.exports = mongoose.model('News', newsSchema, 'News');
