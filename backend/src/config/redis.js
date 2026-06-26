
// const { createClient } = require('redis');

// const redisClient = createClient({
//     username: 'default',
//     password: process.env.REDIS_PASS,
//     socket: {
//         host: 'redis-19425.crce263.ap-south-1-1.ec2.cloud.redislabs.com',
//         port: 19425
//     }
// });


const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: 'kdZUwgKtwCj2QyrjxZT8cri9tQfeqpe5',
    socket: {
        host: 'redis-14670.crce286.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 14670
    }
});

module.exports = redisClient;