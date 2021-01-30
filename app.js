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
const checkMessageType = require('./util/message');
require('dotenv').config();



// Initialize Express Application
const app = express();



// Set Template Processing Module to EJS (Embedded Javascript)
app.set('view engine', 'ejs');


// _____________ Setup Middleware Functions _____________
app.use(express.static(__dirname + "/public"));


app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    secure: true
}));

app.use(flash());
app.use((req, res, next) => {
    res.locals.message = req.flash('info');
    next();
});


// _____________ Setup Passport.js Middleware for User authentication _____________

// Import User Model
const User = require('./models/user');

// Passport {Step1} Create Strategy
passport.use(User.createStrategy());

// Passport {Step2} Application Middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport {Step3} Use passport for Sessions
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


// Route handling root endpoint. If user is already logged in on session, redirect to welcome page. if Not, redirect to log-in.
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect(`account/${req.user._id}`);
    } else {
        // req.flash('info', [{
        //     msg: 'Invalid username or password.'
        // }]);
        res.redirect('/login');
    }
});


// Login Page
app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect(`account/${req.user._id}`);
    } else {
        res.render('login');
    }
});

// Submit Form using username and password
// app.post('/login', (req, res) => {
//     const user = new User({
//         username: req.body.email,
//         password: req.body.password
//     });
//     req.login(user, (err) => {
//         if (!err) {
//             res.redirect(`account/${req.user._id}`);
//         } else {
//             req.flash('info', [{
//                 msg: 'Invalid username or password.'
//             }]);
//             res.redirect('/login');
//         }
//     })
// });
// 
// app.post('/login',
//     passport.authenticate('local', {
//         failureRedirect: '/login',
//         failureFlash: "Invalid username or password."
//     }),
//     function (req, res) {
//         res.redirect(`account/${req.user._id}`);
//     });

app.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            req.flash('info', [{
                msg: 'Something went wrong logging in.'
            }]);
            return res.redirect('/login');
        }
        if (!user) {
            req.flash('info', [{
                msg: 'Invalid username or password.'
            }]);
            return res.redirect('/login');
        }
        req.logIn(user, function (err) {
            if (err) {
                req.flash('info', [{
                    msg: 'Something went wrong logging in.'
                }]);
                return res.redirect('/login');
            }
            res.redirect(`account/${req.user._id}`);
        });
    })(req, res, next);
});

// Logout Request Handler
app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
})


// Proceed to Welcome Page with user ID
app.get('/account/:userId', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('welcome', {
            loggedUser: req.user
        });
    } else {
        req.flash('info', [{
            msg: 'Invalid username or password'
        }]);
        res.redirect("/login");
    }
})


// Admin view users handler
app.get('/admin/users', (req, res) => {
    if (req.isAuthenticated()) {
        User.find({}, (err, foundUsers) => {
            let messageType = "success";
            if (!err) {
                if (!foundUsers) {
                    res.render('admin/users', {
                        users: null,
                        loggedUser: req.user,
                        messageType: checkMessageType(req)
                    });
                } else {
                    res.render('admin_users', {
                        users: foundUsers,
                        loggedUser: req.user,
                        messageType: checkMessageType(req)
                    });
                }
            } else {
                console.log(err);
                req.session.messageType = "danger";
                req.flash('info', [{
                    msg: "An error occured while fetching user data."
                }]);
                res.redirect('/login');
            }
        });
    } else {
        res.redirect('/login');
    }
});


// Create new User -> Use app.route() for chainable route handling (GET&POST)
app.route('/admin/users/add-user').get((req, res) => {
    if (req.isAuthenticated()) {
        res.render('admin_add_user', {
            loggedUser: req.user
        });
    } else {
        res.redirect('/login');
    }


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
                    req.session.messageType = "danger";
                    req.flash('info', [{
                        msg: "An error occured while creating new user."
                    }]);
                    res.redirect('/admin/users');
                } else {
                    req.session.messageType = "success";
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
    if (req.isAuthenticated()) {
        User.findById(req.params.userId, (err, foundUser) => {
            if (err) {
                console.log(err);
                req.session.messageType = "danger";
                req.flash('info', [{
                    msg: "There was an error fetching the user data."
                }]);
                res.redirect('admin/users');
            } else {
                if (foundUser) {
                    res.render('admin_edit_user', {
                        user: foundUser,
                        loggedUser: req.user
                    });
                } else {
                    req.flash('info', [{
                        msg: "There was an error fetching the user data."
                    }]);
                    res.redirect('admin/users');
                }
            }
        });
    } else {
        res.redirect('/login');
    }

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
        if ((req.body.password).length < 5) {
            errorArray.push({
                value: "",
                msg: 'Password minimum length: 5'
            })
        };

        if (req.body.password !== req.body.passwordConfirmation) {
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
                    req.session.messageType = "danger";
                    req.flash('info', [{
                        msg: "An error occured while fetching user data."
                    }]);
                    res.redirect(`/admin/users/edit-user/${req.params.userId}`);
                }
            } else {
                console.log(err);
                req.session.messageType = "danger";
                req.flash('info', [{
                    msg: "An error occured while fetching user data."
                }]);
                res.redirect(`/admin/users/edit-user/${req.params.userId}`);
            }

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
            req.session.messageType = "success";
            res.redirect('/admin/users');
        })
    }

});

app.get('/cancel-edit', (req, res) => {
    req.flash('info', [{
        msg: "Cancelled edit."
    }]);
    req.session.messageType = "danger";
    res.redirect('/admin/users');
})


// Delete Existing User
app.get('/admin/users/delete-user/:userId', (req, res) => {
    if (req.isAuthenticated()) {
        User.findOneAndDelete({
            _id: req.params.userId
        }, (err) => {
            if (err) {
                req.session.messageType = "danger";
                req.flash('info', [{
                    msg: 'Error deleting user data.'
                }]);
                res.redirect('/admin/users');
            } else {
                req.flash('info', [{
                    msg: 'Successfully deleted user.'
                }]);
                res.redirect('/admin/users');
            }
        })
    } else {
        res.redirect('/login');
    }
});


// Server Listen at PORT
const localPORT = 3000;
app.listen(process.env.PORT || localPORT, () => {
    console.log(`Server is up and listening at port:${localPORT}`)
})