
import { json, urlencoded } from 'body-parser';
import * as express from 'express';
import { MiddlewareService } from './services/middlewareService';
import * as Sentry from '@sentry/node';


const port = process.env.PORT || 3000;
Sentry.init({ dsn: 'sentryLink', environment: process.env.envType});


//  **** Express default Configuration **** //
const app: express.Application = express();
app.use(json({ limit: '500mb' }));
app.use(urlencoded({ limit: '500mb', extended: true }));
app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);


// ****** Subscribe to channels ***** //
MiddlewareService.subscribeToTransferQueueIfNeeded(); 
MiddlewareService.subscribeToMiddlewareManagerExchange();

// ****** Health Check ***** //
app.get('/', function (req, res) {
    res.send('Rabbit Middleware Example API Health check');
})

// ****** Error Handling ***** //
app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);

app.use((err, req, res, next) => {
    console.error(err);
    if (!err.statusCode) {
        res.status(err.status || 500);
    }
    res.json({ message: err.message, sentryId: res.sentry });

});

// ***** Server Execution **** //
app.listen(port);
console.log('Magic happens on port ' + port);





