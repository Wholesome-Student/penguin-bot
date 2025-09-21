const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const dictionaryPath = path.join(__dirname, "../dictionary.json");

module.exports = {
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    // dictionary.jsonを読み込む
    let dictionary = {};
    if (fs.existsSync(dictionaryPath)) {
      const data = fs.readFileSync(dictionaryPath, "utf8");
      dictionary = JSON.parse(data);
    }
    const terms = Object.keys(dictionary);

    const filtered = terms.filter((choice) => choice.startsWith(focusedValue)).slice(0, 25);

    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
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
    // dictionary.jsonを読み込む
    let dictionary = {};
    if (fs.existsSync(dictionaryPath)) {
      const data = fs.readFileSync(dictionaryPath, "utf8");
      dictionary = JSON.parse(data);
    }

    if (Object.keys(dictionary).length === 0) {
      await interaction.reply({
        content: "まだ辞書に何も登録されていません。",
        flags: MessageFlags.Ephemeral,
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
      await interaction.reply({
        content: `用語「**${term}**」は見つかりませんでした。`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
