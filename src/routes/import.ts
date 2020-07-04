import express from 'express';
import { Poloniex } from "../common/currency/poloniex";

export const router = express.Router();
const poloniex = new Poloniex();

router.get('/status', async (req, res) => {
  try {
    const result = await poloniex.getAllBalances();
    const response = { statusCode: 200, data: result }
    res.status(response.statusCode || 200);
    res.send(response);
  } catch (error) {
    console.error(error)
    res.send(error.message);
  }

});

