const api = require('./api');
const express = require('express');
const router = express.Router();

router.get('/random', api.findRandom);
router.get('/:title', api.findByTitle);
router.get('/by-id/:documentId/files/represent', api.findRepresentImage);
router.get('/by-id/:documentId/files/:fileId', api.findFileByDocumentId);

module.exports = router;
