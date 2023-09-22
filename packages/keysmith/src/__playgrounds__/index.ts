import { createInterface } from 'readline'

import Me3 from '../me3'

const ENDPOINT = 'https://dev-wallet.me3.io/me3-api'
const REDIRECT_URL = 'http://localhost:3000/authenticated'
const PARTNER_ID = '0f48c2ed-0a48-5c57-aeda-de224c92704b'

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
})
const prompt = <T>(query: string) =>
  new Promise<T>((resolve) =>
    readline.question(query, (ans) => {
      resolve(ans as T)
      readline.close()
    }),
  )

const routeTest = async () => {
  const me3 = new Me3({
    endpoint: ENDPOINT,
    partnerId: PARTNER_ID,
    redirect_url: REDIRECT_URL,
  })

  try {
    const { data: authURL, myPriRsa } = await me3.getAuthLink(REDIRECT_URL)
  
    //Go login with authURL, then paste the redirected url here
    const redirectedURL = await prompt<string>(
      '\nPaste the redirected URL here: \n',
    )

    //Get params from url string
    const urlParams = new URLSearchParams(redirectedURL)
    const state = urlParams.get('http://localhost:3000/authenticated?state')
    const code = urlParams.get('code')
    const session_state = urlParams.get('session_state')

    const authTokens = await me3.getAuthToken(
      code,
      state,
      session_state,
      myPriRsa,
    )

  } catch (e) {
    console.log('HIT ERROR!', e)
  }
}

routeTest()
