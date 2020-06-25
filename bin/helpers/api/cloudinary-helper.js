const 	APIHelper 	= require("./api-helper"),
		multer 		= require("multer"),
		cloudinary	= require("cloudinary"),
		errors	= require("../../errors/errors");

// Default cloudinary config for image storing
const CONFIG = {
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
	api_key: process.env.CLOUDINARY_API_KEY, 
	api_secret: process.env.CLOUDINARY_API_SECRET
}

class CloudinaryHelper extends APIHelper {
	constructor(config = CONFIG) {
		super({provider: "cloudinary"});
		this.cloudinary = new cloudinary();
		this.cloudinary.config({config});
	};
	
	// Only certain file extensions are allowed
	static imageFilter (req, file, cb) {
		// accept image files only
		if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
			return cb(new Error('Only image files are allowed!'), false);
		}
		cb(null, true);
	};
	
	// Cloudinary config for image storing
	static get storage() {
		multer.diskStorage({
			filename: function(req, file, callback) {
				callback(null, Date.now() + file.originalname); // image gets stored as current_time+original_name
			}
		})
	}

	static upload() {
		return multer({ storage: CloudinaryHelper.storage, fileFilter: CloudinaryHelper.imageFilter});
	}
	
	async uploadImageToCloudinary(file, image = "") {
		try {
			console.log("start image to cloudinary");
			console.log(file);
			console.log(image);
			
			let result = await this.cloudinary.uploader.upload(req.file.path)

			this.setParams({query: req.location, resource: "location"});
			await this.setResponse(this.geocoder.geocode(this.query));
			if(!this.response.secure_url) {
				throw new errors.CloudinaryResponseError(this);
			}
			// add cloudinary url for the image to the campground object under image property
			image = result.secure_url;

			console.log(file);
			console.log(image);
			console.log("successfully uploaded image to Cloudinary");
		}
		catch(err) {
			console.log("caught cloudinary error");
			throw new errors.CloudinaryResponseError({data: this, cause: err});
		}
	}
	

}


module.exports = CloudinaryHelper;