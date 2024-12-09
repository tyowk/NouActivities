# NouActivities

A simple, open-source Discord activities bot, built with HTTP interactions.

## Installation

Follow these steps to install and run the bot:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/tyowk/NouActivities.git
   cd NouActivities
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root of the project directory with the following contents:

   ```plaintext
   TOKEN="your-bot-token-here"
   REPORT="report-channel-log"
   KEY="your-bot-public-key"
   ```

   Replace `your-bot-token-here` with your Discord bot token and `your-bot-public-key` with your bot's public key. Also, specify the `REPORT` channel ID where logs will be reported.

4. **Run the bot**:

   ```bash
   npm start
   ```

## Commands

Here are some of the available commands:

- `/activities` - Displays available activities.
- `/help` - Shows the list of commands and their usage.
- `/invite` - Provides an invite link to add the bot to your server.
- `/ping` - Checks if the bot is responsive.

## Contributing

We welcome contributions to improve the bot! To contribute:

1. Fork this repository.
2. Create a new branch:

   ```bash
   git checkout -b feature-name
   ```

3. Make your changes and commit them:

   ```bash
   git commit -m 'Add new feature'
   ```

4. Push your changes to your forked repository:

   ```bash
   git push origin feature-name
   ```

5. Open a pull request to the main repository.

Please ensure that your code follows the existing coding style and passes any tests or linters that may be in place.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/tyowk/NouActivities/tree/main/LICENSE) file for more details.

## Acknowledgements

- [discord.js](https://discord.js.org/): The library used to interact with the Discord API.
- [discord-interactions](https://www.npmjs.com/package/discord-interactions): A library that provides an easy interface for working with slash commands and Discord interactions.
- [express](https://www.npmjs.com/package/express): A fast and minimalist web framework for Node.js.
