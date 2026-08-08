const { Queue } = require('bullmq');

const redisConnection = {
  host: process.env.REDIS_HOST || 'redis-14670.crce286.ap-south-1-1.ec2.cloud.redislabs.com',
  port: Number(process.env.REDIS_PORT || 14670),
  password: process.env.REDIS_PASS,
  maxRetriesPerRequest: null,
};

const submissionQueue = new Queue('submissionQueue', { connection: redisConnection });
const runQueue = new Queue('runQueue', { connection: redisConnection });

module.exports = {
  submissionQueue,
  runQueue,
  redisConnection,
};
