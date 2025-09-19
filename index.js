const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { playSound, leaveVC } = require("./libs/playSound.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});
const { token } = require("./config.json");

// ディレクトリ内のファイル名を取得
const fs = require("fs");
const commandFiles = fs.readdirSync("./commands").filter((file) => file.endsWith(".js"));

client.commands = new Collection();
client.components = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
  if ("handleComponents" in command) {
    client.components.set(command.data.name, command);
  }
}

client.on("ready", () => {
  console.log(`${client.user.tag}起動完了`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  message.channel.send(message.content);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    await command.execute(interaction);
  } else if (interaction.isMessageComponent()) {
    const [commandName, _] = interaction.customId.split(":");
    const command = interaction.client.components.get(commandName);
    await command.handleComponents(interaction);
  }
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (!(oldState && newState && !newState.member.user.bot)) return;
  if (!oldState.channel && newState.channel) {
    playSound(client.user.id, newState, "./sounds/coin001.mp3");
  } else if (oldState.channelId && !newState.channelId) {
    if (oldState.channel.members.every((member) => member.user.bot)) {
      leaveVC();
    }
  }
});

client.login(token);
