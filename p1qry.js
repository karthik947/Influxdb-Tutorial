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

runQry = async () => {
  try {
    const results = await client.query(`
    select * from login_info
    limit 10
  `);
    console.table(results);
  } catch (err) {
    console.log(`Error while processing ${err}`);
  }
};

runQry();
