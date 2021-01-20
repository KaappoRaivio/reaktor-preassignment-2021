import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MySwitch from "../components/MySwitch";

const renderWithRouter = (ui, { route = "/" } = {}) => {
	window.history.pushState({}, "Test page", route);

	return render(<MySwitch>{ui}</MySwitch>, { wrapper: BrowserRouter });
};

export default renderWithRouter;
