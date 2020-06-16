const 	express 			= require("express"),
		router 				= express.Router(),
		middleware			= require("../middleware"), // if file is not specified than it will require index.js in specified folder
		NodeGeocoder 		= require('node-geocoder'),
		multer 				= require('multer'),
		cloudinary 			= require('cloudinary');

// requiring models
const	User				= require("../models/user"),
	  	Campground 			= require("../models/campground"),
	  	Comment				= require("../models/comment"),
	  	Notification		= require("../models/notification");;
	  
const options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null
};
 
var geocoder = NodeGeocoder(options);

// Cloudinary config for image storing
var storage = multer.diskStorage({
	filename: function(req, file, callback) {
		callback(null, Date.now() + file.originalname); // image gets stored as current_time+original_name
  	}
});

// Only certain file extensions are allowed
var imageFilter = function (req, file, cb) {
	// accept image files only
	if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
		return cb(new Error('Only image files are allowed!'), false);
	}
	cb(null, true);
};

// pass in configuration variables
var upload = multer({ storage: storage, fileFilter: imageFilter})

// configure cloudinary
cloudinary.config({ 
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
	api_key: process.env.CLOUDINARY_API_KEY, 
	api_secret: process.env.CLOUDINARY_API_SECRET
});

// INDEX
router.get("/", (req, res) => {
	var noMatch = null;
	if(req.query.search) {
		// Get all campgrounds from DB
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex}, (err, allCampgrounds) => {
			if(err) {
				console.log(err);
			}
			else {
				if (allCampgrounds.length < 1) {
					noMatch = "No campgrounds match that query, please try again!";
				}
				res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});	
			}
		});
	}
	else {
		Campground.find({}, function(err, allCampgrounds){
			if(err){
				console.log(err);
				res.redirect("back");
			} 
			else if (!allCampgrounds) {
				res.redirect("back");
			}
			else {
				res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
			}
		});
	}
});

// CREATE
router.post("/", middleware.isLoggedIn, upload.single("image"), async (req, res) => {
	geocoder.geocode(req.body.campground.location)
	.then(async (data) => {

		if(!data.length){
			console.log("Error creating campground - geocode failure - no data length: \n" + err);
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}

		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
	})
	.then(async() => {
		let result = await cloudinary.uploader.upload(req.file.path)

		if(!result) {
			console.log("Failed to upload campground image!");
			req.flash("error", "Failed to upload campground image!");
			return res.redirect("back");
		}

		// add cloudinary url for the image to the campground object under image property
		req.body.campground.image = result.secure_url;

		// add author to campground
		req.body.campground.author = {
			id: req.user._id,
			username: req.user.username
		}
	})
	.then(async () => {
		let campground = await Campground.create(req.body.campground);

		if(!campground) {
			req.flash('error', "Failed to create campground");
			return res.redirect("back");
		}

		// Get followers of campground author
		let user = await User.findById(req.user._id).populate("followers").exec();

		if(!user) {
			req.flash('error', "Failed to create campground");
			return res.redirect("back");
		}

		// Create notification object for followers
		let newNotification = {
			username: req.user.username,
			campgroundId: campground.id,
		}

		// For each follower create an individual notification model object and add it to their notifications array
		for(const follower of user.followers) {
			let notification = await Notification.create(newNotification);
			await follower.notifications.push(notification);
			await follower.save();
		}
		
		console.log("successfully created notifications");

		req.flash("success", "Successfully created campground");
		res.redirect(`/campgrounds/${campground.id}`);
	})
	.catch(err => {
		console.log(err);
		console.trace();
		req.flash("error", err.message);
		return res.redirect("back");
	});
});

// NEW
router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/new");
});

// SHOW
router.get("/:id", (req, res) => {
	// if not
	// find the campground with provided ID and populate comments
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
		if(err || !foundCampground) {
			console.log(err);
			req.flash("error", "Campground not found.");
			return res.redirect("back");
		}
		else {
			//console.log(foundCampground);
			// render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// EDIT
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if(err || !foundCampground) {
			console.log(err);
			req.flash("error", "Campground not found.");
			return res.redirect("back");
		}
		else {
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
});

// UPDATE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {  
	geocoder.geocode(req.body.location, function (err, data) {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;
		
		// find and update correct campground
		Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
			if(err || !updatedCampground) {
				console.log(err);
				req.flash("error", "Failed to update campground.");
				return res.redirect("back");
			}
			else {
				req.flash("success", "Successfully Updated campground!")
				res.redirect("/campgrounds/" + req.params.id);
			}
		});
	});
});

// DESTROY
router.delete("/:id",async(req,res)=>{
	try {
		let foundCampground = await Campground.findById(req.params.id);
		await foundCampground.remove();
		req.flash("success", "Campground deleted!");
		res.redirect("/campgrounds");
	} catch (error) {
		req.flash("success", "Failed to delete campground");
		res.redirect("/campgrounds");
	}
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;