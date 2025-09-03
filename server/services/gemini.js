// gemini.js - All Gemini AI logic

const { GoogleGenerativeAI } = require("@google/generative-ai");
const API = !!process.env.GEMINI_API_KEY;

let genAI;
if (API) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Cosine Similarity
function cosineSim(a = [], b = []) {
  if (!a.length || !b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * (b[i] || 0);
    na += a[i] * a[i];
    nb += (b[i] || 0) * (b[i] || 0);
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}


async function summarizeText(text) {
    if (!API) return text.slice(0, 400) + (text.length > 400 ? "..." : "");
  
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      const prompt = `Summarize the following text in 3-4 sentences:\n\n${text}`;
      const res = await model.generateContent(prompt);
  
    //   console.log("res from summary:", res);
  
      // SDK v1 me response aise parse hota hai
      const summary =
        res.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Summary not available.";
  
      return summary;
    } catch (error) {
      console.error("Error in summarizing:", error);
      return text.slice(0, 400) + (text.length > 400 ? "..." : "");
    }
  }
  


async function generateTags(text) {
  if (!API) {
    const words = (text || "").toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    return [...new Set(words)].slice(0, 3);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Generate 3-5 short, comma-separated tags for the following text:\n\n${text}`;
  const result = await model.generateContent(prompt);
  return result.response.text().split(",").map((t) => t.trim());
}


async function embedText(text) {
  if (!API) {
    return Array.from(
      { length: 64 },
      (_, i) => ((text.charCodeAt(i % text.length) || 1) % 10) / 10
    );
  }

  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding.values; // array of floats
}

async function answerQuestion(question, contextDocs) {
  if (!API) {
    const joined = contextDocs
      .map(
        (d, i) =>
          `(Doc ${i + 1}) ${d.title}\n${d.summary || d.content.slice(0, 200)}`
      )
      .join("\n\n");
    return `I don't have Gemini API set. Context used:\n\n${joined}\n\nQuestion: ${question}`;
  }

  const context = contextDocs
    .map(
      (d, i) => `(Doc ${i + 1}) ${d.title}\n${d.summary || d.content}`
    )
    .join("\n\n");

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Answer the following question using the context:\n\nContext:\n${context}\n\nQuestion: ${question}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = {
  summarizeText,
  generateTags,
  embedText,
  answerQuestion,
  cosineSim,
  genAI
};
