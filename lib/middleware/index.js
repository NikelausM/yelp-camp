const 	Campground 			= require("../models/campground"),
		Comment				= require("../models/comment"),
		User				= require("../models/user"),
		errors				= require("../../bin/errors/errors");

var middlewareObj = {};

/**
* Checks if the current user owns a specified User resource.
* @author Jose Nicolas Mora
* @param {Request} req - The HTTP request.
* @param {Response} res - The HTTP response object.
* @param {Function} next - The next middleware function.
*/
middlewareObj.checkUserOwnership = async (req, res, next) => {
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
* @author Jose Nicolas Mora
* @param {Request} req - The HTTP request.
* @param {Response} res - The HTTP response object.
* @param {Function} next - The next middleware function.
*/
middlewareObj.checkCampgroundOwnership = function(req, res, next) {
	// is user logged in
	if(req.isAuthenticated()) {
		// Campground.findById(req.params.id, (err, foundCampground) => {
		Campground.findOne({slug: req.params.slug}, (err, foundCampground) => {
			if(err || !foundCampground) {
				req.flash("error", "Campground not found.");
				return res.redirect("back");
			}
			else {
				// does user own the campground
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
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
* @author Jose Nicolas Mora
* @param {Request} req - The HTTP request.
* @param {Response} res - The HTTP response object.
* @param {Function} next - The next middleware function.
*/
middlewareObj.checkCommentOwnership = function(req, res, next) {
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
* @author Jose Nicolas Mora
* @param {Request} req - The HTTP request.
* @param {Response} res - The HTTP response object.
* @param {Function} next - The next middleware function.
*/
middlewareObj.isLoggedIn = function(req, res, next) {
	if(req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You need to be logged in to do that!"); // gives us capability of accessing this in next request
	return res.redirect("/login");
};

module.exports = middlewareObj;
