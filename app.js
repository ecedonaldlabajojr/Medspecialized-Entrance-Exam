const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');



// Initialize Express Application
const app = express();



// Set Template Processing Module to EJS (Embedded Javascript)
app.set('view engine', 'ejs');


// _____________ Setup Middleware Functions _____________
app.use(express.static(__dirname + "/public"));


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser('cookiesareyummy'));

app.use(session({
    secret: 'cookiesareyummy',
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

// _____________ Setup Database Connection Functions _____________
const configDB = require('./config/database');
mongoose.connect(configDB.database, configDB.dbOptions);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error Connecting to database:'));
db.once('open', function () {
    console.log('Successfully Connected to database.');
});



// _____________ Setup Routing _____________

// Import User Model
const User = require('./models/user');


// Root Path
app.get('/', (req, res) => {
    res.render('login', {});
});


// Admin view users handler
app.get('/admin/users', (req, res) => {
    res.render('admin_users', {});
});


// Create new User -> Use app.route() for chainable route handling (GET&POST)
app.route('/admin/users/add-user').get((req, res) => {
    res.render('admin_add_user');
}).post((req, res) => {
    let name = `${req.body.firstname} ${req.body.lastname}`;
    const newUser = new User({
        name: name,
        email: req.body.email,
        phone: req.body.phone,
        role: req.body.role,
        password: req.body.password
    });
    newUser.save();
    console.log(newUser);
    res.send("Sent!");
});


// Update Existing User -> Use app.route() for chainable route handling (GET&POST)
app.route('/admin/users/edit-user/:userId').get((req, res) => {

}).post((req, res) => {

});


// Delete Existing User
app.get('/admin/users/delete-user/:userId', (req, res) => {

});



// Server Listen at PORT
const localPORT = 3000;
app.listen(process.env.PORT || localPORT, () => {
    console.log(`Server is up and listening at port:${localPORT}`)
});