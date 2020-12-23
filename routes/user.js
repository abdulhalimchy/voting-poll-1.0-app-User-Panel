const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { ensureAuthentication, forwardAuthentication } = require('../authentication/auth');
const multer = require('../handlers/multer');


//Register Page - GET
router.get('/register', forwardAuthentication, userController.getRegisterPage);

//Register a User - POST
router.post('/register', forwardAuthentication, userController.registerAUser);

//Login Page - GET
router.get('/login', forwardAuthentication, userController.getLoginPage);

//Login Handle - POST
router.post('/login', forwardAuthentication, userController.userLoginHandle);

//Logout Handle - GET
router.get('/logout', ensureAuthentication, userController.userLogOutHandle);

//Verify Email - GET
router.get('/verifyemail/:token', forwardAuthentication, userController.verifyUserEmail);

//Get account recovery page - GET
router.get('/account-recovery', forwardAuthentication, userController.getAccRecoveryPage);

//Send reset password link to email - POST
router.post('/account-recovery', forwardAuthentication, userController.sendResetLink);

//Get reset password link
router.get('/reset-password/:token', forwardAuthentication, userController.getSetPasswordPage);

//Save new Password -POST
router.post('/reset-password/:token', forwardAuthentication, userController.saveResetPassword);

//Go to DashBoard - GET
router.get('/dashboard', ensureAuthentication, userController.getUserDashboard);

//Go to user profile - GET
router.get('/profile/:username', userController.getUserProfilePage);


//Get resend verification page - GET
router.get('/resend-verification', forwardAuthentication, userController.getResendVerifiPage);

//Resend Verification Email
router.post('/resend-verification', forwardAuthentication, userController.resendVerifiEmail);

//Get Account Settings Page - GET
router.get('/account-settings', ensureAuthentication, userController.getAccountSettingsPage);

//Upload Image - POST
router.post('/upload-profile-image', ensureAuthentication, multer.upload.single('profileImage'), userController.uploadUserImage);

//Update Account Info - POST
router.post('/update-account-info', ensureAuthentication, userController.updateAccountInfo);

//Change Account Password - POST
router.post('/change-account-password', ensureAuthentication, userController.changeAccountPassword);

// Verify link to change email
router.get('/verify-to-change-email/:token', userController.verifyLinkToChangeEmail);

module.exports = router;