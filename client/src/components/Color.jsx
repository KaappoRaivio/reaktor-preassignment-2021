import React from "react";

import styles from "./Color.module.scss";

const Color = ({ color }) => (
	<div className={styles.color}>
		<div className={styles.content} style={{ background: color }}>
			{/*{color}*/}
		</div>
	</div>
);

Color.propTypes = {};

export default Color;
