const fetch = require("node-fetch");
const { combineAvailabilityWithProductInformation } = require("./ProcessData");
const { parseAvailabilityResponse } = require("./ProcessData.js");
const { getManufacturers } = require("./ProcessData");

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
			// console.log(responseJSON, manufacturer);

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

	const manufacturers = getManufacturers(products);

	console.log("sending availability");
	const availabilityRequests = manufacturers.map(getAvailability);
	const availabilityResponses = await Promise.all(availabilityRequests);

	let availability = {};
	for (const response of availabilityResponses) {
		availability = { ...availability, ...response };
	}

	console.log(availability);
	console.log(Object.keys(availability).length);

	const finalResult = combineAvailabilityWithProductInformation(products, availability);
	console.log(finalResult);
	return finalResult;
};

module.exports = { getProducts, PRODUCT_CATEGORIES };
