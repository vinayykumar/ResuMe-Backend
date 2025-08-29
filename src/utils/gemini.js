const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function analyzeResume(resumeText, jobTitle, jobDescription) {
  const prompt = `
You are an AI resume analyzer. Compare this resume with the given job description.

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Resume Text:
${resumeText}

Return ONLY valid JSON in this exact format:

{
  "aiScore": number, 
  "aiFeedback": {
    "Strengths_Resume": [ "string", "string" ],
    "Weakness_Resume": [ "string", "string" ]
  },
  "keywords": [ "string", "string" ]
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Try parsing safely
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    console.error("AI JSON parse error:", err, text);
    throw new Error("Failed to parse AI response");
  }

  return parsed;
}

module.exports = { analyzeResume };
