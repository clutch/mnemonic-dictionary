'use strict';

var mongoose = require('mongoose');

var DictionaryItemSchema = require('./dictionary.item.schema');

module.exports = mongoose.model('DictionaryItem', DictionaryItemSchema);