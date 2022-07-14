const { Message, MessageEmbed } = require("discord.js");
const { checkPermission } = require("../../Base/permission");
const { Bot } = require("../../Structures/Client");
const chalk = require("chalk");

module.exports = {
  help: {
    //command name
    name: "resetmessages",

    //command aliases
    aliases: ["rm"],

    //permissions required for user
    permissions: ["ADMINISTRATOR"],

    //permissions required for client
    required: ["SEND_MESSAGES", "EMBED_LINKS"],

    //command description
    description: "Clear all messages count from a user or @everyone",
    //command usage example
    usage: [`{prefix}resetmessages <all/user:Required>`],

    //command category
    category: "messages",
  },

  /**
   *
   * @param { Bot } client
   * @param { Message } message
   * @param { String[] } args
   */
  run: async (client, message, args) => {
    try {
      //checking client permissions
      let clientPermission = await checkPermission("client", message, [
        "SEND_MESSAGES",
        "EMBED_LINKS",
      ]);
      if (clientPermission) return;

      //checking member permission
      let memberPermission = await checkPermission("member", message, [
        "MANAGE_MESSAGES",
      ]);
      if (memberPermission) return;

      //if no argument
      if (!args[0])
        return message.channel.send(
          new MessageEmbed()
                              .setColor(client.config.Embed.Error)
            .setTimestamp()
            .setFooter(
              client.config.Embed.footer,
              client.user.avatarURL({ dynamic: true })
            )
            .setDescription("Your not using the command right"))

      //if argument is "all"
      if (args[0].toLowerCase() === "all") {
        //updating database
        await client.User.updateMany(
          { guild: message.guild.id },
          {
            $set: {
              messages: 0,
            },
          }
        );
        //embed
        return message.channel.send(
          new MessageEmbed()
                              
            .setColor(message.member.displayColor || client.config.Embed.Color)
            
            .setFooter(
              client.config.Embed.footer,
              client.user.avatarURL({ dynamic: true })
            )
            .setDescription(
              `${client.config.Embed.Succes} **Successfully cleared messages count for @everyone**`
            )
        );
      }

      //if any particular member
      else {
        //member
        let member =
          message.mentions.members.first() ||
          message.guild.members.cache.get(args[0]);

        //if member not found
        if (!member)
          return message.channel.send(
            new MessageEmbed()
              .setAuthor(
                message.author.tag,
                message.author.avatarURL({ dynamic: true })
              )
              .setColor(
                message.member.displayColor || client.config.Embed.Color
              )
              .setTimestamp()
              .setFooter(
                client.config.Embed.footer,
                client.user.avatarURL({ dynamic: true })
              )
              .setDescription(
                `${client.config.Embed.Denied} **Unable to find that user**`
              ))                        
             
  

        //if member found | Updating database
        await client.User.findOneAndUpdate(
          { user: member.id },
          {
            $set: {
              messages: 0,
            },
          }
        );

        //sending message
        message.channel.send(
          new MessageEmbed()
            .setAuthor(
              message.author.tag,
              message.author.avatarURL({ dynamic: true })
            )
            .setColor(message.member.displayColor || client.config.Embed.Color)
            .setTimestamp()       
              
              
            .setDescription(
              `${client.config.Embed.Succes} **Successfully cleared all messages count for ${member.user.tag}**`
            )
        );
      }
    } catch (err) {
      console.log(
        chalk.yellowBright(
          `${err.stack} | ${message.guild.name} (${message.channel.name})`
        )
      );
    }
  },
};
