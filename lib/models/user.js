const 	mongoose 				= require("mongoose"),
		passportLocalMongoose 	= require("passport-local-mongoose");

const	campground				= require("../models/campground"),
	  	notification			= require("../models/notification");

/**
@const
@default
*/
const staticProperties = {COLLECTION_NAME: "User"};

/** 
* Schema representing a User resource.
* @module user
* @param {Schema} The User resource schema.
* @param {Object} Schema static properties.
* @author Jose Nicolas Mora
**/
const userSchema = Object.assign(new mongoose.Schema({
	username: {type: String, unique: true, required: true},
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	email: {type: String, required: true},
	avatar: {type: String},
	bio: {type: String},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	isAdmin: {type: Boolean, default: false},
	notifications: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Notification",
		}
	],
	followers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		}
	],
	campgrounds: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Campground",
		}
	],
}), staticProperties);

userSchema.plugin(require("../middleware/mongoose/global-pre-hooks"));

userSchema.plugin(passportLocalMongoose);

/**
* Removes the Campground and Notification resources of a User resource.
* @param {Array} The array of Mongoose functions for which this middleware is called.
* @param {Function} The callback function containing the logic of this prehook middleware.
*/
userSchema.pre(["remove", "deleteOne"], async function() {
	await Campground.deleteMany({
		_id:{
			$in: this.campgrounds
		}
	});
	await Notification.deleteMany({
		_id:{
			$in: this.notifications
		}
	});
});

/**
* Removes the Campground and Notification resources of a User resource.
* @param {Array} The array of Mongoose functions for which this middleware is called.
* @param {Function} The callback function containing the logic of this prehook middleware.
*/
userSchema.post(["findOneAndDelete", "findOneAndRemove"], async function(doc, next) {
	await Campground.deleteMany({
		_id:{
			$in: doc.campgrounds
		}
	});
	await Notification.deleteMany({
		_id:{
			$in: doc.notifications
		}
	});
});

userSchema.plugin(require("../middleware/mongoose/mongoose-middleware"));

module.exports = mongoose.model(userSchema.COLLECTION_NAME, userSchema);