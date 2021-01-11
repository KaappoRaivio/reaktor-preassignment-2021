const express = require("express");
const path = require("path");

const API = require("./api/src/API.js");

const app = express();

app.use(express.static(path.join(__dirname, "client/build")));

API(app);

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Backend running on ${port}`);
