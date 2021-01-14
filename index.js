const express = require("express");
const path = require("path");
const mcache = require("memory-cache");

const API = require("./api/src/API.js");

const app = express();

// const cache = duration => (req, res, next) => {
// 	const key = "__express__" + req.originalUrl || req.url;
// 	const cachedBody = mcache.get(key);
//
// 	if (cachedBody) {
// 		res.send(cachedBody);
// 		return;
// 	} else {
// 		res.sendResponse = res.send;
// 		res.send = body => {
// 			mcache.put(key, body, duration * 1000);
// 			res.sendResponse(body);
// 		};
// 	}
//
// 	next();
// };

app.use(express.static(path.join(__dirname, "client/build")));
// app.use(cache(300));
app.use((err, req, res, next) => {
	res.status(500);
	res.render("error", { error: err });
});

API(app);

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Backend running on ${port}`);
