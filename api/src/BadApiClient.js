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
			console.log("JSON");
			return { category, products: responseJSON };
		})
		.catch(err => console.error(err));
};

const getAvailability = (manufacturer, maxRetries = 3) => {
	return cachedJSONFetch(`${API_ENDPOINT}/availability/${manufacturer}`, json => json.response !== "[]")
		.then(responseJSON => {
			if (responseJSON.response === "[]") {
				if (maxRetries >= 0) {
					return getAvailability(manufacturer, maxRetries - 1);
				} else {
					return Promise.reject();
				}
			}

			const result = {};
			for (const entry of responseJSON.response) {
				const { id, DATAPAYLOAD } = entry;
				result[id.toLowerCase()] = parseAvailabilityResponse(DATAPAYLOAD);
			}
			return result;
		})
		.catch(err => {
			console.error(err);
			console.log(`Didn't get results for ${manufacturer}`);
			return [];
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

	return manufacturers.map(getAvailability).map(availabilityRequest =>
		availabilityRequest.then(availabilityData => {
			counter += 1;

			let isLastPromise = counter === manufacturers.length;
			return { availabilityData, isLastPromise };
		})
	);
};

module.exports = { getProducts, getAvailabilityPromises, PRODUCT_CATEGORIES, API_ENDPOINT };
