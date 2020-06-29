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

class UserController {
	// User INDEX
	static userIndexGet(req, res) {
		res.render("landing");
	}
	
	// User NEW
	static userNewGet(req, res) {
		res.render("register", {page: "register"});
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
			console.log("finished creating user object");
			console.log(user);
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
}

module.exports = UserController;