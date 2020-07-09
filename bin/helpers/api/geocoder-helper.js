"use strict";
const
		/**
		 * api-helper module
		 * @const
		 */
		APIHelper 	= require("./api-helper"),
		/**
		 * errors module
		 * @const
		 */
		errors	= require("../../errors/errors"),
	  	/**
		* node-geocoder module
		* @const
		*/
	  	NodeGeocoder = require("node-geocoder");

/**
* @const
* @default
*/
const CONFIG = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null,
};

/** 
* Class representing an API Helper which wraps the Node Geocoder API.
* @module bin/helpers/api/geocoder-helper
* @extends bin/helpers/api/api-helper
* @requires bin/helpers/api/api-helper
* @requires bin/errors/errors
* @author Jose Nicolas Mora
*/
class GeocoderHelper extends APIHelper {
	/**
	* Create an CloudinaryHelper.
	* @param {Object=} config - The configuration settings for the cloudinary API.
	* @param {string=} config.provider - The provider of Node Geocoder API.
	* @param {string=} config.httpAdapter - The HTTP adapter of the Node Geocoder API.
	* @param {string=} config.apiKey - The API key of the Google google geocoder API.
	* @param {string=} config.formatter - The formatting of the Node geocoder response.
	*/
	constructor(config = GeocoderHelper.defaultConfig) {
		super({provider: config.provider});
		this.geocoder = NodeGeocoder(config);
	};
	
	/** 
	* Returns the default node geocoder configurations.
	* @return The default node geocoder configurations.
	*/
	static get defaultConfig() {
		return CONFIG;
	}
	
	/** 
	* Geocodes the address specified in the query of the GeocoderHelper.
	*/
	async geocodeData() {
		try {
			await this.setResponse(this.geocoder.geocode(this.query));
			if(!this.response.length) {
				throw new errors.NodeGeocoderResponseError({data: this});
			}
		}
		catch(err) {
			throw new errors.NodeGeocoderResponseError({errorCause: err, data: this});
		}
	};
	
	
	/** 
	* Sets the latitude, longitude, and address of a provided object (req).
	* @param {Object} req - The object, the location data of which, will be set.
	* @param {number} index - The index the node geocoder API response that will be used to set the location data of the object.
	*/
	setLocData(req, index=0) {
		try {
			req.lat = this.response[index].latitude;
			req.lng = this.response[index].longitude;
			req.location = this.response[index].formattedAddress;
		}
		catch(err) {
			throw new errors.ExtendedError({errorCause: err, data: {callingObj: this, req: req, index: index}});
		}
	}
}

module.exports = GeocoderHelper;