import styles from "./Product.module.scss";
import React from "react";
import Color from "./Color";

const Product = ({ name, id, price, manufacturer, availability, color }) => {
	let grayOut = false;

	return (
		<div className={styles.product} key={id}>
			<div className={styles.content}>
				<div className={styles.name}>{name}</div>
				<div className={styles.manufacturer}>{manufacturer}</div>
				<div className={styles.price}>
					Price: <b>{price}</b>
				</div>
				<div className={`${styles.stockStatus} ${grayOut ? styles.grayOut : ""}`}>{availability}</div>
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
