const { Worker } = require('bullmq');
const { redisConnection } = require('../config/queue');
const redisClient = require('../config/redis');
const { getLanguageById, submitBatch, submitToken } = require('../utils/problemUtility');

const initRunWorker = () => {
  const worker = new Worker(
    'runQueue',
    async (job) => {
      const { jobId, code, language, visibleTestCases } = job.data;
      console.log(`[BullMQ Worker] Processing run job ${jobId}...`);

      try {
        const languageId = getLanguageById(language);

        const submissions = visibleTestCases.map((testcase) => ({
          source_code: code,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output,
        }));

        const submitResponse = await submitBatch(submissions);
        const tokens = submitResponse.map((item) => item.token);
        const results = await submitToken(tokens);

        let passed = 0;
        let runtime = 0;
        let memory = 0;
        let compileError = null;
        let runtimeError = null;
        let wrongAnswer = false;

        for (const test of results) {
          if (test.status_id === 3) {
            passed++;
            runtime += Number(test.time || 0);
            memory = Math.max(memory, Number(test.memory || 0));
          } else {
            if (test.compile_output) {
              compileError = test.compile_output;
            } else if (test.stderr) {
              runtimeError = test.stderr;
            } else {
              wrongAnswer = true;
            }
          }
        }

        const runData = {
          completed: true,
          success: passed === results.length,
          totalTestCases: results.length,
          passedTestCases: passed,
          runtime,
          memory,
          compileError,
          runtimeError,
          wrongAnswer,
          testCases: results,
        };

        // Store result in Redis for 5 minutes (300 seconds)
        await redisClient.set(`runResult:${jobId}`, JSON.stringify(runData), { EX: 300 });

        console.log(`[BullMQ Worker] Run job ${jobId} completed successfully.`);
        return runData;
      } catch (err) {
        console.error(`[BullMQ Worker] Error in run job ${jobId}:`, err);
        const errorData = {
          completed: true,
          success: false,
          error: err.message || 'Execution Error',
        };
        await redisClient.set(`runResult:${jobId}`, JSON.stringify(errorData), { EX: 300 });
        throw err;
      }
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job, result) => {
    console.log(`[BullMQ Worker] Run job ${job?.id} completed with result:`, result);
  });
  worker.on('failed', (job, err) => {
    console.error(`[BullMQ Worker] Run Job ${job?.id} failed:`, err);
  });

  return worker;
};

module.exports = { initRunWorker };
