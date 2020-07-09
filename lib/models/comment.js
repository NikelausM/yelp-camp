const 
		/**
		 * mongoose module
		 * @const
		 */
		mongoose		= require("mongoose");

/**
@const
@default
*/
const staticProperties = {
	COLLECTION_NAME: "Comment",
	PRIMARY_KEY: "_id"
};

/** 
* Schema representing a Comment resource.
* @module lib/models/comment
* @require mongoose
* @requires lib/middleware/mongoose/global-pre-hooks
* @requires lib/middleware/mongoose/mongoose-middleware
* @param {Schema} - The Comment resource schema.
* @param {Object=} - The schema static properties.
* @author Jose Nicolas Mora
*/
const commentSchema = Object.assign(new mongoose.Schema({
	text: String,
	createdAt: { type: Date, default: Date.now},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	// parent can be anything
	parent: mongoose.Schema.Types.ObjectId,
	// parent: mongoose.Mixed,
	// parent: {
	// 	typeLiteral: String,
	// 	doc: {
	// 		type: mongoose.Schema.Types.ObjectId,
	// 		ref: parent.typeLiteral
	// 	}
	// },
	// replies
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
}), staticProperties);

commentSchema.plugin(require("../middleware/mongoose/global-pre-hooks"));

commentSchema.plugin(require("../middleware/mongoose/mongoose-middleware"));

/**
* Removes the Comment resources of a Campground resource.
* @param {Array} The array of Mongoose functions for which this middleware is called.
* @param {Function} The callback function containing the logic of this prehook middleware.
*/
commentSchema.pre(["remove", "deleteOne"], async function() {
	try {
		await this.populate("parent").execPopulate(); // populate the parent
		
		const query = {};
		query[this.constructor.PRIMARY_KEY] = this._id;
		await this.parent.comments.pull(query);
		console.log("comment deleted");
	}
	catch(err) {
		const newError = new Error("There was a problem deleting the campground");
		throw new errors.ExtendedError({error: newError, errorCause: err});
	}
});

/**
* Removes the Comment resources of a Campground resource.
* @param {Array} The array of Mongoose functions for which this middleware is called.
* @param {Function} The callback function containing the logic of this prehook middleware.
*/
commentSchema.post(["findOneAndDelete", "findOneAndRemove"], async function(doc, next) {
	try {
		await doc.populate("parent").execPopulate(); // populate the parent
		
		const query = {};
		query[doc.constructor.PRIMARY_KEY] = doc._id;
		await doc.parent.comments.pull(query);
		console.log("comment in parent deleted");
		next();
	}
	catch(err) {
		const newError = new Error("There was a problem deleting the campground");
		throw new errors.ExtendedError({error: newError, errorCause: err});
	}
});

module.exports = mongoose.model(commentSchema.COLLECTION_NAME, commentSchema);

