const 	mongoose 				= require("mongoose"),
		passportLocalMongoose 	= require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
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
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);