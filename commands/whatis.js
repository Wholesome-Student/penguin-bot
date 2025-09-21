const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dictionaryPath = path.join(__dirname, "../dictionary.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("whatis")
    .setDescription("登録されている用語の解説を表示します。")
    .addStringOption((option) =>
      option.setName("term").setDescription("検索したい用語").setRequired(true),
    ),
  async execute(interaction) {
    const term = interaction.options.getString("term").toLowerCase(); // 大文字小文字を区別しないほうが良かったりするのかなーどうなのかなー2

    try {
      // dictionary.jsonを読み込む
      if (!fs.existsSync(dictionaryPath)) {
        await interaction.reply({
          content: "まだ辞書に何も登録されていません。",
          ephemeral: true,
        });
        return;
      }

      const data = fs.readFileSync(dictionaryPath, "utf8");
      const dictionary = JSON.parse(data);

      if (dictionary[term]) {
        // 見つかった場合
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`${term}`)
          .setDescription(dictionary[term])
          .setTimestamp();
        await interaction.reply({ embeds: [embed] });
      } else {
        // 見つからなかった場合
        await interaction.reply(`用語「**${term}**」は見つかりませんでした。`);
      }
    } catch (error) {
      console.error("辞書の読み込み中にエラーが発生しました:", error);
      await interaction.reply({
        content: "申し訳ありません、用語の検索中にエラーが発生しました。",
        ephemeral: true,
      });
    }
  },
};