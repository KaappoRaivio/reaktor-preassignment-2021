import React from "react";

import styles from "./Products.module.scss";
import Product from "./Product";

const Products = ({ loadingProducts, products, loadingStockState, stockState, error, selectedCategory }) => {
	if (loadingProducts) {
		return <div>loading</div>;
	} else {
		// console.log(products);
		return (
			<div>
				<p className={styles.title}>Products</p>
				<div className={styles.productFlexbox}>
					{products[selectedCategory].slice(0, 1000).map(product => {
						return <Product {...product} stockState={stockState} loadingStockState={loadingStockState} />;
					})}
				</div>
			</div>
		);
	}
};

Products.propTypes = {};

export default Products;
