const User = require('../models/User');
const myValidator = require('../validators/myValidator');
const stringFormat = require('../validators/stringFormat');
const bcrypt = require('bcrypt');
const { sendAnEmail } = require('../services/email');
const { verifyEmailTemplate, passResetEmailTemplate, verifyToChangeEmailTemplate } = require('../services/email_template');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { checkFileTypeImg, checkFileSizeLimit } = require('../handlers/file_checker');
const cloudinary = require('cloudinary');
require('../handlers/cloudinary'); // config cloudinary


//-------------GET REGISTER PAGE-----------------
exports.getRegisterPage = (req, res) => {
    res.render('register');
}


//----------------REGISTER A USER AND SAVE INTO DATABASE---------------------
exports.registerAUser = (req, res) => {
    let { name, email, username, password, confirmpassword } = req.body;

    //Formating and removing extra white space
    name = stringFormat.removeExtraWhiteSpace(name).toUpperCase();
    email = email.trim().toLowerCase();
    username = username.trim().toLowerCase();

    let errors = [];

    //Check require fields
    if (!name || !email || !username || !password || !confirmpassword) {
        errors.push({ message: "Please fill in all fields" });
    }

    //Name contains letters only
    if (!myValidator.isLetterAndSpace(name)) {
        errors.push({ message: "Name can contain letters only" });
    }

    //Is email
    if (!myValidator.isEmail(email)) {
        errors.push({ message: "Invalid email" });
    }

    //Username start with letter and contain letter and numbers only
    if (!myValidator.isLetterAndNumber(username)) {
        errors.push({ message: "Username should start with a letter & can contain letters and numbers" });
    }

    //Username at 3 char
    if (username.length < 3) {
        errors.push({ message: "Username should be at least 3 characters" });
    }

    //Username at most 32 char
    if (username.length > 32) {
        errors.push({ message: "Username should be at most 32 characters" });
    }

    //Check password match
    if (password !== confirmpassword) {
        errors.push({ message: "Passwords do not match" });
    }

    //Check pass length
    if (password.length < 6) {
        errors.push({ message: "Password should be at least 6 characters" });
    }

    //If have any error
    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            username,
            password,
            confirmpassword
        });
    } else {
        //Validation passed
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    //Already user exists
                    errors.push({ message: "This Email is already registered" });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        username,
                        password,
                        confirmpassword
                    });
                }
                else {

                    //Check username
                    User.findOne({ username: username })
                        .then(async userRes => {
                            if (userRes) {
                                //This username is not avaiable
                                errors.push({ message: "This username is not available" });
                                res.render('register', {
                                    errors,
                                    name,
                                    email,
                                    username,
                                    password,
                                    confirmpassword
                                });
                            } else {
                                //No user exits, so allow this email to regiser
                                await bcrypt.hash(password, 10, (err, hash) => {
                                    if (err) {
                                        res.json({
                                            error: err
                                        });
                                    }
                                    const newUser = new User({
                                        name,
                                        email,
                                        username,
                                        password: hash
                                    });


                                    // save the user to database
                                    newUser.save()
                                        .then(async user => {

                                            //Creating a token
                                            let token = await jwt.sign({ email: newUser.email, _id: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
                                            let verifyUrl = `${process.env.BASE_URL}/user/verifyemail/${token}`;

                                            //send verification email
                                            await sendAnEmail(email, 'Verify your email', verifyEmailTemplate(user.name, verifyUrl));

                                            req.flash('success_msg', 'Registration Successful, Please verify email to login');
                                            res.redirect('/user/login');
                                        })
                                        .catch(err => console.log('err'));
                                });
                            }
                        })
                        .catch(err => console.log(err));

                }
            })
            .catch(err => console.log(err));
    }
}


//-------------------------GET LOGIN PAGE-------------------------------------
exports.getLoginPage = (req, res) => {
    res.render('login');
}

//-----------------------LOGIN HANDLE----------------------------
exports.userLoginHandle = (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        res.render('login', { error_msg: "Please fill in all fields", email: req.body.email, password: req.body.password });
    }
    else if (!myValidator.isEmail(req.body.email)) {
        res.render('login', { error_msg: "Invalid email" });
    } else {
        passport.authenticate('local', {
            successRedirect: req.session.redirectTo || '/user/dashboard',
            failureRedirect: '/user/login',
            failureFlash: true
        })(req, res, next);
        delete req.session.redirectTo;
    }
}


//-----------------------------LOGOUT HANDLE------------------------
exports.userLogOutHandle = (req, res) => {
    req.logOut();
    req.flash('success_msg', 'Logged out successfully');
    res.redirect('/user/login');
}

// -----------------------------------VERIFIY USER EMAIL--------------------------------
exports.verifyUserEmail = async (req, res) => {
    const token = req.params.token;

    try {
        const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);

        //Token is valid, so search is it verified alreadly?
        await User.findOne({ email: decode.email }).select('emailVerified')
            .then(async user => {
                if (user.emailVerified) {
                    //Alreadly email is verified.
                    req.flash('error_msg', 'Invalid request');
                } else {
                    //Update the emailVerified status to True
                    await User.findOneAndUpdate({ _id: user._id }, { emailVerified: true })
                        .then(res => {
                            req.flash('success_msg', 'Email verified successfully');
                        })
                        .catch(err => {
                            req.flash('error_msg', 'Invalid request');
                        });
                }

            })
            .catch(err => {
                req.flash('error_msg', 'Invalid request');
            });

    } catch (error) {
        console.log("I am error");
        req.flash('error_msg', 'Invalid request');
    }

    res.redirect('/user/login');
}

//--------------------------GET RESEND VERIFICATION EMAIL PAGE-----------------
exports.getResendVerifiPage = (req, res) => {
    res.render('resend_verification');
}

//--------------------------SEND VERIFICATION EMAIL-----------------------
exports.resendVerifiEmail = (req, res) => {
    const email = req.body.email;
    if (!email) {
        res.render('resend_verification', { error_msg: "Please input an email", email });
    }
    else if (!myValidator.isEmail(email)) {
        res.render('resend_verification', { error_msg: "Invalid email" });
    } else {
        User.findOne({ email: email })
            .then(async user => {
                if (!user) {
                    //No user exists in this email
                    res.render('resend_verification', { error_msg: "Email not found" });
                } else {

                    if (user.emailVerified) {
                        req.flash('success_msg', "Alreadly verified")
                        res.redirect('/user/login');
                    } else {
                        //Creating a token
                        let token = await jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
                        let url = `${process.env.BASE_URL}/user/verifyemail/${token}`;

                        //Send verification link to email
                        await sendAnEmail(email, 'Verify your email', verifyEmailTemplate(user.name, url));

                        res.render('resend_verification', { success_msg: "Verification link has sent to your email" });
                    }

                }
            })
            .catch(err => console.log(err));
    }
}


//-------------------------GET ACCOUNT RECOVERY PAGE----------------------
exports.getAccRecoveryPage = (req, res) => {
    res.render('account_recovery');
}


//-------------------------SEND PASSWORD RESET LINK TO EMAIL----------------------
exports.sendResetLink = (req, res) => {
    const email = req.body.email;
    if (!email) {
        res.render('account_recovery', { error_msg: "Please input an email", email });
    }
    else if (!myValidator.isEmail(email)) {
        res.render('account_recovery', { error_msg: "Invalid email" });
    } else {
        User.findOne({ email: email })
            .then(async user => {
                if (!user) {
                    //No user exists in this email
                    res.render('account_recovery', { error_msg: "Email not found" });
                } else {
                    //Creating a token
                    let token = await jwt.sign({ email: user.email, _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '10m' });
                    let url = `${process.env.BASE_URL}/user/reset-password/${token}`;

                    //Send password reset link to email
                    await sendAnEmail(email, 'Password reset', passResetEmailTemplate(user.name, url));

                    res.render('account_recovery', { success_msg: "Reset link has sent to your email" });
                }
            })
            .catch(err => console.log(err));
    }
}

//-----------------------------GET NEW PASSWORD PAGE----------------------
exports.getSetPasswordPage = async (req, res) => {
    const token = req.params.token;
    try {
        const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        res.render('reset_password', { resetkey: token });
    } catch (error) {
        req.flash('error_msg', 'Invalid request');
        res.redirect('/user/login');
    }
}

//--------------------------SAVE RESET PASSWORD---------------------------
exports.saveResetPassword = async (req, res) => {
    const token = req.params.token;
    try {
        const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        const { password, confirmpassword } = req.body;
        let errors = [];

        //Form validation
        //check empty value
        if (!password || !confirmpassword) {
            errors.push({ message: "Please fill all the fields" });
        }
        //Check password match
        if (password !== confirmpassword) {
            errors.push({ message: "Passwords do not match" });
        }

        //Check pass length
        if (password.length < 6) {
            errors.push({ message: "Password should be at least 6 characters" });
        }

        // if have errors
        if (errors.length > 0) {
            res.render('reset_password', { resetkey: token, errors });
        } else {
            //encrypting password
            await bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    res.json({
                        error: err
                    });
                }

                //update the password
                User.findOneAndUpdate({ email: decode.email }, { password: hash })
                    .then(user => {
                        req.flash('success_msg', 'Password changed successfully');
                        res.redirect('/user/login');
                    })
                    .catch(err => {
                        req.flash('error_msg', 'Invalid request');
                        res.redirect('/user/login');
                    });
            });
        }
    } catch (error) {
        // console.log("I am error to save password");
        req.flash('error_msg', 'Invalid request');
        res.redirect('/user/login');
    }
}


//-------------------------GET USER DASHBOARD-----------------------------
exports.getUserDashboard = async (req, res) => {
    //Edit here in future to update the dashboard.
    // const user = await getUserBasicInfo(req.user._id);
    // res.render('dashboard', { user });

    res.redirect('/user/profile/'+req.user.username);
}

//-------------------------GET USER PROFILE PAGE-----------------------------
exports.getUserProfilePage = async (req, res) => {
    let user;
    if(req.user){
        user = await getUserBasicInfo(req.user._id);
    }
    const username = req.params.username;
    User.findOne({ username })
        .then(resultUser => {
            if(resultUser){
                res.render('user_profile', { resultUser, user } );
            }else{
                res.send('User not found');
            }
        })
        .catch(error => {
            res.send("Somthing wrong, try again");
        });
}

//--------------------------GET ACCOUNT SETTINGS PAGE--------------------- 
exports.getAccountSettingsPage = async (req, res) => {
    const user = await getUserBasicInfo(req.user._id);
    res.render('account_settings', { user });
}

//--------------------------UPLOAD IMAGE ----------------------------------
exports.uploadUserImage = (req, res) => {

    if (req.file != undefined && checkFileTypeImg(req.file)) {
        //File is an image file, go ahead to upload

        //Checking file size limit is less than < 2097152 (2MB)
        if (checkFileSizeLimit(req.file.size, 2097152)) {
            cloudinary.v2.uploader.upload(req.file.path, { folder: process.env.CLOUDINARY_FOLDER_NAME })
                .then(async result => {

                    //upload done, now save image info to database 
                    const newImage = {
                        url: result.secure_url,
                        public_id: result.public_id
                    };

                    //get old profile image id
                    const imgPublicId = await getProfileImagePublicId(req.user._id);

                    User.findOneAndUpdate({ _id: req.user._id }, { img: newImage })
                        .then(img => {

                            if (imgPublicId) {
                                //Delete the old profile image from cloudinary
                                cloudinary.v2.uploader.destroy(imgPublicId)
                                    .then(doneee => { })
                                    .catch(err => console.log(err));
                            }

                            req.flash('success_msg', 'Image uploaded succesfully');
                            res.redirect('/user/account-settings');
                        })
                        .catch(err => {
                            req.flash('error_msg', 'Failed to upload, try again.');
                            res.redirect('/user/account-settings');
                        });

                })
                .catch(err => {
                    req.flash('error_msg', 'Failed to upload, try again.');
                    res.redirect('/user/account-settings');
                });
        } else {
            req.flash('error_msg', 'File size should be less than 2MB');
            res.redirect('/user/account-settings');
        }

    } else {
        req.flash('error_msg', 'Please select an image (jpeg, jpg or png) file to upload');
        res.redirect('/user/account-settings');
    }
}


//------------------------------------UPDATE ACCOUNT INFO-----------------------------------------
exports.updateAccountInfo = async (req, res) => {
    const userId = req.user._id;
    const user = await getUserBasicInfo(userId);
    console.log(req.body);//Debug only

    let message; //for storing error message

    //UPDATE NAME---
    if (req.body.name !== undefined) {
        let name = req.body.name;
        name = stringFormat.removeExtraWhiteSpace(name).toUpperCase();
        if (!name) {
            message = "Name can not empty";
        }
        //Name contains letters only
        else if (!myValidator.isLetterAndSpace(name)) {
            message = "Name can contain letters only";
        }
        else if (name === user.name) { //current name == new name
            message = "No changes to update";
        }
        if (message) { //have errors
            res.render('account_settings', {
                name,
                error_msg2: message,
                user
            });
        } else {
            //update in database
            User.findOneAndUpdate({ _id: userId }, { name: name })
                .then(result => {
                    req.flash('success_msg2', 'Name updated successfully');
                    res.redirect('/user/account-settings');
                })
                .catch(err => {
                    req.flash('error_msg2', "Failed to Update, Try again");
                    res.redirect('/user/account-settings');
                })
        }
    }

    //UPDATE USERNAME---
    else if (req.body.username !== undefined) {
        let username = req.body.username;
        username = username.trim().toLowerCase();

        //username not empty
        if (!username) {
            message = "Username can not empty"
        }
        //Username start with letter and contain letter and numbers only
        else if (!myValidator.isLetterAndNumber(username)) {
            message = "Username should start with a letter & can contain letters and numbers";
        }
        //Username at 3 char
        else if (username.length < 3) {
            message = "Username should be at least 3 characters";
        }
        //Current username == new username
        else if (username === user.username) {
            message = "No changes to update";
        }

        if (message) { // have errors
            res.render('account_settings', {
                username,
                error_msg2: message,
                user
            });
        } else {

            //Checking this username is available or not
            User.findOne({ username: username })
                .then(result => {
                    if (result) {
                        res.render('account_settings', {
                            username,
                            error_msg2: "This username is not avaiable.",
                            user
                        });
                    } else {
                        User.findOneAndUpdate({ _id: userId }, { username: username })
                            .then(data => {
                                req.flash('success_msg2', 'Username updated successfully');
                                res.redirect('/user/account-settings');
                            })
                            .catch(err => {
                                req.flash('error_msg2', 'Failed to updated, Try again');
                                res.redirect('/user/account-settings');
                            });
                    }
                })
                .catch(err => {
                    req.flash('error_msg2', 'Failed to updated, Try again');
                    res.redirect('/user/account-settings');
                });
        }
    }

    //Update Email---
    else if (req.body.email) {
        let email = req.body.email;
        email = email.trim().toLowerCase();

        //Validation
        // //Is email
        if (!myValidator.isEmail(email)) {
            message = "Enter an valid email";
        }
        
        //Current email == new email
        else if(email===user.email){
            message = "No changes to update";
        }

        if (message) { // have errors
            res.render('account_settings', {
                email,
                error_msg2: message,
                user
            });
        }else{
            //Check this email is avaiable or not
            User.findOne({ email: email })
                .then(async result => {
                    if (result) {
                        res.render('account_settings', {
                            email,
                            error_msg2: "This email is already registered with another account",
                            user
                        });
                    } else {
                        //Creating a token
                        let token = await jwt.sign({ newemail: email , _id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '10m' });
                        let url = `${process.env.BASE_URL}/user/verify-to-change-email/${token}`;

                        //Send verification link to email
                        await sendAnEmail(email, 'Voting-Poll - Verify to change your email', verifyToChangeEmailTemplate(user.name, url));
                        
                        req.flash('success_msg2', 'A verification mail is sent "'+email+'", verify to change email');
                        res.redirect('/user/account-settings');
                    }
                })
                .catch(err => {
                    req.flash('error_msg2', 'Failed to update, Try again');
                    res.redirect('/user/account-settings');
                });
        }
    }
}

//------------------------------------VERIFY TO CHANGE EMAIL------------------------------------------
exports.verifyLinkToChangeEmail = async (req, res) => {
    const token = req.params.token;

    try {
        const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decode);
        //Token is valid, so search is it verified alreadly?
        User.findOneAndUpdate({ _id: decode._id }, { email: decode.newemail })
            .then(async result => {
                //user is logged in
               if(req.user){
                    req.flash('success_msg2', 'Email updated successfully');
                    res.redirect('/user/account-settings');
                }else{
                    req.flash('success_msg', 'Email updated successfully, login to continue');
                    res.redirect('/user/login');
               }

            })
            .catch(err => {
                res.send('Failed to change email, Try again');
            });

    } catch (error) {
        res.send('Invalid link or request');
    }
}


//------------------------------------CHANGE ACCOUNT PASSWORD-----------------------------------------
exports.changeAccountPassword = async (req, res) => {
    let { password, confirmpassword } = req.body;

    //Check require fields
    if (!password || !confirmpassword) {
        req.flash('error_msg3', "Please fill in all fields");
        res.redirect('/user/account-settings');
    }


    //Check pass length
    if (password.length < 6) {
        req.flash('error_msg3', "Password should be at least 6 characters");
        res.redirect('/user/account-settings');
    }

    //Check password match
    if (password !== confirmpassword) {
        req.flash('error_msg3', "Passwords do not match");
        res.redirect('/user/account-settings');
    } else {
        //encrypting password
        await bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                res.json({
                    error: err
                });
            }

            console.log('I ma here');
            //update the password
            User.findOneAndUpdate({ _id: req.user._id }, { password: hash })
                .then(resultUser => {
                    req.flash('success_msg3', 'Password changed successfully');
                    res.redirect('/user/account-settings');
                })
                .catch(err => {
                    req.flash('error_msg3', 'Failed to change password, try again.');
                    res.redirect('/user/account-settings');
                });
        });
    }
}


//:::::::::::::::::-----:::::::::::::::::::NECESSARY FUNCTION:::::::::::::::-----:::::::::::::::::::

//Get User Profile Image's Cloudinary Public_Id
const getProfileImagePublicId = async (userId) => {
    try {
        const result = await User.findOne({ _id: userId }, { img: 1 });
        if (result.img.public_id) {
            return result.img.public_id;
        }

    } catch (error) {
        console.log(error);
    }
}

//Get User Basic Info
const getUserBasicInfo = async (userId) => {
    try {
        const user = await User.findOne({ _id: userId }, { name: 1, email: 1, username: 1, img: 1 });
        return user;

    } catch (error) {
        console.log(error);
    }
}
