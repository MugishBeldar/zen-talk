const ENV = process.env.NODE_ENV || 'development';
const config = require('./environments/'+ENV);
global.NODE_ENV = ENV;
module.exports = config;
