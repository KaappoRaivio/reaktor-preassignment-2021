const { getProducts, PRODUCT_CATEGORIES } = require("./BadApiClient");

const sampleResponse = require("./sampleResponse.json");

module.exports = app => {
	app.get("/api/products", async (req, res) => {
		if (req.query.debug) {
			console.log("Debug response");
			res.status(200);
			res.json(sampleResponse);
			return;
		}

		const products = await getProducts();
		res.status(200);
		res.json(products);

		console.log(`Sent ${Object.keys(products).length} products`);
	});

	app.get("/api/categories", (req, res) => {
		console.log(`Sending: ${PRODUCT_CATEGORIES}`);
		res.json(PRODUCT_CATEGORIES);
	});
};
