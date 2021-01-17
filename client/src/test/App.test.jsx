import React from "react";

import { act, screen } from "@testing-library/react";
import App from "../App";

import renderWithRouter from "./TestUtils";
import supertest from "supertest";

jest.mock("node-fetch", () => require("fetch-mock-jest"));
import fetchMock from "fetch-mock";
import Main from "../components/Main";
import { fireEvent, wait, waitFor, waitForElement } from "@testing-library/dom";

import categoriesMockResponse from "./mockRequestData/categories.json";
import productsMockResponse from "./mockRequestData/products.json";
import productsWithAvailabilityMockResponse from "./mockRequestData/productsWithAvailability.json";
import { BrowserRouter, MemoryRouter, Router } from "react-router-dom";
import { createMemoryHistory } from "history";

describe("Test the app", () => {
	fetchMock.get("/api/categories", categoriesMockResponse);
	fetchMock.get("/api/products", productsMockResponse);
	fetchMock.get("/api/products?withAvailability=true", productsWithAvailabilityMockResponse);

	test("It should show product categories correctly", done => {
		const inner = async () => {
			renderWithRouter(<App />);

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
			renderWithRouter(<App />);

			await waitFor(() => screen.getAllByRole("button", { name: /^(?!load more).*$/i }));
			const categoryElements = await screen.getAllByRole("button", { name: /^(?!load more).*$/i });

			const products = [];
			for (const categoryElement of categoryElements) {
				fireEvent.click(categoryElement);

				await waitFor(() => screen.getAllByText(/^Category: /i));
				const productElementCategories = await screen.getAllByText(/^Category: /i);
				productElementCategories.map(productElementCategory =>
					expect(productElementCategory.textContent).toMatch(categoryElement.textContent)
				);
			}
		};

		inner().then(done);
	});

	test("It should show more products when requested", done => {
		const inner = async () => {
			renderWithRouter(<App amountOfProductsToShow={3} amountOfProductsToIncrease={2} />);

			await waitFor(() => screen.getAllByRole("listitem"));
			const productElementsBefore = await screen.getAllByRole("listitem");
			expect(productElementsBefore).toHaveLength(3);

			const showMore = await screen.getByRole("button", { name: /load more/i });
			fireEvent.click(showMore);
			fireEvent.click(showMore);
			const productElementsAfter = await screen.getAllByRole("listitem");
			expect(productElementsAfter).toHaveLength(7);
		};
		inner().then(done);
	});

	test("It should not try to show more products than it has", done => {
		const inner = async () => {
			renderWithRouter(<App amountOfProductsToShow={7} amountOfProductsToIncrease={100} />);

			await waitFor(() => screen.getAllByRole("listitem"));
			const productElementsBefore = await screen.getAllByRole("listitem");
			expect(productElementsBefore).toHaveLength(7);

			const showMore = await screen.getByRole("button", { name: /load more/i });
			fireEvent.click(showMore);
			fireEvent.click(showMore);
			const productElementsAfter = await screen.getAllByRole("listitem");
			expect(productElementsAfter).toHaveLength(productsMockResponse.products.beanies.length);

			const showMoreAfter = await screen.getByRole("button", { name: /load more/i });
			expect(showMoreAfter).toBeDisabled();
		};
		inner().then(done);
	});

	test("It should reset the amount of products shown when changing categories", done => {
		const inner = async () => {
			const initialLength = 7;
			const increase = 1;

			renderWithRouter(<App amountOfProductsToShow={initialLength} amountOfProductsToIncrease={increase} />);

			await waitFor(() => screen.getByRole("button", { name: /load more/i }));
			const showMore = await screen.getByRole("button", { name: /load more/i });
			fireEvent.click(showMore);

			const productElementsBefore = await screen.getAllByRole("listitem");
			expect(productElementsBefore).toHaveLength(initialLength + increase);

			await waitFor(() => screen.getAllByRole("button", { name: /^(?!load more).*$/i }));
			const categoryElements = await screen.getAllByRole("button", { name: /^(?!load more).*$/i });
			// console.log(categoryElements);
			fireEvent.click(categoryElements[1]);
			//
			// waitFor(() => screen.getAllByRole("listitem"));
			const productElementsAfter = await screen.getAllByRole("listitem");
			expect(productElementsAfter).toHaveLength(initialLength);
		};
		inner().then(done);
	});
});

describe("Test the routing", () => {
	test("It should redirect to /products/ when URL path is '/'", done => {
		const inner = async () => {
			renderWithRouter(<App />, { route: "/" });

			await waitFor(() => screen.getByRole("button", { name: /load more/i }));
			expect(location.pathname).toBe("/category/");
		};
		inner().then(done);
	});

	test("It should redirect to /products/ when URL path is garbage", done => {
		const inner = async () => {
			renderWithRouter(<App />, { route: "/never/gonna/give/you/up/" });

			await waitFor(() => screen.getByRole("button", { name: /load more/i }));
			expect(location.pathname).toBe("/category/");
		};
		inner().then(done);
	});

	test("It should select the corresponding category from URL param", done => {
		renderWithRouter(<App />, { route: "/category/facemasks/" });

		const inner = async () => {
			await waitFor(() => screen.getAllByText(/^Category: /i));
			const productElements = await screen.getAllByText(/^Category: /i);
			expect(productElements[0].textContent).toEqual("Category: facemasks");
		};

		inner().then(done);
	});

	test("It should handle invalid URL param gracefully", done => {
		renderWithRouter(<App />, { route: "/category/xyzzy/" });

		const inner = async () => {
			await waitFor(() => screen.getAllByText(/^Category: /i));
		};

		inner().then(done);
	});
});
