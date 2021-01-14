import styles from "../scss/Main.module.scss";
import Categories from "./Categories";
import Products from "./Products";
import React, { useEffect, useState } from "react";

import { useHistory, useParams } from "react-router-dom";
import MyErrorBoundary from "./MyErrorBoundary";

const IS_DEVELOPMENT_ENVIRONMENT = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const API_ENDPOINT = IS_DEVELOPMENT_ENVIRONMENT ? "http://localhost:5000" : "";

const useRequest = url => {
	const [waiting, setWaiting] = useState(true);
	const [JSON, setJSON] = useState(null);
	const [error, setError] = useState(null);
	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(url);
			if (response.status < 200 || response.status >= 300) {
				setError({ status: response.status, error: response.statusText });
				setWaiting(false);
				return;
			}

			const JSON = await response.json();
			setJSON(JSON);
			setWaiting(false);
		};
		fetchData();
	}, [url]);

	return { waiting, JSON, error };
};

const useCombinedRequest = (url1, url2) => {
	const request1 = useRequest(url1);
	const request2 = useRequest(url2);

	const [waiting, setWaiting] = useState(true);
	const [bothRequestsComplete, setBothRequestsComplete] = useState(false);
	const [JSON, setJSON] = useState(null);
	const [error, setError] = useState(null);

	if (request1.error && waiting) {
		setError(request1.error);
		setWaiting(false);
	}
	if (request2.error && waiting) {
		setError(request2.error);
		setWaiting(false);
	}

	if (!request1.waiting && request2.waiting && waiting) {
		setJSON(request1.JSON);
		setWaiting(false);
	}
	if (!request2.waiting && !bothRequestsComplete) {
		setJSON(request2.JSON);
		setBothRequestsComplete(true);
		setWaiting(false);
	}

	return { waiting, JSON, error };
};

const Main = () => {
	const categoriesRequest = useRequest(`${API_ENDPOINT}/api/categories`);
	const productsRequest = useCombinedRequest(
		`${API_ENDPOINT}/api/products`,
		`${API_ENDPOINT}/api/products?withAvailability=true`
	);

	const history = useHistory();
	const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
	const { URLCategory } = useParams();

	if (categoriesRequest.error) {
		return <div>Error retrieving product categories: {categoriesRequest.error.error}</div>;
	}

	const shouldUpdateSelectedCategoryFromURL =
		!categoriesRequest.waiting && URLCategory && URLCategory !== categoriesRequest.JSON[selectedCategoryIndex];
	if (shouldUpdateSelectedCategoryFromURL) {
		const index = categoriesRequest.JSON.indexOf(URLCategory);
		if (index !== -1) {
			setSelectedCategoryIndex(index);
		}
	}

	const onCategoryClicked = index => {
		setSelectedCategoryIndex(index);
		if (!categoriesRequest.waiting) {
			history.push(`/category/${categoriesRequest.JSON[index]}`);
		}
	};

	return (
		<div className={styles.columnContainer}>
			<div className={styles.categories}>
				<MyErrorBoundary>
					<Categories
						categories={categoriesRequest}
						onCategoryClicked={onCategoryClicked}
						selectedCategory={selectedCategoryIndex}
					/>
				</MyErrorBoundary>
			</div>
			<div className={styles.products}>
				{!categoriesRequest.waiting ? (
					productsRequest.error ? (
						<div>Something went wrong</div>
					) : (
						<MyErrorBoundary>
							<Products
								loadingProducts={productsRequest.waiting}
								categories={categoriesRequest.JSON}
								products={productsRequest.JSON?.products}
								selectedCategory={selectedCategoryIndex}
							/>
						</MyErrorBoundary>
					)
				) : null}
			</div>
		</div>
	);
};

export default Main;
