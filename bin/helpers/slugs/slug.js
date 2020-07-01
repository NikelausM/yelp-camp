class Slug {
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