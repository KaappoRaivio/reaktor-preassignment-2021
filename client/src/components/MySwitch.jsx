import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Main from "./Main";

const MySwitch = ({ children }) => (
	<Switch>
		<Route path={"/category/:categoryIndex"} render={() => children} />
		<Route path={"/"} render={() => <Redirect to={"/category/0"} />} />
	</Switch>
);

MySwitch.propTypes = {};

export default MySwitch;
