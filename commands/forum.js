const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("news_forum")
    .setDescription("記事共有フォーラムに新しいスレッドを作成します。")
    .addStringOption((option) =>
      option.setName("url").setDescription("記事のURL").setRequired(true),
    ),

  async execute(interaction) {
    const url = interaction.options.getString("url");

    // URLからタイトルを取得する関数
    async function fetchArticleData(url) {
      try {
        // URLからHTMLを取得
        const { data } = await axios.get(url, { timeout: 5000 });
        const $ = cheerio.load(data);
        // <h1>タグからタイトルを取得
        const title = $("h1").first().text().trim();

        if (!title) {
          throw new Error("The article title was not found.");
        }

        const truncatedTitle = title.length > 100 ? title.substring(0, 97) + "..." : title;

        return truncatedTitle;
      } catch (error) {
        if (error.response) {
          // サーバーエラーや接続エラーなど
          throw new Error("Unable to connect to the URL.");
        } else if (error.request) {
          // リクエストが送信できなかった場合
          throw new Error("An error occurred while sending the request to the URL.");
        } else {
          // その他のエラー（タイトル取得の失敗など）
          throw new Error("Failed to fetch the article title.");
        }
      }
    }

    // 記事のタイトルを取得
    let title;
    try {
      title = await fetchArticleData(url);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `Error: ${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // フォーラムチャンネルを取得
    const NEWS_FORUM_CHANNEL_ID = require(".././channel-id.json").newsForum;
    const forumChannel = await interaction.client.channels.fetch(NEWS_FORUM_CHANNEL_ID);

    try {
      // 新しいスレッドを作成
      const thread = await forumChannel.threads.create({
        name: title,
        autoArchiveDuration: 60 * 24, // 1日
        reason: "新しいフォーラムスレッドの作成",
        message: url,
      });

      await interaction.reply({
        content: `スレッド "${title}" が作成されました！\nスレッドのリンク: ${thread.url}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `Error: ${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
