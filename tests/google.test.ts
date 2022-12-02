import Google from "../src/google";
import {ALICE, CONFIG, REDIRECTED, TEST_QR} from "./env.test";

describe('Google class testing', () => {
  const gClient = new Google(
    CONFIG.client_id,
    CONFIG.client_secret,
    CONFIG.redirect_uris
  );

  it('Google::generateAuthUrl', async function () {
    const url = gClient.generateAuthUrl();
    console.log(url);
    expect(url).toBeTruthy();
  });

  it('Google::getTokens', async function () {
    await gClient.getTokens(REDIRECTED);
    const email = await gClient.getUserEmail();
    expect(email).toBeTruthy();
  });

  it('Google::uploadFile & loadFile', async function () {
    const email = await gClient.getUserEmail();
    expect(email).toBeTruthy();

    const imgId = await gClient.saveFiles(
      gClient.b642Readable(TEST_QR),
      'hello.png',
      'image/png'
    );
    console.log(imgId);
    expect(imgId).toBeTruthy();

    const secure = JSON.stringify(ALICE);
    const jsonId = await gClient.saveFiles(
      gClient.str2Readable(secure),
      'hello.json',
      'application/json'
    );
    console.log(jsonId);
    expect(jsonId).toBeTruthy();

    const json = await gClient.loadFile(jsonId!);
    expect(json).toEqual(ALICE);
  });
});
