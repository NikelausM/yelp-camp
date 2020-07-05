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
const staticProperties = {COLLECTION_NAME: "Comment"};

/** 
* Schema representing a Comment resource.
* @module comment
* @require mongoose
* @requires global-pre-hooks
* @requires mongoose-middleware
* @param {Schema} - The Comment resource schema.
* @param {Object} - The schema static properties.
* @author Jose Nicolas Mora
*/
const commentSchema = Object.assign(new mongoose.Schema({
	text: String,
	createdAt: { type: Date, default: Date.now},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		username: String,
	},
}), staticProperties);

commentSchema.plugin(require("../middleware/mongoose/global-pre-hooks"));

commentSchema.plugin(require("../middleware/mongoose/mongoose-middleware"));

module.exports = mongoose.model(commentSchema.COLLECTION_NAME, commentSchema);

