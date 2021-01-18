const { combineAvailabilityWithProductInformation } = require("./ProcessData");
const { v4: uuidv4, validate: validateUUID } = require("uuid");
const NodeCache = require("node-cache");

const { getProducts, getAvailabilityRequests, PRODUCT_CATEGORIES } = require("./BadApiClient");

const jobs = {};
const job = () => {
	return { UUID: uuidv4(), finished: false, hasNewData: false, data: null };
};

const LATEST_PRODUCTS_KEY = "latest_products";
const productCache = new NodeCache({ stdTTL: 300, checkperiod: 300 });

module.exports = app => {
	app.get("/api/products", async (req, res, next) => {
		try {
			const newJob = job();
			jobs[newJob.UUID] = newJob;

			res.status(202).json({ UUID: newJob.UUID });

			const valueFromCache = productCache.get(LATEST_PRODUCTS_KEY);

			if (valueFromCache) {
				newJob.data = valueFromCache;
				newJob.finished = true;
				newJob.hasNewData = true;
				return;
			}

			const products = await getProducts();
			newJob.data = products;
			newJob.hasNewData = true;

			let availability = {};
			const availabilityRequests = getAvailabilityRequests(products);
			availabilityRequests.map(availabilityRequest =>
				availabilityRequest.then(({ availabilityData, isLastRequest }) => {
					availability = { ...availability, ...availabilityData };

					const data = combineAvailabilityWithProductInformation(products, availability);
					newJob.data = data;
					newJob.hasNewData = true;
					if (isLastRequest) {
						newJob.finished = true;
						productCache.set(LATEST_PRODUCTS_KEY, data);
					}
				})
			);
		} catch (err) {
			next(err);
		}
	});

	app.get("/api/jobs/:UUID", async (req, res, next) => {
		const { UUID } = req.params;
		console.log(UUID);

		if (!validateUUID(UUID)) {
			res.sendStatus(400);
			return;
		}

		if (!(UUID in jobs)) {
			res.sendStatus(404);
			return;
		}

		const job = jobs[UUID];

		const responseJSON = {
			UUID,
			finished: job.finished,
			hasNewData: job.hasNewData,
			data: job.hasNewData ? job.data : null,
		};
		job.hasNewData = false;

		if (job.finished) {
			delete jobs[UUID];
			res.status(200);
		} else {
			res.status(202);
		}

		res.json(responseJSON);
	});

	app.get("/api/categories", (req, res) => {
		res.status(200).json(PRODUCT_CATEGORIES);
	});
};
