const 	APIHelper 	= require("./api-helper"),
		multer 		= require("multer"),
		errors	= require("../../errors/errors");

const CONFIG = {
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
	api_key: process.env.CLOUDINARY_API_KEY, 
	api_secret: process.env.CLOUDINARY_API_SECRET
}

class CloudinaryHelper extends APIHelper {
	constructor(config = CloudinaryHelper.defaultConfig) {
		super({provider: "cloudinary"});
		this.cloudinary = require("cloudinary");
		this.cloudinary.config(config);
	};
	
	// Default cloudinary config for image storing
	static get defaultConfig() {
		return CONFIG;
	}
	
	// Allow only certain file extensions
	static imageFilter (req, file, cb) {
		// accept image files only
		if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
			return cb(new Error('Only image files are allowed!'), false);
		}
		cb(null, true);
	};
	
	// Cloudinary config for image storing
	static get storage() {
		return multer.diskStorage({
				filename: function(req, file, callback) {
					callback(null, Date.now() + file.originalname); // image gets stored as current_time+original_name
				}
			})
	}

	static get upload() {
		return multer({ storage: CloudinaryHelper.storage, fileFilter: CloudinaryHelper.imageFilter});
	}
	
	// Upload image to cloudinary api
	async uploadImageToCloudinary() {
		try {
			console.log("start image to cloudinary");
			await this.setResponse(this.cloudinary.uploader.upload(this.query));
			if(!this.response.secure_url) {
				console.log("empty cloudinary response");
				throw new errors.CloudinaryResponseError({data: this});
			}
			console.log("end image to cloudinary");
		}
		catch(err) {
			console.log("upload image to cloudinary error caught")
			throw new errors.CloudinaryResponseError({errorCause: err, data: this});
		}
	}
}


module.exports = CloudinaryHelper;