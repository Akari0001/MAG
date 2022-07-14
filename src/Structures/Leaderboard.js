const { MessageEmbed, TextChannel } = require("discord.js");
const getMessagesArray = require("../Base/leaderboard");
const { Bot } = require("./Client");

class Leaderboard {
  /**
   * @param { Bot } client
   */
  constructor(client) {
    //client
    this.client = client;
  }

  //starting automated leaderboard function
  async startLeaderboard(method) {
    setInterval(async () => {
      //updating...
      await this.updateLeaderboards(method);
    }, this.client.config.Leaderboard.interval || 300000);
  }

  //automated leaderboard function
  async updateLeaderboards(method) {
    //methods
    let methods = ["edit", "send"];

    //checking if provided any method
    if (!method || !methods.includes(method)) method = "send";

    //database of guilds
    let Guilds = await this.client.Guild.find({});

    //looping over each guilds
    Guilds.forEach(async (guild) => {
      //fetching guild
      let Server = this.client.guilds.cache.get(guild._id);

      //if guild and database not found
      if (
        !Server ||
        !guild.Loggers ||
        !guild.Loggers.Leaderboard ||
        !guild.Loggers.Leaderboard.Channel
      )
        return;

      //finding logging channel

      let logChannel = Server.channels.cache.get(
        guild.Loggers.Leaderboard.Channel
      );

      //if logging channel not found
      if (!logChannel) return;

      //Messages Data | returns top 10 users for leaderboard embed
      let Leaderboard = await getMessagesArray(this.client, Server);

      //checking if leaderboard is not empty
      if (!Leaderboard.length) return;

      //index
      let index = 1;

      //leaderboard embed
      const embed = new MessageEmbed()
        .setAuthor(Server.name, Server.iconURL({ dynamic: true }) )
        .setTitle("Live Leaderboard",
          Server.iconURL({ dynamic: true })
        )
        .setColor(this.client.config.Embed.Color)
        .setFooter(
          "Top 50 users with the most messages written in chat in total • This board updates automatically",
          this.client.user.avatarURL({ dynamic: true })
        )
               .setImage("https://media.discordapp.net/attachments/805967263488016394/812199054217052181/xiao.gif")
        //mapping the leaderboard
        .setDescription(
          Leaderboard.map(
            (key) =>
              `
> **#${index++}.** **${key.User}** **- Score:** **\`${key.Messages}\`**`
          )
        )
.addField("Last Update",`<t:${Math.floor(Date.now()/1000) + 3600}:F>`)

      //edit method
      if (method === "edit") {
        //fetching old message (to edit)
        if (guild.Loggers.Leaderboard.LastMessage) {
          //fetching message
          let fetchedMessage = await this.client.findMessage(
            guild.Loggers.Leaderboard.LastMessage,
            logChannel
          );

          //if message not found , so sending new message
          if (!fetchedMessage) {
            //new message
            let newMessage = await logChannel.send(embed).catch(() => {});

            //setting message id to database
            await this.client.setLastMessage(newMessage);
          } else {
            //if message found , so update embed
            fetchedMessage.edit(embed).catch(() => {});
          }
        } else {
          //if no message in database , so sending new message
          let newMessage = await logChannel.send(embed).catch(() => {});
          await this.client.setLastMessage(newMessage);
        }
      }

      //send method
      else if (method === "send") {
        //fetching old message to delete
        if (guild.Loggers.Leaderboard.LastMessage) {
          let fetchedMessage = await this.client.findMessage(
            guild.Loggers.Leaderboard.LastMessage
          );
          //deleting if message found
          if (fetchedMessage) await fetchedMessage.delete(() => {});
        }
        //sending updated embed
        let newMessage = await logChannel.send(embed).catch(() => {});
        await this.client.setLastMessage(newMessage);
      }
    });
  }
}

module.exports = Leaderboard;
