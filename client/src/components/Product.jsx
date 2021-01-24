import styles from "../scss/Product.module.scss";
import React from "react";
import Color from "./Color";

import PropTypes from "prop-types";

const Product = ({ name, type, id, price, manufacturer, availability, color }) => {
	let grayOut = false;

	let availabilityElement;
	if (availability.loading) {
		availabilityElement = <div className={`${styles.availability} ${styles.grayOut}`}>Loading</div>;
	} else {
		availabilityElement = <div className={styles.availability}>{availability.availability}</div>;
	}

	return (
		<div className={styles.product} key={id} data-testid={"product"} role={"listitem"}>
			<div className={styles.content}>
				<div className={styles.name}>{name}</div>
				<div className={styles.manufacturer}>Manufacturer: {manufacturer}</div>
				<div className={styles.manufacturer}>Category: {type}</div>
				<div className={styles.price}>
					Price: <b>{price}</b>
				</div>
				{availabilityElement}
				<div className={styles.colors}>
					{color.map(_color => (
						<Color key={_color} color={_color} />
					))}
				</div>
			</div>
		</div>
	);
};

Product.propTypes = {
	name: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	id: PropTypes.string.isRequired,
	price: PropTypes.number.isRequired,
	manufacturer: PropTypes.string.isRequired,
	availability: PropTypes.shape({ loading: PropTypes.bool.isRequired, availability: PropTypes.string }).isRequired,
	color: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Product;
