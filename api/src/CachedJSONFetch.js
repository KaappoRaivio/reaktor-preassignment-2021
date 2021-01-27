const fetch = require("node-fetch");
const MyResponseJSONCache = require("./MyResponseJSONCache");

const requestCache = new MyResponseJSONCache();
const cachedJSONFetch = async (url, isValidResponse = () => true) => {
	return await requestCache.get(
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
