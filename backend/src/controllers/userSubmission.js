const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "Some required fields are missing.",
      });
    }

    if (language === "cpp") {
      language = "c++";
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found.",
      });
    }

    // Create submission with pending status
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length,
    });

    const languageId = getLanguageById(language);

    const submissions = problem.hiddenTestCases.map((testcase) => ({
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

    let status = "accepted";
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasesPassed++;
        runtime += Number(test.time || 0);
        memory = Math.max(memory, Number(test.memory || 0));
      } else {
        status = "error";

        errorMessage =
          test.compile_output ||
          test.stderr ||
          test.message ||
          test.status?.description ||
          "Wrong Answer";
      }
    }

    // Save submission result
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;
    submittedResult.errorMessage = errorMessage;

    await submittedResult.save();

    // Add problem to solved list only if accepted
    if (
      status === "accepted" &&
      !req.result.problemSolved.some(
        (id) => id.toString() === problemId.toString()
      )
    ) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    return res.status(200).json({
      success: true,
      accepted: status === "accepted",
      status,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory,
      error: errorMessage,
      results: testResult,
    });
  } catch (err) {
    console.error("Submit Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (language === "cpp") language = "c++";

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found",
      });
    }

    const languageId = getLanguageById(language);

    const submissions = problem.visibleTestCases.map((testcase) => ({
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

    return res.status(200).json({
      success: passed === results.length,
      totalTestCases: results.length,
      passedTestCases: passed,
      runtime,
      memory,
      compileError,
      runtimeError,
      wrongAnswer,
      testCases: results,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


module.exports = {submitCode,runCode};

