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
@const
@default
*/
const DB_PROVIDER = "MongoDB";

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
		try {
			// is user logged in
			if(req.isAuthenticated()) {
				// Campground.findById(req.params.id, (err, foundCampground) => {
				const query = {slug: req.params.slug};
				let campground = await Campground.findOne(query)
									.populate("author");
				if(!campground) {
					const data = {provider: DB_PROVIDER, query: query, resource: Campground.schema.COLLECTION_NAME};
					throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
				}
				// does user own the campground
				if(campground.author._id.equals(req.user._id) || req.user.isAdmin) {
					next()
				}
				else {
					req.flash("error", "You don't have permission to do that!");
					return res.redirect("back");
				}
			} else {
				req.flash("error", "You need to be logged in to do that!");
				return res.redirect("back");
			}
		}
		catch(err) {
			req.flash("error", err.message);
			err = new errors.InternalError({errorCause: err});
			console.log(err);
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
		try {
			// is user logged in
			console.log("checking comment ownership")
			const query = {_id: req.params.comment_id};
			console.log(query);
			let comment = await Comment.findOne(query)
								.populate("author");
			if(!comment) {
				const data = {provider: DB_PROVIDER, query: query, 
							  resource: Comment.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError(
					{error: {message: `Unable to find ${data.resource}`}, 
					 data: data}
				);
			}
			console.log("found comment")
			if(comment.author._id.equals(req.user._id) || req.user.isAdmin) {
				next()
			}
			else {
				req.flash("error", "You don't have permission to do that!");
				return res.redirect("back");
			}
		}
		catch(err) {
			req.flash("error", err.message);
			err = new errors.InternalError({errorCause: err});
			console.log(err);
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
		try {
			console.log("checking if logged in")
			if(req.isAuthenticated()) {
				console.log("logged in")
				return next();
			}
			req.flash("error", "You need to be logged in to do that!");
		}
		catch(err) {
			req.flash("error", err.message);
			err = new errors.InternalError({errorCause: err});
			console.log(err);
			return res.redirect("back");
		}
		return res.redirect("/login");
	}
}

module.exports = MiddlewareObj;
