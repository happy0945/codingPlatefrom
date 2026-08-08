const express = require('express');
const submitRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware');
const {
  submitCode,
  getSubmissionStatus,
  runCode,
  getRunStatus,
} = require('../controllers/userSubmission');

submitRouter.post('/submit/:id', userMiddleware, submitCode);
submitRouter.get('/status/:submissionId', userMiddleware, getSubmissionStatus);
submitRouter.post('/run/:id', userMiddleware, runCode);
submitRouter.get('/run-status/:jobId', userMiddleware, getRunStatus);

module.exports = submitRouter;
