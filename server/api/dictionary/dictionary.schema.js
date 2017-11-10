'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var DictionaryItemSchema = require('./dictionary.item.schema');

module.exports = new Schema({
    created: {
        type: Date,
        default: Date.now()
    },
    reviewed: Date,
    review: Boolean,
    score: {
        type: Number,
        default: 0
    },
    items: [DictionaryItemSchema]
});