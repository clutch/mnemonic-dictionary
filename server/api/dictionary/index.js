'use strict';

var express = require('express');
var controller = require('./dictionary.controller');
var config = require('../../config/environment');

var router = express.Router();

router.get('/prune', controller.prune);
router.get('/uniqify', controller.uniqify);
router.get('/items', controller.items);
router.get('/difference', controller.difference);
router.get('/shuffle', controller.shuffle);
router.get('/archived', controller.archived);
router.get('/import', controller.import);
router.get('/clear', controller.clear);
//router.get('/seed', controller.seed);
router.get('/', controller.index);
router.post('/', controller.create);
router.get('/:id', controller.view);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
