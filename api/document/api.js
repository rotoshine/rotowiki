require('dotenv').config();

const mongoose = require('mongoose');
const Document = mongoose.model('Document');
const File = mongoose.model('File');
const fs = require('fs');
const { promisify } = require('util');

const DEFAULT_DOCUMENT_FIELD = '__v _id title content files likeCount parents readCount updatedAt';
const exists = promisify(fs.exists);

function handleError(res, err) {
  console.error(err.message);
  return res.status(500).json({ message: err.message });
}

exports.findByTitle = async function (req, res) {
  try {
    const { title } = req.params;

    console.log('title parameter', decodeURI(title));
    const fields = `${DEFAULT_DOCUMENT_FIELD} likeUsers`;
    const document = await Document
      .findOne({ title }, fields)
      .populate({
        path: 'parents',
        select: DEFAULT_DOCUMENT_FIELD,
        options: {
          sort: {
            title: 1
          }
        }
      });

    if (document) {
      const subDocuments = await Document
        .find({ parents: { $in: [document._id] } })
        .sort('title');

      document.set('subDocuments', subDocuments);
    }

    return res.json({
      document
    });
  } catch (e) {
    console.error(e);
    return res.json({ status: e.status, reason: e.mesasge });
  }
};

exports.findRandom = async function ( req, res) {
  try {
    return res.json({
      document: await Document.random()
    });
  } catch (e) {
    return res.json({ status: e.status, reason: e.mesasge });
  }
};

exports.findFileByDocumentId = async function (req, res) {
  const { UPLOAD_FILE_PATH } = process.env;

  const { fileId } = req.params;

  try {
    const file = await File.findOne({ _id: fileId });

    if (!file) {
      return res.status(404, { message: '파일 정보가 데이터베이스에 존재하지 않습니다.' });
    }

    const filePath = `${UPLOAD_FILE_PATH}/${file.name}`;
    console.log(`file path: ${filePath}`);

    if (await exists(filePath)) {
      res.header('content-type', file.mimeType);
      return fs.createReadStream(filePath).pipe(res);
    } else {
      return res.status(404).json({ message: '파일이 서버에 존재하지 않습니다.' });
    }
  } catch (e) {
    return handleError(res, e);
  }
};
