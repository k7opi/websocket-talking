var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//创建Schema
var contentSchema = new Schema({
    issystem: String,
    userid: String,
    username: String,
    time: String,
    content: String
});
module.exports = contentSchema;