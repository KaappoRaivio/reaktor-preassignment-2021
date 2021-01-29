const DOMParser = require("dom-parser");

const responseTransform = {
	instock: "In stock",
	outofstock: "Out of stock",
	lessthan10: "Less than 10",
};

const parser = new DOMParser();
const parseAvailabilityResponse = DATAPAYLOAD => {
	const parsed = parser.parseFromString(DATAPAYLOAD.toLowerCase(), "text/xml"); // The XML standard only supports lower case tags
	try {
		const text = parsed.getElementsByTagName("instockvalue")[0].childNodes[0].text.trim();
		return responseTransform[text] || "Unknown";
	} catch (error) {
		return "Unknown";
	}
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

const combineAvailabilityWithProductInformation = (products, availabilityFunction) => {
	const result = {};

	for (const category in products) {
		result[category] = [];
		for (const product of products[category]) {
			let availability;
			if (availabilityFunction(product.id)) {
				availability = { loading: false, availability: availabilityFunction(product.id) };
			} else {
				availability = { loading: true, availability: "Loading" };
			}

			result[category].push({
				...product,
				availability,
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
