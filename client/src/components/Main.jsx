import styles from "../scss/Main.module.scss";
import Categories from "./Categories";
import Products from "./Products";
import React from "react";
import MyErrorBoundary from "./MyErrorBoundary";

const Main = ({
	amountOfProductsToShow,
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
							amountOfProductsToRender={amountOfProductsToShow}
						/>
					</MyErrorBoundary>
				)}
			</div>
		</div>
	);
};

export default Main;
