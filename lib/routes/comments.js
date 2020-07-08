const 	express 			= require("express"),
		router 				= express.Router({mergeParams: true}),
		Campground 			= require("../models/campground"),
		Comment 			= require("../models/comment"),
		middleware			= require("../middleware");

const	commentController	= require("../controllers/comment-controller");

/**
* RESTful routes for module:lib/models/comment
* @module lib/routes/comments
* @requires express
* @requires router
* @requires lib/models/campground
* @requires lib/models/comment
* @requires lib/middleware/middleware
* @author Jose Nicolas Mora
*/ 

/**
 * Route serving RESTful NEW route.
 * @name get/new
 * @function
 * @memberof module:lib/routes/comments
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/new", 
		   middleware.isLoggedIn, 
		   commentController.commentNewGet);

/**
 * Route serving RESTful CREATE route.
 * @name post/create
 * @function
 * @memberof module:lib/routes/comments
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.post("/", 
			middleware.isLoggedIn, 
			commentController.commentCreatePost);

/**
 * Route serving RESTful EDIT route.
 * @name get/edit
 * @function
 * @memberof module:lib/routes/comments
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/:comment_id/edit", 
		   middleware.checkCommentOwnership, 
		   commentController.commentEditGet);

/**
 * Route serving RESTful UPDATE route.
 * @name put/update
 * @function
 * @memberof module:lib/routes/comments
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.put("/:comment_id", 
		   middleware.checkCommentOwnership, 
		   commentController.commentUpdatePut);

/**
 * Route serving RESTful DESTROY route.
 * @name delete/destroy
 * @function
 * @memberof module:lib/routes/comments
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.delete("/:comment_id", 
			  middleware.checkCommentOwnership,
			  commentController.commentDestroyDelete);

module.exports = router;