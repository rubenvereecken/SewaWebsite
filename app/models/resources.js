var mongoose = require('mongoose');

// define the schema for our user model
var resourcesSchema = mongoose.Schema({
    type         : Number,
    text         : String,
    title        : String,
    download     : String
});

module.exports = mongoose.model('Resources', resourcesSchema, 'Resources');