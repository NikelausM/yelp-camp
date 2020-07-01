"use strict";
const 	express 		= require("express"),
		router 			= express.Router(),
		errors			= require("../../bin/errors/errors");

// requiring models
const	User				= require("../models/user"),
	  	Campground 			= require("../models/campground"),
	  	Comment				= require("../models/comment"),
	  	Notification		= require("../models/notification");

// require routes
const	middleware		= require("../middleware");

const DB_PROVIDER = "MongoDB";

class NotificationController {
	// User Notifications INDEX
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
	
	// User NOTIFICATION GET
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