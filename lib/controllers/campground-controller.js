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
exports.campgroundIndexGet = function(req, res) {
	var noMatch = null;
	if(req.query.search) {
		// Get all campgrounds from DB
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex}, (err, allCampgrounds) => {
			if(err) {
				console.log(err);
			}
			else {
				if (allCampgrounds.length < 1) {
					noMatch = "No campgrounds match that query, please try again!";
				}
				res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});	
			}
		});
	}
	else {
		Campground.find({}, function(err, allCampgrounds){
			if(err){
				console.log(err);
				res.redirect("back");
			} 
			else if (!allCampgrounds) {
				res.redirect("back");
			}
			else {
				res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
			}
		});
	}
}

// async function createCampground(req, res) {
// 	try {
// 		console.log("start create campground");
// 		let campground = await Campground.create(req.body.campground);

// 		if(!campground) {
// 			throw new Error("Mongoose Campground.create Error: " + 
// 							" There was a problem creating a Campground." + 
// 							" No Campground returned from Campground.create.")
// 		}
// 		console.log("finish create campground");

// 		// Get followers of campground author
// 		console.log("start update user");
// 		let user = await User.findById(req.user._id).populate("followers").exec();

// 		if(!user) {
// 			throw new Error("Mongoose User.findById Error: " + 
// 							" There was a problem finding a User by ID." + 
// 							" No User returned from User.findById.")
// 		}
		
// 		console.log("finish update user");

// 		// Create notification object for followers
// 		let newNotification = {
// 			username: req.user.username,
// 			campgroundId: campground.id,
// 		}

// 		// For each follower create an individual notification model object and add it to their notifications array
// 		console.log("start create notification");
// 		for(const follower of user.followers) {
// 			let notification = await Notification.create(newNotification);
// 			await follower.notifications.push(notification);
// 			await follower.save();
// 		}

// 		console.log("successfully created notifications");

// 		req.flash("success", "Successfully created campground");
// 	}
// 	catch (err) {
// 		console.log(err);
// 		throw new Error(err);
// 	}
// }

// async createCampground(req, res) => {
// 	let campground = null;
// 	const query = req.body.campground;
// 	try {
// 		// add author to campground
// 		req.body.campground.author = {
// 			id: req.user._id,
// 			username: req.user.username
// 		}
// 		campground = await Campground.create(query);
// 	}
// 	catch(err) {
// 		console.log(err);
// 		return;
// 	}
// 	if(!campground) {
// 		throw new errors.ResourceNotFoundError("campground", query);
// 	}
// }

exports.campgroundCreatePost = (req, res) => {
	console.log("in create");
	console.log(req.body);
	
	// create geocoder api helper to handle errors
	let campground = null;
	let geocoderHelper = new GeocoderHelper();
	geocoderHelper.setParams({query: req.body.campground.location, resource: "geographic coordinates"});
	(async () => {
		await geocoderHelper.geocodeData(req.body.campground);
		// geocoderHelper.setLocData(req.body.campground);
		// console.log(req.body.campground);
		// if(geocoderHelper.response)
		// geocoderHelper.setLocData(req.body.campground);
		// let cloudinaryHelper = new CloudinaryHelper();
		// await cloudinaryHelper.uploadImageToCloudinary(req.file.path, req.body.campground.image);
		// campground = createCampground();
		console.log(req.body.campground);
	})()
	.then(() => {
		return res.redirect('back');
	})
	.catch(err => {
		console.log("create campground controller function");
		console.log(err);
		req.flash('error', err.message);
		return res.redirect('back');
	});
	
	// res.redirect(`/campgrounds/${campground.id}`);
}

exports.campgroundNewGet = (req, res) => {
	res.render("campgrounds/new");
}

exports.campgroundShowGet = (req, res) => {

	// find the campground with provided ID and populate comments
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
		if(err || !foundCampground) {
			console.log(err);
			req.flash("error", "Campground not found.");
			return res.redirect("back");
		}
		else {
			//console.log(foundCampground);
			// render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
}

exports.campgroundEditGet = (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if(err || !foundCampground) {
			console.log(err);
			req.flash("error", "Campground not found.");
			return res.redirect("back");
		}
		else {
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
}

exports.campgroundUpdatePut = (req, res) => {
	geocoder.geocode(req.body.location, function (err, data) {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
		
		// find and update correct campground
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
			if(err || !updatedCampground) {
				console.log(err);
				req.flash("error", "Failed to update campground.");
				return res.redirect("back");
			}
			else {
				req.flash("success", "Successfully Updated campground!")
				res.redirect("/campgrounds/" + req.params.id);
			}
		});
	});
}

exports.campgroundDestroyDelete = async (req, res) => {
	try {
		let foundCampground = await Campground.findById(req.params.id);
		await foundCampground.remove();
		req.flash("success", "Campground deleted!");
		res.redirect("/campgrounds");
	} catch (error) {
		req.flash("success", "Failed to delete campground");
		res.redirect("/campgrounds");
	}
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};