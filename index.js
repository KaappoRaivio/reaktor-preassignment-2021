const express = require("express");
const path = require("path");
const app = require("./api/src/App.js");

const debug = require("debug")("r:index");

app.use(express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Backend running on ${port}`);
});
