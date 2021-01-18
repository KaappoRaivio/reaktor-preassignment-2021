import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import Main from "./components/Main";
import MyErrorBoundary from "./components/MyErrorBoundary";
import PropTypes from "prop-types";
import { usePollingRequest, useRequest } from "./hooks/CustomHooks";
import Error from "./components/Error";

const IS_DEVELOPMENT_ENVIRONMENT = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const API_ENDPOINT = IS_DEVELOPMENT_ENVIRONMENT ? "http://localhost:5000" : "";

const App = ({}) => {
	const categoriesRequest = useRequest(`${API_ENDPOINT}/api/categories`);
	const productsRequest = usePollingRequest(`${API_ENDPOINT}/api/products/`, `${API_ENDPOINT}/api/jobs/`);

	const history = useHistory();
	const { categoryIndex } = useParams();

	const [amountOfProductsToRender, setAmountOfProductsToRender] = useState(100); // TODO
	const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(parseInt(categoryIndex) || 0);

	const onCategoryClicked = index => {
		setSelectedCategoryIndex(index);
		history.replace(`/category/${index}`);

		setAmountOfProductsToRender(100);
	};

	const onMoreProductsRequested = () => {
		setAmountOfProductsToRender(amountOfProductsToRender => amountOfProductsToRender + 100);
	};

	if (categoriesRequest.waiting) {
		return <div>Loading product categories</div>;
	}
	if (categoriesRequest.error) {
		console.error("categoriesRequest error");
		return <Error />;
	}

	if (productsRequest.error) {
		console.error("productsRequest error");
		return <Error />;
	}

	return (
		<MyErrorBoundary>
			<Main
				amountOfProductsToShow={amountOfProductsToRender}
				onMoreProductsRequested={onMoreProductsRequested}
				onCategoryClicked={onCategoryClicked}
				selectedCategoryIndex={selectedCategoryIndex}
				products={productsRequest.JSON}
				categories={categoriesRequest.JSON}
			/>
		</MyErrorBoundary>
	);
};

App.propTypes = {
	amountOfProductsToShow: PropTypes.number,
	amountOfProductsToIncrease: PropTypes.number,
};

export default App;
