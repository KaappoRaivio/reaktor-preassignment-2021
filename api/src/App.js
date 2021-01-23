const express = require("express");
const memoryCache = require("memory-cache");
const API = require("./API.js");
var timeout = require("connect-timeout");
const compression = require("compression");

const app = express();
app.use(compression());
API(app);
app.use((err, req, res, next) => {
	res.status(500);
	console.log("error", err);
	res.json({ error: err });
	// res.render("error", { error: err });
});

module.exports = app;
