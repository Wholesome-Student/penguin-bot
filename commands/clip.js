const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("clip")
    .setDescription("現在時刻を記録します")
    .addStringOption((option) =>
      option.setName("title").setDescription("タイトル").setRequired(false),
    ),
  async execute(interaction) {
    const title = interaction.options.getString("title");
    const replyEmbed = new EmbedBuilder()
      .setTitle(title || "無題")
      .setDescription(new Date().toLocaleString())
      .setColor("Random");
    interaction.reply({
      embeds: [replyEmbed],
    });
  },
};
