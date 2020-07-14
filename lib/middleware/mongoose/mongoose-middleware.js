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
* @module lib/middleware/mongoose/mongoose-middleware
* @requires mongoose
* @requires bin/errors/errors
* @author Jose Nicolas Mora
*/

/**
* Represents the plugin function middleware used for handling read-only website errors.
* @author Jose Nicolas Mora
* @param {Schema} schema - The schema of the resource for which a modification is being attempted.
* @param {Object} options - The options used for modifying the execution of the middleware.
*/
module.exports = function plugins(schema, options) {
	
	/**
	* Presents a user with a more user-friendly and understandable errors when the user attempts to modify a resource on a read-only version of the website.
	* @param {Array} The array of Mongoose functions for which this middleware is called.
	* @param {Function} The callback function containing the logic of this prehook middleware.
	*/
	schema.post(["find", "findOne", "findOneAndDelete", "findOneAndRemove", "findOneAndUpdate"], function(err, doc, next) {
		try {
			if(err.message === "Sorry, website is read only right now") {
				const data = {provider: "MongoDB", query: this.getFilter(), resource: schema.COLLECTION_NAME};
				next(new errors.InternalError({error: err, errorCause: err,  data: data}));
			}
		}
		catch(err) {
			const data = {provider: "MongoDB"};
			next(new errors.InternalError({errorCause: err, data: data}));
		}

	});
	
	// // Throw error if resource not found
	// schema.post(["find", "findOne", "findOneAndDelete", "findOneAndRemove", "findOneAndUpdate"], function(doc, next) {
	// 	const data = {provider: "MongoDB", query: this.getFilter(), resource: schema.COLLECTION_NAME};
	// 	if(!doc) {
	// 		const error = new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
	// 		next(error);
	// 	}
	// 	else if(Array.isArray(doc) && !doc.length) {
	// 		const error = new errors.ResourceNotFoundError({error: {message: `Unable to find matching ${data.resource}`}, data: data});
	// 		next(error);
	// 	}
	// 	next();
	// });

}