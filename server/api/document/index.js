'use strict';

var express = require('express');
var controller = require('./document.controller');
var auth = require('../../auth/auth.service');
var router = express.Router();

// TODO 별도의 컨트롤러로 분리하자.
// files
router.get('/by-id/:documentId/files', controller.findDocumentFiles);
router.get('/by-id/:documentId/files/:fileId', controller.findFileByDocumentId);
router.post('/by-id/:documentId/files', auth.isAuthenticated(), controller.uploadFile);
router.delete('/by-id/:documentId/files/:fileId', auth.isAuthenticated(), controller.removeFile);

router.get('/random', controller.random);
router.get('/by-id/:documentId', controller.show);
router.get('/', controller.find);
router.get('/:title', controller.show);
router.get('/:title/sub', controller.findByParent);

router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:title', auth.isAuthenticated(), controller.update);
router.patch('/:title', controller.update);
router.delete('/:title', auth.isAuthenticated(), controller.destroy);
router.post('/:title/like', auth.isAuthenticated(), controller.like);
router.delete('/:title/like', auth.isAuthenticated(), controller.unlike);

module.exports = router;
