const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const { execSync } = require("child_process");
const commandName = "symmetry";
module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("画像をシンメトリーにします。")
    .addStringOption((option) =>
      option.setName("url").setDescription("画像のURL").setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName("is-inverse")
        .setDescription("右半分を使用したシンメトリーにします。")
        .setRequired(false),
    ),
  async execute(interaction) {
    const url = interaction.options.getString("url");
    const isInverse = interaction.options.getBoolean("is-inverse");
    try {
      const stdout = execSync(`python ./libs/symmetry.py "${isInverse}" "${url}"`);
      const base64 = stdout.toString();
      const imageBuffer = Buffer.from(base64, "base64");
      await interaction.reply({
        files: [new AttachmentBuilder(imageBuffer)],
      });
    } catch (e) {
      await interaction.reply({
        content: "画像生成に失敗しました",
        ephemeral: true,
      });
    }
  },
};
