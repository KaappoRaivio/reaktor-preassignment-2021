const debug = require("debug")("r:CachedJSONFetch");

const fetch = require("node-fetch");
const MyResponseJSONCache = require("./MyResponseJSONCache");

const requestCache = new MyResponseJSONCache();
const cachedJSONFetch = async (url, isValidResponse = () => true) => {
	return await requestCache.getOrFill(url, isValidResponse);
};

module.exports = cachedJSONFetch;
