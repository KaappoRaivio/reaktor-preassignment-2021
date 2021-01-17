import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Main from "./components/Main";
import MyErrorBoundary from "./components/MyErrorBoundary";

const App = ({ amountOfProductsToShow, amountOfProductsToIncrease }) => (
	<BrowserRouter>
		<MyErrorBoundary>
			<Switch>
				<Route
					path={"/category/:URLCategory"}
					render={() => (
						<Main
							amountOfProductsToShow={amountOfProductsToShow || 100}
							amountOfProductsToIncrease={amountOfProductsToIncrease || 100}
						/>
					)}
				/>
				<Route path={"/"} render={() => <Redirect to={"/category/ "} />} />
			</Switch>
		</MyErrorBoundary>
	</BrowserRouter>
);

App.propTypes = {};

export default App;
