"use strict";
const errors	= require("../../errors/errors");

/** 
* Class representing an API Helper which wraps API classes/functions to better handle errors.
* @module api-helper
* @class
* @requires errors
* @author Jose Nicolas Mora
*/
class APIHelper {
	/**
	* Create an APIHelper.
	* @param {Object} params - The API parameters.
	* @param {string=} params.provider - The API provider (e.g., NodeGeocoder, Cloudinary, Google, etc.).
	* @param {string=} params.query - The query of a specified API call.
	* @param {string=} params.resource - The resource requested from a specified API call.
	*/
	constructor({provider = "", query = "", resource = ""}) {
		this._provider = provider;
		this._query = query;
		this._resource = resource;
	}
	
	/**
	* Set the parameters of the APIHelper.
	* @param {string=} params.provider - The API provider (e.g., NodeGeocoder, Cloudinary, Google, etc.).
	* @param {string=} params.query - The query of a specified API call.
	* @param {string=} params.resource - The resource requested from a specified API call.
	*/
	setParams({provider = this._provider, query = this._query, resource = this._resource, response = ""}) {
		this._provider = provider;
		this._query = query;
		this._resource = resource;
	}
	
	/**
	* Getter of provider.
	* @return {string} API provider.
	*/
	get provider() {
		return this._provider;
	}

	/**
	* Setter of provider.
	* @param {string} newProvider - The API provider.
	*/
	set provider(newProvider) {
		this._provider = newProvider;
	}
	
	/**
	* Getter of API call query.
	* @return {string} API call query.
	*/
	get query() {
		return this._query;
	}
	
	/**
	* Setter of query.
	* @param {string} - The API call query.
	*/
	set query(newQuery) {
		this._query = newQuery;
	}
	
	/**
	* Getter of resource requested from API call.
	* @return {string} resource requested from API call.
	*/
	get resource() {
		return this._resource;
	}
	
	/**
	* Setter of resource requested from API call.
	* @param {string} - The resource requested from API call.
	*/
	set resourceExpected(newResource) {
		this._resource = newResource;
	}
	
	/**
	* Getter of response of API call.
	* @return {string} response of API call.
	*/
	get response() {
		return this._response;
	}
	
	/**
	* Setter of response of API call.
	* @param {string} - The response of API call.
	*/
	set response(newResponse) {
		this._response = newResponse;
	}
	
	/**
	* Sets the response of the APIHelper as the response of the API call specified.
	* @param (Function) apiCall - The specified API function to be called.
	*/
	async setResponse(apiCall) {
		try {
			this._response = await apiCall;
		}
		catch(err) {
			throw new errors.InternalError({errorCause: err, data: this});
		}
		if(!this._response) {
			throw new errors.APIResponseError({data: this});
		}
	}
}

module.exports = APIHelper;