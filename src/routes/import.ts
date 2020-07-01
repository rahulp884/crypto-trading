import express from 'express';
import http from 'node-fetch';
import bluebird from 'bluebird';
http.Promise = bluebird;
import { Poloniex } from "../common/currency/poloniex";

export const router = express.Router();
const poloniex = new Poloniex();

router.get('/status', async (req, res) => {
  try {
    await poloniex.getAllBalances();
    const result = { statusCode: 200 }
    res.status(result.statusCode || 200);
    res.send(result);
  } catch (error) {
    console.error(error)
    res.send(error.message);
  }

});

