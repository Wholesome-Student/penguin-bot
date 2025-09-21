const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dictionaryPath = path.join(__dirname, "../dictionary.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addterm")
    .setDescription("新しい用語を辞書に登録・更新します。")
    .addStringOption((option) =>
      option.setName("term").setDescription("登録する用語").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("description").setDescription("用語の解説").setRequired(true),
    ),
  async execute(interaction) {
    const term = interaction.options.getString("term").toLowerCase(); // 大文字小文字を区別しないほうが良かったりするのかなーどうなのかなー
    const description = interaction.options.getString("description");

    // dictionary.jsonを読み込む
    let dictionary = {};
    if (fs.existsSync(dictionaryPath)) {
      const data = fs.readFileSync(dictionaryPath, "utf8");
      dictionary = JSON.parse(data);
    }

    // 新しい用語を追加または更新
    dictionary[term] = description;
    fs.writeFileSync(dictionaryPath, JSON.stringify(dictionary, null, 2), "utf8");

    await interaction.reply(
      `用語「**${term}**」を「${description}」という説明文で登録・更新しました。`,
    );
  },
};
