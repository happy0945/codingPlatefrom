const { getLanguageById, submitBatch, submitToken } = require('./problemUtility');

/**
 * Evaluates code against a list of test cases and returns comprehensive failure diagnostics.
 */
const evaluateCode = async (code, language, testCases) => {
  const languageId = getLanguageById(language);

  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const formattedSubmissions = testCases.map((tc) => ({
    source_code: code,
    language_id: languageId,
    stdin: tc.input,
    expected_output: tc.output,
  }));

  const batchResponse = await submitBatch(formattedSubmissions);
  const tokens = batchResponse.map((item) => item.token);
  const rawResults = await submitToken(tokens);

  let passedTestCases = 0;
  let totalRuntime = 0;
  let maxMemory = 0;
  const failedTestCases = [];

  rawResults.forEach((res, index) => {
    const originalTc = testCases[index] || {};
    const isPassed = res.status_id === 3; // 3 = Accepted in Judge0

    if (isPassed) {
      passedTestCases++;
      totalRuntime += Number(res.time || 0);
      maxMemory = Math.max(maxMemory, Number(res.memory || 0));
    } else {
      const statusDescription = res.status?.description || (res.status_id === 4 ? 'Wrong Answer' : 'Execution Error');
      const actualOutput = (res.stdout || '').trim();
      const expectedOutput = (originalTc.output || '').trim();
      const compileError = res.compile_output || null;
      const runtimeError = res.stderr || res.message || null;

      const diagnosticReport = [
        `❌ Test Case #${index + 1} Failed: ${statusDescription}`,
        `📥 Input: ${originalTc.input || '(empty)'}`,
        `🎯 Expected Output: ${expectedOutput}`,
        `📤 Actual Output: ${actualOutput || '(none)'}`,
        compileError ? `⚠️ Compilation Error:\n${compileError}` : null,
        runtimeError ? `⚠️ Runtime Error:\n${runtimeError}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      failedTestCases.push({
        caseIndex: index + 1,
        stdin: originalTc.input,
        expectedOutput,
        actualOutput,
        status: statusDescription,
        statusId: res.status_id,
        compileError,
        runtimeError,
        diagnosticReport,
      });
    }
  });

  const allPassed = passedTestCases === testCases.length;

  return {
    passed: allPassed,
    totalTestCases: testCases.length,
    passedTestCases,
    failedCount: failedTestCases.length,
    runtime: totalRuntime,
    memory: maxMemory,
    failedTestCases,
    rawResults,
    formattedReport: allPassed
      ? `✅ All ${testCases.length} test cases passed successfully!`
      : `❌ ${failedTestCases.length} out of ${testCases.length} test cases failed.\n\n` +
        failedTestCases.map((f) => f.diagnosticReport).join('\n\n----------------------------------------\n\n'),
  };
};

module.exports = { evaluateCode };
