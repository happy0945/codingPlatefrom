
const axios = require("axios");

const getLanguageById = (language) => {
  const languages = {
    "c++": 54,
    java: 62,
    javascript: 102,
  };

  return languages[language.toLowerCase()];
};

const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_URL}/submissions/batch`,
    { submissions },
    {
      params: {
        base64_encoded: false,
      },
    }
  );

  return data;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const decodeBase64 = (value) => {
  if (!value) return null;

  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch (err) {
    return value;
  }
};

const submitToken = async (tokens) => {
    const tokenString = tokens.join(",");

  while (true) {
    try {
      const response = await axios.get(
        `${process.env.JUDGE0_URL}/submissions/batch`,
        {
          params: {
            tokens: tokenString,
            base64_encoded: true,
            fields:
              "stdout,stderr,compile_output,message,time,memory,status,status_id",
          },
        }
      );

      const results = response.data.submissions;

      if (!results) {
        throw new Error("Judge0 did not return submissions.");
      }

      // Decode Base64 response
      results.forEach((item) => {
        item.stdout = decodeBase64(item.stdout);
        item.stderr = decodeBase64(item.stderr);
        item.compile_output = decodeBase64(item.compile_output);
        item.message = decodeBase64(item.message);
      });

      console.log("Decoded Results:");
      console.log(JSON.stringify(results, null, 2));

      const finished = results.every(
        (submission) => submission.status_id > 2
      );

      if (finished) {
        return results;
      }

      await delay(1000);
    } catch (err) {
      console.log("====================================");
      console.log("Judge0 Error");
      console.log("Status:", err.response?.status);
      console.log("Response:");
      console.log(JSON.stringify(err.response?.data, null, 2));
      console.log("====================================");

      throw err;
    }
  }
};

module.exports = {
  getLanguageById,
  submitBatch,
  submitToken,
};