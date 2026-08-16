const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateContent(code, language) {
    
    // System Prompt: Sirf role aur language check ke liye
    const systemInstruction = `
You are an expert ${language} code reviewer. 
First, verify if the code is actually ${language}. If it is not, reply ONLY with this exact message and stop:
## ❌ Language Mismatch Detected
You selected **${language}**, but the provided code appears to be in a different language.
    `;

    // User Prompt: Code pehle denge, aur Template sabse last mein!
    const userPrompt = `
Here is the ${language} code to review:
\`\`\`${language}
${code}
\`\`\`

If the code is valid ${language}, you MUST output your review EXACTLY using the Markdown template below. 
DO NOT add any conversational text like "Alternatively..." or "Here is the review". 
DO NOT skip any headings. You MUST include Security and Test Cases even if the code is simple.

### 📊 Code Quality Report

#### 🐛 Bugs & Issues
(List bugs with 🔴 CRITICAL, 🟠 HIGH, 🟡 MEDIUM, 🔵 LOW. If none, write "✅ No major bugs found.")

#### ⚡ Complexity Analysis
* **Time Complexity:** 
* **Space Complexity:** 
* **Explanation:** 

#### 🔐 Security & Vulnerabilities
(Identify any security risks. If none, write "✅ No obvious security vulnerabilities detected.")

#### 🧪 Suggested Test Cases
* **Test Case 1 (Normal):** Input: [...], Expected: [...]
* **Test Case 2 (Edge Case):** Input: [...], Expected: [...]
* **Test Case 3 (Negative/Invalid):** Input: [...], Expected: [...]

#### ✨ Optimized & Refactored Code
\`\`\`${language}
(Provide the fully optimized code here)
\`\`\`
    `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: userPrompt } // Template ab last mein jaa raha hai
            ],
            temperature: 0.1, // Isko 0.1 kar diya hai taaki AI bilkul bhi apni marzi na chalaye
            model: "llama-3.3-70b-versatile", 
        });

        return chatCompletion.choices[0]?.message?.content || "";

    } catch (error) {
        console.error("Groq API Error:", error);
        return "## ❌ Error\nBackend is running, but failed to connect to Groq AI.";
    }
}

module.exports = generateContent;