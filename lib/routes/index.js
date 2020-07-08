"use strict";
// require packages
const 	express 		= require("express"),
		router 			= express.Router(),
		passport 		= require("passport");
		
// require models
const	User 			= require("../models/user"),
		Campground 		= require("../models/campground"),
		Notification	= require("../models/notification");

// require routes
const	middleware		= require("../middleware");

// requiring controllers
const	userController	= require("../controllers/user-controller");
const	notificationController	= require("../controllers/notification-controller");

/**
* RESTful routes and additional routes for {@link module:lib/models/user} .
* @module lib/routes/index
* @requires express
* @requires router
* @requires router
* @requires passport
* @requires lib/models/user
* @requires lib/models/campground
* @requires lib/models/notification
* @requires lib/middleware/middleware
* @requires lib/controllers/user-controller
* @requires lib/controllers/notification-controller
* @author Jose Nicolas Mora
*/

/**
 * Route serving RESTful INDEX route.
 * @name get/index
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/", 
		   userController.userIndexGet);

/**
 * Route serving RESTful NEW route for {@link module:lib/models/user}.
 * @name get/register
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/register", 
		   userController.userNewGet);

/**
 * Route serving RESTful CREATE route for {@link module:lib/models/user}.
 * @name post/register
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.post("/register", 
			userController.userCreatePost);

/**
 * Route serving RESTful SHOW route for {@link module:lib/models/user}.
 * @name get/show
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/users/:id", 
		   userController.userShowGet);

/**
 * Route serving RESTful EDIT route for {@link module:lib/models/user}.
 * @name get/edit
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/users/:id/edit", 
		   middleware.checkUserOwnership, 
		   userController.userEditGet);

/**
 * Route serving RESTful UPDATE route for {@link module:lib/models/user}.
 * @name put/update
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.put("/users/:id", 
		   middleware.checkUserOwnership, 
		   userController.userUpdatePut);

/**
 * Route serving LOGIN form display for {@link module:lib/models/user}.
 * @name get/login
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/login", 
		   userController.userLoginGet);

/**
 * Route serving LOGIN form submission for {@link module:lib/models/user}.
 * @name post/login
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.post("/login", 
			userController.userLoginPost);

/**
 * Route serving LOGOUT submission for {@link module:lib/models/user}.
 * @name get/logout
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/logout", 
		   userController.userLogoutPost);

/**
 * Route serving FOLLOW {@link module:lib/models/user} request.
 * @name get/follow
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/follow/:id", 
		   middleware.isLoggedIn, 
		   userController.userFollowGet);

/**
 * Route serving RESTFUL INDEX route for {@link module:lib/models/notification} request.
 * @name get/notifications/index
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/notifications", 
		   middleware.isLoggedIn, 
		   notificationController.notificationIndexGet);

/**
 * Route serving RESTful SHOW route for {@link module:lib/models/notification}.
 * @name get/notifications/show
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/notifications/:id", 
		   middleware.isLoggedIn, 
		   notificationController.notificationGet);

/**
 * Route serving RESTful DESTROY route for {@link module:lib/models/notification}.
 * @name delete/notifications/destroy
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.delete("/notifications/:id", 
			  middleware.isLoggedIn,
			  notificationController.notificationDestroyDelete);

/**
 * Route serving forgot password request form display for {@link module:lib/models/user}.
 * @name get/users/forgot
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get("/users/:id/forgot", 
		   userController.userForgotGet);

/**
 * Route serving forgot password email generation for {@link module:lib/models/user}.
 * @name post/users/forgot
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.post("/users/:id/forgot", 
			userController.userForgotPost);

/**
 * Route serving reset password request form display for {@link module:lib/models/user}.
 * @name get/users/reset
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.get('/reset/:token', 
		   userController.userResetGet);

/**
 * Route serving reset password confirmation email generation for {@link module:lib/models/user}.
 * @name post/users/reset
 * @function
 * @memberof module:lib/routes/index
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware.
 */
router.post('/reset/:token', 
			userController.userResetPost);

module.exports = router;