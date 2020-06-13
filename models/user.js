const 	mongoose 				= require("mongoose"),
		passportLocalMongoose 	= require("passport-local-mongoose"),
		bcrypt 					= require("bcrypt-nodejs");

const UserSchema = new mongoose.Schema({
	username: {type: String, unique: true, required: true},
	password: String,
	avatar: String,
	firstName: String,
	lastName: String,
	email: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	isAdmin: {type: Boolean, default: false},
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);