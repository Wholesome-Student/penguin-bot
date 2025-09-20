const { REST, Routes } = require("discord.js");
const { readdirSync } = require("fs");
const { token, clientId, guildId } = require("./config.json");

const commands = [];

// commandsフォルダのコマンドをすべて読み込む
const commandFiles = readdirSync("./commands").filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[警告] ${file} には正しい "data" または "execute" がありません`);
  }
}

// DiscordのREST APIを使ってコマンドを登録
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("🛰️ コマンドを登録中...");

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });

    console.log("✅ コマンド登録成功！");
  } catch (error) {
    console.error("❌ コマンド登録失敗：", error);
  }
})();
