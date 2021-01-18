const request = require("supertest");
jest.mock("node-fetch", () => require("fetch-mock-jest").sandbox());
const fetchMock = require("node-fetch");

const app = require("../src/App");
const { parseAvailabilityResponse } = require("../src/ProcessData");
const { API_ENDPOINT } = require("../src/BadApiClient");

const availabilityData = require("./mockRequestData/availabilityParseTestData.json");

describe("Test the API", () => {
	test("It should respond with an array of categories", done => {
		request(app)
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

		const agent = request(app);
		agent.get("/api/products").then(jobResponse => {
			expect(jobResponse.statusCode).toBe(202);

			const { UUID } = jobResponse.body;
			console.log(UUID);

			agent.get(`/api/jobs/${UUID}`).then(productsResponse => {
				const { finished, hasNewData, data: products } = productsResponse.body;

				expect(finished).toBe(true);
				expect(hasNewData).toBe(true);

				for (const category in products) {
					for (const product of products[category]) {
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
						// expect(loading).toBeTruthy();
						expect(availability).toBeDefined();
					}
				}
				done();
			});
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
