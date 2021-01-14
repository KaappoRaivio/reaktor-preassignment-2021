import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Main from "./components/Main";
import MyErrorBoundary from "./components/MyErrorBoundary";

const App = props => (
	<Switch>
		<Route path={"/category/:URLCategory"} component={Main} />
		<Route path={"/"} render={() => <Redirect to={"/category/ "} />} />
	</Switch>
);

App.propTypes = {};

export default App;
