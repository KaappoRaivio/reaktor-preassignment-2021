import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Main from "./Main";

const App = props => (
	<Switch>
		<Route path={"/category/:URLCategory"} component={Main} />
		<Route path={"/"} render={() => <Redirect to={"/category/gloves"} />} />
	</Switch>
);

App.propTypes = {};

export default App;
