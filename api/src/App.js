const express = require("express");
const memoryCache = require("memory-cache");
const API = require("./API.js");
const debug = require("debug")("App.js");
const compression = require("compression");

const app = express();
app.use(compression());
API(app);
app.use((err, req, res, next) => {
	res.status(500);
	debug("Error", err);
	res.json({ error: err });
	// res.render("error", { error: err });
});

module.exports = app;
