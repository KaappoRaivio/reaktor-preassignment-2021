# Preassignment for Reaktor's junior positions for 2021
Both the front end and back end are hosted on the same heroku instance. The front end lives at `client/` and the back end at `api/`

End-to-end tests for the front end, and unit tests for the back end are available: just run `yarn test` after installing the deps.

## Front end
It's a quite plain and simple React app with a couple of custom hooks for easier data retrieval. 
I used React Router to persist the app state across page reloads.

## Back end
For the back end, I came up with the following requirements:
1. The inital load time shouldn't be dependent on the flaky and slow availability API
3. It should take care of the failure case of the provided API
4. It should implement sensible caching
5. It should make the minimum amount of requests to the provided APIs
2. The client-side code should be as simple as possible

There are many approaches to process the data coming from the provided API, such as:
* Do data processing in the client
    * Doesn't require a back end
    * Needs an ugly workaround for the CORS policy of the provided API
* Use a proxy
    * Solves the CORS problem
    * You need write some server-side code anyway, so why not put all the data processing into the back end?
* A back end with one endpoint that returns all the data in one response
    * The simplest client-side code
    * The initial page load time will be tied to the slowest API response, taking page load times to unacceptable levels (tens of seconds)
* __A back end with asynchronous jobs and polling__
    * The moment new data arrives, it can be shown to the user irrespective of the other slow API calls which might not yet have returned
    * Not susceptible to connection timeouts
    * However, more data needs to be transferred
* A back end with server-sent events
    * Perhaps the canonical approach, but complicates other logic (caching mainly) to the point where, in this case, it isn't worth it
 

__I went with the fourth option, as it fulfilled the most of my criteria.__ WIth it, the typical interaction with the client looks like the following:
1. Client requests `/api/products`
2. Server responds with a token that the client can use to poll for updates. At the same time, the server sends the product, and availability requests parallely. As each of them resolves, their content will be added to the data
3. Client polls for updates
4. If there is an update since the last call, the server sends it. If there isn't any more updates to come, the server informs the client.  

I went with short polling, since it's more straightforward to implement and more resilient to connection timeouts.

### Pros and cons
There is always a tradeoff between page load time, amount of data transferred, and time updates take to show up at the client. 
Int this case, I wanted to update the availability data as eagerly as possible, since the different availability requests could take vastly different times to complete.
This results in some duplicate data being transferred as I didn't want to complicate things with delta updates, but in my opinion, it is an acceptable compromise.
Compressed with gzip, each update is about 500 kB (3 MB uncompressed).

### Caching
Caching the results is also necessary, so that subsequent requests will not create unnecessary requests to the same resources a request has already been sent to. 
I chose to implement caching on the requests that the server-side code sends. This way, if multiple clients send requests at the same time, the server still queries the provided API only once.

Three cases are possible:
1. A resource that the cache has never seen is requested	
2. A resource that the cache knows about but doesn't yet have the results for is requested
3. A resource that the cache has a result available readily is requested
  

### The endpoints
The back end defines three endpoints: `/api/categories`, `/api/products`, and `/api/jobs/:UUID`

#### `/api/categories`
 
Returns an array consisting of the product categories as strings.

#### `/api/products`
Creates a new job that either retrieves the necessary data from the provided API, or uses cached values, whichever is more appropriate in the given context.

Returns a token that can be used to poll the status of the job at...

#### `/api/jobs/:UUID`
* `400`'s if `UUID` isn't compliant with RFC4122 v4.
* `404`'s if `UUID` doesn't have a job associated with it.

Returns a response like: `{ "finished": ..., "hasNewData": ..., data: ...}`

If `hasNewData` is true, then `data` has the most recent product data, and the client should replace its old data with it.

If `finished` is false, the client should continue polling. If it's true, the client should stop polling, as any subsequent calls with the same `UUID` will `404`

-----

This project was bootstrapped with [Create React Main](https://github.com/facebook/create-react-app).
