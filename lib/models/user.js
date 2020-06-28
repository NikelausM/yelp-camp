const 	mongoose 				= require("mongoose"),
		passportLocalMongoose 	= require("passport-local-mongoose");

const staticProperties = {COLLECTION_NAME: "User"};

const userSchema = Object.assign(new mongoose.Schema({
	username: {type: String, unique: true, required: true},
	password: {type: String},
	avatar: {type: String, required: true},
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	email: {type: String, required: true},
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
}), staticProperties);

userSchema.plugin(passportLocalMongoose);

userSchema.plugin(require("../middleware/mongoose/mongoose-middleware"));

module.exports = mongoose.model(userSchema.COLLECTION_NAME, userSchema);