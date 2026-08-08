const Problem = require('../models/problem');
const Submission = require('../models/submission');
const User = require('../models/user');
const { submissionQueue, runQueue } = require('../config/queue');
const redisClient = require('../config/redis');

// Enqueue Official Code Submission into BullMQ
const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Some required fields are missing.',
      });
    }

    if (language === 'cpp') {
      language = 'c++';
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found.',
      });
    }

    // Create submission record with pending status
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: 'pending',
      testCasesTotal: problem.hiddenTestCases.length,
    });

    // Enqueue job to BullMQ submissionQueue and pass to the worker
    await submissionQueue.add('submitJob', {
      submissionId: submittedResult._id.toString(),
      userId: userId.toString(),
      problemId: problemId.toString(),
      code,
      language,
      hiddenTestCases: problem.hiddenTestCases,
    });

    return res.status(202).json({
      success: true,
      submissionId: submittedResult._id,
      status: 'pending',
      message: 'Submission queued successfully.',
    });
  } catch (err) {
    console.error('Submit Queue Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};

// Poll official submission status from MongoDB
const getSubmissionStatus = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.',
      });
    }

    if (submission.status === 'pending') {
      return res.status(200).json({
        completed: false,
        status: 'pending',
      });
    }

    return res.status(200).json({
      completed: true,
      success: submission.status === 'accepted',
      accepted: submission.status === 'accepted',
      status: submission.status,
      totalTestCases: submission.testCasesTotal,
      passedTestCases: submission.testCasesPassed,
      runtime: submission.runtime,
      memory: submission.memory,
      error: submission.errorMessage,
    });
  } catch (err) {
    console.error('Get Submission Status Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};

// Enqueue Code Run (Test visible testcases) into BullMQ
const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { code, language } = req.body;

    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (language === 'cpp') language = 'c++';

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    const jobId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Enqueue job to BullMQ runQueue
    await runQueue.add('runJob', {
      jobId,
      code,
      language,
      visibleTestCases: problem.visibleTestCases,
    });

    return res.status(202).json({
      success: true,
      jobId,
      status: 'pending',
      message: 'Run queued successfully.',
    });
  } catch (err) {
    console.error('Run Queue Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};

// Poll Code Run status from Redis
const getRunStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const cachedData = await redisClient.get(`runResult:${jobId}`);

    if (!cachedData) {
      return res.status(200).json({
        completed: false,
        status: 'pending',
      });
    }

    const result = JSON.parse(cachedData);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Get Run Status Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};

module.exports = {
  submitCode,
  getSubmissionStatus,
  runCode,
  getRunStatus,
};
