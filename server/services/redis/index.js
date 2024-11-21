const { Redis } = require('ioredis')

const pub = new Redis({
  host: `${process.env.REDIS_HOST}`,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

const sub = new Redis({
  host: `${process.env.REDIS_HOST}`,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

module.exports = Object.freeze({
  pub, sub
})
