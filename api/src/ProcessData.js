const DOMParser = require("dom-parser");

const parser = new DOMParser();

const responseTransform = {
	instock: "In stock",
	outofstock: "Out of stock",
	lessthan10: "Less than 10",
};

const parseAvailabilityResponse = DATAPAYLOAD => {
	const parsed = parser.parseFromString(DATAPAYLOAD.toLowerCase(), "text/xml"); // The XML standard only supports lower case tags
	return responseTransform[parsed.getElementsByTagName("instockvalue")[0].childNodes[0].text] || "Unknown";
};

const getManufacturers = products => {
	const result = new Set();

	for (const key in products) {
		for (const product of products[key]) {
			result.add(product.manufacturer);
		}
	}

	return [...result];
};

const addAvailabilityToProductInformation = products => {
	const result = {};

	for (const category in products) {
		result[category] = [];
		for (const product of products[category]) {
			result[category].push({
				...product,
				availability: { loading: true, availability: null },
			});
		}
	}

	return result;
};

const combineAvailabilityWithProductInformation = (products, availability) => {
	const result = {};

	for (const category in products) {
		result[category] = [];
		for (const product of products[category]) {
			result[category].push({
				...product,
				availability: { loading: false, availability: availability[product.id] || "No information" },
			});
		}
	}

	return result;
};

module.exports = {
	parseAvailabilityResponse,
	getManufacturers,
	combineAvailabilityWithProductInformation,
	addAvailabilityToProductInformation,
};
