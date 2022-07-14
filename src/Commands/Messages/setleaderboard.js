const chalk = require("chalk");
const { Message, MessageEmbed } = require("discord.js");
const getMessagesArray = require("../../Base/leaderboard");
const { checkPermission } = require("../../Base/permission");
const { Bot } = require("../../Structures/Client");

module.exports = {
  help: {
    //command name
    name: "setleaderboard",

    //command aliases
    aliases: ["setlb"],

    //permissions required for user
    permissions: ["ADMINISTRATOR"],

    //permissions required for client
    required: ["ADMINISTRATOR"],

    //command description
    description: `\`setleaderboard\` command sets the automated leaderboard!`,

    //command usage
    usage: [`{prefix}setleaderboard <Channel:Optional>`],

    //command category
    category: "messages",
  },
  /**
   *
   * @param { Bot } client
   * @param { Message } message
   * @param { string[] } args
   */
  run: async (client, message, args) => {
    try {
      //checking client permission
      let clientPermission = await checkPermission("client", message, [
        "MANAGE_MESSAGES",
      ]);
      if (clientPermission) return;

      //checking member permission
      let memberPermission = await checkPermission("member", message, [
        "MANAGE_MESSAGES",
      ]);
      if (memberPermission) return;

      //channel
      let channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[0]) ||
        message.channel;

      //fetching leaderboard | with top 10 users
      let Leaderboard = await getMessagesArray(client, message.guild);

      //index
      let index = 1;

      //leaderboard embed
      const embed = new MessageEmbed()
        .setAuthor("Getting Data",
          message.guild.iconURL({ dynamic: true })
        )
        
        .setColor(client.config.Embed.Color)
        .setFooter(
          "Incoming Leaderboard",
          client.user.avatarURL({ dynamic: true })
        )
        .setTimestamp()       
        
        
//mapping the leaderboard           
.setDescription("Loading Please Wait\nThis can take up to **5** minutes");
      

      //fetching guild data
      let Database = await client.Guild.findById(message.guild.id);

      //new message
      let lastMessage = await channel.send(embed);

      //if database not found
      if (!Database) {
        let doc = new client.Guild({
          _id: message.guild.id,
          Loggers: {
            Leaderboard: {
              LastMessage: lastMessage.id,
              Channel: channel.id,
            },
          },
        });
        //saving database
        await doc.save();
        return message.channel.send(
          new MessageEmbed()
            .setAuthor(
              message.author.tag,
              message.author.avatarURL({ dynamic: true })
            )
            .setColor(client.config.Embed.Color)
            .setFooter(
              client.config.Embed.footer,
              client.user.avatarURL({ dynamic: true })
            )
            .setTimestamp()
            .setDescription(
              `${
                client.config.Embed.Succes
              } **Successfully set the new live leaderboard channel to ${channel.toString()}**`
            )
        );
      } else {
        //if no channel and message
        if (
          !Database.Loggers.Leaderboard.LastMessage &&
          !Database.Loggers.Leaderboard.Channel
        ) {
          //updating...
          Database.Loggers.Leaderboard.LastMessage = lastMessage.id;
          Database.Loggers.Leaderboard.Channel = channel.id;
          await Database.save();
          return message.channel.send(
            new MessageEmbed()
              .setAuthor(
                message.author.tag,
                message.author.avatarURL({ dynamic: true })
              )
              .setColor(client.config.Embed.Color)
              .setFooter(
                client.config.Embed.footer,
                client.user.avatarURL({ dynamic: true })
              )
              .setTimestamp()
              .setDescription(
                `${
                  client.config.Embed.Succes
                } **Successfully set the new live leaderboard channel to ${channel.toString()}**`
              )
          );
        }

        //finding channel
        let OldChannel = message.guild.channels.cache.get(
          Database.Loggers.Leaderboard.Channel
        );
        if (OldChannel) {
          //fetching old message
          let OldMessage = await client.findMessage(
            Database.Loggers.Leaderboard.LastMessage,
            OldChannel
          );
          if (OldMessage) await OldMessage.delete().catch(() => {});
        }
        //saving database
        Database.Loggers.Leaderboard.LastMessage = lastMessage.id;
        Database.Loggers.Leaderboard.Channel = channel.id;
        await Database.save();
        //sending message
        return message.channel.send(
          new MessageEmbed()
            .setAuthor(
              message.author.tag,
              message.author.avatarURL({ dynamic: true })
            )
            .setColor(client.config.Embed.Color)
            .setFooter(
              client.config.Embed.footer,
              client.user.avatarURL({ dynamic: true })
            )
            .setTimestamp()
            .setDescription(
              `${
                client.config.Embed.Succes
              } **Successfully set the new live leaderboard channel to ${channel.toString()}**`
            )
        );
      }
    } catch (err) {
      console.log(
        chalk.redBright(
          `${err.message} | ${message.guild.name} (${message.channel.name})`
        )
      );
    }
  },
};
