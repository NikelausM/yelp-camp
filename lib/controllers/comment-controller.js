const 	
		/**
		 * express module
		 * @const
		 */
		express 			= require("express"), 
		/**
		 * middleware module.
		 * If file is not specified than it will require index.js in specified folder
		 * @const
		 */
		middleware			= require("../middleware"), 
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
* Class representing a Comment controller.
* @module lib/controllers/comment-controller
* @requires express
* @requires lib/middleware/middleware
* @requires bin/errors/errors
* @requires lib/models/user
* @requires lib/models/campground
* @requires lib/models/comment
* @author Jose Nicolas Mora
*/
class CommentController {
	/**
	* Create a CommentController.
	*/
	constructor() {
		
	}
	/**
	* Show the form for creating a new Comment resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async commentNewGet(req, res) {
		try {
			const query = {slug: req.params.slug};
			const campground = await Campground.findOne(query);
			if(!campground) {
				const data = {provider: DB_PROVIDER, query: query, resource: Campground.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			res.render("comments/new", {campground: campground});
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	/**
	* Create a new Comment resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async commentCreatePost(req, res) {
		try {
			const campgroundQuery = {slug: req.params.slug};
			const campground = await Campground.findOne(campgroundQuery);
			if(!campground) {
				const data = {provider: DB_PROVIDER, query: campgroundQuery, resource: Campground.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			} 
			
			const commentQuery = req.body.comment;
			const comment = await Comment.create(commentQuery);
			if(!comment) {
				const data = {provider: DB_PROVIDER, query: commentQuery, resource: Comment.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			
			// add username and id to comment
			comment.author.id = req.user._id;
			comment.author.username = req.user.username;
			await comment.save();
			
			// connect new comment to campground
			await campground.comments.push(comment);
			await campground.save();
			
			// redirect campground show page
			req.flash("success", "Successfully added comment!");
			res.redirect("/campgrounds/" + campground.slug);
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	/**
	* Show to the form for editing the specified Comment resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async commentEditGet(req, res) {
		try {
			const query = {_id: req.params.comment_id};
			const comment = await Comment.findOne(query);
			if(!comment) {
				const data = {provider: DB_PROVIDER, query: query, resource: Comment.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			// res.render("comments/edit", {campground_id: req.params.id, comment: comment});
			res.render("comments/edit", {campground_slug: req.params.slug, comment: comment});
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	/**
	* Update the specified Comment resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async commentUpdatePut(req, res) {
		try {
			const query = {_id: req.params.comment_id};
			const comment = await Comment.findOneAndUpdate(query, req.body.comment, {new: true});
			if(!comment) {
				const data = {provider: DB_PROVIDER, query: query, resource: Comment.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			res.redirect("/campgrounds/" + req.params.slug);
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
	
	/**
	* Remove the specified Comment resource.
	* @param {Request} req - The HTTP request.
	* @param {Response} res - The HTTP response object .
	*/
	static async commentDestroyDelete(req, res) {
		try {
			const query = {_id: req.params.comment_id};
			const comment = await Comment.findOneAndDelete(query);
			if(!comment) {
				const data = {provider: DB_PROVIDER, query: query, resource: Comment.schema.COLLECTION_NAME};
				throw new errors.ResourceNotFoundError({error: {message: `Unable to find ${data.resource}`}, data: data});
			}
			req.flash("success", "Comment deleted");
			res.redirect("/campgrounds/" + req.params.slug);
		}
		catch(err) {
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
	}
}

module.exports = CommentController;