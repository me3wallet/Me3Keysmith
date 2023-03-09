import _ from 'lodash'
import dotenv from 'dotenv'
import { AddressInfo } from 'net'
import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import * as ethers from 'ethers'

import Me3 from '@me3technology/keysmith'

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


// initiate Google OAuth2 access
app.get('/initiateAccess', async (req: Request, res: Response) => {
  const gAuthUrl = await me3.getAuthLink(process.env.redirect)
  return res.json({ data: { url: gAuthUrl } })
})

// initiateAccess callback handler
let wallets = []
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
    wallets = await me3.getWallets()
    res.json(wallets)
  } catch (e) {
    res.send(e)
  }
})

app.post('/signTx', bodyParser.json(), async (req: Request, res: Response) => {
  if (!me3.isInitialized()) {
    return res.json({ error: 'Oops, ERROR!', msg: 'Me3 still did not initialized!' })
  }
  if (_.isEmpty(wallets)) {
    return res.json({ error: 'Oops, ERROR!', msg: 'No wallets loaded' })
  }
  try {
    const { series, tx } = req.body
    const walletToSign = wallets.find((w) => w.chainName.toLowerCase() === series.toLowerCase())
    const signed = await me3.signTx(walletToSign, {
      ...tx,
      value: ethers.parseEther(tx.value),
    })

    return res.json({ data: { signed } })
  } catch (e) {
    return res.json({ error: 'Oops, ERROR!', msg: e.message })
  }
})
