const { v4: generateUUID } = require("uuid");

const { getProducts, getProductsAndAvailability, PRODUCT_CATEGORIES } = require("./BadApiClient");
const sampleResponse = require("./sampleResponse.json");

// const availabilityAPIJobs = {};

module.exports = app => {
	app.get("/api/products", async (req, res) => {
		if (req.query.debug) {
			console.log("Debug response");
			res.status(200);
			res.json(sampleResponse);
			return;
		}

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
	});

	// app.get("/api/availability/:jobID", async (req, res) => {
	// 	const { jobID } = req.params;
	// 	console.log(jobID);
	// 	if (!jobID in availabilityAPIJobs) {
	// 		res.sendStatus(400);
	// 		return;
	// 	}
	//
	// 	let job = availabilityAPIJobs[jobID];
	//
	// 	const response = await job.promise;
	//
	// 	res.status(200);
	// 	res.json(response);
	// });

	app.get("/api/categories", (req, res) => {
		console.log(`Sending: ${PRODUCT_CATEGORIES}`);
		res.json(PRODUCT_CATEGORIES);
	});
};
