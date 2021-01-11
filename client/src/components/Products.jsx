import React from "react";

import styles from "./Products.module.scss";
import Product from "./Product";

const Products = ({ loadingProducts, products, categories, selectedCategory }) => {
	console.log(products);
	if (loadingProducts) {
		return <div>loading</div>;
	} else {
		return (
			<div>
				<p className={styles.title}>Products</p>
				<div className={styles.productFlexbox}>
					{products[categories[selectedCategory]].slice(0, 1000).map(product => {
						return <Product {...product} />;
					})}
				</div>
			</div>
		);
	}
};

Products.propTypes = {};

export default Products;
