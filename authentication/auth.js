module.exports = {
    ensureAuthentication: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please login to continue');
        res.redirect('/user/login');
    },

    forwardAuthentication: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/user/profile/'+req.user.username);
    }
}