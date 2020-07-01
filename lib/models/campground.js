const	mongoose 	= require("mongoose"),
		Comment		= require("./comment"),
		Slug		= require("../../bin/helpers/slugs/slug.js");

// SCHEMA SETUP
const staticProperties = {COLLECTION_NAME: "Campground"};

const campgroundSchema = Object.assign(new mongoose.Schema({	
	name: {type: String, required: true},
	slug: {
		type: String,
		unique: true,
	},
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
	],
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		}
	],
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

// add a slug before the campground gets saved to the database
campgroundSchema.pre('save', async function (next) {
    try {
        // check if a new campground is being saved, or if the campground name is being modified
        if (this.isNew || this.isModified("name")) {
            this.slug = await Slug.generateUniqueSlug(this, this._id, this.name);
        }
        next();
    } catch (err) {
        next(err);
    }
});

campgroundSchema.plugin(require("../middleware/mongoose/mongoose-middleware"));

// Create model and connect it to campgroundSchema
module.exports = mongoose.model(campgroundSchema.COLLECTION_NAME, campgroundSchema);
