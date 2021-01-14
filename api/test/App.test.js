const supertest = require("supertest");
const app = require("../src/App");
const { parseAvailabilityResponse } = require("../src/ProcessData");

const availabilityData = require("./testData/availabilityData.json");

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
});

describe("Test the data processing", () => {
	test("It should parse product availability strings correctly", done => {
		for (const DATAPAYLOAD in availabilityData) {
			expect(parseAvailabilityResponse(DATAPAYLOAD)).toBe(availabilityData[DATAPAYLOAD]);
		}

		done();
	});
});
