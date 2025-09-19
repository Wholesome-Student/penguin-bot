const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  getVoiceConnection,
} = require("@discordjs/voice");

let connection, player;
async function playSound(botId, trigger, soundPath) {
  if (trigger.member.voice.channel) {
    if (!trigger.member.voice.channel.members.find((member) => member.id === botId)) {
      connection = joinVoiceChannel({
        channelId: trigger.channel.id,
        guildId: trigger.guild.id,
        adapterCreator: trigger.guild.voiceAdapterCreator,
        selfMute: false,
      });
      player = createAudioPlayer();
    }
    connection.subscribe(player);
    const resource = createAudioResource(soundPath);
    player.play(resource);
  }
}
async function leaveVC() {
  if (connection) {
    connection.destroy();
  }
}

module.exports = { playSound, leaveVC };
