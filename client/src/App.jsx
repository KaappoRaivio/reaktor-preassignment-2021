import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Main from "./components/Main";
import MyErrorBoundary from "./components/MyErrorBoundary";

const App = props => (
	<BrowserRouter>
		<MyErrorBoundary>
			<Switch>
				<Route path={"/category/:URLCategory"} component={Main} />
				<Route path={"/"} render={() => <Redirect to={"/category/ "} />} />
			</Switch>
		</MyErrorBoundary>
	</BrowserRouter>
);

App.propTypes = {};

export default App;
