const	
		/**
		 * mongoose module
		 * @const
		 */
		mongoose 	= require("mongoose"),
		/**
		 * Comment resource class module
		 * @const
		 */
		Comment		= require("./comment"),
		/**
		 * Notification class module
		 * @const
		 */
	  	Notification	= require("./notification"),
		/**
		 * Slug class module
		 * @const
		 */
		Slug		= require("../../bin/helpers/slugs/slug.js"),
		/**
		* errors class module
		*/
		errors				= require("../../bin/errors/errors");


// SCHEMA SETUP
const staticProperties = {COLLECTION_NAME: "Campground"};

/** 
* Schema representing a Campground resource.
* @module lib/models/campground
* @requires mongoose
* @requires lib/models/comment
* @requires bin/helpers/models/notification
* @requires bin/helpers/slugs/slug
* @requires lib/middleware/mongoose/global-pre-hooks
* @requires lib/middleware/mongoose/mongoose-middleware
* @requires bin/errors/errors
* @param {module:Mongoose:Schema} - The Campground resource schema.
* @param {Object=} - The schema static properties.
* @author Jose Nicolas Mora
*/
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
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
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

campgroundSchema.plugin(require("../middleware/mongoose/global-pre-hooks"));

/**
* Removes the Comment resources of a Campground resource.
* @param {Array} The array of Mongoose functions for which this middleware is called.
* @param {Function} The callback function containing the logic of this prehook middleware.
*/
campgroundSchema.pre(["remove", "deleteOne"], async function() {
	try {
		await Comment.deleteMany({
			_id:{
				$in: this.comments
			}
		});
		let notifications = await Notification.find({campgroundSlug: this.slug});
		await Notification.deleteMany({
			_id:{
				$in: notifications
			}
		});
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
campgroundSchema.post(["findOneAndDelete", "findOneAndRemove"], async function(doc, next) {
	try {
		console.log("delete something");
		await Comment.deleteMany({
			_id:{
				$in: doc.comments
			}
		});
		let notifications = await Notification.find({campgroundSlug: doc.slug});
		if(!notifications && !notifications.length) {
			throw new Error("notification not found!");
		}
		await Notification.deleteMany({
			_id:{
				$in: notifications
			}
		});
		notifications = await Notification.find({campgroundSlug: doc.slug});
		if(notifications.length) {
			throw new Error("notification not deleted!");
		}
	}
	catch(err) {
		const newError = new Error("There was a problem deleting the campground");
		throw new errors.ExtendedError({error: newError, errorCause: err});
	}
});

/**
* Add a slug before the campground gets saved to the database
* @param {string} The Mongoose function for which this middleware is called.
* @param {Function} The callback function containing the logic of this prehook middleware.
*/
campgroundSchema.pre('save', async function (next) {
    try {
        // check if a new campground is being saved, or if the campground name is being modified
        if (this.isNew || this.isModified("name")) {
            this.slug = await Slug.generateUniqueSlug(this, this._id, this.name);
        }
        next();
    } catch (err) {
		const newError = new Error("There was a problem saving the campground");
		throw new errors.ExtendedError({error: newError, errorCause: err});
    }
});

campgroundSchema.plugin(require("../middleware/mongoose/mongoose-middleware"));

// Create model and connect it to campgroundSchema
module.exports = mongoose.model(campgroundSchema.COLLECTION_NAME, campgroundSchema);
