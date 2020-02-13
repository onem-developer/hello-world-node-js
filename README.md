## Setup

1. Sign up for a free ONEm Developer Account at [https://www.onem.com](https://www.onem.com)
2. Choose a hosting provider such as Heroku, host this app there
3. Create a micro-app and set the callback url to `http://<PATH_TO_THIS_APP>/api`
4. Set the `TOKEN_SECRET` environment variable to `87654321` in `.env`

## Install

`$ npm install`

`$ npm start`

## Access the micro-app channels

In the [ONEm developer portal](https://developer-portal.onem.zone/) go to your micro-app, choose "Web channel".  Add the corresponding javascript code to the `<body>` section of `/public/index.html`.

* the Web-widget can be accessed in your micro-app's home path in your browser.
* try SMS channel using the Test Client tab in the [ONEm developer portal](https://developer-portal.onem.zone/) by sending `#<your app name>`.
