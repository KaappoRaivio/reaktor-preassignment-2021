const debug = require("debug")("r:MyResponseJSONCache");

const NodeCache = require("node-cache");

const waitUntil = predicate => {
	return new Promise(resolve => {
		const inner = async () => {
			while (!predicate()) {
				await new Promise(r => setTimeout(r, 1000));
			}
		};
		inner().then(resolve).catch(console.error);
	});
};

class MyResponseJSONCache {
	constructor() {
		this.pendingCache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });
		this.resultCache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });
		this.resultCache.on("expired", (key, value) => {
			if (this.pendingCache.has(key)) {
				debug(`${key} expired from resultCache, deleting from pendingCache now`);
				const removed = this.pendingCache.del(key);
				if (removed !== 1) {
					debug("PROBLEM: removal didn't succeed from pending cache!!!");
				}
			}
		});
	}

	async get(key, onCacheMissed, isValidResponse = () => true) {
		const resultPromise = await new Promise(resolve => resolve(this.resultCache.get(key)));
		if (resultPromise) {
			debug(`resultCache hit for ${key}`);
			return resultPromise;
		}

		const pendingPromise = await new Promise(resolve => resolve(this.pendingCache.get(key)));
		if (pendingPromise) {
			debug(`pendingCache hit for ${key}`);
			return pendingPromise;
		}

		this.pendingCache.set(
			key,
			new Promise(resolve => {
				waitUntil(() => this.resultCache.get(key))
					.then(() => {
						debug(`Filled cache for ${key}`);
						return this.resultCache.get(key);
					})
					.then(resolve)
					.catch(console.error);
			})
		);

		let json;
		do {
			const promise = onCacheMissed();
			const res = await promise;
			json = await res.json();

			if (!isValidResponse(json)) {
				debug(`Received invalid response for key ${key}: ${JSON.stringify(json)}`);
			}
		} while (!isValidResponse(json));

		this.resultCache.set(key, new Promise(resolve => resolve(json)));

		return new Promise(resolve => resolve(json));
		// return promise
		// 	.then(res => res.json())
		// 	.then(json => {
		// 		if (isValidResponse(json)) {
		// 			this.resultCache.set(key, new Promise(resolve => resolve(json)));
		// 		} else {
		// 			debug(`Received invalid response for key ${key}: ${JSON.stringify(json)}`);
		// 		}
		// 		return json;
		// 	});
	}
}

module.exports = MyResponseJSONCache;
