const	mongoose 	= require("mongoose"),
		Comment	= require("./comment");

// SCHEMA SETUP
const staticProperties = {COLLECTION_NAME: "Campground"};

const campgroundSchema = Object.assign(new mongoose.Schema({	
	name: {type: String, required: true},
	price: {type: Number, required: true},
	image: {type: String, required: true},
	description: {type: String, required: true},
	location: {type: String, required: true},
	lat: {type: Number, default: 0},
	lng: {type: Number, default: 0},
	createdAt: { type: Date, default: Date.now},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		username: String,
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment",
		}
	]
}), staticProperties);

// Invoked before mongoose remove is called
// should be asynchronous
campgroundSchema.pre(["remove", "deleteOne"], async function() {
	await Comment.deleteMany({
		_id:{
			$in: this.comments
		}
	});
});

campgroundSchema.post(["findOneAndDelete", "findOneAndRemove"], async function(doc, next) {
	await Comment.deleteMany({
		_id:{
			$in: doc.comments
		}
	});
});

campgroundSchema.plugin(require("../middleware/mongoose/mongoose-middleware"));

// Create model and connect it to campgroundSchema
module.exports = mongoose.model(campgroundSchema.COLLECTION_NAME, campgroundSchema);
