import dotenv from 'dotenv'
import { AddressInfo } from 'net'
import express, { Request, Response } from 'express'
import _ from 'lodash'
import Me3 from '@me3/keysmith'

import bodyParser from 'body-parser'

dotenv.config()

const app = express()
const server = app.listen(process.env.PORT || 5000, () => {
    const { port } = server.address() as AddressInfo
    console.log('server is running on port', port)
})

const me3 = new Me3({
    endpoint: process.env.endpoint,
    partnerId: process.env.partner,
    client_id: process.env.google,
    client_secret: process.env.secret,
    redirect_uris: [process.env.redirect],
})

// initiate Google OAuth2 access
app.get('/initiateAccess', async (req: Request, res: Response) => {
    const gAuthUrl = await me3.getGAuthUrl()

    return res.json({ data: { url: gAuthUrl } })
})

// initiateAccess callback handler
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
            res.json({ error: 'Oops, ERROR!', msg: e.message })
        }
        return
    }

    res.json({ error: 'Can\'t recover the wallets' })
})

app.post('/signTx', bodyParser.json(), async (req: Request, res: Response) => {
        try {
            const { series, tx } = req.body
            const wallets = await me3.getWallets()

            const walletToSign = wallets.find((w) => w.chainName.toLowerCase() === series.toLowerCase())
            const signed = await me3.signTransaction(series, walletToSign, tx)

            return res.json({ data: { signed } })
        } catch (e) {
            return res.json({ error: 'Oops, ERROR!', msg: e.message })
        }
    }
)
