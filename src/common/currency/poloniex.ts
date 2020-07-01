import http from 'node-fetch';
import bluebird from 'bluebird';
http.Promise = bluebird;

import wreck from '@hapi/wreck';
import url from 'url';
import config from 'config';
// import curl from 'curlrequest';

import { SingRequestOptions, signRequest } from '../authentication/sign-request';

import { DatabaseService } from '../database';
// import nonce from 'nonce';
const nonce = require('nonce')();

const PRIVATE_API_URL = 'https://poloniex.com/tradingApi';
const PUBLIC_API_URL = 'https://poloniex.com/public';

export class Poloniex /**extends RPC*/ {

    private Headers = {
        // 'X-Requested-With': 'XMLHttpRequest'
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'request node',
    }

    async post(command, options) {
        try {


            // if (!form || typeof form === 'string') {
            //     throw new Error('Invalid form data');
            // }
            // form.nonce = form.nonce || nonce(16);

            // let options: SingRequestOptions = {
            const key = config.POLONIEX_KEY;
            const secret = config.POLONIEX_SECRET;
            // form: form
            // };
            const query = { command, nonce: nonce() }

            const queryString = url.format({ query }).substring(1);
 
            const signedHeaders = signRequest({ key, secret, query: queryString });
            const headers = { ...this.Headers, ...signedHeaders };
            const requestOptions = {
                headers,
                form: queryString,
                // payload: { command, nonce: nonce() },
                json: true,
                strictSSL: true,
                timeout: 60 * 1000,
                forever: true
            };
            console.log(requestOptions);
            // http(PRIVATE_API_URL, requestOptions)
            //     .then(async (result) => {
            //         let res = await result.json()
            //         console.log(new Date().toUTCString(), '->', form.command, '->', result.status);
            //         console.log(res);
            //     })
            // let result = await wreck.post(`${PRIVATE_API_URL}?${queryString}`, requestOptions)
            // curl.request({
            //     method: 'POST',
            //     headers: {
            //         Key: key,
            //         Sign: signedHeaders.Sign,
            //     },
            //     data: queryString,
            //     pretend: true
            // }, function (err, stdout, meta) {
            //     console.log('%s %s', meta.cmd, meta.args.join(' '));
            //     console.log(stdout.toString())
            // })

            
            let result = await wreck.post(`${PRIVATE_API_URL}`, requestOptions);
            console.log(new Date().toUTCString(), '->', `${PRIVATE_API_URL}`, '->', result.payload);

            return result.payload//result.body.data.toString();
        } catch (error) {
            console.log("Error in sending post request: ", error);

        }
    }

    public async getAllBalances(): Promise<any> {
        const form = { command: 'returnBalances' };
        const result = await this.post('returnBalances', {});
        console.log("*************** All balances ***************", result);
    }

}
