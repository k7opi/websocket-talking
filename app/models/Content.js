var mongoose = require('mongoose');
var ContentSchema = require('../schemas/ContentSchemas');
//创建model，这个地方的content对应mongodb数据库中contents的conllection。
//mongoose会自动改成复数，如模型名：xx―>xxes, kitten―>kittens, money还是money
var Content = mongoose.model('content',ContentSchema);
module.exports = Content;