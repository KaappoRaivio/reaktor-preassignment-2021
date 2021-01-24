import React from "react";

import { act, screen } from "@testing-library/react";
import App from "../App";

import renderWithRouter from "./TestUtils";
import fetchMock from "fetch-mock";
import { fireEvent, waitFor } from "@testing-library/dom";

import categoriesMockResponse from "./mockRequestData/categories.json";
import productsMockResponse from "./mockRequestData/products.json";
import jobMockResponse from "./mockRequestData/jobs.json";

jest.mock("node-fetch", () => require("fetch-mock-jest"));

describe("Test the app", () => {
	fetchMock.get("/api/categories/", categoriesMockResponse);
	fetchMock.get("/api/products/", productsMockResponse);
	fetchMock.get("/api/jobs/7ec4623d-5f4e-4815-b5f5-c1771a8a0d46", jobMockResponse);
	test("It should show product categories correctly", done => {
		const inner = async () => {
			renderWithRouter(<App />);

			const categories = await waitFor(() => screen.getAllByTestId("category"));
			expect(new Set(categories.map(categoryElement => categoryElement.textContent))).toEqual(
				new Set(categoriesMockResponse)
			);
		};
		inner().then(done);
	});
	//
	test("It should show different products when clicking a category", done => {
		const inner = async () => {
			// await act(async () => {
			renderWithRouter(<App />);
			// renderWithRouter(<App amountOfProductsToRender={3} amountOfProductsToIncrease={2} />);
			// });

			const categoryElements = await waitFor(() => screen.getAllByRole("button", { name: /^(?!load more).*$/i }));

			const products = [];
			for (const categoryElement of categoryElements) {
				fireEvent.click(categoryElement);

				const productElementCategories = await waitFor(() => screen.getAllByText(/^Category: /i));
				productElementCategories.map(productElementCategory =>
					expect(productElementCategory.textContent).toMatch(categoryElement.textContent)
				);
			}
		};

		inner().then(done);
	});
	//
	test("It should show more products when requested", done => {
		const inner = async () => {
			await act(async () => {
				renderWithRouter(<App amountOfProductsToIncrease={2} />, { route: "/category/0?show=3" });
			});

			const productElementsBefore = await waitFor(() => screen.getAllByRole("listitem"));
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
			await act(async () => {
				renderWithRouter(<App amountOfProductsToIncrease={100} />, { route: "/category/0?show=7" });
			});

			const productElementsBefore = await waitFor(() => screen.getAllByRole("listitem"));
			expect(productElementsBefore).toHaveLength(7);

			const showMore = await screen.getByRole("button", { name: /load more/i });
			fireEvent.click(showMore);
			fireEvent.click(showMore);
			const productElementsAfter = await screen.getAllByRole("listitem");
			expect(productElementsAfter).toHaveLength(jobMockResponse.data.beanies.length);

			const showMoreAfter = await screen.getByRole("button", { name: /load more/i });
			expect(showMoreAfter).toBeDisabled();
		};
		inner().then(done);
	});

	test("It should reset the amount of products shown when changing categories", done => {
		const inner = async () => {
			const initialLength = 7;
			const increase = 1;
			await act(async () => {
				renderWithRouter(
					<App amountOfProductsToRender={initialLength} amountOfProductsToIncrease={increase} />,
					{
						route: `/category/0?show=${initialLength}`,
					}
				);
			});
			await waitFor(() => screen.getAllByRole("listitem"));
			const showMore = await waitFor(() => screen.getByRole("button", { name: /load more/i }));
			fireEvent.click(showMore);

			const productElementsBefore = await waitFor(() => screen.getAllByRole("listitem"));
			expect(productElementsBefore).toHaveLength(initialLength + increase);

			const categoryElements = await waitFor(() => screen.getAllByRole("button", { name: /^(?!load more).*$/i }));
			fireEvent.click(categoryElements[1]);
			// //

			const productElementsAfter = await waitFor(() => screen.getAllByRole("listitem"));
			expect(productElementsAfter).toHaveLength(initialLength);
		};
		inner().then(done);
	});

	test("It should use a value from URL query param if available", done => {
		const inner = async () => {
			await act(async () => {
				renderWithRouter(<App />, { route: "/category/0?show=4" });
			});

			const productElements = await waitFor(() => screen.getAllByRole("listitem"));
			expect(productElements).toHaveLength(4);
		};
		inner().then(done);
	});
});

describe("Test the routing", () => {
	test("It should redirect to /products/ when URL path is '/'", done => {
		const inner = async () => {
			await act(async () => {
				renderWithRouter(<App />, { route: "/" });
			});
			await waitFor(() => screen.getByRole("button", { name: /load more/i }));
			expect(location.pathname).toMatch("/category/0");
		};
		inner().then(done);
	});

	test("It should redirect to /products/ when URL path is garbage", done => {
		const inner = async () => {
			await act(async () => {
				renderWithRouter(<App />, { route: "/never/gonna/give/you/up/" });
			});

			await waitFor(() => screen.getByRole("button", { name: /load more/i }));
			expect(location.pathname).toMatch("/category/0");
		};
		inner().then(done);
	});

	test("It should select the corresponding category from URL param", done => {
		const inner = async () => {
			await act(async () => {
				renderWithRouter(<App />, { route: "/category/1" });
			});
			await waitFor(() => screen.getAllByText(/^Category: /i));
			const productElements = await screen.getAllByText(/^Category: /i);

			expect(productElements[0].textContent).toEqual("Category: facemasks");
		};

		inner().then(done);
	});

	test("It should handle invalid URL param gracefully", done => {
		const inner = async () => {
			await act(async () => {
				renderWithRouter(<App />, { route: "/category/null/" });
			});
			await waitFor(() => screen.getAllByText(/^Category: /i));
		};

		inner().then(done);
	});
});
