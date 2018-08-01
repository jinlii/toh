// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { enableProdMode } from '@angular/core';

// An Express server is a pipeline of middleware that filters and processes URL requests one after the other.
import * as express from 'express';
import { join } from 'path';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main');

// Express Engine
import { ngExpressEngine } from '@nguniversal/express-engine';
// Import module map for lazy loading
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [ // You supply extraProviders when your app needs information that can only be determined by the currently running server instance.
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

// TODO: implement data requests securely
/*
This sample server doesn't handle data requests.

The tutorial's "in-memory web api" module, a demo and development tool, intercepts all HTTP calls and simulates the behavior of a remote data server.
In practice, you would remove that module and register your web api middleware on the server here.

For example, the browser automatically sends auth cookies for the current user. Angular Universal cannot forward these credentials to a separate data server.
If your server handles HTTP requests, you'll have to add your own security plumbing.

*/
app.get('/api/*', (req, res) => {
  res.status(404).send('data requests are not supported');
});

// Server static files from /browser
// The following express code routes all remaining requests to /dist; it returns a 404 - NOT FOUND if the file is not found.
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
