import React from "react";
import PropTypes from "prop-types";

import styles from "../scss/Color.module.scss";

const Color = ({ color }) => (
	<div className={styles.color}>
		<div className={styles.content} style={{ background: color }}>
			{/*{color}*/}
		</div>
	</div>
);

Color.propTypes = {
	color: PropTypes.string.isRequired,
};

export default Color;
