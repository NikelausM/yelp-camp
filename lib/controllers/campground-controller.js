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

// Display a list of all campgrounds
exports.campgroundIndexGet = async function(req, res) {
	let campgrounds = [];
	try {
		// Get all campgrounds from DB
		let query = {};
		if(req.query.search) {
			const regex = new RegExp(escapeRegex(req.query.search), 'gi');
			query = {name: regex};
		}
		campgrounds = await Campground.find(query);
		res.render("campgrounds/index",{campgrounds: campgrounds, noMatch: null});
	}
	catch(err) {
		if (err instanceof errors.ResourceNotFoundError) {
			// No match was found
			res.render("campgrounds/index",{campgrounds: campgrounds, noMatch: err.message});
		}
		else {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect("back");
		}
	}
}

async function setCampgroundLocData(req) {
	try {
		let geocoderHelper = new GeocoderHelper();
		geocoderHelper.setParams({query: req.body.campground.location, resource: "geographic coordinates"});
		await geocoderHelper.geocodeData();
		geocoderHelper.setLocData(req.body.campground);
		return req.body.campground;
	}
	catch(err) {
		throw new errors.ExtendedError({errorCause: err});
	}
}

async function uploadCampgroundImage(req) {
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

async function createNewCampgroundNotifications(loggedInUser, campground) {
	try {
		// Get followers of campground author
		let user = await User.findOne({_id: loggedInUser._id}).populate("followers").exec();

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

exports.campgroundCreatePost = async (req, res) => {
	console.log("going to create");
	try {
		console.log("in create");
		await setCampgroundLocData(req)
		await uploadCampgroundImage(req);
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username,
		}
		const campground = await Campground.create(req.body.campground);
		await createNewCampgroundNotifications(req.user, campground);

		req.flash("success", "Successfully created campground");
		return res.redirect(`/campgrounds/${campground._id}`);
	}
	catch(err) {
		console.log(err);
		req.flash('error', err.message);
		return res.redirect("back");
	}
}

exports.campgroundNewGet = (req, res) => {
	res.render("campgrounds/new");
}

exports.campgroundShowGet = async (req, res) => {
	try {
		const campground = await Campground.findOne({_id: req.params.id}).populate("comments").exec();
		return res.render("campgrounds/show", {campground: campground});
	}
	catch(err) {
		console.log(err);
		req.flash("error", err.message);
		return res.redirect("back");
	}
}

exports.campgroundEditGet = async (req, res) => {
	try {
		const campground = await Campground.findOne({_id: req.params.id});
		return res.render("campgrounds/edit", {campground: campground});
	}
	catch(err) {
		console.log(err);
		req.flash('error', err.message);
		return res.redirect("back");
	}
}

exports.campgroundUpdatePut = async (req, res) => {
	try {
		let campground = await setCampgroundLocData(req);
		campground = await Campground.findOneAndUpdate({_id: req.params.id}, req.body.campground, {new: true});
		req.flash("success", "Successfully Updated campground!")
		res.redirect("/campgrounds/" + req.params.id);
	}
	catch(err) {
		console.log(err);
		req.flash('error', err.message);
		return res.redirect("back");
	}
}

exports.campgroundDestroyDelete = async (req, res) => {
	try {
		console.log("destroying campground");
		await Campground.findOneAndDelete({_id: req.params.id});
		req.flash("success", "Campground deleted!");
	} catch (err) {
		console.log("error destroying campground");
		console.log(err);
		req.flash("error", "Failed to delete campground");
	}
	res.redirect("/campgrounds");
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};