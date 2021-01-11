import styles from "./App.module.scss";
import Categories from "./components/Categories";
import Products from "./components/Products";
import { useDebugValue, useEffect, useMemo, useState } from "react";

import { useParams, useHistory } from "react-router-dom";

const API_ENDPOINT = !process.env.NODE_ENV || process.env.NODE_ENV === "development" ? "http://localhost:5000" : "";

const useRequest = url => {
	const [waiting, setWaiting] = useState(true);
	const [json, setJSON] = useState({});
	const [error, setError] = useState(null);
	useEffect(() => {
		fetch(url)
			.then(res => res.json())
			.then(json => {
				console.log("Moi");
				console.log(json);
				setJSON(json);
				setWaiting(false);
			});
		// .catch(setError);
	}, [url]);

	return { waiting, json, error };
};

const App = () => {
	const categories = useRequest(`${API_ENDPOINT}/api/categories`);
	const products = useRequest(`${API_ENDPOINT}/api/products`);
	const [selectedCategory, setSelectedCategory] = useState(0);

	const history = useHistory();

	const { URLCategory } = useParams();
	if (!categories.waiting && URLCategory && URLCategory !== categories.json[selectedCategory]) {
		const index = categories.json.indexOf(URLCategory);
		if (index !== -1) {
			setSelectedCategory(index);
		}
	}

	const onCategoryClicked = index => {
		setSelectedCategory(index);
		if (!categories.waiting) {
			history.replace(`/category/${categories.json[index]}`);
		}
	};

	return (
		<div className={styles.columnContainer}>
			<div className={styles.categories}>
				<Categories
					categories={categories}
					onCategoryClicked={onCategoryClicked}
					selectedCategory={selectedCategory}
				/>
			</div>
			<div className={styles.products}>
				{!categories.waiting ? (
					<Products
						loadingProducts={products.waiting}
						categories={categories.json}
						products={products.json}
						selectedCategory={selectedCategory}
					/>
				) : null}
			</div>
		</div>
	);
};

export default App;
