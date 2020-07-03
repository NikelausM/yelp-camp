const	mongoose 	= require("mongoose"),
		errors		= require("../../../bin/errors/errors");

const PROVIDER = "MongoDB";

module.exports = function globalPreHooks(schema, options) {
	schema.pre(["save", "remove", "updateOne", "deleteOne", "findOneAndDelete", "findOneAndRemove", "findOneAndUpdate", "update", "updateMany"], function(next) {
		if(process.env.DB_USERNAME === "read-only-user") {
			let error = new Error("Sorry, website is read only right now");
			next(error)
		}
		else {
			next();
		}
	});
}