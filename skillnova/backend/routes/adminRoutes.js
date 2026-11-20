const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

router.get('/users', adminAuth, adminCtrl.listUsers);

router.get('/skills', adminAuth, adminCtrl.listSkills);

router.get('/sessions', adminAuth, adminCtrl.listSessions);

router.get('/achievements', adminAuth, adminCtrl.listAchievements);

router.get('/feedback', adminAuth, adminCtrl.listFeedback);

router.get('/collaborations', adminAuth, adminCtrl.listCollaborations);
router.delete('/collaborations/:collabId', adminAuth, adminCtrl.deleteCollaboration);

router.get('/notifications', adminAuth, adminCtrl.listNotifications);

router.get('/contacts', adminAuth, adminCtrl.listContacts);

router.get('/messages', adminAuth, adminCtrl.listMessages);
router.delete('/conversations/:conversationId', adminAuth, adminCtrl.clearConversation);

module.exports = router;
