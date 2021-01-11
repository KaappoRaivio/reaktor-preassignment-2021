// import fetch from "node-fetch";
// import parseAvailabilityResponse from "./ResponseParser";
const parseAvailabilityResponse = require("./ResponseParser.js");

const fetch = require("node-fetch");

const API_ENDPOINT = "https://bad-api-assignment.reaktor.com/v2";
// const API_ENDPOINT = "https://cors-anywhere.herokuapp.com/https://bad-api-assignment.reaktor.com/v2";
export const PRODUCT_CATEGORIES = ["gloves", "facemasks", "beanies"];

export const getCategory = category => {
	return fetch(`${API_ENDPOINT}/products/${category}`)
		.then(res => res.json())
		.then(responseJSON => {
			// let result = {};
			// for (const entry of responseJSON) {
			// 	const { id, ...rest } = entry;
			// 	result[id] = { ...rest, stockStatus: { loading: true, inStock: null, error: null } };
			// }
			// return result;
			return { category, products: responseJSON };
		});
};

export const getManufacturers = products => {
	const result = new Set();

	for (const key in products) {
		for (const product of products[key]) {
			result.add(product.manufacturer);
		}
	}

	return [...result];
};

export const getAvailability = manufacturer => {
	return fetch(`${API_ENDPOINT}/availability/${manufacturer}`)
		.then(res => res.json())
		.then(responseJSON => {
			const result = {};
			console.log(responseJSON, manufacturer);

			if (responseJSON.response === "[]") {
				return getAvailability(manufacturer);
			}

			for (const entry of responseJSON.response) {
				const { id, DATAPAYLOAD } = entry;

				result[id.toLowerCase()] = parseAvailabilityResponse(DATAPAYLOAD);
			}
			console.log(result);
			return result;
		});
};

// const getData = async () => {
//     let result = {}
//
//     for (const category of PRODUCT_CATEGORIES) {
//         result[category] = getCategory(category);
//     }
//
//     return result
// }

// getAvailability("hennex");
// parseAvailabilityResponse("<AVAILABILITY>\n  <CODE>200</CODE>\n  <INSTOCKVALUE>LESSTHAN10</INSTOCKVALUE>\n</AVAILABILITY>")
