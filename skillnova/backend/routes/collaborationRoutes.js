const express = require('express');
const router = express.Router();
const collab = require('../controllers/collaborationController');
const upload = require('../middleware/upload');

router.get('/public/:id', collab.publicGet);

router.get('/list', collab.list); 
router.post('/create', upload.array('files', 6), collab.create);
router.get('/:id', collab.get);

router.post('/:id/join', collab.requestJoin);

router.post('/:id/members/approve', collab.approveMember);

router.post('/:id/posts', upload.array('files', 6), collab.createPost);

router.post('/:id/messages', upload.array('files', 6), collab.sendMessage);

router.delete('/:id', collab.remove);

module.exports = router;
