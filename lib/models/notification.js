const 	mongoose 				= require("mongoose");

/**
@const
@default
*/
const staticProperties = {COLLECTION_NAME: "Notification"};

/** 
* Schema representing a Notification resource.
* @module notification
* @requires mongoose
* @requires global-pre-hooks
* @requires mongoose-middleware
* @param {Schema} - The Notification resource schema.
* @param {Object} - The schema static properties.
* @author Jose Nicolas Mora
*/
const notificationSchema = Object.assign(new mongoose.Schema({
	username: String,
	// campgroundId: String,
	campgroundSlug: String,
	isRead: { type: Boolean, default: false },
}), staticProperties);

notificationSchema.plugin(require("../middleware/mongoose/global-pre-hooks"));

notificationSchema.plugin(require("../middleware/mongoose/mongoose-middleware"));

module.exports = mongoose.model(notificationSchema.COLLECTION_NAME, notificationSchema);