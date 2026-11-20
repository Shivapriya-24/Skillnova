const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getUserInfo,
  updatePreferences,
  deleteAccount,
  getAllUsers,
  forgotPassword,
  resetPassword
} = require('../controllers/userController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);      
router.post('/reset-password', resetPassword); 
router.get('/userinfo', getUserInfo);
router.get('/users', getAllUsers); 
router.patch('/preferences', updatePreferences);
router.delete('/delete-account', deleteAccount);

module.exports = router;
