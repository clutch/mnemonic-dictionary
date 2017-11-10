/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

import Dictionary from '../api/dictionary/dictionary.model';
import _ from 'lodash';

Dictionary.find({}).remove()
  .then(() => {
    var words = "abash,abeyance,abhor,abject,abjure,abnegate,abominate,abortive,abridge,abrogate,abscond,absolve,abstemious,abstruse,abut";
    var defs = "embarras,a temporary suspension,despise, wretched, to renounce under oath,relinquish,to detest, terminated prematurely, to shorten, abolish, to run off, to forgive, difficult to understand, to border on";
    var keys = "a bash,obey aunt's, a bore, abe objected, adam nagged ate, a bomb a minute, abortion, a bridge, a brogue, able khan, abe solve, able stem, abe's truce, a butt";

    var words_r = words.split(",");
    var defs_r = defs.split(",");
    var keys_r = keys.split(",");

    var items = [];

    var l = Math.min(words_r.length, defs_r.length, keys_r.length);

    for (var i = 0; i < l; i++) {
      items.push({
        word: words_r[i],
        definition: defs_r[i],
        keys: keys_r[i],
        correct: 0,
        incorrect: 0
      });
    }

    var chunks = _.chunk(items, 5);

    _.each(chunks, function(chunk){
      Dictionary.create({
        created: new Date(),
        review: false,
        score: 0,
        items: chunk
      });
    });
  });


