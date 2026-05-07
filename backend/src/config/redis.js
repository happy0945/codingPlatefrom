
const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-19425.crce263.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 19425
    }
});
module.exports = redisClient;
