"use strict";
// requiring packages
const 	express 			= require("express"),
		router 				= express.Router(),
	  	CloudinaryHelper	= require("../../bin/helpers/api/cloudinary-helper"),
		middleware			= require("../middleware"); // if file is not specified than it will require index.js in specified folder

// requiring controllers
const	campgroundController	= require("../controllers/campground-controller");

// INDEX
router.get("/", campgroundController.campgroundIndexGet);

// CREATE
router.post("/", middleware.isLoggedIn, CloudinaryHelper.upload.single("image"), campgroundController.campgroundCreatePost);

// NEW
router.get("/new", middleware.isLoggedIn, campgroundController.campgroundNewGet);

// SHOW
// router.get("/:id", campgroundController.campgroundShowGet);
router.get("/:slug", campgroundController.campgroundShowGet);

// EDIT
// router.get("/:id/edit", middleware.checkCampgroundOwnership, campgroundController.campgroundEditGet);
router.get("/:slug/edit", middleware.checkCampgroundOwnership, campgroundController.campgroundEditGet);

// UPDATE
// router.put("/:id", middleware.checkCampgroundOwnership, campgroundController.campgroundUpdatePut);
router.put("/:slug", middleware.checkCampgroundOwnership, campgroundController.campgroundUpdatePut);

// DESTROY
// router.delete("/:id", campgroundController.campgroundDestroyDelete);
router.delete("/:slug", campgroundController.campgroundDestroyDelete);

module.exports = router;