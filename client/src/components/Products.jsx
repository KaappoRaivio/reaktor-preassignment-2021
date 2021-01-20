import React from "react";

import styles from "../scss/Products.module.scss";
import Product from "./Product";
import PropTypes from "prop-types";

const Products = ({ products, categories, selectedCategory, amountOfProductsToRender, onMoreProductsRequested }) => {
	const _products = products[categories[selectedCategory]];
	return (
		<div>
			<p className={styles.title}>Products</p>
			<div className={styles.productFlexbox} role={"list"}>
				{_products.slice(0, Math.min(amountOfProductsToRender, _products.length)).map(product => (
					<Product key={product.id} {...product} />
				))}
			</div>
			<div className={styles.loadMore}>
				<button disabled={amountOfProductsToRender >= _products.length} onClick={onMoreProductsRequested}>
					Load more
				</button>
			</div>
		</div>
	);
};

Products.propTypes = {
	products: PropTypes.object,
	categories: PropTypes.arrayOf(PropTypes.string).isRequired,
	selectedCategory: PropTypes.number.isRequired,
	amountOfProductsToRender: PropTypes.number.isRequired,
};

export default Products;
