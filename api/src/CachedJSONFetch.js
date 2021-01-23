const fetch = require("node-fetch");
const MyResponseJSONCache = require("./MyResponseJSONCache");

const requestCache = new MyResponseJSONCache();
const cachedJSONFetch = (url, isValidResponse = () => true) => {
	return requestCache.get(
		url,
		() => {
			return fetch(url).then(res => {
				if (res.ok) {
					return res;
				} else {
					throw new Error(`Request to ${url} got status ${res.status}!`);
				}
			});
		},
		isValidResponse
	);
};

module.exports = cachedJSONFetch;
