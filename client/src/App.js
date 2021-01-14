import styles from "./App.module.scss";
import Categories from "./components/Categories";
import Products from "./components/Products";
import React, { useEffect, useState } from "react";

import { useHistory, useParams } from "react-router-dom";

const IS_DEVELOPMENT_ENVIRONMENT = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const API_ENDPOINT = IS_DEVELOPMENT_ENVIRONMENT ? "http://localhost:5000" : "";

const useRequest = url => {
	const [waiting, setWaiting] = useState(true);
	const [json, setJSON] = useState({});
	const [error, setError] = useState(null);
	useEffect(async () => {
		const response = await fetch(url);
		if (response.status < 200 || response.status >= 300) {
			setError({ status: response.status, error: response.statusText });
			setWaiting(false);
			return;
		}

		const json = await response.json();
		console.log(json);
		setJSON(json);
		setWaiting(false);
	}, [url]);

	return { waiting, json, error };
};

const App = () => {
	const categoriesRequest = useRequest(`${API_ENDPOINT}/api/categories`);
	const productsRequest = useRequest(`${API_ENDPOINT}/api/products`);
	const productsAndAvailabilityRequest = useRequest(`${API_ENDPOINT}/api/products?withAvailability=true`);

	let products = {};
	if (!productsAndAvailabilityRequest.waiting) {
		products = productsAndAvailabilityRequest.json.products;
	} else {
		products = productsRequest.json?.products;
	}
	const waitingForProducts = productsRequest.waiting && productsAndAvailabilityRequest.waiting;

	const history = useHistory();
	const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
	const { URLCategory } = useParams();
	if (!categoriesRequest.waiting && URLCategory && URLCategory !== categoriesRequest.json[selectedCategoryIndex]) {
		const index = categoriesRequest.json.indexOf(URLCategory);
		if (index !== -1) {
			setSelectedCategoryIndex(index);
		}
	}

	const onCategoryClicked = index => {
		setSelectedCategoryIndex(index);
		if (!categoriesRequest.waiting) {
			history.push(`/category/${categoriesRequest.json[index]}`);
		}
	};

	return (
		<div className={styles.columnContainer}>
			<div className={styles.categories}>
				<Categories
					categories={categoriesRequest}
					onCategoryClicked={onCategoryClicked}
					selectedCategory={selectedCategoryIndex}
				/>
			</div>
			<div className={styles.products}>
				{!categoriesRequest.waiting ? (
					<Products
						loadingProducts={waitingForProducts}
						categories={categoriesRequest.json}
						products={products}
						selectedCategory={selectedCategoryIndex}
					/>
				) : null}
			</div>
		</div>
	);
};

export default App;
