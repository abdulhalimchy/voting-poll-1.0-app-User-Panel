const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true,
    }
});

const Faq = mongoose.model('Faq', FaqSchema);
module.exports = Faq;