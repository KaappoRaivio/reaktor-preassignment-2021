import styles from "../scss/Main.module.scss";
import Categories from "./Categories";
import Products from "./Products";
import React, { useState } from "react";

import { useHistory, useParams } from "react-router-dom";
import MyErrorBoundary from "./MyErrorBoundary";
import Error from "./Error";
import { usePollingRequest, useRequest } from "../hooks/CustomHooks";

const IS_DEVELOPMENT_ENVIRONMENT = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const API_ENDPOINT = IS_DEVELOPMENT_ENVIRONMENT ? "http://localhost:5000" : "";

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
