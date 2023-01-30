import dotenv from 'dotenv'
import { AddressInfo } from 'net'
import express from 'express'
import _ from 'lodash'
import Me3 from '@me3/keysmith'

dotenv.config()

const app = express()
const server = app.listen(process.env.PORT || 5000, () => {
  const { port } = server.address() as AddressInfo
  console.log('server is running on port', port)
})

const me3 = new Me3({
  endpoint: process.env.endpoint,
  partnerId: process.env.partner,
  redirect_url: process.env.redirect,
})

app.get('/', async function (req, res) {
  if (!_.has(req.query, 'code')) {
    const auth_url = await me3.getAuthLink(process.env.redirect)
    res.redirect(auth_url)
    return
  }

  const success = await me3.getAuthToken(
    _.get(req.query, 'code') as string,
    _.get(req.query, 'state') as string,
    _.get(req.query, 'session_state') as string,
  )
  if (success) {
    res.redirect('https://www.me3.io/')
    return
  }
  res.json({ error: 'Can\'t recover the wallets' })
})

app.get('/wallets', async function (req, res) {
  try {
    const wallets = await me3.getWallets()
    res.json(wallets)
  } catch (e) {
    res.send(e)
  }
})
