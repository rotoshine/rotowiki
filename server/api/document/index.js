'use strict';

var express = require('express');
var controller = require('./document.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

router.get('/random', controller.random);
router.get('/', controller.find);
router.get('/:title', controller.show);
router.get('/:title/sub', controller.findByParent);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:title', auth.isAuthenticated(), controller.update);
router.patch('/:title', controller.update);
router.delete('/:title', auth.isAuthenticated(), controller.destroy);

module.exports = router;
