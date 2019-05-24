const util = require('util');
const fs = require('fs');
const path = require('path');
const mkdirp = util.promisify(require('mkdirp'));
const Dat = require('dat-node');
const { createClient } = require('dat-pinning-service-client');
const writeFile = util.promisify(fs.writeFile);

const createClientAsync = (url, username = '', password = '') =>
  new Promise((resolve, reject) => {
    createClient(url, { username, password }, (err, client) => {
      if (err) reject(err);
      else resolve(client);
    });
  });

const pinDatAsync = (client, key, name) =>
  new Promise((resolve, reject) => {
    client.addDat({ url: `dat://${key}`, name }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });

const datAsync = path =>
  new Promise((resolve, reject) => {
    Dat(path, (err, dat) => {
      if (err) reject(err);
      else resolve(dat);
    });
  });

const importAsync = dat =>
  new Promise((resolve, reject) => {
    const importer = dat.importFiles();
    importer.on('end', () => resolve());
    importer.on('error', err => reject(err));
  });

const joinNetworkAsync = dat =>
  new Promise(resolve => {
    const network = dat.joinNetwork({}, resolve);
    network.once('listening', () => {
      resolve();
    });
  });

const packageJson = require(path.join(process.cwd(), 'package.json'));
const siteName = packageJson.name || path.basename(process.cwd());

exports.onPostBuild = async (args, options) => {
  const rootDir = 'public';
  const wellKnownDir = path.join(rootDir, '.well-known');
  const datFilePath = path.join(wellKnownDir, 'dat');

  try {
    const dat = await datAsync(rootDir);
    await importAsync(dat);
    await joinNetworkAsync(dat);

    const key = dat.key.toString('hex');
    await mkdirp(wellKnownDir);
    await writeFile(datFilePath, `dat://${key}\nTTL=3600\n`);

    if (options.pinning_service && options.pinning_service.domain) {
      const client = await createClientAsync(
        options.pinning_service.domain,
        options.pinning_service.username,
        options.pinning_service.password
      );
      await pinDatAsync(client, key, siteName);
    }

    console.log(`Site published at dat://${key}`);
    console.log(
      `See this link for instructions on pointing a custom domain name at your dat site`
    );
    console.log(
      'https://beakerbrowser.com/docs/guides/use-a-domain-name-with-dat#dat-dns-txt-records'
    );
    console.log('Run `dat ./public` to seed your site.');
  } catch (err) {
    console.log('ERROR: Failed to publish site to dat!');
    throw err;
  }
};
