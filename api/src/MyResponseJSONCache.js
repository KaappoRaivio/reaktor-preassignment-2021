const debug = require("debug")("r:MyResponseJSONCache");

const NodeCache = require("node-cache");
const fetch = require("node-fetch");

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

const onCacheMissed = url => {
	debug(`Cache miss for ${url}`);
	return fetch(url).then(res => {
		debug(`Response for url ${url}`);
		if (res.ok) {
			return res;
		} else {
			debug(`Request to ${url} got status ${res.status}!`);
			throw new Error(`Request to ${url} got status ${res.status}!`);
		}
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
		this.resultCache.on("del", (key, value) => {
			this.pendingCache.del(key);
		});
	}
	/*
	Three cases:
		1. A resource is requested that the cache has never seen
			-> neither resultCache nor pendingCache have entries for it.
			onCacheMissed is called.
			pendingCache entry is set to a promise that resolves when resultCache entry is filled
			when onCacheMissed resolves, resultCache entry is set to its contents.

		2. A resource is requested that the cache knows about but doesn't yet have the results for
			-> resultCache doesn't have an entry, pendingCache does.
			the pendingCache entry is returned.

		3. A resource is requested that the cache has a result available readily
			-> both resultCache and pendingCache have an entry
			the resultCache entry is returned
	* */
	async getOrFill(key, isValidResponse = () => true, maxRetries = 10) {
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
						debug(`Filled resultCache for ${key}`);
						return this.resultCache.get(key);
					})
					.then(resolve)
					.catch(console.error);
			})
		);

		let json;
		do {
			const promise = onCacheMissed(key);
			const res = await promise;
			json = await res.json();

			if (!isValidResponse(json)) {
				debug(`Received invalid response for key ${key}: ${JSON.stringify(json)}`);
			}

			maxRetries -= 1;
		} while (!isValidResponse(json) && maxRetries >= 0);

		this.resultCache.set(key, new Promise(resolve => resolve(json)));
		return new Promise(resolve => resolve(json));
	}
}

module.exports = MyResponseJSONCache;
