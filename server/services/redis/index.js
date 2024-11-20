const { Redis } = require('ioredis')

const pub = new Redis({
  host: "redis-13561.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 13561,
  username: "default",
  password: "root",
});

const sub = new Redis({
  host: "redis-13561.c212.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 13561,
  username: "default",
  password: "root",
});

module.exports = Object.freeze({
  pub, sub
})
