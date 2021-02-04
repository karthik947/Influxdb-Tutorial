//Download 1 min candles and aggregate them into higher timeframes.
require('dotenv').config();

const Influx = require('influx');
const _ = require('lodash');
const got = require('got');

const client = new Influx.InfluxDB({
  database: 'monalisa_db',
  host: process.env.HOST,
  port: 8086,
  username: process.env.UNAME,
  password: process.env.PASSWORD,
});

//metadata
const startTS = 1609746029444; //Mon, 04 Jan 2021 07:40:29 GMT
const endTS = 1612338099808; //Wed, 03 Feb 2021 07:41:39 GMT

//returns all list of APIs to process
const getReqArray = ({ symbol, fromTS, toTS, timeframe }) => {
  const tfw = {
    '1m': 1 * 60 * 1000,
  };
  const barw = tfw[timeframe];
  const n = Math.ceil((toTS - fromTS) / (1000 * barw));
  return _.times(n, (i) => {
    const startTS = fromTS + i * 1000 * barw;
    return `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&startTime=${startTS}&limit=1000`;
  });
};

//Load Data
loadData = async ({ symbol }) => {
  try {
    const reqArray = getReqArray({
      symbol,
      fromTS: startTS,
      toTS: endTS,
      timeframe: '1m',
    });
    const reqRespA = await Promise.all(reqArray.map((url) => got(url)));
    const reqDatA = reqRespA.map((r) => JSON.parse(r.body)).flat();
    const rows = reqDatA.map((o) => {
      return {
        measurement: 'kline_data',
        tags: {
          exchange: 'BINANCE',
          subtype: 'SPOT',
          symbol,
        },
        fields: {
          open: parseFloat(o[1]),
          high: parseFloat(o[2]),
          low: parseFloat(o[3]),
          close: parseFloat(o[4]),
          volume: parseFloat(o[5]),
        },
        timestamp: new Date(o[0]),
      };
    });
    const rowChunks = _.chunk(rows, 2000); //best to write in chunks of 2k records
    await rowChunks.reduce(async (previousPromise, nextID) => {
      await previousPromise;
      return client.writePoints(nextID);
    }, Promise.resolve());
    console.log('Data stored successfully!');
  } catch (err) {
    console.log(`Error while processing ${err}`);
  }
};

loadData({ symbol: 'ETHUSDT' });
