const http = require('http');
http.createServer((req, res) => res.end('Bot is running')).listen(process.env.PORT || 3000);
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const ADMIN_ID = process.env.ADMIN_CHAT_ID;

const userState = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userState[chatId] = {};

  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎁 Получить бесплатный гайд', callback_data: 'get_guide' }]
      ]
    }
  };

  bot.sendMessage(chatId, `Привет, ${msg.from.first_name}! 👋\n\nЯ помогу тебе получить эксклюзивный гайд по продвижению в медиа. Нажми кнопку ниже, чтобы начать!`, opts);
});

bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;

  if (query.data === 'get_guide') {
    userState[chatId] = { step: 'awaiting_name' };
    bot.sendMessage(chatId, 'Отлично! Напиши, пожалуйста, как к тебе обращаться (ваше имя):');
  }
  
  bot.answerCallbackQuery(query.id);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  const state = userState[chatId];

  if (state && state.step === 'awaiting_name') {
    state.name = text;
    state.step = 'awaiting_contact';
    bot.sendMessage(chatId, `Приятно познакомиться, ${text}! 📲 Оставь свой номер телефона или Email для связи:`);
  } 
  else if (state && state.step === 'awaiting_contact') {
    state.contact = text;
    state.step = 'completed';

    bot.sendMessage(
      chatId,
      'Спасибо! Держи обещанный гайд по медиастратегии: https://example.com/guide.pdf\n\nУспехов в продвижении! 🚀'
    );

    const username = msg.from.username ? `@${msg.from.username}` : 'скрыт';
    const adminMessage = `🔥 Новая заявка на гайд!\n\n👤 Имя: ${state.name}\n📞 Контакт: ${state.contact}\n💬 Telegram: ${username}`;
    
    bot.sendMessage(ADMIN_ID, adminMessage);
  }
});

console.log('Бот успешно запущен и готов к работе!');
