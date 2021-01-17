const express = require("express");
const memoryCache = require("memory-cache");
const API = require("./API.js");

const app = express();

const cache = duration => (req, res, next) => {
	const key = "__express__" + req.originalUrl || req.url;
	const cachedBody = memoryCache.get(key);

	if (cachedBody) {
		res.send(cachedBody);
	} else {
		res.sendResponse = res.send;
		res.send = body => {
			memoryCache.put(key, body, duration * 1000);
			res.sendResponse(body);
		};
		next();
	}
};

// app.use(cache(300));
app.use((req, res, next) => {
	req.connection.setTimeout(1000 * 60);
	next();
});
app.use((err, req, res, next) => {
	res.status(500);
	res.render("error", { error: err });
});

API(app);

module.exports = app;
