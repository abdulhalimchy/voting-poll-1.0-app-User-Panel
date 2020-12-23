const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const mongoose = require('mongoose');
const morgan = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

//env loading
require('dotenv-extended').load();


const app = express();

//pulic directory
app.use(express.static(__dirname + '/public'));

// passport config
require('./authentication/passport')(passport);


// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


//Morgan
app.use(morgan('dev'));

// Express body parser
app.use(express.urlencoded({ extended: true }));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');


// Express Session Middlware
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);


// Passport middleware. Note: this must declare after the session
app.use(passport.initialize());
app.use(passport.session());


//Connect flash
app.use(flash());


//Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.success_msg2 = req.flash('success_msg2');
    res.locals.success_msg3 = req.flash('success_msg3');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error_msg2 = req.flash('error_msg2');
    res.locals.error_msg3 = req.flash('error_msg3');
    res.locals.error = req.flash('error');
    res.locals.user_name = req.flash('user_name');
    next();
});


//Index Route
app.use('/', require('./routes/index'));

//User Route
app.use('/user/', require('./routes/user'));

//Poll Route
app.use('/poll', require('./routes/poll'));


//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function (req, res) {
    res.render('404');
    // res.send('The page not found. Maybe removed or not longer available', 404);
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));