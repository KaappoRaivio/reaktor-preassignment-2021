const debug = require("debug")("r:API");

const { combineAvailabilityWithProductInformation } = require("./ProcessData");
const { v4: uuidv4, validate: validateUUID } = require("uuid");
const { getProducts, getAvailabilityPromises, PRODUCT_CATEGORIES } = require("./BadApiClient");

const jobs = {};
const job = () => {
	return { UUID: uuidv4(), finished: false, hasNewData: false, data: null };
};

const LATEST_PRODUCTS_KEY = "latest_products";

module.exports = app => {
	app.get("/api/products", async (req, res, next) => {
		try {
			const newJob = job();
			jobs[newJob.UUID] = newJob;

			res.status(202).json({ UUID: newJob.UUID });

			const products = await getProducts();
			newJob.data = products;
			newJob.hasNewData = true;

			let availability = {};
			getAvailabilityPromises(products).map(availabilityPromise =>
				availabilityPromise.then(({ availabilityData, isLastPromise }) => {
					availability = { ...availability, ...availabilityData };

					newJob.data = combineAvailabilityWithProductInformation(products, availability);
					newJob.hasNewData = true;
					if (isLastPromise) {
						debug(`Finished job ${newJob.UUID}`);
						newJob.finished = true;
					}
				})
			);
		} catch (err) {
			next(err);
		}
	});

	app.get("/api/jobs/:UUID", async (req, res, next) => {
		try {
			const { UUID } = req.params;

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
		} catch (err) {
			next(err);
		}
	});

	app.get("/api/categories", (req, res) => {
		res.status(200).json(PRODUCT_CATEGORIES);
	});
};
