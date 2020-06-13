const	mongoose 	= require("mongoose"),
		Comment	= require("./comment");

// SCHEMA SETUP
const campgroundSchema = new mongoose.Schema({
	name: {type: String, require: true},
	price: {type: Number, require: true},
	image: {type: String, require: true},
	description: {type: String, require: true},
	location: {type: String, require: true},
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
});

// Invoked before mongoose remove is called
// should be asynchronous
campgroundSchema.pre("remove", async function() {
   await Comment.deleteMany({
      _id:{
         $in: this.comments
      }
   });
});

// Create model and connect it to campgroundSchema
module.exports = mongoose.model("Campground", campgroundSchema);
