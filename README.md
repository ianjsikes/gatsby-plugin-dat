# gatsby-plugin-dat

Syncs your Gatsby site with the [dat][1] peer-to-peer network. [dat][1] is a decentralized networking protocol. [Beaker][2] is a browser built on the dat protocol.

This plugin will do three things:

1. Create a `.well_known/dat` file so the dat version of your site will be available at `dat://yourdomain.com`
2. Sync the contents of `public/` on the dat network.
3. (Optional) Seed your site to a pinning service so that it is always available. This can be any service that implements the [HTTP Pinning Service API][5], such as [Hashbase][3] or your own, self-hosted [homebase][4] instance.

## Installation

```bash
$ yarn add gatsby-plugin-dat dat
# OR
$ npm install gatsby-plugin-dat dat
```

Then, add the plugin to `gatsby-config.js`

```javascript
plugins: [`gatsby-plugin-dat`];
```

Or, if you'd like to use a pinning service like [Hashbase][3], include your credentials in the options:

```javascript
plugins: [
  {
    resolve: `gatsby-plugin-dat`,
    options: {
      pinning_service: {
        domain: 'https://hashbase.io/',
        // If your pinning service does not need authentication,
        // you can omit these fields.
        username: 'YOUR USERNAME HERE',
        password: 'YOUR PASSWORD HERE',
      },
    },
  },
];
```

## Usage

Every time you run `gatsby build` or `yarn build`, your site will build and sync with dat. The unique dat url of your site will be printed to the console. However, in order to actually visit your site using [Beaker][2], you need at least one source to seed it. There are a few ways you can do this:

- Locally, by running `dat ./public`. Make sure you have the dat CLI installed globally (`yarn global add dat` or `npm i -g dat`). You'll need to keep this command running as long as you want to seed your site.
- Locally, using a background service. Instructions:
  ```bash
  $ yarn global add dat-store
  $ dat-store install-service
  $ dat-store run-service
  $ dat-store [PASTE YOUR dat://... URL HERE]
  ```
  This will seed your site in the background as long as your machine is running.
- Using a pinning service, like [Hashbase][3] (or [homebase][4] for self-hosting). Your site will be automatically synced with a pinning service if you include the service's domain in this plugin's config (see above).

[1]: https://dat.foundation/
[2]: https://beakerbrowser.com/
[3]: https://hashbase.io/
[4]: https://github.com/beakerbrowser/homebase
[5]: https://www.datprotocol.com/deps/0003-http-pinning-service-api/
[6]: https://github.com/datproject/dat-store
