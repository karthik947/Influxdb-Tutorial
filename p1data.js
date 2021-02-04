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

//metadata
const { users } = require('./helper');
const randomUser = () => users[Math.floor(Math.random() * users.length)]; //returns a random user
const rcount = 10000; //10000 rows
const startTS = 1609746029444; //Mon, 04 Jan 2021 07:40:29 GMT
const endTS = 1612338099808; //Wed, 03 Feb 2021 07:41:39 GMT

loadData = async () => {
  try {
    const rows = [...new Array(rcount)].map((r) => {
      return {
        measurement: 'login_info',
        tags: { host: 'localhost', app: 'AppName', Instance: 'Instance1878' },
        fields: { uname: randomUser() },
        timestamp: new Date(_.random(startTS, endTS)),
      };
    });
    await client.writePoints(rows);
    console.log('Data stored successfully!');
  } catch (err) {
    console.log(`Error while processing ${err}`);
  }
};

loadData();
