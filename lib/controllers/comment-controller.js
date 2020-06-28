const 	express 			= require("express"),
		router 				= express.Router({mergeParams: true}),
		Campground 			= require("../models/campground"),
		Comment 			= require("../models/comment"),
		middleware			= require("../middleware");

