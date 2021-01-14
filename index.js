const express = require("express");
const path = require("path");
const app = require("./api/src/App.js");

app.use(express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
	console.log(`Backend running on ${port}`);
});
