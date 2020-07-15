/**
* Module containing error classes to be thrown in different situations.
* These error classes extend the stack trace of previously thrown errors.
* @module bin/errors/errors
*/

/** 
* Class representing an error that extends previously thrown errors.
* @extends Error
* @author Jose Nicolas Mora
*/
class ExtendedError extends Error {
	/**
	* Create an ExtendedError.
	* @override
	* @param {Object} params - The error parameters supplied.
	* @param {Error=} params.error - The error being wrapped by this class.
	* @param {Object=} params.data - The data of the error (Can be any relevant info).
	*/
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
	
	/**
	* Getter for default error properties.
	* @return {Object} - Default error properties.
	*/
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

	/**
	* Extend the stack trace to include previous errors
	*/ 
	extendStackTrace() {
		this.stack = this.stack
					+ `\nCaused by: ${this.errorCause.stack} \n`;
	}
}

/** 
* Class representing an internal error.
* @class
* @extends ExtendedError
* @author Jose Nicolas Mora
*/
class InternalError extends ExtendedError {
	/**
	* Create an InternalError.
	* @override
	* @param {Object} params - The error parameters supplied.
	* @param {Error=} params.error - The error being wrapped by this class.
	* @param {Object=} params.data - The data of the error (Can be any relevant info).
	*/
	constructor(params) {
		// Ensure error at least has default parameters
		params.error = Object.assign(InternalError.defaultProps, params.error);
		super(params);
	}
	
	/**
	* Getter for default error properties.
	* @override
	* @return {Object} - Default error properties.
	*/
	static get defaultProps() {
		return {
			name: 		"InternalResponseError",
			parent: 	"ExtendErrorClass",
			message: 	"An internal error occurred.",
		};
	}
}

/** 
* Class representing a resource not found error (can be used for bad DB responses).
* @class
* @extends ExtendedError
* @author Jose Nicolas Mora
*/
class ResourceNotFoundError extends ExtendedError {
	/**
	* Create an ResourceNotFoundError.
	* @override
	* @param {Object} params - The error parameters supplied.
	* @param {Error=} params.error - The error being wrapped by this class.
	* @param {Object=} params.data - The data of the error (Can be any relevant info).
	*/
	constructor(params) {
		// Ensure error at least has default parameters
		params.error = Object.assign(ResourceNotFoundError.defaultProps, params.error);
		// Ensure data at least has default parameters
		params.data = Object.assign(ResourceNotFoundError.defaultData, params.data);
		
		super(params);
	}
	
	/**
	* Getter for default error properties.
	* @override
	* @return {Object} - Default error properties.
	*/
	static get defaultProps() {
		return {
			name: 		"ResourceNotFoundError",
			parent: 	"ExtendError",
			message: 	"Resource could not be found.",
		};
	}
	
	/**
	* Getter for default data properties.
	* @return {Object} - Default error properties.
	*/
	static get defaultData() {
		return {
			provider: 	"",
			query: 		"",
			resource: 	"",
			response: 	"",
		}
	}
}

/** 
* Class representing a bad API response not found error.
* @class
* @extends ExtendedError
* @author Jose Nicolas Mora
*/
class APIResponseError extends ExtendedError {
	/**
	* Create an APIResponseError.
	* @override
	* @param {Object} params - The error parameters supplied.
	* @param {Error=} params.error - The error being wrapped by this class.
	* @param {Object=} params.data - The data of the error (Can be any relevant info).
	*/
	constructor(params){
		// Ensure error at least has default parameters
		params.error = Object.assign(APIResponseError.defaultProps, params.error);
		// Ensure data at least has default parameters
		params.data = Object.assign(APIResponseError.defaultData, params.data);

		super(params);
	}
	
	/**
	* Getter for default error properties.
	* @override
	* @return {Object} - Default error properties.
	*/
	static get defaultProps() {
		return {
			name: 		"APIResponseError",
			parent: 	"ExtendedError",
			message: 	"An API provided an incorrect response",
		};
	}
	
	/**
	* Getter for default data properties.
	* @return {Object} - Default error properties.
	*/
	static get defaultData() {
		return {
			provider: 	"",
			query: 		"",
			resource: 	"",
			response: 	"",
		}
	}
}

/** 
* Class representing a Node Geocoder API response error..
* @class
* @extends APIResponseError
* @author Jose Nicolas Mora
*/
class NodeGeocoderResponseError extends APIResponseError {
	/**
	* Create an NodeGeocoderResponseError.
	* @override
	* @param {Object} params - The error parameters supplied.
	* @param {Error=} params.error - The error being wrapped by this class.
	* @param {Object=} params.data - The data of the error (Can be any relevant info).
	*/
	constructor(params) {
		
		// Ensure error at least has default parameters
		params.error = Object.assign(NodeGeocoderResponseError.defaultProps, params.error);

		super(params);
	}
	
	/**
	* Getter for default error properties.
	* @override
	* @return {Object} - Default error properties.
	*/
	static get defaultProps() {
		return {
			name: 		"NodeGeocoderResponseError",
			parent: 	"APIResponseError",
			message: 	"Address not found.",
		};
	}
}

/** 
* Cass representing a Cloudinary API response error.
* @class
* @extends APIResponseError
* @author Jose Nicolas Mora
*/
class CloudinaryResponseError extends APIResponseError {
	/**
	* Create an CloudinaryResponseError.
	* @override
	* @param {Object} params - The error parameters supplied.
	* @param {Error=} params.error - The error being wrapped by this class.
	* @param {Object=} params.data - The data of the error (Can be any relevant info).
	*/
	constructor(params) {
		
		// Ensure error at least has default parameters
		params.error = Object.assign(CloudinaryResponseError.defaultProps, params.error);

		super(params);
	}
	
	/**
	* Getter for default error properties.
	* @override
	* @return {Object} - Default error properties.
	*/
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