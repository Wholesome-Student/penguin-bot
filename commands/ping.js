const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("pong!を返すだけのコマンド"),
  async execute(interaction) {
    await interaction.reply({ content: "pong!" });
  },
};
