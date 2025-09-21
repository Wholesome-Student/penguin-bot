const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dictionaryPath = path.join(__dirname, "../dictionary.json");

function loadDictionary() {
  if (fs.existsSync(dictionaryPath)) {
    const data = fs.readFileSync(dictionaryPath, "utf8");
    return JSON.parse(data);
  }
  return {};
}

module.exports = {
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const dictionary = loadDictionary();
    const terms = Object.keys(dictionary);

    const filtered = terms.filter(choice => choice.startsWith(focusedValue)).slice(0, 25);
    
    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice })),
    );
  },

  data: new SlashCommandBuilder()
    .setName("whatis")
    .setDescription("登録されている用語の解説を表示します。")
    .addStringOption((option) =>
      option
        .setName("term")
        .setDescription("検索したい用語")
        .setRequired(true)
        .setAutocomplete(true),
    ),
  async execute(interaction) {
    const term = interaction.options.getString("term").toLowerCase();

    try {
      const dictionary = loadDictionary();

      if (Object.keys(dictionary).length === 0) {
        await interaction.reply({
          content: "まだ辞書に何も登録されていません。",
          ephemeral: true,
        });
        return;
      }

      if (dictionary[term]) {
        const embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`${term}`)
          .setDescription(dictionary[term])
          .setTimestamp();
        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply(`用語「**${term}**」は見つかりませんでした。`);
      }
    } catch (error) {
      console.error("エラー: ", error);
      await interaction.reply({
        content: "エラーが発生しました。",
        ephemeral: true,
      });
    }
  },
};