const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Generate interview questions for a domain
exports.generateQuestions = async (domain, difficulty) => {
  const prompt = `
    Generate 5 ${difficulty} level interview questions for ${domain}.
    Return a JSON array with this structure (no markdown, raw JSON only):
    [
      {
        "questionText": "...",
        "type": "descriptive",
        "domain": "${domain}",
        "difficulty": "${difficulty}",
        "sampleAnswer": "...",
        "isAIGenerated": true
      }
    ]
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
};

// Evaluate a user's answer and return score + feedback
exports.evaluateAnswer = async (question, answer) => {
  const prompt = `
    Question: ${question}
    User's Answer: ${answer}

    Evaluate the answer and return JSON only (no markdown):
    {
      "score": <number between 0 and 10>,
      "feedback": "<detailed feedback on what was good and what was missing>"
    }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
};

// Generate overall feedback summary from all answers
exports.generateFeedbackSummary = async (allFeedback, domain) => {
  const prompt = `
    Based on the following interview feedback for a ${domain} interview:
    ${allFeedback}

    Return a JSON object only (no markdown):
    {
      "strengths": ["...", "..."],
      "weaknesses": ["...", "..."],
      "suggestions": ["...", "..."],
      "summary": "<2-3 sentence overall summary>"
    }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text);
};