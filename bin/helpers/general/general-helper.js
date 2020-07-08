/** 
* Class containing helper functions.
* @module bin/helpers/general/general-helper
* @author Jose Nicolas Mora
*/
class GeneralHelper {
	/**
	* Create an GeneralHelper.
	*/
	constructor() {
		
	}
	/**
	* Copy the attributes specified in an attributes array of a source object to a target object.
	* @param {Object} target - Target object to be copied to.
	* @param {Object} source - Source object to be copied from.
	* @param {Object[]} attributes - The attributes to be copied.
	*/
	static setAttr(target, source, attributes) {
		for(const attribute of attributes) {
			target[attribute] = source[attribute];
		}
	}
}

module.exports = GeneralHelper;