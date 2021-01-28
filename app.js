const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const {
    body,
    validationResult
} = require('express-validator');
const passport = require('passport');



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
    saveUninitialized: false,
    secure: true
}));

app.use(flash());
app.use((req, res, next) => {
    res.locals.message = req.flash('info');
    next();
})


// _____________ Setup Passport.js for User authentication _____________
// Import User Model
const User = require('./models/user');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// _____________ Setup Database Connection Functions _____________
const configDB = require('./config/database');
const {
    response
} = require('express');
mongoose.connect(configDB.database, configDB.dbOptions);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error Connecting to database:'));
db.once('open', function () {
    console.log('Successfully Connected to database.');
});



// _____________ Setup Routing _____________


// Root Path
app.get('/', (req, res) => {
    res.render('login', {});
});


// Admin view users handler
app.get('/admin/users', (req, res) => {
    User.find({}, (err, foundUsers) => {
        if (!err) {
            if (!foundUsers) {
                res.render('admin/users', {
                    users: null
                });
            } else {
                res.render('admin_users', {
                    users: foundUsers
                });
            }
        } else {
            console.log(err);
            res.redirect('/');
        }
    });
});


// Create new User -> Use app.route() for chainable route handling (GET&POST)
app.route('/admin/users/add-user').get((req, res) => {
    res.render('admin_add_user');


}).post([body('firstname').not().isEmpty().withMessage("Please provide first name"),
    body('lastname').not().isEmpty().withMessage("Please provide last name"),
    body('role').not().isEmpty().withMessage("Please select a role"),
    body('email').isEmail().withMessage("Please provide a valid email"),
    body('password').isLength({
        min: 5
    }).withMessage('Password minimum length: 5')
], (req, res) => {

    const errors = validationResult(req);
    let errorArray = []
    errorArray = errorArray.concat(errors.array());


    if (req.body.password !== req.body.passwordConfirmation) {
        errorArray.push({
            msg: "Passwords do not match. Try again."
        });
    }

    User.findOne({
        username: req.body.email
    }, (err, userFound) => {
        if (!err) {
            if (userFound) {
                errorArray.push({
                    value: "",
                    msg: "Email already exists."
                });
            }
        } else {
            console.log(err);
        }
    }).then(() => {
        if (errorArray.length !== 0) {
            req.flash('info', errorArray);
            res.redirect('/admin/users/add-user');

            // if Form has no Errors(errorArray == 0), continue on with creating new user and save to database
        } else {

            User.register({
                username: req.body.email,
                email: req.body.email,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                phone: req.body.phonenum,
                role: req.body.role,
            }, req.body.password, (err, user) => {
                if (err) {
                    console.log(err);
                    res.redirect('/admin/users');
                } else {
                    req.flash('info', [{
                        msg: "Successfully added new user."
                    }]);
                    res.redirect('/admin/users');
                }
            });
        }
    })

});


// Update Existing User -> Use app.route() for chainable route handling (GET&POST)
app.route('/admin/users/edit-user/:userId').get((req, res) => {
    User.findById(req.params.userId, (err, foundUser) => {
        if (err) {
            return console.log(err);
        } else {
            if (foundUser) {
                res.render('admin_edit_user', {
                    user: foundUser
                });
            } else {
                req.flash('info', [{
                    msg: "There was an error fetching the user data."
                }]);
                res.redirect('admin/users');
            }
        }
    });

    // POST Request. Handle form Submission > Evaluate form first using express-validator. If no error, proceed to database record update
}).post([body('firstname').not().isEmpty().withMessage("Please provide first name"),
    body('lastname').not().isEmpty().withMessage("Please provide last name"),
    body('role').not().isEmpty().withMessage("Please select a role"),
    body('email').isEmail().withMessage("Please provide a valid email")
], (req, res) => {
    const errors = validationResult(req);
    let errorArray = [];

    errorArray = errorArray.concat(errors.array());

    if (req.body.password !== "") {
        console.log('Password < 5')
        if ((req.body.password).length < 5) {
            errorArray.push({
                value: "",
                msg: 'Password minimum length: 5'
            })
        };

        if (req.body.password !== req.body.passwordConfirmation) {
            console.log('Password mismatch');
            errorArray.push({
                value: "",
                msg: "Passwords do not match. Try again."
            })
        }
    }

    // Check if there are errors found. If there is, redirect to update-user page and display errors.
    if (errorArray.length > 0) {
        req.flash('info', errorArray);
        res.redirect(`/admin/users/edit-user/${req.params.userId}`);

        // If no error found, proceed to updating database Content
    } else {
        User.findById(req.params.userId, (err, foundUser) => {
            if (!err) {
                if (foundUser) {
                    foundUser.firstname = req.body.firstname;
                    foundUser.lastname = req.body.lastname;
                    foundUser.email = req.body.email;
                    foundUser.username = req.body.email;
                    foundUser.phone = req.body.phonenum;
                    foundUser.role = req.body.role;

                    // Check if there is new password. Password match-checking is already done above.
                    if (req.body.password !== "") {
                        console.log(req.body.password);
                        foundUser.setPassword(req.body.password, function (err) {
                            foundUser.save();
                            if (err) {
                                console.log(err);
                                req.flash('info', [{
                                    msg: 'Error occured while changing your password'
                                }]);
                                res.redirect(`/admin/users/edit-user/${req.params.userId}`);
                            }
                        });
                    }

                    // Simpy redirect to edit-user page if an error occurred fetching data on user
                } else {
                    req.flash('info', [{
                        msg: "An error occured while finding the user on db."
                    }]);
                    res.redirect(`/admin/users/edit-user/${req.params.userId}`);
                }
            } else {
                return console.log(err);
            }


            console.log(foundUser);
            // Save user changes
            foundUser.save(err => {
                if (err) {
                    console.log(err);
                }
            })

        }).then(() => {
            // After updating record, redirect and flash success alert.
            req.flash('info', [{
                msg: 'Successfully updated user record.'
            }]);
            res.redirect('/admin/users');
        })
    }



});


// Delete Existing User
app.get('/admin/users/delete-user/:userId', (req, res) => {
    User.findOneAndDelete({
        _id: req.params.userId
    }, (err) => {
        if (err) {
            req.flash('info', [{
                msg: 'Error fetching user data.'
            }]);
            res.redirect('/admin/users');
        } else {
            req.flash('info', [{
                msg: 'Successfully deleted user.'
            }]);
            res.redirect('/admin/users');
        }
    })
});


// Server Listen at PORT
const localPORT = 3000;
app.listen(process.env.PORT || localPORT, () => {
    console.log(`Server is up and listening at port:${localPORT}`)
})