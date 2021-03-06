import React from "react";
import PropTypes from "prop-types";

import styles from "../scss/Main.module.scss";
import Categories from "./Categories";
import Products from "./Products";
import MyErrorBoundary from "./MyErrorBoundary";

const Main = ({
	amountOfProductsToRender,
	onMoreProductsRequested,
	onCategoryClicked,
	products,
	categories,
	selectedCategoryIndex,
}) => {
	return (
		<div className={styles.columnContainer}>
			<div className={styles.categories}>
				<MyErrorBoundary>
					<Categories
						categories={categories}
						onCategoryClicked={onCategoryClicked}
						selectedCategory={selectedCategoryIndex}
					/>
				</MyErrorBoundary>
			</div>
			<div className={styles.products}>
				{products == null ? (
					<div>Loading products</div>
				) : (
					<MyErrorBoundary>
						<Products
							categories={categories}
							products={products}
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

Main.propTypes = {
	amountOfProductsToRender: PropTypes.number.isRequired,
	onMoreProductsRequested: PropTypes.func.isRequired,
	onCategoryClicked: PropTypes.func.isRequired,
	products: PropTypes.object,
	categories: PropTypes.arrayOf(PropTypes.string).isRequired,
	selectedCategoryIndex: PropTypes.number.isRequired,
};

export default Main;
