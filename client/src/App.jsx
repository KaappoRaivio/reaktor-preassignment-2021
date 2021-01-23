import React, { useState, useEffect } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import Main from "./components/Main";
import MyErrorBoundary from "./components/MyErrorBoundary";
import PropTypes from "prop-types";
import { usePollingRequest, useRequest } from "./hooks/CustomHooks";
import Error from "./components/Error";

const IS_DEVELOPMENT_ENVIRONMENT = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const API_ENDPOINT = IS_DEVELOPMENT_ENVIRONMENT ? "http://localhost:5000" : "";

const useQuery = () => {
	return new URLSearchParams(useLocation().search);
};

const replaceURL = (history, categoryIndex, amountOfProductsToRender) => {
	history.replace(`/category/${categoryIndex}?show=${amountOfProductsToRender}`);
};

const App = props => {
	const categoriesRequest = useRequest(`${API_ENDPOINT}/api/categories/`);
	const productsRequest = usePollingRequest(`${API_ENDPOINT}/api/products/`, `${API_ENDPOINT}/api/jobs/`);

	const history = useHistory();
	const { categoryIndex } = useParams();
	const amountOfProductsToRenderFromURL = parseInt(useQuery().get("show"));

	const [amountOfProductsToRender, setAmountOfProductsToRender] = useState(
		amountOfProductsToRenderFromURL > 0 ? amountOfProductsToRenderFromURL : 100
	);
	const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(parseInt(categoryIndex) || 0);

	useEffect(() => {
		replaceURL(history, selectedCategoryIndex, amountOfProductsToRender);
	}, [selectedCategoryIndex, amountOfProductsToRender]);

	const onCategoryClicked = index => {
		const newAmount = props.amountOfProductsToRender || 100;
		setSelectedCategoryIndex(index);
		setAmountOfProductsToRender(newAmount);
	};

	const onMoreProductsRequested = () => {
		setAmountOfProductsToRender(x => x + (props.amountOfProductsToIncrease || 100));
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
				amountOfProductsToRender={amountOfProductsToRender}
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
	amountOfProductsToIncrease: PropTypes.number,
};

export default App;
