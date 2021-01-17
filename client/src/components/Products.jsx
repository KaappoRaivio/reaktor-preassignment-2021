import React from "react";

import styles from "../scss/Products.module.scss";
import Product from "./Product";
import PropTypes from "prop-types";

const Products = ({ products, categories, selectedCategory, amountOfProductsToRender, onMoreProductsRequested }) => {
	const _products = products[categories[selectedCategory]];
	return (
		<div>
			<p className={styles.title}>Products</p>
			<div className={styles.productFlexbox}>
				{_products.slice(0, Math.min(amountOfProductsToRender, _products.length)).map(product => {
					return <Product key={product.id} {...product} />;
				})}
			</div>
			<div className={styles.loadMore}>
				<button onClick={() => onMoreProductsRequested(100)}>Load more</button>
			</div>
		</div>
	);
};

Products.propTypes = {
	products: PropTypes.object,
	categories: PropTypes.arrayOf(PropTypes.string).isRequired,
	selectedCategory: PropTypes.number.isRequired,
};

export default Products;
