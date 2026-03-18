require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { execSync } = require("child_process");

// ==========================
// CONFIG
// ==========================
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Default whale wallet (Vitalik)
const DEFAULT_WALLET = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

// ==========================
// HELPER FUNCTIONS
// ==========================

// Run CLI command safely
function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8" });
  } catch {
    return null;
  }
}

// Clean output and limit lines
function clean(text, lines = 4) {
  if (!text) return "No data / failed";
  const cleaned = text.split("\n").slice(0, lines).join("\n");
  // remove long JSON dumps
  return cleaned.length > 400 ? cleaned.slice(0, 400) + "..." : cleaned;
}

// Send message in Telegram chunks to avoid 400 error
function sendInChunks(chatId, text) {
  const chunkSize = 4000;
  for (let i = 0; i < text.length; i += chunkSize) {
    bot.sendMessage(chatId, text.substring(i, i + chunkSize));
  }
}

// Sentiment comments
function getSentimentComment(data, type) {
  if (!data || data === "No data / failed") return `${type} shows no data.`;
  const lowered = data.toLowerCase();
  if (lowered.includes("increase") || lowered.includes("top") || lowered.includes("active") || lowered.includes("gain")) {
    return `${type} is showing bullish activity.`;
  } else if (lowered.includes("drop") || lowered.includes("loss") || lowered.includes("decrease") || lowered.includes("low")) {
    return `${type} is showing bearish signals.`;
  }
  return `${type} shows mixed activity.`;
}

// Summarize market tokens (top 3 by volume)
function summarizeTokens(raw) {
  try {
    const obj = JSON.parse(raw);
    if (!obj.data?.tokens) return "No data / failed";
    const tokens = obj.data.tokens
      .sort((a, b) => b.volume_24h - a.volume_24h)
      .slice(0, 3)
      .map(t => `${t.symbol} (${t.chain}): $${t.price.toFixed(2)}, 24h Vol: $${t.volume_24h.toLocaleString()}`);
    return tokens.join("\n");
  } catch {
    return "No data / failed";
  }
}

// ==========================
// BOT HANDLERS
// ==========================

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome! Send /pulse to get the PRO ON-CHAIN PULSE REPORT with insights.\nYou can also send /pulse <wallet_address> to check a specific wallet.");
});

bot.onText(/\/pulse(?:\s+(\S+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const walletInput = match[1];
  const wallets = walletInput ? [walletInput] : [DEFAULT_WALLET];

  bot.sendMessage(chatId, "Fetching on-chain data...");

  // --------------------------
  // Market / DEX / NFT / Labels / Gas
  // --------------------------
  const ethRaw = runCommand("nansen research search eth");
  const btcRaw = runCommand("nansen research search btc");
  const dexTrades = clean(runCommand("nansen dex trades")); 
  const dexLiquidity = clean(runCommand("nansen dex liquidity")); 
  const nftCollections = clean(runCommand("nansen nft collections")); 
  const nftVolume = clean(runCommand("nansen nft volume")); 
  const labels = clean(runCommand("nansen labels")); 
  const gas = clean(runCommand("nansen gas")); 

  const eth = summarizeTokens(ethRaw);
  const btc = summarizeTokens(btcRaw);

  // --------------------------
  // Build report
  // --------------------------
  let report = `
==============================
ON-CHAIN PULSE REPORT
==============================

1. Market is active:
ETH Market:
${eth}
Comment: ${getSentimentComment(eth, "ETH Market")}

BTC Market:
${btc}
Comment: ${getSentimentComment(btc, "BTC Market")}

2. DEX trading activity:
Trades:\n${dexTrades}
Liquidity:\n${dexLiquidity}
Comment: ${getSentimentComment(dexTrades + " " + dexLiquidity, "DEX Activity")}

3. NFT market shows activity:
Collections:\n${nftCollections}
Volume:\n${nftVolume}
Comment: ${getSentimentComment(nftCollections + " " + nftVolume, "NFT Market")}

Other Signals:
Labels:\n${labels}
Gas info:\n${gas}
Comment: ${getSentimentComment(labels + " " + gas, "Other Signals")}
`;

  // --------------------------
  // Wallet summaries
  // --------------------------
  wallets.forEach((wallet, idx) => {
    const portfolio = clean(runCommand(`nansen research wallet ${wallet} defi-holdings`), 5); 
    const activity = clean(runCommand(`nansen research wallet ${wallet} defi`), 5); 

    report += `\nWallet ${idx + 1}: ${wallet}\nPortfolio:\n${portfolio}\nRecent Activity:\n${activity}\n`;
    report += `Comment: ${getSentimentComment(portfolio + " " + activity, "Wallet Summary")}\n`;
  });

  // --------------------------
  // Conclusion
  // --------------------------
  report += "\nConclusion:\nMarket shows mixed signals based on recent activity.";

  // --------------------------
  // Send report
  // --------------------------
  sendInChunks(chatId, report);
});