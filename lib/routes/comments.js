const 	express 			= require("express"),
		router 				= express.Router({mergeParams: true}),
		Campground 			= require("../models/campground"),
		Comment 			= require("../models/comment"),
		middleware			= require("../middleware");

const	commentController	= require("../controllers/comment-controller");

// NEW
router.get("/new", middleware.isLoggedIn, commentController.commentNewGet);

// CREATE
router.post("/", middleware.isLoggedIn, commentController.commentCreatePost);

// EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, commentController.commentEditGet);

// UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, commentController.commentUpdatePut);

// DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, commentController.commentDestroyDelete);

module.exports = router;