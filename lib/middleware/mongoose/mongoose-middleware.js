const	mongoose 	= require("mongoose"),
		errors		= require("../../../bin/errors/errors");

const PROVIDER = "MongoDB";

module.exports = function plugins(schema, options) {
	
	schema.post(["find", "findOne", "findOneAndDelete", "findOneAndRemove", "findOneAndUpdate"], function(err, doc, next) {
		if(err.message === "Sorry, website is read only right now") {
			next(err);
		}
		const data = {provider: "MongoDB", query: this.getFilter(), resource: schema.COLLECTION_NAME};
		next(new errors.InternalError({errorCause: err, data: data}));
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