const
		/**
		 * mongoose module
		 * @const
		 */
		mongoose 	= require("mongoose"),
		/**
		 * errors module
		 * @const
		 */
		errors		= require("../../../bin/errors/errors");

/**
@const
@default
*/
const PROVIDER = "MongoDB";

/**
* Global prehooks for protecting read-only versions of website
* @module global-pre-hooks
* @requires mongoose
*/

/**
* Represents the global pre hooks for Mongoose middleware to protect read-only version of the web-site.
* @author Jose Nicolas Mora
* @param {Schema} schema - The schema of the resource for which a modification is being attempted.
* @param {Object} options - The options used for modifying the execution of the middleware.
*/
module.exports = function globalPreHooks(schema, options) {

	/**
	* Prevents a read-only version of the website from allowing modification of resources.
	* @param {Array} The array of Mongoose functions for which this middleware is called.
	* @param {Function} The callback function containing the logic of this prehook middleware.
	*/
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