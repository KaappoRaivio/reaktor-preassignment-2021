const request = require("supertest");
jest.mock("node-fetch", () => require("fetch-mock-jest").sandbox());
const fetchMock = require("node-fetch");

const MyResponseJSONCache = require("../src/MyResponseJSONCache.js");

const mockData1 = { never: "gonna", let: "you down" };
const mockData2 = { never: "gonna", run_around: "and hurt you" };
const mockData3 = [{ valid: false }, {}, { valid: true }];

describe("Test the response cache", () => {
	fetchMock.once("/test/1", mockData1);
	fetchMock.once("/test/2", mockData2, { delay: 400 });

	let timesCalled = 0;
	fetchMock.get("/test/3", () => mockData3[timesCalled++]);

	test("it should return and cache the result", done => {
		const inner = async () => {
			const cache = new MyResponseJSONCache();
			const json = await cache.getOrFill("/test/1", () => true);
			expect(json).toEqual(mockData1);

			const json2 = await cache.getOrFill("/test/1", () => true);
			expect(json).toEqual(mockData1);
		};
		inner().then(done);
	});

	test("it should not make a new request if a previous request for the same resource is pending", done => {
		const inner = async () => {
			const cache = new MyResponseJSONCache();
			const request1 = cache.getOrFill("/test/2", () => true);
			const request2 = await new Promise(resolve =>
				setTimeout(() => resolve(cache.getOrFill("/test/2", () => true)), 200)
			);

			const json1 = await request1;
			const json2 = await request2;

			expect(json1).toEqual(mockData2);
			expect(json1).toEqual(mockData2);
		};
		inner().then(done);
	});

	test("it should retry until isValidResponse returns true", done => {
		const inner = async () => {
			const cache = new MyResponseJSONCache();

			const json1 = await cache.getOrFill("/test/3", json => json.valid);
			expect(json1).toEqual(mockData3[2]);
		};
		inner().then(done);
	});
});
