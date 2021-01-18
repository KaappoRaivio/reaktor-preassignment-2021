import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import App from "./App";
import MyErrorBoundary from "./components/MyErrorBoundary";
import MySwitch from "./components/MySwitch";

ReactDOM.render(
	<React.StrictMode>
		<BrowserRouter>
			<MySwitch>
				<App />
			</MySwitch>
		</BrowserRouter>
	</React.StrictMode>,
	document.getElementById("root")
);
