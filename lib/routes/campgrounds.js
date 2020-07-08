"use strict";
// requiring packages
const 	express 			= require("express"),
		router 				= express.Router(),
	  	CloudinaryHelper	= require("../../bin/helpers/api/cloudinary-helper"),
		middleware			= require("../middleware"); // if file is not specified than it will require index.js in specified folder

// requiring controllers
const	campgroundController	= require("../controllers/campground-controller");

/**
* RESTful routes for module:lib/models/campground.
* @module lib/routes/campgrounds
* @requires express
* @requires router
* @requires bin/helpers/api/cloudinary-helper
* @requires lib/middleware/middleware
* @requires lib/controllers/campground-controller
* @author Jose Nicolas Mora
*/

/**
 * Route serving RESTful INDEX route.
 * @name get/index
 * @function
 * @memberof module:lib/routes/campgrounds
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/", 
		   campgroundController.campgroundIndexGet);

/**
 * Route serving RESTful CREATE route.
 * @name post/create
 * @function
 * @memberof module:lib/routes/campgrounds
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.post("/", 
			middleware.isLoggedIn, 
			CloudinaryHelper.upload.single("image"), 
			campgroundController.campgroundCreatePost);

/**
 * Route serving RESTful NEW route.
 * @name get/new
 * @function
 * @memberof module:lib/routes/campgrounds
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/new", 
		   middleware.isLoggedIn, 
		   campgroundController.campgroundNewGet);

/**
 * Route serving RESTful SHOW route.
 * @name get/show
 * @function
 * @memberof module:lib/routes/campgrounds
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/:slug", 
		   campgroundController.campgroundShowGet);

/**
 * Route serving RESTful EDIT route.
 * @name get/edit
 * @function
 * @memberof module:lib/routes/campgrounds
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/:slug/edit", 
		   middleware.checkCampgroundOwnership, 
		   campgroundController.campgroundEditGet);

/**
 * Route serving RESTful UPDATE route.
 * @name put/update
 * @function
 * @memberof module:lib/routes/campgrounds
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.put("/:slug",
		   middleware.checkCampgroundOwnership,
		   campgroundController.campgroundUpdatePut);

/**
 * Route serving RESTful DESTROY route.
 * @name delete/destroy
 * @function
 * @memberof module:lib/routes/campgrounds
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.delete("/:slug", 
			  middleware.checkCampgroundOwnership,
			  campgroundController.campgroundDestroyDelete);

/**
 * Route serving campground like/dislike route.
 * @name post/like
 * @function
 * @memberof module:lib/routes/campgrounds
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.post("/:slug/like",
			middleware.isLoggedIn, 
			campgroundController.campgroundLikePost);

module.exports = router;