const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("parrot")
    .setDescription("オウム返しをするだけのコマンド")
    .addStringOption((option) =>
      option.setName("message").setDescription("オウム返しさせるメッセージ").setRequired(true),
    ),
  async execute(interaction) {
    await interaction.reply({
      content: interaction.options.getString("message"),
      ephemeral: true,
    });
  },
};
