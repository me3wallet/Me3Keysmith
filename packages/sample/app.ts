import {AddressInfo} from 'net'
import express from 'express'
import _ from 'lodash'
import dotenv from 'dotenv'
import Me3 from '@me3/keysmith'

dotenv.config()

const app = express()
const server = app.listen(process.env.PORT || 5000, () => {
  const {port} = server.address() as AddressInfo
  console.log('server is running on port', port)
})

const me3 = new Me3({
  endpoint: process.env.endpoint,
  partnerId: process.env.partner,
  client_id: process.env.google,
  client_secret: process.env.secret,
  redirect_uris: [process.env.redirect],
})

app.get('/', async function (req, res) {
  const code = _.get(req.query, 'code') as string
  if (_.isEmpty(code)) {
    const auth_url = me3.getGAuthUrl()
    res.redirect(auth_url)
    return
  }

  const success = await me3.getGToken(code)
  if (success) {
    try {
      const wallets = await me3.getWallets()
      console.table(wallets)
      res.redirect('https://www.avarta.io/')
    } catch (e) {
      res.json({error: 'Oops, ERROR!', msg: e.message})
    }
    return
  }

  res.json({error: 'Can\'t recover the wallets'})
})
