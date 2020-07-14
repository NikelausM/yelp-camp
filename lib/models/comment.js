const 
		/**
		 * mongoose module
		 * @const
		 */
		mongoose		= require("mongoose"),
		/**
		* errors class module
		*/
		errors				= require("../../bin/errors/errors");

/**
@const
@default
*/
const staticProperties = {
	COLLECTION_NAME: "Comment",
	PRIMARY_KEY: "_id",
};

/** 
* Schema representing a Comment resource.
* @module lib/models/comment
* @require mongoose
* @requires bin/errors/errors
* @requires lib/middleware/mongoose/global-pre-hooks
* @requires lib/middleware/mongoose/mongoose-middleware
* @param {Schema} - The Comment resource schema.
* @param {Object=} - The schema static properties.
* @author Jose Nicolas Mora
*/
var commentSchema = Object.assign(new mongoose.Schema({
	text: String,
	createdAt: { type: Date, default: Date.now},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	// parent can be anything
	parent: {
		onModel: String,
		on: {
			type: mongoose.Schema.Types.ObjectId,
			refPath: 'parent.onModel'
		}
	},
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
		await this.parent.populate("on").execPopulate(); // populate the parent
		
		const query = {};
		query[this.constructor.schema.PRIMARY_KEY] = this._id;
		await this.parent.on.comments.pull(query);
		await this.parent.on.save();
		
	}
	catch(err) {
		const newError = new Error("There was a problem deleting the campground comment");
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
		await doc.parent.populate("on").execPopulate(); // populate the parent
		
		const query = {};
		query[doc.constructor.schema.PRIMARY_KEY] = doc._id
		await doc.parent.on.comments.pull(query);
		await doc.parent.on.save();
		
		next();
	}
	catch(err) {
		const newError = new Error("There was a problem deleting the campground comment");
		throw new errors.ExtendedError({error: newError, errorCause: err});
	}
});

/**
* Recursively populate comments.
* @param {module:lib/models/comment[]} The array of comments to be recursively populated.
*/
commentSchema.statics.populateAll = async function (comments) {
	try{			
		for(let comment of comments) {
			await comment.populate("author").execPopulate();
			await comment.populate("comments").execPopulate();
			await comment.constructor.populateAll(	comment.comments);
		}
	}
	catch(err) {
		console.log(err);
		const newError = new Error("There was a problem retreiving comments");
		throw new errors.ExtendedError({error: newError, errorCause: err});
	}
}

module.exports = mongoose.model(commentSchema.COLLECTION_NAME, commentSchema);

