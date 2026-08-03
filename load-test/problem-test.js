import http from "k6/http";
import { sleep } from "k6";

export const options = {
    vus: 5,
    duration: "10s",
};

export default function () {
    const payload = JSON.stringify({
        language: "javascript",
        sourceCode: `
function addTwoNumbers(a, b) {
    return a + b;
}
`
    });

    const params = {
        headers: {
            "Content-Type": "application/json",

            // Uncomment if your API requires authentication
            // Authorization: "Bearer YOUR_JWT_TOKEN",
        },
    };

    const res = http.post(
        "http://localhost:5000/submission/submit/6a3eb16e30033f04c659e555",
        payload,
        params
    );

    console.log(`VU: ${__VU}`);
    console.log(`Status: ${res.status}`);
    console.log(`Response Time: ${res.timings.duration.toFixed(2)} ms`);

    sleep(1);
}