const { Worker } = require('bullmq');
const { redisConnection } = require('../config/queue');
const Submission = require('../models/submission');
const User = require('../models/user');
const { getLanguageById, submitBatch, submitToken } = require('../utils/problemUtility');

const initSubmissionWorker = () => {
  const worker = new Worker(
    'submissionQueue',
    async (job) => {
      const { submissionId, userId, problemId, code, language, hiddenTestCases } = job.data;
      console.log(`[BullMQ Worker] Processing submission ${submissionId}...`);

      try {
        const languageId = getLanguageById(language);

        const submissions = hiddenTestCases.map((testcase) => ({
          source_code: code,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output,
        }));

        const submitResponse = await submitBatch(submissions);
        const tokens = submitResponse.map((item) => item.token);
        const testResult = await submitToken(tokens);

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'accepted';
        let errorMessage = null;

        for (const test of testResult) {
          if (test.status_id === 3) {
            testCasesPassed++;
            runtime += Number(test.time || 0);
            memory = Math.max(memory, Number(test.memory || 0));
          } else {
            status = test.status_id === 4 ? 'wrong' : 'error';
            errorMessage =
              test.compile_output ||
              test.stderr ||
              test.message ||
              test.status?.description ||
              'Wrong Answer';
          }
        }

        // Update MongoDB submission document
        const updatedSubmission = await Submission.findByIdAndUpdate(
          submissionId,
          {
            status,
            testCasesPassed,
            runtime,
            memory,
            errorMessage,
            results: testResult,
          },
          { new: true }
        );

        // Add problem to user's problemSolved array if accepted
        if (status === 'accepted') {
          const userDoc = await User.findById(userId);
          if (
            userDoc &&
            !userDoc.problemSolved.some((id) => id.toString() === problemId.toString())
          ) {
            userDoc.problemSolved.push(problemId);
            await userDoc.save();
          }
        }

        console.log(`[BullMQ Worker] Submission ${submissionId} completed with status: ${status}`);
        return { success: true, status, submissionId };
      } catch (err) {
        console.error(`[BullMQ Worker] Error in submission ${submissionId}:`, err);
        await Submission.findByIdAndUpdate(submissionId, {
          status: 'error',
          errorMessage: err.message || 'Internal execution error',
        });
        throw err;
      }
    },
    { connection: redisConnection }
  );

  worker.on('failed', (job, err) => {
    console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err);
  });

  return worker;
};

module.exports = { initSubmissionWorker };
