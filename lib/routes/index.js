"use strict";
// require packages
const 	express 		= require("express"),
		router 			= express.Router(),
		passport 		= require("passport"),
		async 			= require("async"),
		nodemailer 		= require("nodemailer"),
		crypto 			= require("crypto"),
		errors			= require("../../bin/errors/errors");
		
// require models
const	User 			= require("../models/user"),
		Campground 		= require("../models/campground"),
		Notification	= require("../models/notification");

// require routes
const	middleware		= require("../middleware");

// requiring controllers
const	userController	= require("../controllers/user-controller");

// Root route
router.get("/", userController.userIndexGet);

// User NEW
router.get("/register", userController.userNewGet);

// User CREATE
router.post("/register", userController.userCreatePost);

// SHOW login form
router.get("/login", userController.userLoginGet);

// Login route
router.post("/login", userController.userLoginPost);


// Logout route
router.get("/logout", userController.userLogoutPost);

// SHOW USERS PROFILE
router.get("/users/:id", userController.userShowGet);

// follow user
router.get("/follow/:id", middleware.isLoggedIn, userController.userFollowGet);

// view all notifications
router.get("/notifications", middleware.isLoggedIn, async (req, res) => {
	try {
		let user = await User.findById(req.user._id).populate({
			path: "notifications", // populate notifications
			options: {sort: {"_id": -1}} // sort notifications in descending order
		}).exec();
		let allNotifications = user.notifications;
		res.render("notifications/index", {allNotifications});
	}
	catch(err) {
		console.log(err);
        console.trace();
        req.flash("error", err.message);
        return res.redirect("back");
	}
});

// handle notification
router.get("/notifications/:id", middleware.isLoggedIn, async (req, res) => {
	try {
		let notification = await Notification.findById(req.params.id);
		notification.isRead = true; // make seen notification no longer seen in drop down
		notification.save();
		res.redirect(`/campgrounds/${notification.campgroundId}`);
	}
	catch(err) {
		console.log(err);
        console.trace();
        req.flash("error", err.message);
        return res.redirect("back");
	}
});

// Show request password reset page
router.get('/forgot', function(req, res) {
    res.render('forgot');
});

// Send password reset email
router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                if (err) {
                    req.flash('error', 'There was a problem resetting your password!');
                    return res.redirect('/forgot');
                }
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (err || !user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }
                
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                
                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail', 
                auth: {
                    user: 'nikelausMTest@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'nikelausMTest@gmail.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                if (err) {
                    req.flash('error', 'There was a problem resetting your password!');
                    return res.redirect('/forgot');
                }
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) {
			req.flash('error', 'There was a problem resetting your password!');
			return next(err);
		}
        res.redirect('/forgot');
    });
});


// Password reset page
router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (err || !user) {
			if(err) {
				console.log("Error: " + err);
			}
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {token: req.params.token});
    });
});

// Reset password
router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (err || !user) {
					if(err) {
						console.log("Error: " + err);
					}
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;
                        
                        user.save(function(err) {
							if(err) {
								console.log("Saving password error" + err);
								req.flash('error', 'There was a problem saving the password.');
								return res.redirect('back');
							}
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail', 
                auth: {
                    user: 'nikelausMTest@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'nikelausMTest@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
				if(err) {
					console.log("Problem sending reset email");
                    req.flash('error', 'There was a problem with sending your reset email!');
                    return res.redirect('back');
				}
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/campgrounds');
    });
});

module.exports = router;