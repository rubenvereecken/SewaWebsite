var mongoose = require('mongoose');

// define the schema for our user model
var deliverablesSchema = mongoose.Schema({
    text         : String,
    title        : String,
    download     : String,
    isInternal   : Boolean,
    isFirstReviewMeeting : Boolean,
    order        : String
});

module.exports = mongoose.model('Deliverables', deliverablesSchema, 'Deliverables');
