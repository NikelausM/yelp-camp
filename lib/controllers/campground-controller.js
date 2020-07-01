"use strict";
const 	express 			= require("express"),
		router 				= express.Router(),
		middleware			= require("../middleware"), // if file is not specified than it will require index.js in specified folder
		multer 				= require("multer"),
		superRepo			= require("super-repo"),
		errors				= require("../../bin/errors/errors"),
		APIHelper			= require("../../bin/helpers/api/api-helper"),
		GeocoderHelper		= require("../../bin/helpers/api/geocoder-helper"),
		CloudinaryHelper	= require("../../bin/helpers/api/cloudinary-helper");

// requiring models
const	User				= require("../models/user"),
	  	Campground 			= require("../models/campground"),
	  	Comment				= require("../models/comment"),
	  	Notification		= require("../models/notification");

const DB_PROVIDER = "MongoDB";

class CampgroundController {
	// Campground Index
	static async campgroundIndexGet(req, res) {
		let campgrounds = [];
		try {
			// Get all campgrounds from DB
			let query = {};
			if(req.query.search) {
				const regex = new RegExp(CampgroundController.escapeRegex(req.query.search), 'gi');
				query = {name: regex};
			}
			campgrounds = await Campground.find(query);
			if(!campgrounds.length) {
				return res.render("campgrounds/index",{campgrounds: campgrounds, noMatch: `Unable to find ${Campground.schema.COLLECTION_NAME}`});
			}
			return res.render("campgrounds/index",{campgrounds: campgrounds, noMatch: null});
		}
		catch(err) {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect("back");
		}
	}

	static async setCampgroundLocData(campground) {
		try {
			let geocoderHelper = new GeocoderHelper();
			geocoderHelper.setParams({query: campground.location, resource: "geographic coordinates"});
			await geocoderHelper.geocodeData();
			geocoderHelper.setLocData(campground);
			return campground;
		}
		catch(err) {
			throw new errors.ExtendedError({errorCause: err});
		}
	}

	static async uploadCampgroundImage(req) {
		try {
			let cloudinaryHelper = new CloudinaryHelper();
			cloudinaryHelper.setParams({query: req.file.path});
			await cloudinaryHelper.uploadImageToCloudinary();
			req.body.campground.image = cloudinaryHelper.response.secure_url;
			return req.body.campground;
		}
		catch(err) {
			throw new errors.ExtendedError({errorCause: err});
		}
	}

	static async createNewCampgroundNotifications(loggedInUser, campground) {
		try {
			// Get followers of campground author
			const query = {_id: loggedInUser._id};
			let user = await User.findOne(query).populate("followers").exec();
			if(!user) {
				const data = {provider: DB_PROVIDER, query: query, resource: User.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}

			// Create notification object for followers
			const newNotification = {
				username: user.username,
				campgroundId: campground.id,
			}

			// For each follower create an individual notification model object and add it to their notifications array
			for(const follower of user.followers) {
				let notification = await Notification.create(newNotification);
				await follower.notifications.push(notification);
				await follower.save();
			}
		}
		catch(err) {
			throw new errors.ExtendedError({errorCause: err, data: {loggedInUser: loggedInUser, campground: campground}});
		}

	}

	static async campgroundCreatePost(req, res) {
		try {
			await CampgroundController.setCampgroundLocData(req.body.campground);
			await CampgroundController.uploadCampgroundImage(req);
			req.body.campground.author = {
				id: req.user._id,
				username: req.user.username,
			}
			const campground = await Campground.create(req.body.campground);
			await CampgroundController.createNewCampgroundNotifications(req.user, campground);
			
			await req.user.campgrounds.push(campground);
			await req.user.save();
			
			req.flash("success", "Successfully created campground");
			return res.redirect(`/campgrounds/${campground._id}`);
		}
		catch(err) {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect("back");
		}
	}

	static campgroundNewGet(req, res) {
		res.render("campgrounds/new");
	}

	static async campgroundShowGet(req, res) {
		try {
			const query = {_id: req.params.id};
			const campground = await Campground.findOne(query).populate("comments").exec();
			if(!campground) {
				const data = {provider: DB_PROVIDER, query: query, resource: Campground.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			return res.render("campgrounds/show", {campground: campground});
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}

	static async campgroundEditGet(req, res) {
		try {
			const query = {_id: req.params.id};
			const campground = await Campground.findOne(query);
			if(!campground) {
				const data = {provider: DB_PROVIDER, query: query, resource: Campground.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			return res.render("campgrounds/edit", {campground: campground});
		}
		catch(err) {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect("back");
		}
	}

	static async campgroundUpdatePut(req, res) {
		try {
			await CampgroundController.setCampgroundLocData(req.body.campground);
			const query = {_id: req.params.id};
			const campground = await Campground.findOneAndUpdate(query, req.body.campground, {new: true});
			if(!campground) {
				const data = {provider: DB_PROVIDER, query: query, resource: Campground.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			req.flash("success", "Successfully updated campground!")
			res.redirect("/campgrounds/" + req.params.id);
		}
		catch(err) {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect("back");
		}
	}

	static async campgroundDestroyDelete (req, res) {
		try {
			const query = {_id: req.params.id}
			const campground = await Campground.findOneAndDelete(query);
			if(!campground) {
				const data = {provider: DB_PROVIDER, query: query, resource: Campground.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			req.flash("success", "Campground deleted!");
		} catch (err) {
			console.log(err);
			req.flash("error", err.message);
		}
		res.redirect("/campgrounds");
	}

	static escapeRegex(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
}

module.exports = CampgroundController;