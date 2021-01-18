import styles from "../scss/Main.module.scss";
import Categories from "./Categories";
import Products from "./Products";
import React, { useEffect, useRef, useState } from "react";

import { useHistory, useParams } from "react-router-dom";
import MyErrorBoundary from "./MyErrorBoundary";
import Error from "./Error";

const IS_DEVELOPMENT_ENVIRONMENT = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const API_ENDPOINT = IS_DEVELOPMENT_ENVIRONMENT ? "http://localhost:5000" : "";

const useRequest = (url, { retries = 3 } = {}) => {
	const [retriesLeft, setRetriesLeft] = useState(retries);
	const [waiting, setWaiting] = useState(true);
	const [JSON, setJSON] = useState(null);
	const [error, setError] = useState(null);

	const [didCancel, setDidCancel] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(url);
			if (!didCancel) {
				if (response.status < 200 || response.status >= 300) {
					if (retriesLeft > 0) {
						setRetriesLeft(retriesLeft => retriesLeft - 1);
						return fetchData();
					} else {
						setError({ status: response.status, error: response.statusText });
						setWaiting(false);
						return;
					}
				}

				const JSON = await response.json();
				setJSON(JSON);
				setWaiting(false);
			}
		};
		fetchData();

		return () => {
			setDidCancel(true);
		};
	}, [url, didCancel, retriesLeft]);

	return { waiting, JSON, error };
};

const useInterval = (callback, delay) => {
	const savedCallback = useRef();
	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		const tick = () => savedCallback.current();

		if (delay != null) {
			const id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [callback, delay]);
};

const usePollingRequest = pollingInitialisationURL => {
	const { waiting: pollingInitialisationWaiting, JSON, error: pollingInitializationError } = useRequest(
		pollingInitialisationURL
	);
	const [UUID, setUUID] = useState(null);
	const [finished, setFinished] = useState(false);
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);

	if (!pollingInitialisationWaiting && UUID == null) {
		setUUID(JSON.uuid);
	}

	useInterval(
		async () => {
			if (UUID) {
				const response = await fetch(`${API_ENDPOINT}/api/jobs/${UUID}`);
				if (response.status < 200 || response.status >= 300) {
					return;
				}
				const { finished, hasNewData, data } = await response.json();
				// console.log(finished, hasNewData, data);
				setFinished(finished);

				if (hasNewData) {
					setData(data);
				}
			}
		},
		finished ? null : 1000
	);

	return { waiting: data == null, JSON: data, error: error || pollingInitializationError };
};

const Main = ({ amountOfProductsToShow, amountOfProductsToIncrease }) => {
	const categoriesRequest = useRequest(`${API_ENDPOINT}/api/categories`);
	const productsRequest = usePollingRequest(`${API_ENDPOINT}/api/products`);

	const history = useHistory();
	const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
	const { URLCategory } = useParams();

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

		setAmountOfProductsToRender(amountOfProductsToShow);
	};

	const [amountOfProductsToRender, setAmountOfProductsToRender] = useState(amountOfProductsToShow);
	const onMoreProductsRequested = () => {
		setAmountOfProductsToRender(amountOfProductsToRender => amountOfProductsToRender + amountOfProductsToIncrease);
	};

	if (categoriesRequest.waiting) {
		return <div>Loading product categories</div>;
	}
	if (categoriesRequest.error) {
		return <Error />;
	}

	return (
		<div className={styles.columnContainer}>
			<div className={styles.categories}>
				<MyErrorBoundary>
					<Categories
						categories={categoriesRequest.JSON}
						onCategoryClicked={onCategoryClicked}
						selectedCategory={selectedCategoryIndex}
					/>
				</MyErrorBoundary>
			</div>
			<div className={styles.products}>
				{productsRequest.waiting ? (
					<div>Loading products</div>
				) : (
					<MyErrorBoundary>
						<Products
							categories={categoriesRequest.JSON}
							products={productsRequest.JSON}
							selectedCategory={selectedCategoryIndex}
							onMoreProductsRequested={onMoreProductsRequested}
							amountOfProductsToRender={amountOfProductsToRender}
						/>
					</MyErrorBoundary>
				)}
			</div>
		</div>
	);
};

export default Main;
