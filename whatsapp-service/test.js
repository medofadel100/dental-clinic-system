const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEYS.split(',')[0].trim());
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function run() {
    try {
        const result = await model.generateContent('Explain how AI works in a few words');
        console.log(result.response.text());
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}
run();
