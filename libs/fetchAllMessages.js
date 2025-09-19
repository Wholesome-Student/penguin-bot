const { ChannelType } = require("discord.js");

async function fetchAllMessages(channel) {
  if (!channel || channel.type !== ChannelType.GuildText) {
    return false;
  }
  let allMessages = [];
  let lastMessageId = null;
  while (true) {
    const messages = await channel.messages.fetch({
      limit: 100,
      before: lastMessageId,
    });
    allMessages = allMessages.concat(Array.from(messages.values()));
    if (messages.size === 0) break;
    lastMessageId = messages.last().id;
  }
  return allMessages;
}

module.exports = { fetchAllMessages };
