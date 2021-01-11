import styles from "./App.module.scss";
import Categories from "./components/Categories";
import Products from "./components/Products";
import { PRODUCT_CATEGORIES, getCategory, getAvailability, getManufacturers } from "./client/ApiClient";
import { useDebugValue, useEffect, useMemo, useState } from "react";

import { useParams } from "react-router-dom";

const useRequest = () => {
	const [loadingProducts, setLoadingProducts] = useState(true);
	const [loadingStockState, setLoadingStockStatus] = useState(true);
	const [products, setProducts] = useState({});
	const [stockState, setStockState] = useState({});
	const [stockLoadingStarted, setStockLoadingStarted] = useState(false);

	useEffect(() => {
		const promises = PRODUCT_CATEGORIES.map(getCategory);
		let counter = 0;
		let onFulfilled = result => {
			setProducts(oldProducts => ({ ...oldProducts, [result.category]: result.products }));
			counter += 1;
			if (counter === promises.length) {
				setLoadingProducts(false);
			}
		};
		for (const promise of promises) {
			promise.then(onFulfilled);
		}
	}, []);

	useEffect(() => {
		console.log(loadingProducts, stockLoadingStarted);
		if (!loadingProducts && !stockLoadingStarted) {
			setStockLoadingStarted(true);
			const manufacturers = getManufacturers(products);
			console.log(manufacturers);
			const promises = manufacturers.map(getAvailability);
			let counter = 0;
			let onFulfilled = result => {
				setStockState(oldState => {
					console.log(oldState, result, Object.keys(oldState).length);
					return { ...oldState, ...result };
				});
				counter += 1;
				if (counter === promises.length) {
					setLoadingStockStatus(false);
				}
			};

			for (const promise of promises) {
				promise.then(onFulfilled);
			}
		}
	}, [loadingProducts, products, stockState, loadingStockState, stockLoadingStarted]);

	return { loadingProducts, products, loadingStockState, stockState, error: null };
};

const App = () => {
	const [selectedCategory, setSelectedCategory] = useState(PRODUCT_CATEGORIES[0]);

	const category = useParams()?.category?.toLowerCase();
	if (category && selectedCategory !== category && category in PRODUCT_CATEGORIES) {
		setSelectedCategory(category);
	}

	const { loadingProducts, products, loadingStockState, stockState, error } = useRequest();
	// const loadingProducts = false;
	// const error = null;
	// const products = {
	// 	beanies: [
	// 		{
	// 			id: "e7b28caea36a39eddb0a",
	// 			type: "gloves",
	// 			name: "VEUPÄN TREE",
	// 			color: ["black"],
	// 			price: 44,
	// 			manufacturer: "hennex",
	// 		},
	// 		{
	// 			id: "8ca48a85f3d5b45e2949b",
	// 			type: "gloves",
	// 			name: "OOTSOPHEM TYRANNUS",
	// 			color: ["black"],
	// 			price: 27,
	// 			manufacturer: "okkau",
	// 		},
	// 		{
	// 			id: "d720a424aa4bf49211f",
	// 			type: "gloves",
	// 			name: "REVÄNÖIS TREE MAGIC",
	// 			color: ["grey"],
	// 			price: 679,
	// 			manufacturer: "niksleh",
	// 		},
	// 		{
	// 			id: "5df739fb9fdd504616",
	// 			type: "gloves",
	// 			name: "DALTAISOP EARTH",
	// 			color: ["purple"],
	// 			price: 70,
	// 			manufacturer: "laion",
	// 		},
	// 		{
	// 			id: "e7b28caea36a39eddb0a",
	// 			type: "gloves",
	// 			name: "VEUPÄN TREE",
	// 			color: ["black"],
	// 			price: 44,
	// 			manufacturer: "hennex",
	// 		},
	// 		{
	// 			id: "8ca48a85f3d5b45e2949b",
	// 			type: "gloves",
	// 			name: "OOTSOPHEM TYRANNUS",
	// 			color: ["black"],
	// 			price: 27,
	// 			manufacturer: "okkau",
	// 		},
	// 		{
	// 			id: "d720a424aa4bf49211f",
	// 			type: "gloves",
	// 			name: "REVÄNÖIS TREE MAGIC",
	// 			color: ["grey"],
	// 			price: 679,
	// 			manufacturer: "niksleh",
	// 		},
	// 		{
	// 			id: "5df739fb9fdd504616",
	// 			type: "gloves",
	// 			name: "DALTAISOP EARTH",
	// 			color: ["purple"],
	// 			price: 70,
	// 			manufacturer: "laion",
	// 		},
	// 	],
	// };

	return (
		<div className={styles.columnContainer}>
			<div className={styles.categories}>
				<Categories
					categories={PRODUCT_CATEGORIES}
					onCategoryClicked={setSelectedCategory}
					selectedCategory={selectedCategory}
				/>
			</div>
			<div className={styles.products}>
				<Products
					loadingProducts={loadingProducts}
					products={products}
					loadingStockState={loadingStockState}
					stockState={stockState}
					error={error}
					selectedCategory={selectedCategory}
				/>
			</div>
		</div>
	);
};

export default App;
