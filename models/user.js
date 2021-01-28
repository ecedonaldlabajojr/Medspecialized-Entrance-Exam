const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
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

const User = new mongoose.model('User', userSchema);

module.exports = User;