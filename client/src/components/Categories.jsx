import React from "react";

import styles from "./Categories.module.scss";

import { useHistory } from "react-router-dom";

const Categories = ({ categories, onCategoryClicked, selectedCategory }) => {
	// console.log(categories);
	const history = useHistory();
	return (
		<div>
			<p className={styles.title}>Categories</p>
			<div className={styles.categories}>
				{categories.map(category => (
					<div
						// onClick={() => onCategoryClicked(category)}
						onClick={() => history.push(`/categories/${category}`)}
						className={`${styles.category} ${selectedCategory === category ? styles.selected : ""}`}>
						{category}
					</div>
				))}
			</div>
		</div>
	);
};

export default Categories;
