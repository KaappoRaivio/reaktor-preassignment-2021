const fetch = require("node-fetch");
const {
	combineAvailabilityWithProductInformation,
	parseAvailabilityResponse,
	getManufacturers,
	addAvailabilityToProductInformation,
} = require("./ProcessData");

const API_ENDPOINT = "https://bad-api-assignment.reaktor.com/v2";
const PRODUCT_CATEGORIES = ["gloves", "facemasks", "beanies"];

const getCategory = category => {
	return fetch(`${API_ENDPOINT}/products/${category}`)
		.then(res => res.json())
		.then(responseJSON => {
			return { category, products: responseJSON };
		});
};

const getAvailability = manufacturer => {
	return fetch(`${API_ENDPOINT}/availability/${manufacturer}`)
		.then(res => res.json())
		.then(responseJSON => {
			if (responseJSON.response === "[]") {
				return getAvailability(manufacturer);
			}

			const result = {};
			for (const entry of responseJSON.response) {
				const { id, DATAPAYLOAD } = entry;

				result[id.toLowerCase()] = parseAvailabilityResponse(DATAPAYLOAD);
			}
			return result;
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

const getAvailabilityRequests = products => {
	const manufacturers = getManufacturers(products);

	let counter = 0;

	const availabilityRequests = manufacturers.map(getAvailability);
	return availabilityRequests.map(availabilityRequest =>
		availabilityRequest.then(availabilityData => {
			counter += 1;

			let isLastRequest = counter === manufacturers.length;
			return { availabilityData, isLastRequest };
		})
	);
	// return availabilityRequests.map(availability => _products => {
	// 	return combineAvailabilityWithProductInformation(_products, availability)
	// })

	// const availabilityResponses = await Promise.all(availabilityRequests);

	// let availability = {};
	// for (const response of availabilityResponses) {
	// 	availability = { ...availability, ...response };
	// }
	//
	// return combineAvailabilityWithProductInformation(products, availability);
};

module.exports = { getProducts, getAvailabilityRequests, PRODUCT_CATEGORIES, API_ENDPOINT };
