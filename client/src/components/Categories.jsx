import React from "react";

import styles from "./Categories.module.scss";

import { useHistory } from "react-router-dom";

const Categories = ({ categories, onCategoryClicked, selectedCategory }) => {
	return (
		<div>
			<p className={styles.title}>Categories</p>
			<div className={styles.categories}>
				{!categories.waiting
					? categories.json.map((category, index) => (
							<div
								// onClick={() => onCategoryClicked(category)}
								key={category}
								onClick={() => onCategoryClicked(index)}
								className={`${styles.category} ${selectedCategory === index ? styles.selected : ""}`}>
								{category}
							</div>
					  ))
					: null}
			</div>
		</div>
	);
};

export default Categories;
