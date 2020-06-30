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
		res.render("login", {page: "login"});
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
			let user = await User.findById(query);
			if(!user) {
				const data = {provider: DB_PROVIDER, query: query, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
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
}

module.exports = UserController;