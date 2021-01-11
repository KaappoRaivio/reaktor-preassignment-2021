import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
// import Switch from "react-router-dom";
// import Route from "react-router-dom";

ReactDOM.render(
	<React.StrictMode>
		<Router>
			{/*<App />*/}
			<Switch>
				<Route path={"/category/:category"} component={App} />
				<Route path={"/"} exact component={App} />
			</Switch>
		</Router>
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
