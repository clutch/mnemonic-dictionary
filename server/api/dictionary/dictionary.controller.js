'use strict';

import Dictionary from './dictionary.model';
import config from '../../config/environment';
import _ from 'lodash';
import moment from 'moment';
import Q from 'q';

exports.index = function(req, res) {
    Dictionary.find(function(err, dictionaries) {
        if (err) return res.send(500, err);
        var total = 0;
        _.each(dictionaries, function(dictionary) {
            // http://stackoverflow.com/questions/25150570/get-hours-difference-between-two-dates-in-moment-js
            var created = dictionary.created;
            var now = moment();
            var duration = moment.duration(now.diff(created));
            var days = Math.floor(duration.asDays());
            if ((days === 0) || (days === 1) || (days === 3) || (days === 7) || ((days % 14) === 0)) {
                dictionary.review = true;
                total += 1;
            }
            /*else if ((dictionary.score < 0.85) && (Math.random() < 0.4) && (total <= 10)){
                            dictionary.review = true;
                            total += 1;
                        }*/
        });

        res.json(200, dictionaries);
    });

};

exports.create = function(req, res) {
    var dictionary = new Dictionary(req.body);

    dictionary.save(function(err, dictionary) {
        if (err) return res.send(500, err);

        res.json(200, dictionary);
    });
};

exports.delete = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }

    Dictionary.findById(req.params.id, function(err, dictionary) {

        if (err) return res.send(500, err);

        if (!dictionary) {
            return res.send(404);
        }

        dictionary.remove(function(err) {
            if (err) return res.send(500, err);
            return res.json(200, dictionary);
        });

    });
};

exports.view = function(req, res) {
    var id = req.params.id;

    Dictionary.findById(id, function(err, dictionary) {
        if (err) return res.send(500, err);

        res.json(200, dictionary);
    });

};

exports.archived = function(req, res) {
    res.json(200, require('../../config/dictionary.2015.03.29.1248am.js').archive);
};

exports.import = function(req, res) {
    var dictionaries = require('../../config/dictionary.2015.03.29.1248am.js').archive;

    var out = [];

    _.each(dictionaries, function(dict) {
        var dictionary = new Dictionary(dict);
        dictionary.save();
        out.push(dictionary);
    });

    res.json({
        total: dictionaries.length,
        imported: out
    });
};

exports.update = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }

    Dictionary.findById(req.params.id, function(err, dictionary) {

        if (err) return res.send(500, err);

        if (!dictionary) {
            return res.send(404);
        }

        dictionary.review = req.body.review;
        dictionary.reviewed = req.body.reviewed;
        dictionary.score = req.body.score;
        dictionary.items = req.body.items;

        dictionary.save(function(err) {
            if (err) return res.send(500, err);
            return res.json(200, dictionary);
        });

    });

};

exports.clear = function(req, res) {
    Dictionary.remove({}, function(err, resp){
        res.json({
            clearAll: true,
            err: err,
            resp: resp
        });
    });
}

exports.seed = function(req, res) {
    require('../../config/seed');
    res.json({
        seed: true
    });
}

exports.uniqify = function(req, res) {
    Dictionary.find(function(err, dictionaries) {
        if (err) return res.send(500, err);

        var items = [];

        _.each(dictionaries, function(dict) {
            _.each(dict.items, function(item) {
                items.push(item);
            });
        });

        var uniq = _.uniq(items, false, function(item) {
            return item.word;
        });

        var chunks = _.chunk(uniq, 5);

        var i = 0;
        for (; i < chunks.length; i++) {
            dictionaries[i].items = chunks[i];
            var correct = 0,
                total = 0;
            _.each(dictionaries[i].items, function(item) {
                correct += item.correct;
                total += (item.correct + item.incorrect);
            });
            if (total !== 0) {
                dictionaries[i].score = (correct / total).toFixed(2, 0);
            } else {
                dictionaries[i].score = 0;
            }
            dictionaries[i].save();
        }
        for (; i < dictionaries.length; i++) {
            dictionaries[i].items = [];
            dictionaries[i].remove();
        }

        res.json({
            total: items.length,
            uniq: uniq.length,
            out: dictionaries
        });
    });

};

exports.shuffle = function(req, res) {
    Dictionary.find(function(err, dictionaries) {
        if (err) return res.send(500, err);

        var items = [];

        _.each(dictionaries, function(dict) {
            _.each(dict.items, function(item) {
                items.push(item);
            });
        });

        var uniq = _.uniq(items, false, function(item) {
            return item.word;
        });

        uniq = _.shuffle(uniq);

        var chunks = _.chunk(uniq, 5);

        var i = 0;
        for (; i < chunks.length; i++) {
            dictionaries[i].items = chunks[i];
            var correct = 0,
                total = 0;
            _.each(dictionaries[i].items, function(item) {
                correct += item.correct;
                total += (item.correct + item.incorrect);
            });
            if (total !== 0) {
                dictionaries[i].score = (correct / total).toFixed(2, 0);
            } else {
                dictionaries[i].score = 0;
            }
            dictionaries[i].save();
        }
        for (; i < dictionaries.length; i++) {
            dictionaries[i].items = [];
            dictionaries[i].remove();
        }

        res.json({
            total: items.length,
            uniq: uniq.length,
            out: dictionaries
        });
    });

};

exports.difference = function(req, res) {
    Dictionary.find(function(err, dictionaries) {
        if (err) return res.send(500, err);

        var saved = [];
        _.each(dictionaries, function(dict) {
            _.each(dict.items, function(item) {
                saved.push(item);
            });
        });

        var aDictionaries = require('../../../other/dictionary.2015.03.29.1248am.json'),
            archived = [];
        _.each(aDictionaries, function(dict) {
            _.each(dict.items, function(item) {
                archived.push(item);
            });
        });

        var difference = _.differenceBy(archived, saved, 'word');

        res.json({
            archived: archived.length,
            saved: saved.length,
            difference: difference.length,
            m: difference
        });

    });

};

exports.items = function(req, res) {
    Dictionary.find(function(err, dictionaries) {
        if (err) return res.send(500, err);

        var items = [];
        _.each(dictionaries, function(dict) {
            _.each(dict.items, function(item) {
                items.push(item);
            });
        });

        res.json(_.sortBy(items,'word'));
    });
};

exports.prune = function(req, res) {
    Dictionary.find(function(err, dictionaries){
        Dictionary.remove({}, function(err){

            var items = [];
            _.each(dictionaries, function(dictionary){
                _.each(dictionary.items, function(item){
                    items.push(item);
                });
            });

            var chunks = _.chunk(_.shuffle(items), 5),
                promises = [],
                i = 0,
                d = 0;

            // Five sets per day
            _.each(chunks, function(chunk){
                var dictionary = new Dictionary();
                dictionary.created = moment().add(d, 'days').toDate();
                dictionary.review = true;
                dictionary.items = chunk;
                i++;
                promises.push(dictionary.save());
                if(i % 5 === 0){
                    d++;
                }
            });

            Q.all(promises).then(function(responses){
                res.json(200, responses);
            });
        });
    });
}