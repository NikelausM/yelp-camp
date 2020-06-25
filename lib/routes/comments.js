const 	express 			= require("express"),
		router 				= express.Router({mergeParams: true}),
		Campground 			= require("../models/campground"),
		Comment 			= require("../models/comment"),
		middleware			= require("../middleware");

// Comments NEW
router.get("/new", middleware.isLoggedIn, (req, res) => {
	// find campground by id
	console.log(req.params.id);
	Campground.findById(req.params.id, (err, campground) =>  {
		if(err || !campground) {
			console.log(err);
			req.flash("error", "Campground not found!");
			return res.redirect("back");
		}
		else {
			console.log(campground);
			res.render("comments/new", {campground: campground});
		}
	});
});

// Comments CREATE
router.post("/", middleware.isLoggedIn, (req, res) => {
	// lookup cammpground using ID
	Campground.findById(req.params.id, (err, campground) => {
		if(err || !campground) {
			console.log(err);
			req.flash("error", "Campground not found!");
			return res.redirect("/campgrounds");
		}
		else {
			// create new comment
			Comment.create(req.body.comment, (err, comment) => {
				if(err || !comment) {
					console.log(err);
					req.flash("error", "Failed to create comment!");
					return res.redirect("back");
				}
				else {
					// add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					console.log("username: " + req.user.username);
					// save comment
					comment.save();
					
					// connect new comment to campground
					campground.comments.push(comment);
					campground.save();
					console.log(comment);
					// redirect campground show page
					req.flash("success", "Successfully added comment!");
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

// EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if(err || !foundComment) {
			console.log(err);
			req.flash("error", "Comment not found!");
			return res.redirect("back");
		}
		res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
	});
});

// UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if(err || !updatedComment) {
			console.log(err);
			req.flash("error", "Failed to update comment!");
			return res.redirect("back");
		}
		else {
			console.log("updated comment");
			console.log(updatedComment);
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, (err, deletedComment) => {
		if(err || !deletedComment) {
			console.log(err);
			req.flash("error", "Failed to delete comment!");
			return res.redirect("back");
		}
		else {
			req.flash("success", "Comment deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});


module.exports = router;