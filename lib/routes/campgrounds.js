"use strict";
// requiring packages
const 	express 			= require("express"),
		router 				= express.Router(),
	  	CloudinaryHelper	= require("../../bin/helpers/api/cloudinary-helper"),
		middleware			= require("../middleware"); // if file is not specified than it will require index.js in specified folder

// requiring controllers
const	campgroundController	= require("../controllers/campground-controller");

/**
@module CampgroundRoutes.
*/

// INDEX
router.get("/", campgroundController.campgroundIndexGet);

// CREATE
router.post("/", middleware.isLoggedIn, CloudinaryHelper.upload.single("image"), campgroundController.campgroundCreatePost);

// NEW
router.get("/new", middleware.isLoggedIn, campgroundController.campgroundNewGet);

// SHOW
router.get("/:slug", campgroundController.campgroundShowGet);

// EDIT
router.get("/:slug/edit", middleware.checkCampgroundOwnership, campgroundController.campgroundEditGet);

// UPDATE
router.put("/:slug", middleware.checkCampgroundOwnership, campgroundController.campgroundUpdatePut);

// DESTROY
router.delete("/:slug", campgroundController.campgroundDestroyDelete);

// Campground LIKE
router.post("/:slug/like", middleware.isLoggedIn, campgroundController.campgroundLikePost);

module.exports = router;