const debug = require("debug")("r:CachedJSONFetch");

const fetch = require("node-fetch");
const MyResponseJSONCache = require("./MyResponseJSONCache");

const requestCache = new MyResponseJSONCache();
const cachedJSONFetch = async (url, isValidResponse = () => true) => {
	return await requestCache.get(
		url,
		() => {
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
		},
		isValidResponse
	);
};

module.exports = cachedJSONFetch;
