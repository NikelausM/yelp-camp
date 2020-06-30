"use strict";
const 	express 		= require("express"),
		router 			= express.Router(),
		passport 		= require("passport"),
		async 			= require("async"),
		nodemailer 		= require("nodemailer"),
		crypto 			= require("crypto"),
		errors			= require("../../bin/errors/errors");

// requiring models
const	User				= require("../models/user"),
	  	Campground 			= require("../models/campground"),
	  	Comment				= require("../models/comment"),
	  	Notification		= require("../models/notification");

// require routes
const	middleware		= require("../middleware");

const DB_PROVIDER = "MongoDB";

class UserController {
	// User INDEX
	static userIndexGet(req, res) {
		res.render("landing");
	}
	
	// User NEW
	static userNewGet(req, res) {
		res.render("users/register");
	}
	
	// User CREATE
	static async userCreatePost(req, res) {
		try {
			let user = await new User({username: req.body.username, 
									firstName: req.body.firstName, 
									lastName: req.body.lastName,
									email: req.body.email,
									avatar: req.body.avatar,
								   });
			
			if(req.body.adminCode === process.env.ADMIN_CODE) {
				user.isAdmin = true;
			}
			
			user = await User.register(user, req.body.password);
			
			await passport.authenticate("local")(req, res, () => {
				req.flash("success", "Welcome to YelpCamp " + user.username);
				return res.redirect('/campgrounds');
			});	
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	static userLoginGet(req, res) {
		res.render("users/login");
	}
	
	static userLoginPost(req, res, next) {
		try {
			passport.authenticate("local", {
				successRedirect: "/campgrounds",
				failureRedirect: "/login",
			})(req, res, next);
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	static userLogoutPost(req, res) {
		try {
			req.logout();
			req.flash("success", "Logged you out!");
			res.redirect("/campgrounds");
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	static async userShowGet(req, res) {
		try {
			const userQuery = {_id: req.params.id};
			const user = await User.findOne(userQuery);
			if(!user) {
				const data = {provider: DB_PROVIDER, query: userQuery, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			
			const campgroundQuery = {"author.id": user._id};
			const campgrounds = await Campground.find(campgroundQuery).exec();
			if(!campgrounds) {
				const data = {provider: DB_PROVIDER, query: campgroundQuery, resource: Campground.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			
			return res.render("users/show", {user: user, campgrounds: campgrounds});
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	static async userFollowGet(req, res) {
		try {
			const query = {_id: req.params.id};
			let user = await User.findOne(query);
			if(!user) {
				const data = {provider: DB_PROVIDER, query: query, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			// prevent them from following again
			await user.followers.push(req.user._id);
			await user.save();
			req.flash("success", "Successfully followed " + user.username + "!");
			res.redirect("/users/" + req.params.id);
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	static async userNotificationsIndexGet(req, res) {
		try {
			const query = {_id: req.user._id};
			const user = await User.findOne(query).populate({
				path: "notifications", // populate notifications
				options: {sort: {"_id": -1}} // sort notifications in descending order
			}).exec();
			if(!user) {
				const data = {provider: DB_PROVIDER, query: query, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			
			const allNotifications = user.notifications;
			res.render("notifications/index", {allNotifications});
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	static async userNotificationsGet(req, res) {
		try {
			const query = {_id: req.params.id};
			let notification = await Notification.findById(query);
			if(!notification) {
				const data = {provider: DB_PROVIDER, query: query, resource: Notification.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			notification.isRead = true; // make seen notification no longer seen in drop down
			notification.save();
			res.redirect(`/campgrounds/${notification.campgroundId}`);
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	static userForgotGet(req, res) {
		res.render('users/forgot');
	}
	
	static async function generate token(done) {
		crypto.randomBytes(20, function(err, buf) {
			if (err) {
				req.flash('error', 'There was a problem resetting your password!');
				return res.redirect('/forgot');
			}
			var token = buf.toString('hex');
			done(err, token);
		});
	}
	
	static userForgotPost(req, res, next) {
		async.waterfall([
			UserController.generateToken(done),
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
	}
}

module.exports = UserController;