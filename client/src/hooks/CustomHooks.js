import { useEffect, useRef, useState } from "react";

const useRequest = (url, { retries = 3 } = {}) => {
	const [retriesLeft, setRetriesLeft] = useState(retries);
	const [waiting, setWaiting] = useState(true);
	const [JSON, setJSON] = useState(null);
	const [error, setError] = useState(null);

	const [didCancel, setDidCancel] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch(url);
			if (!didCancel) {
				if (response.status < 200 || response.status >= 300) {
					if (retriesLeft > 0) {
						setRetriesLeft(retriesLeft => retriesLeft - 1);
					} else {
						setError({ status: response.status, error: response.statusText });
						setWaiting(false);
					}
					return;
				}

				const JSON = await response.json();
				setJSON(JSON);
				setWaiting(false);
			}
		};
		fetchData();

		return () => {
			setDidCancel(true);
		};
	}, [url, didCancel, retriesLeft]);

	return { waiting, JSON, error };
};

const useInterval = (callback, delay) => {
	const savedCallback = useRef();
	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		const tick = () => savedCallback.current();

		if (delay != null) {
			const id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [callback, delay]);
};

const usePollingRequest = (pollingInitializationURL, pollingURL) => {
	const { waiting: pollingInitializationWaiting, JSON, error: pollingInitializationError } = useRequest(
		pollingInitializationURL
	);
	const [UUID, setUUID] = useState(null);
	const [finished, setFinished] = useState(false);
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);

	if (!pollingInitializationWaiting && UUID == null) {
		setUUID(JSON.UUID);
	}

	useInterval(
		async () => {
			if (UUID) {
				const response = await fetch(`${pollingURL}${UUID}`);
				if (response.status < 200 || response.status >= 300) {
					return;
				}
				const JSON = await response.json();
				const { finished, hasNewData, data } = JSON;
				setFinished(finished);

				if (hasNewData) {
					setData(data);
				}
			}
		},
		finished ? null : 1000
	);

	return { waiting: data == null, JSON: data, error: error || pollingInitializationError };
};

export { useRequest, usePollingRequest };
