const debug = require("debug")("MyResponseJSONCache");

const NodeCache = require("node-cache");

class MyResponseJSONCache {
	constructor() {
		this.cache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });
	}

	get(key, onCacheMissed, isValidResponse = () => true) {
		console.log(`Getting ${key}`);
		const promise = this.cache.get(key);
		console.log(`Got ${key}`);

		if (promise) {
			debug(`Cache hit for ${key}`);
			return promise;
		} else {
			const promise = onCacheMissed();

			return promise
				.then(res => res.json())
				.then(json => {
					if (isValidResponse(json)) {
						this.cache.set(key, new Promise(resolve => resolve(json)));
					}
					return json;
				});
		}
	}
}

module.exports = MyResponseJSONCache;
