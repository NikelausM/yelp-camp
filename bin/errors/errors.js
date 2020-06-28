const assert = require('assert').strict;
const http = require('http');

// Base class for errors that can be extended
class ExtendedError extends Error {
	constructor(params){
		
		// Ensure error at least has default parameters
		params.error = Object.assign(ExtendedError.defaultProps, params.error);
		super(params.error.message);
		
		// Copy error parameters to error class object
		Object.assign(this, params.error);
		
		// Ensure error instance has data property
		this.data = Object.assign({}, params.data);
		
		// Extend most recent error
		if(params.errorCause) {
			this.errorCause = params.errorCause;
			this.extendStackTrace();
		}
	}

	// get static const defaultData property
	static get defaultProps() {
		return {
			name: 		"ExtendedError",
			parent: 	"Error",
			message: 	"An error occurred.",
		};
	}
	
	// // Set stack trace
	// setStackTrace() {
	// 	if (typeof Error.captureStackTrace === 'function'){
	// 		// Error.captureStackTrace(this, this.constructor)
	// 		Error.captureStackTrace(this);
	// 	} else {
	// 		this.stack = (new Error(this.message)).stack
	// 	}
	// }

	// Extend the stack trace to include previous errors
	extendStackTrace() {
		this.stack = this.stack
					+ `\nCaused by: ${this.errorCause.stack} \n`;
	}
}

// Unknown internal error
class InternalError extends ExtendedError {
	constructor(params) {
		// Ensure error at least has default parameters
		params.error = Object.assign(InternalError.defaultProps, params.error);
		super(params);
	}
	static get defaultProps() {
		return {
			name: 		"InternalResponseError",
			parent: 	"ExtendErrorClass",
			message: 	"An internal error occurred.",
		};
	}
}

// Resource not found (can be used for bad DB responses)
class ResourceNotFoundError extends ExtendedError {
	constructor(params) {
		// Ensure error at least has default parameters
		params.error = Object.assign(ResourceNotFoundError.defaultProps, params.error);
		// Ensure data at least has default parameters
		params.data = Object.assign(ResourceNotFoundError.defaultData, params.data);
		
		super(params);
	}
	static get defaultProps() {
		return {
			name: 		"ResourceNotFoundError",
			parent: 	"ExtendError",
			message: 	"Resource could not be found.",
		};
	}
	
	static get defaultData() {
		return {
			provider: 	"",
			query: 		"",
			resource: 	"",
			response: 	"",
		}
	}
}

// Bad API response
class APIResponseError extends ExtendedError {
	constructor(params){
		// Ensure error at least has default parameters
		params.error = Object.assign(APIResponseError.defaultProps, params.error);
		// Ensure data at least has default parameters
		params.data = Object.assign(APIResponseError.defaultData, params.data);

		super(params);
	}
	
	static get defaultProps() {
		return {
			name: 		"APIResponseError",
			parent: 	"ExtendedError",
			message: 	"An API provided an incorrect response",
		};
	}
	
	static get defaultData() {
		return {
			provider: 	"",
			query: 		"",
			resource: 	"",
			response: 	"",
		}
	}
}

// Bad Node Geocoder Error
class NodeGeocoderResponseError extends APIResponseError {
	constructor(params) {
		
		// Ensure error at least has default parameters
		params.error = Object.assign(NodeGeocoderResponseError.defaultProps, params.error);

		super(params);
	}
	static get defaultProps() {
		return {
			name: 		"NodeGeocoderResponseError",
			parent: 	"APIResponseError",
			message: 	"Address not found.",
		};
	}
}

// Cloudinary API response error
class CloudinaryResponseError extends APIResponseError {
	constructor(params) {
		
		// Ensure error at least has default parameters
		params.error = Object.assign(CloudinaryResponseError.defaultProps, params.error);

		super(params);
	}
	static get defaultProps() {
		return {
			name: 		"CloudinaryResponseError",
			parent: 	"APIResponseError",
			message: 	"Image could not be uploaded.",
		};
	}
}

module.exports = {
	ExtendedError,
	InternalError,
	ResourceNotFoundError,
	APIResponseError,
	NodeGeocoderResponseError,
	CloudinaryResponseError,
}