const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const { fetchAllMessages } = require("../libs/fetchAllMessages.js");
const commandName = "reaction-board";
const emojiRegex = /^\p{Emoji}$/u;
module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("チャンネルごとにリアクションの集計を行います。")
    .addStringOption((option) =>
      option.setName("emoji").setDescription("検索するデフォルト絵文字(1文字)").setRequired(true),
    )
    .addNumberOption((option) =>
      option.setName("threshold").setDescription("対象にするリアクション数").setRequired(true),
    ),
  async execute(interaction) {
    const emoji = interaction.options.getString("emoji");
    const threshold = interaction.options.getNumber("threshold");
    if (!emojiRegex.test(emoji)) {
      return await interaction.reply({
        content: "デフォルト絵文字を1つだけ入力してください。",
        ephemeral: true,
      });
    }
    await interaction.reply({
      components: [
        new ActionRowBuilder().addComponents(
          new ChannelSelectMenuBuilder()
            .setCustomId(`${commandName}:${emoji}_${threshold}`)
            .setChannelTypes([ChannelType.GuildText])
            .setPlaceholder(`${threshold}個以上の${emoji}を検索するチャンネルを選択`),
        ),
      ],
    });
  },
  async handleComponents(interaction) {
    const [_, searchKeys] = interaction.customId.split(":");
    const [emoji, threshold] = searchKeys.split("_");
    const channelId = interaction.values.join("");
    await interaction.reply({
      content: "検索中...",
      ephemeral: true,
    });
    const channel = interaction.guild.channels.cache.get(channelId);
    const allMessages = await fetchAllMessages(channel);
    const okMessages = allMessages
      .filter((message) => message.reactions.cache.get(emoji)?.count >= threshold)
      .reverse();
    if (okMessages.length === 0) {
      await interaction.followUp({
        content: "ヒットしませんでした。",
        ephemeral: true,
      });
      return;
    }
    let messageEmbeds = [];
    const listMessageEmbeds = [];
    okMessages.forEach((message, idx) => {
      const file = message.attachments.first();
      messageEmbeds.push(
        new EmbedBuilder()
          .setTitle(
            `${emoji} ${message.reactions.cache.get(emoji)?.count} https://discord.com/channels/${
              interaction.guildId
            }/${channelId}/${message.id}`,
          )
          .setAuthor({
            name: message.author.username,
            iconURL: message.author.displayAvatarURL(),
          })
          .setDescription(message.content || "\u200b")
          .setImage(file?.height && file?.width ? file.url : null)
          .setTimestamp(message.createdTimestamp)
          .setColor("Random"),
      );
      if ((idx + 1) % 10 === 0 || idx === okMessages.length - 1) {
        listMessageEmbeds.push(messageEmbeds);
        messageEmbeds = [];
      }
    });
    listMessageEmbeds.forEach(async (messageEmbeds) => {
      await interaction.followUp({
        embeds: messageEmbeds,
      });
    });
  },
};
