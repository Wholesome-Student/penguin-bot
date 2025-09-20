const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder().setName("hc").setDescription("OKを返すヘルスチェック。"),
  async execute(interaction) {
    await interaction.reply("OK");
  },
};
