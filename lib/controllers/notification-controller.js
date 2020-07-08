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
		 * errors module
		 * @const
		 */
		errors				= require("../../bin/errors/errors");

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
* Class representing a Notification controller.
* @module lib/controllers/notification-controller
* @requires express
* @requires lib/middleware/middleware
* @requires bin/errors/errors
* @requires lib/models/user
* @requires lib/models/campground
* @requires lib/models/comment
* @requires lib/models/notification
* @author Jose Nicolas Mora
*/
class NotificationController {
	/**
	* Create a NotificationController.
	*/
	constructor() {
		
	}
	/**
	* Display a listing of the Comment resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async notificationIndexGet(req, res) {
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
	
	/**
	* Display the specified Notification resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async notificationGet(req, res) {
		try {
			const query = {_id: req.params.id};
			let notification = await Notification.findOne(query);
			if(!notification) {
				const data = {provider: DB_PROVIDER, query: query, resource: Notification.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			notification.isRead = true; // make seen notification no longer seen in drop down
			notification.save();
			// res.redirect(`/campgrounds/${notification.campgroundId}`);
			res.redirect(`/campgrounds/${notification.campgroundSlug}`);
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	/**
	* Remove the specified Notification resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async notificationDestroyDelete(req, res) {
		try {
			const query = {_id: req.params.id};
			let notification = await Notification.findOneAndDelete(query);
			if(!notification) {
				const data = {provider: DB_PROVIDER, query: query, resource: Notification.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
		}
		return res.redirect("back");
	}
}

module.exports = NotificationController;