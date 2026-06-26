const axios = require("axios");

const JUDGE0_URL = "https://ce.judge0.com";

const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 102,
    };

    return language[lang.toLowerCase()];
};

const submitBatch = async (submissions) => {
    try {
        const response = await axios.post(
            `${JUDGE0_URL}/submissions/batch`,
            {
                submissions,
            },
            {
                params: {
                    base64_encoded: false,
                },
            }
        );

        console.log("Submit Response:");
        console.log(response.data);

        return response.data;
    } catch (error) {
        console.log("Submit Batch Error");
        console.log(error.response?.data || error.message);
        throw error;
    }
};

const waiting = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const submitToken = async (tokens) => {

    // tokens is ["abc","xyz","pqr"]
    const tokenString = tokens.join(",");

    console.log("Polling Tokens:", tokenString);

    while (true) {
        try {
            const response = await axios.get(
                `${JUDGE0_URL}/submissions/batch`,
                {
                    params: {
                        tokens: tokenString,
                        base64_encoded: false,
                        fields:
                            "stdout,stderr,compile_output,time,memory,status_id,status",
                    },
                }
            );

            const results = response.data.submissions;

            console.log(results);

            const isFinished = results.every(
                (result) => result.status_id > 2
            );

            if (isFinished) {
                return results;
            }

            console.log("Waiting...");
            await waiting(1000);
        } catch (error) {
            console.log("Polling Error");
            console.log(error.response?.data || error.message);
            throw error;
        }
    }
};


module.exports = {
    getLanguageById,
    submitBatch,
    submitToken,
};