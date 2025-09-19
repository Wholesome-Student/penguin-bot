const fs = require("fs");
const { REST, Routes } = require("discord.js");
const { token, clientId, guildId } = require("./config.json");

// ディレクトリ内のファイル名を取得
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));
// コマンド情報を配列に格納する
const commands = [];
for (const file of commandFiles) {
  console.log(file);
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

// rest通信
const rest = new REST().setToken(token);
rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => {
    console.log("Command registration completed!");
  })
  .catch(console.error);
