"use strict";

const 	
		/**
		 * express module
		 * @const
		 */
		express 			= require("express"), 
		/**
		 * middleware module.
		 * If file is not specified than it will require index.js in specified folder
		 * @const
		 */
		middleware			= require("../middleware"), 
		/**
		 * multer module
		 * @const
		 */
		multer 				= require("multer"),
		/**
		 * errors module
		 * @const
		 */
		errors				= require("../../bin/errors/errors"),
		/**
		 * api-helper class module
		 * @const
		 */
		APIHelper			= require("../../bin/helpers/api/api-helper"),
		/**
		 * geocoder-helper class module
		 * @const
		 */
		GeocoderHelper		= require("../../bin/helpers/api/geocoder-helper"),
		/**
		 * cloudinary-helper class module
		 * @const
		 */
		CloudinaryHelper	= require("../../bin/helpers/api/cloudinary-helper"),
		/**
		 * general-helper class module
		 * @const
		 */
		GeneralHelper		= require("../../bin/helpers/general/general-helper");

// requiring models
const	
		/**
		 * User resource class module
		 * @const
		 */
		User				= require("../models/user"),
		/**
		 * Campground resource class module
		 * @const
		 */
	  	Campground 			= require("../models/campground"),
		/**
		 * Comment resource class module
		 * @const
		 */
	  	Comment				= require("../models/comment"),
		/**
		 * Notification resource class module
		 * @const
		 */
	  	Notification		= require("../models/notification");

/**
@const
@default
*/
const DB_PROVIDER = "MongoDB";

/** 
* Class representing a Campground controller.
* @module lib/controllers/campground-controller
* @requires express
* @requires multer
* @requires lib/middleware/middleware
* @requires bin/errors/errors
* @requires bin/helpers/api/api-helper
* @requires bin/helpers/api/geocoder-helper
* @requires bin/helpers/api/cloudinary-helper
* @requires bin/helpers/general/general-helper
* @requires lib/models/user
* @requires lib/models/campground
* @requires lib/models/comment
* @requires lib/models/notification
* @author Jose Nicolas Mora
*/
class CampgroundController {
	/**
	* Create a CampgroundController.
	*/
	constructor() {
		
	}
	/**
	* Display a listing of the Campground resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async campgroundIndexGet(req, res) {
		const perPage = 8;
		const pageQuery = parseInt(req.query.page);
		const pageNumber = pageQuery ? pageQuery : 1;
		
		let campgrounds = [];
		try {
			// Get all campgrounds from DB
			
			let query = {};
			let search = false;
			if(req.query.search) {
				const regex = new RegExp(CampgroundController.escapeRegex(req.query.search), 'gi');
				query = {name: regex};
				search = req.query.search;
			}
			
			let noMatch = null;
			campgrounds = await Campground.find(query).skip((perPage * pageNumber) - perPage).limit(perPage).populate("likes");
			if(!campgrounds.length) {
				noMatch = "Sorry, no campgrounds match your search";
			}

			const count = await Campground.countDocuments(query).exec();
			// const count = campgrounds.length;
			const pages = Math.ceil(count / perPage);

			return res.render("campgrounds/index",{campgrounds: campgrounds, 
												   current: pageNumber,
												   pages: pages,
												   noMatch: noMatch,
												   search: search,
												  });
		}
		catch(err) {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect("back");
		}
	}

	/**
	* Set the geographic coordinates of a campground.
	* @param {module:lib/models/campground} campground - The Campground object.
	* @return {module:lib/models/campground} The modified campground.
	*/
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

	/**
	* Upload Campground image to Cloudinary, and add image link to campground object.
	* @param {Request} req - The HTTP Request.
	* @return {module:lib/models/campground} The modified campground.
	*/
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

	/**
	* Create notifications of a newly created campground for all followers of the campground author.
	* @param {module:lib/models/user} loggedInUser - The logged in user.
	* @param {module:lib/models/campground} campground - The modified campground.
	*/
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
			let newNotification = {
				followedUser: user._id,
				campgroundSlug: campground.slug,
			}

			// For each follower create an individual notification model object and add it to their notifications array
			for(const follower of user.followers) {
				newNotification.followerUser = follower._id;
				let notification = await Notification.create(newNotification);
				await follower.notifications.push(notification);
				await follower.save();
			}
		}
		catch(err) {
			throw new errors.ExtendedError({errorCause: err, data: {loggedInUser: loggedInUser, campground: campground}});
		}

	}
	
	/**
	* Create a new Campground resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async campgroundCreatePost(req, res) {
		try {
			await CampgroundController.setCampgroundLocData(req.body.campground);
			await CampgroundController.uploadCampgroundImage(req);
			req.body.campground.author = req.user;
			const campground = await Campground.create(req.body.campground);
			await CampgroundController.createNewCampgroundNotifications(req.user, campground);
			
			await req.user.campgrounds.push(campground);
			await req.user.save();
			
			req.flash("success", "Successfully created campground");
			// return res.redirect(`/campgrounds/${campground._id}`);
			return res.redirect(`/campgrounds/${campground.slug}`);
		}
		catch(err) {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect("back");
		}
	}

	/**
	* Show the form for creating a new Campground resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static campgroundNewGet(req, res) {
		res.render("campgrounds/new");
	}

	/**
	* Display the specified Campground resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async campgroundShowGet(req, res) {
		try {
			const query = {slug: req.params.slug};
			const campground = await Campground.findOne(query)
				.populate("author")
				.populate("comments")
				.populate("likes")
				.exec();
			if(!campground) {
				const data = {provider: DB_PROVIDER, query: query, resource: Campground.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			for(let comment of campground.comments) {
				await comment.populate("author")
					.execPopulate();
			}
			return res.render("campgrounds/show", {campground: campground});
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	/**
	* Show to the form for editing the specified Campground resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async campgroundEditGet(req, res) {
		try {
			// const query = {_id: req.params.id};
			const query = {slug: req.params.slug};
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
	
	/**
	* Update the specified Campground resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async campgroundUpdatePut(req, res) {
		try {

			await CampgroundController.setCampgroundLocData(req.body.campground);
			// const query = {_id: req.params.id};
			const query = {slug: req.params.slug};
			let campground = await Campground.findOne(query, {new: true});
			if(!campground) {
				const data = {provider: DB_PROVIDER, query: query, resource: Campground.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			// Object.assign(campground, req.body.campground); // update campground
			GeneralHelper.setAttr(campground, req.body.campground, ["name", "price", "image", "description", "location", "lat", "lng"]);
			await campground.save();
			req.flash("success", "Successfully updated campground!")
			// res.redirect("/campgrounds/" + req.params.id);
			res.redirect("/campgrounds/" + campground.slug);
		}
		catch(err) {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect("back");
		}
	}
	
	/**
	* Remove the specified Campground resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async campgroundDestroyDelete (req, res) {
		try {
			// const query = {_id: req.params.id}
			const query = {slug: req.params.slug}
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

	/** Replaces characters of a search query. */
	static escapeRegex(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	
	/**
	* Like/dislike a Campground resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async campgroundLikePost(req, res) {
		try {
			const query = {slug: req.params.slug};
			let campground = await Campground.findOne(query);
			if(!campground) {
				const data = {provider: DB_PROVIDER, query: query, resource: Campground.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			// check if req.user._id exists in foundCampground.likes
			let foundUserLike = campground.likes.some(function (like) {
				return like.equals(req.user._id);
			});
			
			if (foundUserLike) {
				// user already liked, removing like
				campground.likes.pull(req.user._id);
			} else {
				// adding the new user like
				campground.likes.push(req.user);
			}

			campground.save();
			return res.redirect("/campgrounds/" + campground.slug);
		}
		catch(err) {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect("/campgrounds");
		}
	}
}

module.exports = CampgroundController;