"use strict";
const 	APIHelper 			= require("./api-helper"),
		NodeGeocoder 		= require("node-geocoder"),
		errors				= require("../../errors/errors");

const OPTIONS = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODER_API_KEY,
	formatter: null,
};

// const query = req.body.campground.location;
class GeocoderHelper extends APIHelper {
	
	constructor(options = GeocoderHelper.defaultOptions) {
		super({provider: options.provider});
		this.geocoder = NodeGeocoder(options);
	};
	
	static get defaultOptions() {
		return OPTIONS;
	}
	
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