const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: Number,
    role: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model('User', userSchema);

module.exports = User;