/** 
* Class containing function which generate and unique slugs for a specified model.
* @module slug
* @class
* @author Jose Nicolas Mora
*/
class Slug {
	
	/**
	* Generates and returns a unique slug for a specified model object.
	* @param {mongoose.Model} model - The model for which a slug will be generated.
	* @param {String} - The id of the model object.
	* @param {name} - The name of the model object.
	* @param {slug} - The slug of the model object.
	*/
	static async generateUniqueSlug(model, id, name, slug) {
		try {
			// generate the initial slug
			if (!slug) {
				slug = this.slugify(name);
			}
			// check if a campground with the slug already exists
			var modelInstance = await model.constructor.findOne({slug: slug});
			// check if a campground was found or if the found campground is the current campground
			if (!modelInstance || modelInstance._id.equals(id)) {
				return slug;
			}
			// if not unique, generate a new slug
			var newSlug = this.slugify(name);
			
			// check again by calling the function recursively
			return await this.generateUniqueSlug(model, id, name, newSlug);
			
		} catch (err) {
			throw new Error(err);
		}
	}
	
	/**
	* Converts a potential slug string to be a URL friendly slug string.
	* @param {string} text - The slug string.
	*/
	static slugify(text) {
		var slug = text.toString().toLowerCase()
			.replace(/\s+/g, '-')        // Replace spaces with -
			.replace(/[^\w\-]+/g, '')    // Remove all non-word chars
			.replace(/\-\-+/g, '-')      // Replace multiple - with single -
			.replace(/^-+/, '')          // Trim - from start of text
			.replace(/-+$/, '')          // Trim - from end of text
			.substring(0, 75);           // Trim at 75 characters
		return slug + "-" + Math.floor(1000 + Math.random() * 9000);  // Add 4 random digits to improve uniqueness
	}
}

module.exports = Slug;