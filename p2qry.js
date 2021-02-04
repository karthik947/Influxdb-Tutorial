require('dotenv').config();

const Influx = require('influx');
const _ = require('lodash');

const client = new Influx.InfluxDB({
  database: 'monalisa_db',
  host: process.env.HOST,
  port: 8086,
  username: process.env.UNAME,
  password: process.env.PASSWORD,
});

//Aggregate into 1d candles
aggrKline = async ({ symbol, tf }) => {
  try {
    const a_open = await client.query(
      `select first(open) from kline_data WHERE time >= '2021-01-04T00:00:00Z' AND time <= '2021-02-03T00:00:00Z' AND symbol = '${symbol}' GROUP BY time(${tf})`
    );
    const a_close = await client.query(
      `select last(close) from kline_data WHERE time >= '2021-01-04T00:00:00Z' AND time <= '2021-02-03T00:00:00Z' AND symbol = '${symbol}' GROUP BY time(${tf})`
    );
    const a_high = await client.query(
      `select max(high) from kline_data WHERE time >= '2021-01-04T00:00:00Z' AND time <= '2021-02-03T00:00:00Z' AND symbol = '${symbol}' GROUP BY time(${tf})`
    );
    const a_low = await client.query(
      `select min(low) from kline_data WHERE time >= '2021-01-04T00:00:00Z' AND time <= '2021-02-03T00:00:00Z' AND symbol = '${symbol}' GROUP BY time(${tf})`
    );
    const kline_aggr = a_open.map((o, i) => {
      return {
        symbol,
        opents: o.time.getTime(),
        fts: o.time.toLocaleString(),
        open: o.first,
        high: a_high[i].max,
        low: a_low[i].min,
        close: a_close[i].last,
      };
    });
    console.table(kline_aggr);
  } catch (err) {
    console.log(`Error while processing ${err}`);
  }
};

aggrKline({ symbol: 'ETHUSDT', tf: '1h' });
