const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const commandName = "hey";
module.exports = {
  data: new SlashCommandBuilder().setName(commandName).setDescription("押すと挨拶するボタンを生成"),
  async execute(interaction) {
    await interaction.reply({
      content: "ボタンを生成",
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`${commandName}:hello`)
            .setLabel("hello!")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`${commandName}:bye`)
            .setEmoji("👋")
            .setStyle(ButtonStyle.Danger),
        ),
      ],
    });
  },
  async handleComponents(interaction) {
    const [_, buttonName] = interaction.customId.split(":");
    let sendContent = "";
    if (buttonName === "hello") {
      sendContent = "hello!";
    } else if (buttonName === "bye") {
      sendContent = "bye!";
    } else {
      return;
    }
    await interaction.reply({
      content: sendContent,
      ephemeral: true,
    });
  },
};
