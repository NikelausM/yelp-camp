"use strict";
// require packages
const 	express 		= require("express"),
		router 			= express.Router(),
		passport 		= require("passport"),
		async 			= require("async"),
		errors			= require("../../bin/errors/errors");
		
// require models
const	User 			= require("../models/user"),
		Campground 		= require("../models/campground"),
		Notification	= require("../models/notification");

// require routes
const	middleware		= require("../middleware");

// requiring controllers
const	userController	= require("../controllers/user-controller");
const	notificationController	= require("../controllers/notification-controller");

// Root route
router.get("/", userController.userIndexGet);

// User NEW
router.get("/register", userController.userNewGet);

// User CREATE
router.post("/register", userController.userCreatePost);

// SHOW USERS PROFILE
router.get("/users/:id", userController.userShowGet);

// User EDIT
router.get("/users/:id/edit", middleware.checkUserOwnership, userController.userEditGet);

// User UPDATE
router.put("/users/:id", middleware.checkUserOwnership, userController.userUpdatePut);

// SHOW login form
router.get("/login", userController.userLoginGet);

// Login route
router.post("/login", userController.userLoginPost);

// Logout route
router.get("/logout", userController.userLogoutPost);

// Follow user
router.get("/follow/:id", middleware.isLoggedIn, userController.userFollowGet);

// View all notifications
router.get("/notifications", middleware.isLoggedIn, notificationController.notificationIndexGet);

// Handle notification on click
router.get("/notifications/:id", middleware.isLoggedIn, notificationController.notificationGet);

// DESTROY NOTIFICATION
router.delete("/notifications/:id", middleware.isLoggedIn, notificationController.notificationDestroyDelete);

// Show request password reset page
router.get("/users/:id/forgot", userController.userForgotGet);

// Send password reset email
router.post("/users/:id/forgot", userController.userForgotPost);

// Password reset 
router.get('/reset/:token', userController.userResetGet);

// Reset password
router.post('/reset/:token', userController.userResetPost);

module.exports = router;