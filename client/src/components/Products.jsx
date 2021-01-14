import React from "react";

import styles from "../scss/Products.module.scss";
import Product from "./Product";
import PropTypes from "prop-types";

const Products = ({ loadingProducts, products, categories, selectedCategory }) => {
	if (loadingProducts) {
		return <div>loading</div>;
	} else {
		return (
			<div>
				<p className={styles.title}>Products</p>
				<div className={styles.productFlexbox}>
					{products[categories[selectedCategory]].slice(0, 1000).map(product => {
						return <Product key={product.id} {...product} />;
					})}
				</div>
			</div>
		);
	}
};

Products.propTypes = {
	loadingProducts: PropTypes.bool.isRequired,
	products: PropTypes.object,
	categories: PropTypes.arrayOf(PropTypes.string).isRequired,
	selectedCategory: PropTypes.number.isRequired,
};

export default Products;
