const mongoose		= require("mongoose");
	
const staticProperties = {COLLECTION_NAME: "Comment"};

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

commentSchema.plugin(require("../middleware/mongoose/mongoose-middleware"));

module.exports = mongoose.model(commentSchema.COLLECTION_NAME, commentSchema);

