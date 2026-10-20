const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenAI } = require('@google/genai');

const token = process.env.TELEGRAM_BOT_TOKEN;
const geminiApiKey = process.env.GEMINI_API_KEY;
const allowedUserId = process.env.ALLOWED_USER_IDS;

const bot = new TelegramBot(token, { polling: true });
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const text = msg.text;

  // Security check: only allow your user ID
  if (allowedUserId && userId !== allowedUserId) {
    bot.sendMessage(chatId, "Unauthorized access.");
    return;
  }

  if (!text || text.startsWith('/')) return;

  try {
    await bot.sendChatAction(chatId, 'typing');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: text,
    });

    const reply = response.text;
    bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Error communicating with Gemini.");
  }
});

console.log("Personal AI Bot (Gemini) is running...");
