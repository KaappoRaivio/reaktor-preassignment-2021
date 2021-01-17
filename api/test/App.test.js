const supertest = require("supertest");
jest.mock("node-fetch", () => require("fetch-mock-jest").sandbox());
const fetchMock = require("node-fetch");

const app = require("../src/App");
const { parseAvailabilityResponse } = require("../src/ProcessData");
const { API_ENDPOINT } = require("../src/BadApiClient");

const availabilityData = require("./mockRequestData/availabilityParseTestData.json");

describe("Test the API", () => {
	test("It should respond with an array of categories", done => {
		supertest(app)
			.get("/api/categories/")
			.then(response => {
				expect(response.statusCode).toBe(200);

				const categories = response.body;
				expect(Array.isArray(categories)).toBeTruthy();

				done();
			});
	});

	test("It should respond with an object of products", done => {
		fetchMock.get(`${API_ENDPOINT}/products/gloves`, require("./mockRequestData/productsGloves.json"));
		fetchMock.get(`${API_ENDPOINT}/products/facemasks`, require("./mockRequestData/productsFacemasks.json"));
		fetchMock.get(`${API_ENDPOINT}/products/beanies`, require("./mockRequestData/productsBeanies.json"));

		fetchMock.get(`${API_ENDPOINT}/availability/hennex`, require("./mockRequestData/availabilityHennex.json"));
		fetchMock.get(`${API_ENDPOINT}/availability/ippal`, require("./mockRequestData/availabilityIppal.json"));
		fetchMock.get(`${API_ENDPOINT}/availability/juuran`, require("./mockRequestData/availabilityJuuran.json"));

		supertest(app)
			.get("/api/products")
			.then(response => {
				expect(response.statusCode).toBe(200);

				const products = response.body;

				for (const category in products.products) {
					for (const product of products.products[category]) {
						const {
							id,
							manufacturer,
							name,
							price,
							type,
							color,
							availability: { loading, availability },
						} = product;

						expect(
							[id, type, name, price, manufacturer].map(x => x != null).reduce((a, b) => a && b)
						).toBeTruthy();
						expect(Array.isArray(color)).toBeTruthy();
						expect(loading).toBeTruthy();
						expect(availability).toBeDefined();
					}
				}
				done();
			});
		supertest(app)
			.get("/api/products?withAvailability=true")
			.then(response => {
				expect(response.statusCode).toBe(200);

				const products = response.body;
				// console.log(products.products.gloves);

				for (const category in products.products) {
					for (const product of products.products[category]) {
						const {
							id,
							manufacturer,
							name,
							price,
							type,
							color,
							availability: { loading, availability },
						} = product;

						expect(
							[id, type, name, price, manufacturer].map(x => x != null).reduce((a, b) => a && b)
						).toBeTruthy();
						expect(Array.isArray(color)).toBeTruthy();
						expect(loading).toBeFalsy();
						expect(availability).toBeInstanceOf(String);
						expect(availability).not.toBe("Unknown");
					}
				}

				fetchMock.restore();
				done();
			});
	});
});

describe("Test the data processing", () => {
	test("It should parse product availability strings correctly", done => {
		for (const DATAPAYLOAD in availabilityData) {
			expect(parseAvailabilityResponse(DATAPAYLOAD)).toBe(availabilityData[DATAPAYLOAD]);
		}

		done();
	});
});
