const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    voter: {
        type: [{
            voterId: Object
        }]
    }
});

const PollSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    creatorId: {
        type: Object,
        required: true,
    },
    options: [OptionSchema],
    totalVote: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        required: true
    },
    global: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Poll = mongoose.model('Poll', PollSchema);
module.exports = Poll;