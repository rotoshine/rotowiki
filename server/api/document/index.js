'use strict';

var express = require('express');
var controller = require('./document.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:title', controller.show);
router.post('/', controller.create);
router.put('/:title', controller.update);
router.patch('/:title', controller.update);
router.delete('/:title', controller.destroy);

module.exports = router;
