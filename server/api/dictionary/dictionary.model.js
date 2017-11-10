'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var Schema = mongoose.Schema;

var DictionaryItemSchema = new Schema({
    word: String,
    pronunciation: String,
    definition: String,
    keys: String,
    link: String,
    correct: {
        type: Number,
        default: 0
    },
    incorrect: {
        type: Number,
        default: 0
    }
});

var DictionarySchema = new Schema({
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

mongoose.model('DictionaryItem', DictionaryItemSchema);

export default mongoose.model('Dictionary', DictionarySchema);