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
			// add bio
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
	
	// User SHOW
	static async userShowGet(req, res) {
		try {
			const userQuery = {_id: req.params.id};
			const user = await User.findOne(userQuery).populate({
				path: "campgrounds", // populate notifications
				options: {sort: {"_id": -1}} // sort notifications in descending order
			}).exec();
			if(!user) {
				const data = {provider: DB_PROVIDER, query: userQuery, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			
			return res.render("users/show", {user: user, campgrounds: user.campgrounds});
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	// User EDIT
	static async userEditGet(req, res) {
		try {
			const query = {_id: req.params.id};
			const user = await User.findOne(query);
			if(!user) {
				const data = {provider: DB_PROVIDER, query: query, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			return res.render("users/edit", {user: user});
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	// User Update
	static async userUpdatePut(req, res) {
		try {
			const query = {_id: req.params.id};
			const user = await User.findOneAndUpdate(query, req.body.user, {new: true});
			if(!user) {
				const data = {provider: DB_PROVIDER, query: query, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			req.flash("success", "Successfully updated profile!")
			res.redirect("/users/" + user._id);
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	// User get LOGIN form
	static userLoginGet(req, res) {
		res.render("users/login");
	}
	
	// User send LOGIN request
	static userLoginPost(req, res, next) {
		try {
			passport.authenticate("local", {
				successRedirect: "/campgrounds",
				failureRedirect: "/login",
				failureFlash: true,
			})(req, res, next);
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	// User send LOGOUT request
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
	
	// User FOLLOW
	static async userFollowGet(req, res) {
		try {
			const query = {_id: req.params.id};
			let user = await User.findOne(query).populate("followers");
			if(!user) {
				const data = {provider: DB_PROVIDER, query: query, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}

			user.followers.forEach((follower) => {
				if(follower._id.equals(req.user._id)) {
					throw new Error(`Already following ${user.username}`)
				}
			})

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
	
	// User get FORGOT password form
	static userForgotGet(req, res) {
		res.render('users/forgot');
	}
	
	// Create token for resetting passord
	static async generateResetPasswordToken(req, res, next) {
		try {
			const buffer = await crypto.randomBytes(20);
			const token = buffer.toString('hex');
			return token;
		}
		catch(err) {
			throw err;
		}

	}
	
	// User SET reset password token
	static async findUserAndSetResetPasswordToken(req, res, next, token) {
		try {
			const query = { email: req.body.email };
			let user = await User.findOne(query);
			if(!user) {
				const data = {provider: DB_PROVIDER, query: query, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			user.resetPasswordToken = token;
			user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

			await user.save();

			return user;
		}
		catch(err) {
			throw err;
		}

	}
	
	// User CREATE reset password email
	static async generateResetPasswordEmail(req, res, next, token, user) {
		try {
			let smtpTransport = await nodemailer.createTransport({
				service: 'Gmail', 
				auth: {
					user: 'nikelausMTest@gmail.com',
					pass: process.env.GMAILPW
				}
			});
			let mailOptions = {
				to: user.email,
				from: 'nikelausMTest@gmail.com',
				subject: 'Node.js Password Reset Request',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
				'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
				'http://' + req.headers.host + '/reset/' + token + '\n\n' +
				'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			await smtpTransport.sendMail(mailOptions);
			req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
		}
		catch(err) {
			throw err;
		}
	}
	
	// User send RESET password reqeust
	static async userForgotPost(req, res, next) {
		try {
			const token = await UserController.generateResetPasswordToken(req, res, next);
			const user = await UserController.findUserAndSetResetPasswordToken(req, res, next, token);
			await UserController.generateResetPasswordEmail(req, res, next, token, user);
			return res.redirect("/campgrounds");
		}
		catch(err) {
			console.log(err);
			req.flash("error", "There was a problem resetting your password!");
			return res.redirect("/forgot");
		}
		
	}
	
	// User get RESET password form
	static async userResetGet(req, res, next) {
		try {
			
			const query = { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } };
			const user = await User.findOne(query);
			if(!user) {
				const data = {provider: DB_PROVIDER, query: query, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			return res.render('users/reset', {token: req.params.token});
		}
		catch(err) {
			console.log(err);
			if(err instanceof errors.ResourceNotFoundError) {
				req.flash("error", err.message);
			}
			else {
				req.flash("error", "Password reset token is invalid or has expired.");
			}
			return res.redirect("/");
		}
	}
	
	// User reset password
	static async resetPassword(req, res, next) {
		try {
			
			const query = { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } };
			let user = await User.findOne(query);
			if(!user) {
				const data = {provider: DB_PROVIDER, query: query, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			
			if (req.body.password !== req.body.confirm) {
				throw new Error("Passwords do not match.");
			}
			await user.setPassword(req.body.password);
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;

			await user.save();
			
			await req.login(user, function(err) {
				if (err) {
					throw err;
				}
			});
			return user;
		}
		catch(err) {
			throw err;
		}
	}
	
	// User CREATE reset password confirmation email
	static async generateResetPasswordConfirmationEmail(req, res, next, user) {
		try {
			let smtpTransport = await nodemailer.createTransport({
				service: 'Gmail', 
				auth: {
					user: 'nikelausMTest@gmail.com',
					pass: process.env.GMAILPW
				}
			});
			let mailOptions = {
				to: user.email,
				from: 'nikelausMTest@gmail.com',
				subject: 'Your password has been changed',
				text: 'Hello,\n\n' +
				'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
			};
			await smtpTransport.sendMail(mailOptions);
			req.flash('success', 'Success! Your password has been changed.');				
		}
		catch(err) {
			throw err;
		}
	}
	
	// User SEND reset password request
	static async userResetPost(req, res, next) {
		try {
			let user = await UserController.resetPassword(req, res, next);
			await UserController.generateResetPasswordConfirmationEmail(req, res, next, user);
			return res.redirect("/campgrounds");
		}
		catch(err) {
			console.log(err);
			req.flash("error", "Password reset token is invalid or has expired.");
			return res.redirect("/");
		}
	}
}

module.exports = UserController;