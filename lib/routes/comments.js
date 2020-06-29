const 	express 			= require("express"),
		router 				= express.Router({mergeParams: true}),
		Campground 			= require("../models/campground"),
		Comment 			= require("../models/comment"),
		middleware			= require("../middleware");

const	commentController	= require("../controllers/comment-controller");

// Comment NEW
router.get("/new", middleware.isLoggedIn, commentController.commentNewGet);

// Comment CREATE
router.post("/", middleware.isLoggedIn, commentController.commentCreatePost);

// Comment EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, commentController.commentEditGet);

// UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, commentController.commentUpdatePut);

// DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, commentController.commentDestroyDelete);

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