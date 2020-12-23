const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Inbox = require('../models/Inbox');
const Faq = require('../models/Faq');
const myValidator = require('../validators/myValidator');
const stringFormat = require('../validators/stringFormat')


//-------------------Index Page - GET
router.get('/', async (req, res) => {
    let user;
    if (req.user) {
        try {
            user = await User.findOne({ _id: req.user._id }, { name: 1, email: 1, username: 1, img: 1 });
        } catch (error) {
            console.log(error);
        }
    }
    res.render('index', { user });
});


//------------------Contact Page - GET
router.get('/contact', async (req, res) => {
    let user;
    if (req.user) {
        try {
            user = await User.findOne({ _id: req.user._id }, { name: 1, email: 1, username: 1, img: 1 });
        } catch (error) {
            console.log(error);
        }
    }
    
    res.render('contact', { user });
    console.log(req.body);
});

//------------------ Send Message Contact Page - POST
router.post('/contact', async (req, res) => {
    let user;
    if (req.user) {
        try {
            user = await User.findOne({ _id: req.user._id }, { name: 1, email: 1, username: 1, img: 1 });
        } catch (error) {
            console.log(error);
        }
    }
    
    let { name, email, message } = req.body;

    //Formating and removing extra white space
    name = stringFormat.removeExtraWhiteSpace(name).toUpperCase();
    email = email.trim().toLowerCase();
    message = message.trim();

    let errors = [];

    //Check require fields
    if (!name || !email || !message) {
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

    //If have any error
    if (errors.length > 0) {
        res.render('contact', {
            name,
            email,
            message,
            errors,
            user
        });
    } else {
        //Validation passed
        const newMessage = new Inbox({
            name,
            email,
            message
        });

        // save the message to database
        newMessage.save()
            .then(async msg => {
                res.render('contact', { success_msg: 'Message sent successfully, soon you will get reply from our team.', user });
            })
            .catch(err => console.log('err'));
    }
});

//--------------------- GET ABOUT PAGE --------------------------
router.get('/about', async (req, res) => {
    let user;
    if (req.user) {
        try {
            user = await User.findOne({ _id: req.user._id }, { name: 1, email: 1, username: 1, img: 1 });
        } catch (error) {
            console.log(error);
        }
    }

    res.render('about', { user } );
});

//--------------------- GET FAQ / F.A.Q PAGE --------------------------
router.get('/faq', async (req, res) => {
    let user;
    if (req.user) {
        try {
            user = await User.findOne({ _id: req.user._id }, { name: 1, email: 1, username: 1, img: 1 });
        } catch (error) {
            console.log(error);
        }
    }

    Faq.find()
        .then(resultFaq => {
            res.render('faq', { user, resultFaq });
        })
        .catch(err => {
            res.send("errorr occured");
        });
})

module.exports = router;