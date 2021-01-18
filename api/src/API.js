const { combineAvailabilityWithProductInformation } = require("./ProcessData");
const { v4: uuidv4, validate: validateUUID } = require("uuid");

const { getProducts, getAvailabilityRequests, PRODUCT_CATEGORIES } = require("./BadApiClient");

const jobs = {};
const job = () => {
	return { uuid: uuidv4(), finished: false, hasNewData: false, data: null };
};

module.exports = app => {
	app.get("/api/products", async (req, res, next) => {
		try {
			const newJob = job();
			jobs[newJob.uuid] = newJob;

			res.status(202).json({ uuid: newJob.uuid });

			const products = await getProducts();
			newJob.data = products;
			newJob.hasNewData = true;

			let availability = {};
			const availabilityRequests = getAvailabilityRequests(products);
			console.log(availabilityRequests);
			availabilityRequests.map(availabilityRequest =>
				availabilityRequest.then(({ availabilityData, isLastRequest }) => {
					console.log(Object.keys(availabilityData).length, isLastRequest);
					availability = { ...availability, ...availabilityData };

					newJob.data = combineAvailabilityWithProductInformation(products, availability);
					newJob.hasNewData = true;
					if (isLastRequest) {
						newJob.finished = true;
					}
				})
			);
		} catch (err) {
			next(err);
		}
	});

	app.get("/api/jobs/:uuid", async (req, res, next) => {
		const { uuid } = req.params;
		console.log(uuid);

		if (!validateUUID(uuid)) {
			res.sendStatus(400);
			return;
		}

		if (!(uuid in jobs)) {
			res.sendStatus(404);
			return;
		}

		const job = jobs[uuid];

		const responseJSON = {
			uuid,
			finished: job.finished,
			hasNewData: job.hasNewData,
			data: job.hasNewData ? job.data : null,
		};
		job.hasNewData = false;

		if (job.finished) {
			delete jobs[uuid];
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
