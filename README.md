[![Discord Bots](https://top.gg/api/widget/1305829720213950474.svg)](https://top.gg/bot/1305829720213950474/invite)

# NouActivities

NouActivities is a simple, open-source Discord activities bot built using HTTP interactions.

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

   ```bash
   TOKEN="your-bot-token-here"
   REPORT="your-report-channel-id-here"
   KEY="your-bot-public-key-here"
   PORT="your-server-port-here"
   ```

   - Replace `your-bot-token-here` with your Discord bot token (you can get this from the Discord Developer Portal).
   - Replace `your-report-channel-id-here` with the channel ID where you want report logs to be sent.
   - Replace `your-bot-public-key-here` with your bot's public key (found in the bot's settings in the Discord Developer Portal).
   - Set `your-server-port-here` to the port number your bot will run on.

4. **Run the bot**:

   ```bash
   npm start
   ```

5. **Configure your bot’s interaction endpoint**:

   In the **[Discord Developer Portal](https://discord.com/developers/applications)**, go to your bot's application settings, and navigate to the **Interactions Endpoint URL** section. Set the **Interaction URL** to:

   ```bash
   https://<domain.com>/interactions
   ```
   ![setup.png](https://github.com/user-attachments/assets/046627ea-234b-4d13-8329-444037d260ec)
## Commands

Here are some of the available commands:

- `/activities`: Displays a list of available activities.
- `/help`: Shows a list of all commands and their usage.
- `/invite`: Provides an invite link to add the bot to your server.
- `/ping`: Checks if the bot is responsive.

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

Please ensure that your code follows the existing coding style and passes any tests or linters in place.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/tyowk/NouActivities/tree/main/LICENSE) file for more details.

## Acknowledgements

- [discord.js](https://discord.js.org/): The library used to interact with the Discord API.
- [discord-interactions](https://www.npmjs.com/package/discord-interactions): A library that simplifies working with slash commands and Discord interactions.
- [express](https://www.npmjs.com/package/express): A fast and minimalist web framework for Node.js.
