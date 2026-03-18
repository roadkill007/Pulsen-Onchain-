# On-Chain Pulse CLI

This project uses Nansen API to generate a blockchain activity report.

It makes 11+ API calls and converts raw data into insights.

Run with:
node pulse.js

Installation & Setup Instructions

> Clone the project:

git clone < repository link >
cd onchain-pulse

> Install dependencies:

npm install

> Create .env file with:

TELEGRAM_TOKEN=<Your Telegram Bot Token>
NANSEN_API_KEY=<Your Nansen API Key>

> Run the Telegram bot

 node bot.js

Users can now interact with Pulsen by sending /pulse in Telegram.
