import crypto from 'crypto';
import request from 'request';
const nonce = require('nonce')();
import { SingRequestOptions, signRequest } from '../authentication/sign-request';

import config from 'config';

const version = require('../../../package.json').version;
const USER_AGENT = `${require('../../../package.json').name} ${version}`;
const DEFAULT_SOCKETTIMEOUT = 60 * 1000;
const DEFAULT_KEEPALIVE = true;
const STRICT_SSL = true;

const PRIVATE_API_URL = 'https://poloniex.com/tradingApi'
export class Poloniex /**extends RPC*/ {

    private key;
    private secret;
    private options;

    async getAllBalances(): Promise<any> {
        this.key = config['POLONIEX_KEY'];
        this.secret = config['POLONIEX_SECRET'];
        this.options = {};
        const result = await this.returnBalances();
        console.log("*************** All balances ***************", result);
        return result;
    }


    returnBalances() {
        let parameters = {};
        return this.accessPrivateAPI('returnBalances', parameters);
    }

    public accessPrivateAPI(command, parameters) {
        Object.keys(parameters).forEach((key) => {
            if (typeof parameters[key] === 'function') {
                throw new Error('Invalid parameters');
            }
        });

        let param = parameters;
        param.command = command;
        param.nonce = this.options && this.options.nonce ? this.options.nonce() : nonce(16);
        let options = {
            method: 'POST',
            url: PRIVATE_API_URL,
            form: param,
            headers: this.getPrivateHeaders(param),
        };
        if (options.headers) {
            return this.makeRequest(options);
        } else {
            let err = new Error('Error: API key and secret required');
            throw err;
        }
    }

    private getPrivateHeaders(parameters) {
        if (!this.key || !this.secret) {
            return null;
        }

        let paramString = Object.keys(parameters).map(function (param) {
            return encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param]);
        }).join('&');

        let signature = crypto.createHmac('sha512', this.secret).update(paramString).digest('hex');
        return {
            Key: this.key,
            Sign: signature
        };
    }

    private makeRequest(options) {
        if (!('headers' in options)) {
            options.headers = {};
        }

        options.json = true;
        // add custom headers only if they are not already defined
        if (this.options !== undefined && this.options.headers !== undefined) {
            for (let h in this.options.headers) {
                if (this.options.headers.hasOwnProperty(h) && options.headers[h] === undefined) {
                    options.headers[h] = this.options.headers[h];
                }
            }
        }

        options.headers['User-Agent'] = options.headers['User-Agent'] || USER_AGENT;
        options.strictSSL = true;
        options.timeout = this.options && this.options.socketTimeout || DEFAULT_SOCKETTIMEOUT;
        options.forever = this.options && this.options.hasOwnProperty('keepAlive') ? this.options.keepAlive : DEFAULT_KEEPALIVE;
        if (options.forever) {
            options.headers['Connection'] = options.headers['Connection'] || 'keep-alive';
        }

        if (this.options && this.options.hasOwnProperty('proxy')) {
            options.proxy = this.options.proxy;
        }

        if (this.options && this.options.hasOwnProperty('agent')) {
            options.agent = this.options.agent;
        }

        return new Promise((resolve, reject) => {
            request(options, function (error, response, body) {
                let err = error;
                if (!err && response.statusCode !== 200) {
                    let errMsg = `Poloniex error ${response.statusCode}: ${response.statusMessage}`;
                    if (typeof response.body === 'object' && response.body.hasOwnProperty('error')) {
                        errMsg = `${errMsg}. ${response.body.error}`;
                    }

                    err = new Error(errMsg);
                }

                if (!err && (typeof response.body === 'undefined' || response.body === null)) {
                    err = new Error('Poloniex error: Empty response');
                }

                if (!err && body.error) {
                    err = new Error(body.error);
                }

                if (!err) {
                    return resolve(body);
                } else {
                    return reject(err);
                }
            });

        });
    }

}
