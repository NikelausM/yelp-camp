const 
		/**
		 * errors module
		 * @const
		 */
		errors				= require("../../bin/errors/errors");

// requiring models
const
		/**
		 * User resource class module
		 * @const
		 */
		User				= require("../models/user"),
		/**
		 * Campground resource class module
		 * @const
		 */
	  	Campground 			= require("../models/campground"),
		/**
		 * Comment resource class module
		 * @const
		 */
	  	Comment				= require("../models/comment");


/**
* Middleware module. Contains general middleware functions.
* @module lib/middleware/middleware
* @requires bin/errors/errors
* @requires lib/models/user
* @requires lib/models/campground
* @requires lib/models/comment
* @author Jose Nicolas Mora
*/
class MiddlewareObj {
	/**
	* Create a MiddlewareObj.
	*/
	constructor() {
		
	}
	
	/**
	* Checks if the current user owns a specified User resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	*/
	static async checkUserOwnership(req, res, next) {
		try {
			// is user logged in
			if(req.isAuthenticated()) {
				const query = {_id: req.params.id};
				const user = await User.findOne(query);
				if(!user) {
					const data = {provider: DB_PROVIDER, query: userQuery, resource: User.schema.COLLECTION_NAME};
					throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
				}
				// does user own the campground
				if(user._id.equals(req.user._id) || req.user.isAdmin) {
					next()
				}
				else {
					req.flash("error", "You don't have permission to do that!");
					return res.redirect("back");
				}
			}
			else {
				req.flash("error", "You need to be logged in to do that!");
				return res.redirect("back");
			}
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}

	/**
	* Checks if the current user owns a specified Campground resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	*/
	static async checkCampgroundOwnership(req, res, next) {
		// is user logged in
		if(req.isAuthenticated()) {
			// Campground.findById(req.params.id, (err, foundCampground) => {
			Campground.findOne({slug: req.params.slug}, (err, campground) => {
				if(err || !campground) {
					req.flash("error", "Campground not found.");
					return res.redirect("back");
				}
				else {
					// does user own the campground
					if(campground.author._id.equals(req.user._id) || req.user.isAdmin) {
						next()
					}
					else {
						req.flash("error", "You don't have permission to do that!");
						return res.redirect("back");
					}
				}
			});
		} else {
			req.flash("error", "You need to be logged in to do that!");
			return res.redirect("back");
		}
	}

	/**
	* Checks if the current user owns a specified Comment resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	*/
	static async checkCommentOwnership (req, res, next) {
		// is user logged in
		if(req.isAuthenticated()) {
			Comment.findById(req.params.comment_id, (err, foundComment) => {
				if(err || !foundComment) {
					req.flash("error", "Comment not found!");
					return res.redirect("back");
				}
				else {				
					// does user own the comment
					console.log(foundComment.author.id); // mongoose object
					console.log(req.user._id); // string
					if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
						next()
					}
					else {
						req.flash("error", "You don't have permission to do that!");
						return res.redirect("back");
					}
				}
			});
		} else {
			req.flash("error", "You need to be logged in to do that!");
			return res.redirect("back");
		}
	}

	/**
	* Checks if the current user is logged in.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object.
	* @param {Function} next - The next middleware function.
	*/
	static async isLoggedIn (req, res, next) {
		if(req.isAuthenticated()) {
			return next();
		}
		req.flash("error", "You need to be logged in to do that!"); // gives us capability of accessing this in next request
		return res.redirect("/login");
	}
}

module.exports = MiddlewareObj;
