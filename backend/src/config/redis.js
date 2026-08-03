const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-14670.crce286.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 14670
    }
});

module.exports = redisClient;