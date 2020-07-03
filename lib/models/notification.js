const 	mongoose 				= require("mongoose");

const staticProperties = {COLLECTION_NAME: "Notification"};

const notificationSchema = Object.assign(new mongoose.Schema({
	username: String,
	// campgroundId: String,
	campgroundSlug: String,
	isRead: { type: Boolean, default: false },
}), staticProperties);

notificationSchema.plugin(require("../middleware/mongoose/global-pre-hooks"));

notificationSchema.plugin(require("../middleware/mongoose/mongoose-middleware"));

module.exports = mongoose.model(notificationSchema.COLLECTION_NAME, notificationSchema);