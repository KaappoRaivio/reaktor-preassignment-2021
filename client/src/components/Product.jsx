import styles from "./Product.module.scss";
import React from "react";
import Color from "./Color";

const stockStatusMap = {
	instock: "In stock",
	outofstock: "Out of stock",
	lessthan10: "Less than 10",
};

const Product = ({ name, id, price, manufacturer, stockState, loadingStockState, color }) => {
	let stockStatus = stockState[id];
	let grayOut = false;

	if (stockStatus == null) {
		grayOut = true;
		if (loadingStockState) {
			stockStatus = "Loading";
		} else {
			stockStatus = "No data";
		}
	}

	return (
		<div className={styles.product} key={id}>
			<div className={styles.content}>
				<div className={styles.name}>{name}</div>
				<div className={styles.manufacturer}>{manufacturer}</div>
				<div className={styles.price}>
					Price: <b>{price}</b>
				</div>
				<div className={`${styles.stockStatus} ${grayOut ? styles.grayOut : ""}`}>
					{stockStatusMap[stockStatus] || stockStatus}
				</div>
				<div className={styles.colors}>
					{color.map(_color => (
						<Color color={_color} />
					))}
				</div>
			</div>
		</div>
	);
};

export default Product;
