const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    img: {
        url: {
            type: String,
            default: ''
        },
        public_id: {    //cloudinary image public_id
            type: String
        }
    },
    regDate: {
        type: Object,
        default: Date.now
    },
    accountStatus: {
        type: String,
        default: 'unblocked'
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;