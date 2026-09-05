require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

if (!TOKEN) throw new Error("BOT_TOKEN is missing.");
if (!ADMIN_ID) throw new Error("ADMIN_ID is missing.");

const bot = new TelegramBot(TOKEN, { polling: true });

const userData = {};

const mainMenu = {
  reply_markup: {
    keyboard: [
      ["🌐 Get a Website"],
      ["💼 Our Services", "💰 Check Prices"],
      ["📂 Portfolio", "💬 Contact Us"]
    ],
    resize_keyboard: true
  }
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  userData[chatId] = {};

  bot.sendMessage(
    chatId,
    `👋 Welcome to EPIC XI TRUST-LINKS!

We help individuals and businesses create professional websites.

What would you like to do?`,
    mainMenu
  );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith("/")) return;

  if (text === "🌐 Get a Website") {
    userData[chatId] = { step: "business_name" };

    return bot.sendMessage(
      chatId,
      "🏢 Great! What is the name of your business or project?"
    );
  }

  if (text === "💼 Our Services") {
    return bot.sendMessage(
      chatId,
      `💼 EPIC XI SERVICES

🌐 Website Design
🛒 Business Websites
📱 Landing Pages
🎓 Educational Websites
📊 Dashboards
⚙️ Custom Web Projects`
    );
  }

  if (text === "💰 Check Prices") {
    return bot.sendMessage(
      chatId,
      `💰 WEBSITE PRICING

Our prices depend on the type and features of your project.

Start a website request and we'll review your requirements and discuss a suitable price with you.`
    );
  }

  if (text === "📂 Portfolio") {
    return bot.sendMessage(
      chatId,
      `📂 OUR PORTFOLIO

https://epicxi.netlify.app`
    );
  }

  if (text === "💬 Contact Us") {
    return bot.sendMessage(
      chatId,
      `💬 CONTACT EPIC XI

Send us a website request using the 🌐 Get a Website button.

We'll review your request and contact you through Telegram.`
    );
  }

  const data = userData[chatId];

  if (!data || !data.step) return;

  if (data.step === "business_name") {
    data.businessName = text;
    data.step = "website_type";

    return bot.sendMessage(
      chatId,
      "🌐 What type of website do you need?\n\nExample: Business website, Online store, Portfolio, School website, Blog, etc."
    );
  }

  if (data.step === "website_type") {
    data.websiteType = text;
    data.step = "features";

    return bot.sendMessage(
      chatId,
      "⚙️ What features do you want on the website?"
    );
  }

  if (data.step === "features") {
    data.features = text;
    data.step = "budget";

    return bot.sendMessage(
      chatId,
      "💰 What is your estimated budget?"
    );
  }

  if (data.step === "budget") {
    data.budget = text;
    data.step = null;

    const username = msg.from.username
      ? `@${msg.from.username}`
      : "No username";

    const request = `🔥 NEW WEBSITE CLIENT REQUEST

👤 Client: ${msg.from.first_name || "Unknown"}
📱 Username: ${username}
🆔 Telegram ID: ${chatId}

🏢 Business/Project:
${data.businessName}

🌐 Website Type:
${data.websiteType}

⚙️ Features:
${data.features}

💰 Budget:
${data.budget}`;

    try {
      await bot.sendMessage(ADMIN_ID, request);

      await bot.sendMessage(
        chatId,
        `✅ Thank you!

Your website request has been sent to the EPIC XI team.

We will review your request and contact you through Telegram.`,
        mainMenu
      );

      delete userData[chatId];

    } catch (error) {
      console.error(error);

      bot.sendMessage(
        chatId,
        "⚠️ Something went wrong. Please try again later."
      );
    }
  }
});

app.get("/", (req, res) => {
  res.send("EPIC XI Telegram Bot is running 🤖");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
