const { getProducts, getProductsAndAvailability, PRODUCT_CATEGORIES } = require("./BadApiClient");

module.exports = app => {
	app.get("/api/products", async (req, res, next) => {
		try {
			const products = await getProducts();

			if (req.query.withAvailability === "true") {
				const productsAndAvailability = await getProductsAndAvailability(products);
				res.status(200);
				res.json({ products: productsAndAvailability });
			} else {
				res.status(200);
				res.json({ products });
			}

			console.log(`Sent ${Object.keys(products).length} products`);
		} catch (err) {
			next(err);
		}
	});

	app.get("/api/categories", (req, res) => {
		console.log(`Sending: ${PRODUCT_CATEGORIES}`);
		// throw new Error("BROKEN");
		res.status(200).json(PRODUCT_CATEGORIES);
	});
};
