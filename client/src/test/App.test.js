import React from "react";

import { act, render, screen } from "@testing-library/react";
import App from "../App";

import supertest from "supertest";

jest.mock("node-fetch", () => require("fetch-mock-jest"));
import fetchMock from "fetch-mock";
import Main from "../components/Main";
import { fireEvent, waitFor, waitForElement } from "@testing-library/dom";

import categoriesMockResponse from "./mockRequestData/categories.json";
import productsMockResponse from "./mockRequestData/products.json";
import productsWithAvailabilityMockResponse from "./mockRequestData/productsWithAvailability.json";

describe("Test the UI", () => {
	fetchMock.get("/api/categories", categoriesMockResponse);
	fetchMock.get("/api/products", productsMockResponse);
	fetchMock.get("/api/products?withAvailability=true", productsWithAvailabilityMockResponse);

	test("It should show product categories correctly", done => {
		const inner = async () => {
			render(<App />);

			await waitFor(() => screen.getAllByTestId("category"));
			const categories = await screen.getAllByTestId("category");
			expect(new Set(categories.map(categoryElement => categoryElement.textContent))).toEqual(
				new Set(categoriesMockResponse)
			);
		};
		inner().then(done);
	});

	test("It should show different products when clicking a category", done => {
		const inner = async () => {
			render(<App />);

			await waitFor(() => screen.getAllByTestId("category"));
			const categoryElements = await screen.getAllByTestId("category");

			const products = [];
			for (const categoryElement of categoryElements) {
				fireEvent.click(categoryElement);

				await waitFor(() => screen.getAllByTestId(`product-${categoryElement.textContent}`));
				await screen.getAllByTestId(`product-${categoryElement.textContent}`);
			}
		};

		inner().then(done);
	});
});
