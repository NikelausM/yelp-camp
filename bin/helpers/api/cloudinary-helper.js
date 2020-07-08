const 	
		/**
		 * api-helper module
		 * @const
		 */
		APIHelper 	= require("./api-helper"),
		/**
		 * multer module
		 * @const
		 */
		multer 		= require("multer"),
		/**
		 * errors module
		 * @const
		 */
		errors	= require("../../errors/errors");

/**
* @const
* @default
*/
const CONFIG = {
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
	api_key: process.env.CLOUDINARY_API_KEY, 
	api_secret: process.env.CLOUDINARY_API_SECRET
}

/** 
* Class representing an API Helper which wraps the Cloudinary API.
* @module bin/helpers/api/cloudinary-helper
* @extends bin/helpers/api/api-helper
* @requires bin/helpers/api/api-helper
* @requires multer
* @requires bin/errors/errors
* @author Jose Nicolas Mora
*/
class CloudinaryHelper extends APIHelper {
	/**
	* Create an CloudinaryHelper.
	* @param {Object=} config - The configuration settings for the cloudinary API.
	* @param {string=} config.cloud_name - The Cloudinary cloud name.
	* @param {string=} config.api_key - The Cloudinary API key.
	* @param {string=} config.api_secret - The Cloudinary API secret.
	*/
	constructor(config = CloudinaryHelper.defaultConfig) {
		super({provider: "cloudinary"});
		this.cloudinary = require("cloudinary");
		this.cloudinary.config(config);
	};
	
	/** 
	* Returns the Default cloudinary config for image storing.
	* @return The default configuration of the Cloudinary API.
	*/
	static get defaultConfig() {
		return CONFIG;
	}
	
	/** 
	* Restrict file extensions of images to be uploaded to Cloudinary.
	* @param {Request} - The HTTP request object.
	* @param {Object} file - The image file to be uploaded.
	* @param {requestCallback} cb - The callback that handles the response.
	*/
	static imageFilter (req, file, cb) {
		// accept image files only
		if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
			return cb(new Error('Only image files are allowed!'), false);
		}
		cb(null, true);
	};
	
	/** 
	* Returns the disk storage used for cloudinary uploads.
	* @return {Object} - The disk storage used for cloudinary uploads.
	*/
	static get storage() {
		return multer.diskStorage({
				filename: function(req, file, callback) {
					callback(null, Date.now() + file.originalname); // image gets stored as current_time+original_name
				}
			})
	}

	/** 
	* Returns the multer object used for Cloudinary uploads.
	* @return {Object} - The multer object used for Cloudinary uploads.
	*/
	static get upload() {
		return multer({ storage: CloudinaryHelper.storage, fileFilter: CloudinaryHelper.imageFilter});
	}
	
	/** 
	* Upload image to Cloudinary API.
	*/
	async uploadImageToCloudinary() {
		try {
			await this.setResponse(this.cloudinary.uploader.upload(this.query));
			if(!this.response.secure_url) {
				console.log("empty cloudinary response");
				throw new errors.CloudinaryResponseError({data: this});
			}
		}
		catch(err) {
			console.log("upload image to cloudinary error caught")
			throw new errors.CloudinaryResponseError({errorCause: err, data: this});
		}
	}
}


module.exports = CloudinaryHelper;