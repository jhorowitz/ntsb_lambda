import {Handler, Context, Callback} from 'aws-lambda';
import * as request from "request";
import * as docket from "./docket";

interface HelloResponse {
    statusCode: number;
    body: string;
}

const getURLType: Handler = (event: any, context: Context, callback: Callback) => {
    console.log(event);
};

const getDocketOverviewURL: Handler = (event: any, context: Context, callback: Callback) => {
    if (!event.queryStringParameters) {
        const response: HelloResponse = {
            statusCode: 400,
            body: JSON.stringify({
                "error": "no query params supplied",
            }),
        };
        return callback(undefined, response);
    }
    const docketKey = event.queryStringParameters.docket_key;
    if (!docketKey || isNaN(docketKey)) {
        const response: HelloResponse = {
            statusCode: 400,
            body: JSON.stringify({
                "error": "docket_key must be supplied and be a number",
                "docket_key": docketKey,
            }),
        };
        return callback(undefined, response);
    }

    const response: HelloResponse = {
        statusCode: 200,
        body: JSON.stringify({url: docket.getOverviewPageUrl(docketKey)}),
    };


    return callback(undefined, response);
};

export {getDocketOverviewURL}
