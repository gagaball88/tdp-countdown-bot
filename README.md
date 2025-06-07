# tdp-countdown-bot

Bot that counts down to/up from a specified date with custom text/images

## Prerequisites

- **Node.js:** Version 16.x or newer is recommended. Node.js comes with npm (Node Package Manager), which is needed to install dependencies. You can download Node.js from [https://nodejs.org/](https://nodejs.org/).

## Setup and Installation

You can get the bot code in one of two ways:

**1. Using Git (Recommended):**

   a. Clone the repository:
      ```bash
      git clone https://github.com/gagaball88/tdp-countdown-bot.git
      ```
   b. Navigate into the project directory:
      ```bash
      cd tdp-countdown-bot
      ```

**2. Downloading a Release:**

   a. Download the latest release ZIP file from the [Releases page](https://github.com/gagaball88/tdp-countdown-bot/releases/latest).
   b. Extract the ZIP file to a folder of your choice.
   c. Navigate into the extracted folder (e.g., `tdp-countdown-bot-x.y.z`) using your terminal or command prompt.

**Install Dependencies:**

Once you are in the project's root directory (the one containing the `package.json` file), install the required dependencies:

```bash
npm install
```

---
<!-- The following sections will detail configuration and running the bot. -->

## Configuration

<!-- Slot configuration is now primarily managed via the Web UI -->
<!-- The line about manually editing config.json has been removed. -->

### Credentials (`credentials.env`)

This bot requires API keys and access tokens for the various platforms it interacts with, as well as database credentials. These are stored in a `credentials.env` file that you need to create.

1.  **Locate the Template File:**
    In the `src/config/` directory, you will find a template file named `credentials.env.test`. This file lists all the necessary credentials the bot uses.

2.  **Create Your `credentials.env` File:**
    Make a copy of `src/config/credentials.env.test` and rename the copy to `src/config/credentials.env`.
    ```bash
    # In the project root directory:
    cp src/config/credentials.env.test src/config/credentials.env
    ```

3.  **Edit `src/config/credentials.env`:**
    Open `src/config/credentials.env` with a text editor and fill in your actual API keys, tokens, and other credentials. Below is a description of each variable:

    *   **Twitter:**
        *   `TWITTER_API_KEY`: Your Twitter App's API Key (Consumer Key).
        *   `TWITTER_API_SECRET_KEY`: Your Twitter App's API Secret Key (Consumer Secret).
        *   `TWITTER_ACCESS_TOKEN`: Your Twitter App's Access Token.
        *   `TWITTER_ACCESS_TOKEN_SECRET`: Your Twitter App's Access Token Secret.
    *   **Mastodon:**
        *   `MASTODON_ACCESS_TOKEN`: Your Mastodon account's Access Token (generate this from your Mastodon account's Preferences > Development).
        *   `MASTODON_URL`: The base URL of your Mastodon instance (e.g., `https://mastodon.social`).
    *   **Tumblr:**
        *   `TUMBLR_CONSUMER_KEY`: Your Tumblr App's Consumer Key.
        *   `TUMBLR_CONSUMER_SECRET`: Your Tumblr App's Consumer Secret.
        *   `TUMBLR_TOKEN`: Your Tumblr Access Token.
        *   `TUMBLR_TOKEN_SECRET`: Your Tumblr Token Secret.
    *   **Discord:**
        *   `DISCORD_TOKEN`: Your Discord Bot's Token.
    *   **Bluesky:**
        *   `BLUESKY_IDENTIFIER`: Your Bluesky account email or handle.
        *   `BLUESKY_PASSWORD`: Your Bluesky App Password (it's recommended to create an app-specific password rather than using your main account password).
    *   **PostgreSQL Database:** (Used for storing pictures, as per original README)
        *   `PG_HOST_IP`: Hostname or IP address of your PostgreSQL server.
        *   `PG_HOST_PORT`: Port number for your PostgreSQL server (usually 5432).
        *   `PG_USERNAME`: Username for connecting to the PostgreSQL database.
        *   `PG_PASSWORD`: Password for the PostgreSQL user.
        *   `PG_DATABASE`: The name of the PostgreSQL database.

4.  **Security Note:**
    The `credentials.env` file is listed in `.gitignore`, so it will not be committed to your Git repository. **Never share this file or commit it to version control.** Keep your credentials secure.

### Logging Configuration (`logLevel`)

You can control the verbosity of the application logs by setting the `logLevel` environment variable. This helps in debugging issues or reducing noise in production environments.

The available log levels are, in order of increasing severity (and decreasing verbosity):

1.  `DEBUG`: Shows all log messages, including detailed debugging information.
2.  `INFO`: Shows informational messages, warnings, and errors. This is the default level if `logLevel` is not set or is invalid.
3.  `WARN`: Shows warnings and errors.
4.  `ERROR`: Shows only error messages.

The logging system is hierarchical. For example, if `logLevel` is set to `INFO`, you will see logs of type `INFO`, `WARN`, and `ERROR`, but `DEBUG` logs will be hidden. If set to `ERROR`, only `ERROR` logs will be shown.

**How to set `logLevel`:**

*   **Using a `.env` file:**
    You can add `logLevel` to your `src/config/credentials.env` file (or a general `.env` file if you prefer to manage it separately, though `credentials.env` is already used for other environment-like settings):
    ```env
    # In src/config/credentials.env
    logLevel=DEBUG
    ```

*   **Command Line:**
    You can set it when running the application:
    ```bash
    logLevel=DEBUG npm start
    ```
    Or, if running the `main.js` script directly with Node.js:
    ```bash
    logLevel=DEBUG node src/main.js
    ```

<!-- The following section will detail database setup for pictures -->
4. Create a new table called `pictures` in a postgres database.

    ```SQL
    CREATE TABLE
    public.pictures (
        id serial NOT NULL,
        filename character varying(255) NOT NULL,
        picture_data bytea NOT NULL,
        category character varying(255) NOT NULL
    );

    ALTER TABLE
    public.pictures
    ADD
    CONSTRAINT pictures_pkey PRIMARY KEY (id);
    ```

5. Add `.jpg` pictures to the table.

    `filename` should contain the picture's file name.

    `picture_data` should contain a hex byte array of the actual picture data.

    `category` should contain a keyword which is specified as `pictureSlot` in `config.json` to filter for specific groups of pictures.

## Running the Bot and Accessing the Web UI

Once you have completed the setup, installation, and configuration steps:

1.  **Start the Bot:**
    Navigate to the project's root directory in your terminal (the one containing `package.json`) and run the start command:
    ```bash
    npm start
    ```
    You should see log messages in your terminal indicating the bot has started successfully and the web server is running.

2.  **Access the Web UI:**
    Open your web browser and go to the following URL:
    [http://localhost:8080](http://localhost:8080)

    This interface allows you to manage your countdown/countup slots and view bot logs.

## Configuring Countdown Slots

All countdown/countup configurations (target dates, messages, specific platform behaviors, etc.) are managed through the Web UI.

Once you have the bot running and the Web UI open (see previous section):

*   **Slot Management:** The Web UI will display a tab for each configured countdown/countup "slot". You can:
    *   **Edit an existing slot:** Click on its tab, modify the values in the form, and click "Save".
    *   **Add a new slot:** Click the "Add New Slot" button. A new tab and form will appear for the new slot. Fill in the details and click "Save".
    *   **Delete a slot:** Open the tab for the slot you wish to remove and click the "Delete" button.

*   **Slot Parameters:** Each slot form contains fields to define:
    *   The target date and time (`Hour`, `Day`, `Month`, `Year`).
    *   Messages to be posted (`Message 1`, `Message 2`, `Message End`).
    *   End-of-countdown specific picture (`Picture End`).
    *   Whether the slot is currently `Active`.
    *   The `Mode` (`countdown` or `countup`).
    *   The `Accuracy` of the time displayed in posts.
    *   Whether to include a `Day Count` in messages.
    *   A `Picture Slot` category to filter images for posts.
    *   The `Post Time` (hour of the day) for daily summary posts when the target is far off.

**Important Note on Applying Configuration Changes:**

When you save changes to slots (add, edit, delete) in the Web UI:
1.  The `src/config/config.json` file is updated immediately with your new settings.
2.  However, for these changes to be fully reflected in the bot's posting schedule (especially for newly added slots or changes to timing/frequency), **you must restart the bot application.**

The bot currently loads the full configuration and sets up all posting schedules when it starts. A future enhancement might allow for dynamic reloading of schedules without a restart.
