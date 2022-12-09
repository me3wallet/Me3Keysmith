import hapi from '@hapi/hapi'
import {Me3} from '../src';

(async () => {
  const me3 = new Me3({
    endpoint: '',
    partnerId: '',
    client_id: '',
    client_secret: '',
    redirect_uris: ['http://localhost:3000']
  })

  const url = me3.getGAuthUrl()
  console.log(url)

  const getGToken = () => new Promise((resolve, reject) => {
    const server = hapi.server({
      port: 3000,
      host: 'localhost'
    })

    let browser
    server.route({
      method: 'GET',
      path: '/',
      handler: async request => {
        try {
          const result = await me3.getGToken(request.query.code)
          resolve(result)
        } catch (err) {
          reject(err)
        } finally {
          server.stop()
          browser.kill()
        }
        return true
      }
    })
    server.start()
  })

  const result = await getGToken()
  if (result) {
    console.log('Google client is ready!')
  }

  const walelts = await me3.getWallets()
  console.table(walelts)
})()
