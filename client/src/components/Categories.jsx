import React from "react";

import styles from "../scss/Categories.module.scss";

import { useHistory } from "react-router-dom";

const Categories = ({ categories, onCategoryClicked, selectedCategory }) => {
	return (
		<div>
			<p className={styles.title}>Categories</p>
			<div className={styles.categories}>
				{categories.map((category, index) => (
					<button
						data-testid={"category"}
						key={category}
						onClick={() => onCategoryClicked(index)}
						className={`${styles.category} ${selectedCategory === index ? styles.selected : ""}`}>
						{category}
					</button>
				))}
			</div>
		</div>
	);
};

export default Categories;
