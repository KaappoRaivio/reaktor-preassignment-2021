import React, { Component } from "react";

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

		return hasError ? <div>Something went wrong</div> : children;
	}
}

export default MyErrorBoundary;
