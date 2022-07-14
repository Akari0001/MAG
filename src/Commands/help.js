const chalk = require("chalk");
const { Message, MessageEmbed } = require("discord.js");
const { checkPermission } = require("../../Base/permission");
const { Bot } = require("../../Structures/Client");

module.exports = {
  help: {
    //command name
    name: "help",

    //command aliases
    aliases: ["h"],

    //permissions required for user
    permissions: ["NO PERMISSIONS"],

    //permissions required for client
    required: ["ADMINISTRATOR"],

    //command description
    description: `\`help\` command provides help for using commands!`,

    //command usage example
    usage: [`{prefix}help <Command:Optional>`],

    //command category
    category: "others",
  },
  /**
   *
   * @param { Bot } client
   * @param { Message } message
   * @param { String[] } args
   */
  run: async (client, message, args) => {
    try {
      //checking client permission
      let clientPermission = await checkPermission("client", message, [
        "ADMINISTRATOR",
      ]);
      if (clientPermission) return;

      //config
      const { config } = client;

      //client invite
      const inviteURL = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=20171494`;

      //if no arguments
      if (!args[0]) {
        //Messages Array
        let Messages = [];
        //Others Array
        let Others = [];

        //looping commands
        client.commands.forEach((command) => {
          if (command.help.category === "messages")
            Messages.push(`**\`${command.help.name}\`**`);

          if (command.help.category === "others")
            Others.push(`**\`${command.help.name}\`**`);
        });

        //embed
        return message.channel.send(
          new MessageEmbed()
            .setAuthor(
              client.user.username + "'s help panel",
              client.user.avatarURL({ dynamic: true })
            )
.setThumbnail("https://media.discordapp.net/attachments/987324302581968927/991039600682237962/Anime_Town_Hall.webp")                
.setFooter("These emojis belongs to ScrumpBot / ScrumpBot.com / Discord.gg/scrumpbot")          .setColor(message.member.displayColor || config.Embed.Color)
            .setDescription("<a:SB_Diamond:991029954441543720>  Want a bot like this in your server? Dm [Isabelle](https://discord.com/users/941450171265474661) for purchase **`$5`**")
            .addField(` Message Category`, Messages.join(" , "))
            .addField(`Information Category`, Others.join(" , "))
            .addField(
              "More Information",`Use \`${config.prefix}help <Command:Required>\` for more help about each command!`
              
            )
                      
        );}
      

      //finding command
      let command =
        (await client.commands.get(args[0])) ||
        client.commands.get(client.aliases.get(args[0]));

      //if command not found
      if (!command)
        return message.channel.send(
          new MessageEmbed()
            .setAuthor(
              message.author.tag,
              message.author.avatarURL({ dynamic: true })
            )
            .setColor(message.member.displayColor || config.Embed.Color)
            .setTimestamp()
            .setFooter(
              config.Embed.footer,
              client.user.avatarURL({ dynamic: true })
            )
            .setDescription(
              `${config.Embed.Denied} **Unable to find the command \`${
                args[0] || "Unknown"
              }\`!**`
            )
        );

      //usage array
      let usage = [];

      //looping command usages to replace with prefix | Usefull for custom prefix
      command.help.usage.forEach((usages) => {
        usage.push(usages.split("{prefix}").join(config.prefix));
      });

      //embed
      message.channel.send(
        new MessageEmbed()
          .setAuthor(
            message.author.tag,
            message.author.avatarURL({ dynamic: true })
          )
          .setColor(message.member.displayColor || config.Embed.Color)
          .setTimestamp()
          .setFooter(
            config.Embed.footer,
            client.user.avatarURL({ dynamic: true })
          )
          .setDescription(`> **${command.help.description}**`)
          .addField(`Usage`, `\`${usage.join("` **,** `")}\``, true)
          .addField(`Category`, `\`${command.help.category}\``)
          .addField(
            `Shortcut`,
            `\`${command.help.aliases.join("` **,** `")}\``
          )
          .addField(
            `Permission Required`,
            `\`${command.help.permissions.join("` **,** `").toLowerCase()}\``
          )
      );
    } catch (err) {
      console.log(
        chalk.redBright(
          `${err.stack} | ${message.guild.name} (${message.channel.name})`
        )
      );
    }
  },
};
