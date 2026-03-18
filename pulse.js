const { execSync } = require("child_process");

function runCommand(cmd) {
  try {
    const output = execSync(cmd, { encoding: "utf-8" });
    return output;
  } catch (err) {
    return "No data / command failed";
  }
}

// Trim long outputs so it doesn't flood your terminal
function cleanOutput(text) {
  if (!text) return "No data";
  return text.split("\n").slice(0, 10).join("\n"); // show first 10 lines
}

function main() {
  console.log("\n==============================");
  console.log(" REAL ON-CHAIN PULSE REPORT ");
  console.log("==============================\n");

  const wallet = runCommand("nansen research wallet 0x000000000000000000000000000000000000dead");
  const portfolio = runCommand("nansen research portfolio 0x000000000000000000000000000000000000dead");
  const eth = runCommand("nansen research search eth");
  const btc = runCommand("nansen research search btc");
  const smartMoney = runCommand("nansen research smart-money");
  const alerts = runCommand("nansen alerts");
  const research = runCommand("nansen research");
  const points = runCommand("nansen research points");
  const profiler = runCommand("nansen research profiler");
  const tradeQuote = runCommand("nansen trade quote eth");

  console.log("📊 WALLET DATA:");
  console.log(cleanOutput(wallet));

  console.log("\n💼 PORTFOLIO:");
  console.log(cleanOutput(portfolio));

  console.log("\n🔥 ETH DATA:");
  console.log(cleanOutput(eth));

  console.log("\n₿ BTC DATA:");
  console.log(cleanOutput(btc));

  console.log("\n🧠 SMART MONEY:");
  console.log(cleanOutput(smartMoney));

  console.log("\n🚨 ALERTS:");
  console.log(cleanOutput(alerts));

  console.log("\n📚 RESEARCH:");
  console.log(cleanOutput(research));

  console.log("\n🎯 POINTS:");
  console.log(cleanOutput(points));

  console.log("\n🧬 PROFILER:");
  console.log(cleanOutput(profiler));

  console.log("\n💱 TRADE QUOTE:");
  console.log(cleanOutput(tradeQuote));

  console.log("\n==============================");
  console.log(" END OF REPORT ");
  console.log("==============================\n");
}

main();