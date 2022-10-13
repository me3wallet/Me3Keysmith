"use strict";

const open = require("open");
const hapi = require("@hapi/hapi");
const { Me3 } = require("../lib");

(async () => {
  const me3 = new Me3({
    endpoint: '',
    partnerId: '',
    client_id: '',
    client_secret: '',
    redirect_uris: ['http://localhost:3000']
  });

  const url = me3.getGAuthUrl()

  // eslint-disable-next-line no-async-promise-executor
  const getGToken = () => new Promise(async (resolve, reject) => {
    const server = hapi.server({
      port: 3000,
      host: "localhost"
    });

    let browser
    server.route({
      method: "GET",
      path: "/",
      handler: async request => {
        try {
          const result = await me3.getGToken(request.query.code)
          resolve(result)
        } catch (err) {
          reject(err);
        } finally {
          server.stop();
          browser.kill()
        }
        return true
      }
    });
    await server.start()
    browser = await open(url, { app: { name: 'google chrome' } })
  });

  const result = await getGToken();
  if (result) {
    console.log('Google client is ready!')
  }

  const walelts = await me3.getWallets()
  console.table(walelts)
})()
