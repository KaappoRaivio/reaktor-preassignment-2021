import React, { Component } from "react";
import Error from "./Error";

class MyErrorBoundary extends Component {
	static propTypes = {};

	constructor(props) {
		super(props);

		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	render() {
		const { children } = this.props;
		const { hasError } = this.state;

		return hasError ? <Error /> : children;
	}
}

export default MyErrorBoundary;
