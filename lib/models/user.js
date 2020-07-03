const 	mongoose 				= require("mongoose"),
		passportLocalMongoose 	= require("passport-local-mongoose");

const	campground				= require("../models/campground"),
	  	notification			= require("../models/notification");

const staticProperties = {COLLECTION_NAME: "User"};

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