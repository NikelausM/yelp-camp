"use strict";
const errors	= require("../../errors/errors");

// For use with API libraries to guarantee that errors are caught
class APIHelper {
	constructor({provider = "", query = "", resource = ""}) {
		this._provider = provider;
		this._query = query;
		this._resource = resource;
	}
	
	setParams({provider = this._provider, query = this._query, resource = this._resource, response = ""}) {
		this._provider = provider;
		this._query = query;
		this._resource = resource;
	}
	
	get provider() {
		return this._provider;
	}
	
	set provider(newProvider) {
		this._provider = newProvider;
	}
	
	get query() {
		return this._query;
	}
	
	set query(newQuery) {
		this._query = newQuery;
	}
	
	get resource() {
		return this._resource;
	}
	
	set resourceExpected(newResource) {
		this._resource = newResource;
	}
	
	get response() {
		return this._response;
	}
	
	set response(newResponse) {
		this._response = newResponse;
	}
	
	// Catches API errors when sending responses
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