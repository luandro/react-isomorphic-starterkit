import express from "express";
import path from "path";
import favicon from "serve-favicon";
import React from "react";
import ReactDOM from "react-dom/server";
import {RoutingContext, match} from "react-router";
import createLocation from "history/lib/createLocation";
import Transmit from "react-transmit";
import routes from "views/routes";
import request from "request";

const app = express();
const port = process.env.PORT || 8000;
var hostname = process.env.HOSTNAME || "localhost";
const staticDir = path.join(__dirname,'..','static');
app.use(favicon(staticDir + '/favicon.ico'));
/**
 * Attempt to serve static requests from the public folder.
 */
app.use(express.static(staticDir));
/**
 * Catch dynamic requests here to fire-up React Router.
 */
app.get('*', (req, res) => {
	match({routes, location: req.url }, (error, redirectLocation, renderProps) => {
		if (error) {
	    	res.status(500).send(error.message)
	    } else if (redirectLocation) {
	      	res.status(302).redirect(redirectLocation.pathname + redirectLocation.search)
	    } else if (renderProps) {
	      	Transmit.renderToString(RoutingContext, renderProps).then(({reactString, reactData}) => {
				let output = (
					`<!doctype html>
					<html lang="en-us">
						<head>
							<meta charset="utf-8">
							<title>react-isomorphic-starterkit</title>
							<link rel="shortcut icon" href="/favicon.ico">
						</head>
						<body>
							<div id="react-root">${reactString}</div>
						</body>
					</html>`
				);

				const webserver = process.env.NODE_ENV === "production" ? "" : "//" + hostname + ":8080";
				output          = Transmit.injectIntoMarkup(output, reactData, [`${webserver}/dist/client.js`]);

				res.status(200).send(output);
			}).catch((error) => {
				console.error(error);
			});
	    } else {
	      	res.send(404, 'Not found')
	    }
	});
});
/**
 * Endpoint that proxies all GitHub API requests to https://api.github.com.
 */
app.get('/api/github/:path', (req, res) => {
    request('https://api.github.com/'+req.params.path, (error, response, body) => {
        if (!error && response.statusCode === 200) {
        console.log(body);
          res.send(body);
        }
      });
});
/**
 * Start Hapi server on port 8000.
 */
app.listen(port, (error) => {
	if (error) {
		console.error(error);
		return process.exit(3);
	}
	console.info("==> ✅  Server is listening");
	console.info("==> 🌎  Go to http://localhost:%s.", port);
});
