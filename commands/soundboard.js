const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
} = require("discord.js");
const { playSound } = require("../libs/playSound.js");
const { soundboard } = require("../sounds/soundboard.json");
const commandName = "soundboard";

const label2Path = new Collection();
const actionRows = [];
let currentRow = new ActionRowBuilder();
soundboard.forEach((value, idx) => {
  label2Path[value.label] = value.path;
  const button = new ButtonBuilder()
    .setCustomId(`${commandName}:${value.label}`)
    .setLabel(value.label)
    .setStyle(ButtonStyle.Success);
  currentRow.addComponents(button);
  if ((idx + 1) % 5 === 0 || idx === soundboard.length - 1) {
    actionRows.push(currentRow);
    currentRow = new ActionRowBuilder();
  }
});

module.exports = {
  data: new SlashCommandBuilder().setName(commandName).setDescription("サウンドボートを送信"),
  async execute(interaction) {
    await interaction.reply({
      content: "サウンドボードを生成しました",
      components: actionRows,
    });
  },
  async handleComponents(interaction) {
    const [_, buttonName] = interaction.customId.split(":");
    playSound(interaction.applicationId, interaction, `./sounds/${label2Path[buttonName]}`);
    await interaction.reply({
      content: "音声を再生しました",
      ephemeral: true,
    });
  },
};
