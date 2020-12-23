const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

//Load User Model
const User = require('../models/User');

module.exports = (passport) => {

    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            //Check User
            User.findOne({ email: email })
                .then(user => {
                    if (!user) {  //user not found
                        return done(null, false, { message: "This email is not registered" });
                    }else{
                        if(user.emailVerified===false){
                            return done(null, false, { message: "Please verify your email" });
                        }else if(user.accountStatus=='blocked'){
                            return done(null, false, { message: "Your account is blocked" });
                        }else{
                            //email is verified, user can login.
                            bcrypt.compare(password, user.password, (err, isMatch) => {
                                if (err) {
                                    throw err;
                                }
                                if (isMatch) {
                                    return done(null, user);
                                } else {
                                    return done(null, false, { message: "Password incorrect" });
                                }
                            });

                        }
                    }

                })
                .catch(err => console.log(err));
        })
    );


    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, {name: 1, email: 1, username: 1} ,async (err, user) => {
            done(err, user);
        });
    });
}