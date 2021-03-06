const debug = require("debug")("r:BadApiClient");

const cachedJSONFetch = require("./CachedJSONFetch");

const {
	combineAvailabilityWithProductInformation,
	parseAvailabilityResponse,
	getManufacturers,
	addAvailabilityToProductInformation,
} = require("./ProcessData");

const API_ENDPOINT = "https://bad-api-assignment.reaktor.com/v2";
const PRODUCT_CATEGORIES = ["gloves", "facemasks", "beanies"];

const getCategory = category => {
	return cachedJSONFetch(`${API_ENDPOINT}/products/${category}`)
		.then(responseJSON => {
			return { category, products: responseJSON };
		})
		.catch(err => debug(err));
};

const getAvailability = manufacturer => {
	const isValidResponse = json => json.response != null && json.response !== "[]";

	return cachedJSONFetch(`${API_ENDPOINT}/availability/${manufacturer}`, isValidResponse)
		.then(responseJSON => {
			if (!isValidResponse(responseJSON)) {
				return id => "No data";
			}

			const result = {};
			for (const entry of responseJSON.response) {
				const { id, DATAPAYLOAD } = entry;
				result[id.toLowerCase()] = parseAvailabilityResponse(DATAPAYLOAD);
			}
			return id => result[id];
		})
		.catch(err => {
			debug(`Didn't get results for ${manufacturer}`);
			debug(err);
			return id => "No data";
		});
};

const getProducts = async () => {
	const categoryRequests = PRODUCT_CATEGORIES.map(getCategory);
	const categoryResponses = await Promise.all(categoryRequests);

	const products = {};
	for (const response of categoryResponses) {
		products[response.category] = response.products;
	}

	return addAvailabilityToProductInformation(products);
};

const getAvailabilityPromises = products => {
	const manufacturers = getManufacturers(products);
	let counter = 0;

	return manufacturers.map(getAvailability).map(availabilityPromise =>
		availabilityPromise.then(availabilityData => {
			counter += 1;

			let isLastPromise = counter === manufacturers.length;
			return { availabilityData, isLastPromise };
		})
	);
};

module.exports = { getProducts, getAvailabilityPromises, PRODUCT_CATEGORIES, API_ENDPOINT };
