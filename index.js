const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenAI } = require('@google/genai');
const http = require('http');

const token = process.env.TELEGRAM_BOT_TOKEN;
const geminiApiKey = process.env.GEMINI_API_KEY;
const allowedUserId = process.env.ALLOWED_USER_IDS;
const PORT = process.env.PORT || 3000;

// Create a dummy HTTP server so Render detects an open port and passes its health check
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Personal AI Bot is running!\n');
});

server.listen(PORT, () => {
  console.log(`HTTP server is listening on port ${PORT}`);
});

// Start the Telegram Bot with polling
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
