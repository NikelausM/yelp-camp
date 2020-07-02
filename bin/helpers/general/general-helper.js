class GeneralHelper {
	static setAttr(target, source, attributes) {
		for(const attribute of attributes) {
			target[attribute] = source[attribute];
		}
	}
}

module.exports = GeneralHelper;