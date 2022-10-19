# Me3 Keysmith

⚠️ Recommend node16, if node version >16, then please use `NODE_OPTIONS=--openssl-legacy-provider`

⚠️ This module enables one to create Me3 wallets and recovery files. Implementation of custodial/non-custodial governance is at the users level, and Me3 bears no liability from the governance implemented by the user.

## How to use

### 1. Initialize the `Me3` instance

```ts
import pkg from "@me3/keysmith";
const { Me3 } = pkg;

const me3 = new Me3({
  endpoint: "<Me3 Api endpoint, please request from the Me3 team>",
  partnerId: "<Me3 partner id, please request from the Me3 team>",
  client_id:
    "<Google api oauth2 client id, please obtain it from google api console>",
  client_secret:
    "<Google api oauth2 client secret, please obtain it from google api console>",
  redirect_uris: [
    "<Google api oauth2 redirect urls, this is a redirect url of your choice that was registered with google api console>",
  ],
});
```

You can get the google oauth credentials from their console, example [here](https://developers.google.com/fit/android/get-api-key#request_an_oauth_20_client_id_in_the)

Please enable `Google Drive Api`.

### 2. Prompt a google account login by following the 2 steps below

**2.1 Get oauth2 url**

```ts
const url = me3.getGAuthUrl();
```

You should direct the browser to open this url. The resulting page allows us to prompt the user to accept the permissions needed for us to upload the generated key into their GDrive.
First, it would prompt a SSO login.
After login, they would prompt for permissions. Please confirm all the google api permissions (email, gdrive access) required.
Once completed, the web page would be redirected to `redirect_uris` at step 1, alongside several parameters (including a "code" parameter)

**2.2 Please pass the full redirected url (with parameters) to this method**

```ts
const isSuccess = await me3.getGToken('<full redirect url, including parameters>);
```

You can check the success or failure of obtaining the GToken from the return value

### 3. Create / Restore crypto wallets using backup secret file

```ts
const wallets = await me3.getWallets();
```

**It will carry out**

- If new user?
  - create secret json / qr code then save to gdrive for new user
  - generates the wallets using above secure file for new user
- Otherwise
  - read the security file and decode from gdrive
  - restore the wallets based above information
- There would be wallets (address / privateKey / chainName / walletName )

## Recommend to use `CLI`

- ⚠️ **Please change the parameters at `cli/index.js L8~L17`**
- `yarn && yarn build` for build
- `yarn cli:prod` for cli app execute
