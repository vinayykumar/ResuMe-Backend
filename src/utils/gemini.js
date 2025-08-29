const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });


async function analyzeResume(resumeText, jobTitle, jobDescription) {
  const prompt = `
  You are an AI resume analyzer. Compare this resume with the given job description.

  Job Title: ${jobTitle}
  Job Description: ${jobDescription}

  Resume Text:
  ${resumeText}

  Return these in the response and strictly follow this JSON Format, dont add any spacing or special characters
  {
    "aiScore": number, 
    "aiFeedback": {
      "Strengths_Resume": [ "string", "string" ],
      "Weakness_Resume": [ "string", "string" ]
    },
    "keywords": [ "string", "string" ]
  }
  `;

  let text;
  try {
    const result = await model.generateContent(prompt);
    const rawText = response.aiResponse.response.candidates[0].content.parts[0].text;
    return JSON.parse(rawText);

  } catch (err) {
    console.error("Final AI error:", err);
    throw new Error("AI Resume Analysis failed");
  }
}

module.exports = { analyzeResume };
