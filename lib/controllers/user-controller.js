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

/** 
* Class representing a User controller.
* @author Jose Nicolas Mora
**/
class UserController {
	/**
	* Display a listing of the Landing page.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static userIndexGet(req, res) {
		res.render("landing");
	}
	
	/**
	* Show the form for creating a new User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static userNewGet(req, res) {
		res.render("users/register");
	}
	
	/**
	* Create a new User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async userCreatePost(req, res) {
		try {
			// add bio
			const passLength = 6;
			if (!req.body.password || req.body.password.length < passLength ) {
				req.flash("error", "Sorry, your password must be longer than " + passLength + " characters");
				return res.redirect("back");
			}
			let user = await new User({username: req.body.username, 
									   firstName: req.body.firstName, 
									   lastName: req.body.lastName,
									   email: req.body.email,
									   avatar: req.body.avatar,
									   bio: req.body.bio,
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
	
	/**
	* Display the specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
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
	
	/**
	* Show to the form for editing the specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
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
	
	/**
	* Update the specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
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
	
	/**
	* Show to the form for logging in the specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static userLoginGet(req, res) {
		res.render("users/login");
	}
	
	/**
	* Login the specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	*/
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
	
	/**
	* Logout the specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
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
	
	/**
	* Follow the specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
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
	
	/**
	* Show the forgot password form for the specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async userForgotGet(req, res) {
		try {
			const query = { _id: req.params.id };
			let user = await User.findOne(query);
			if(!user) {
				const data = {provider: DB_PROVIDER, query: query, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			res.render('users/forgot', {user: user});
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
		
	}
	
	/**
	* Create token for resetting passord.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	* @return {string} The generated reset password token.
	*/
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
	
	/**
	* Set the token of the specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	* @param {string} token - The generated reset password token.
	* @return {User} The modified User resource.
	*/
	static async findUserAndSetResetPasswordToken(req, res, next, token) {
		try {
			const query = { _id: req.params.id };
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
	
	/**
	* Create and send reset password email for specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	* @param {string} token - The generated reset password token.
	* @param {User} user - The specified User resource.
	*/
	static async generateResetPasswordEmail(req, res, next, token, user) {
		try {
			if(req.body.email !== "jnickm@gmail.com") {
				throw new Error("wrong email");
			}
			let smtpTransport = await nodemailer.createTransport({
				service: 'Gmail', 
				auth: {
					user: 'nikelausMTest@gmail.com',
					pass: process.env.GMAILPW
				}
			});
			let mailOptions = {
				to: req.body.email,
				from: 'nikelausMTest@gmail.com',
				subject: 'Node.js Password Reset Request',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
				'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
				'http://' + req.headers.host + '/reset/' + token + '\n\n' +
				'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			await smtpTransport.sendMail(mailOptions);
			req.flash('success', 'An e-mail has been sent to ' + req.body.email + ' with further instructions.');
		}
		catch(err) {
			throw err;
		}
	}
	
	/**
	* Send password reset request for specified user resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	*/
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
	
	/**
	* Show the reset password form for the specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	*/
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
	
	/**
	* Reset the password of the specified User resource and login the User.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	* @return {User} The User resource that had its password reset.
	*/
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
	
	/**
	* Create and send the reset password confirmation email to the owner of the specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	* @param {User} user - The User resource that had its password reset.
	*/
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
	
	/**
	* Reset password for specified User resource, and send confirmation email to its owner.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	*/
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