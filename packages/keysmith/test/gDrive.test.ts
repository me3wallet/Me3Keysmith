import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { describe } from 'mocha'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'

import GDriveClient from '../src/gDrive'
import {
  couldNotFindFileIdResponse,
  unauthenticatedResponse,
  uploadSuccessResponse,
} from './fixtures/gDrive'

chai.use(chaiAsPromised)
const { expect } = chai

describe('GDriveClient.saveFile() unit test', () => {
  let moxios: MockAdapter
  let client: GDriveClient

  beforeEach(() => {
    moxios = new MockAdapter(axios)
    client = new GDriveClient()
  })

  afterEach(() => {
    moxios.reset()
  })

  it('Should throw when accessToken provided is expired', async () => {
    moxios
      .onPost('/files')
      .reply(401, unauthenticatedResponse)

    await expect(
      client.saveFile(
        'an-unauthenticated-dummy-token',
        { foo: 'bar' },
        'foo_bar.json'
      )
    ).to.eventually.be.rejectedWith('Invalid authentication credentials! Please provide a valid access token!')
  })

  it('Should throw when its other unexpected error', async () => {
    moxios
      .onPost('/files')
      .networkError()

    await expect(
      client.saveFile(
        'an-unauthenticated-dummy-token',
        { foo: 'bar' },
        'foo_bar.json'
      )
    ).to.eventually.be.rejectedWith('Unexpected error while uploading recovery file to user gDrive! Please contact Me3 and provide the above error log!')
  })

  it('Should return fileId when file upload to gDrive was successful', async () => {
    const expectedFileId = '1mMNM34OJLereW81atiT71YPhOuVwiiNh'
    moxios
      .onPost('/files')
      .reply(200, uploadSuccessResponse(expectedFileId))

    const fileId = await client.saveFile(
      'an-authenticated-dummy-token',
      { foo: 'bar' },
      'foo_bar.json'
    )
    expect(fileId).to.deep.equal(expectedFileId)
  })
})

describe('GDriveClient.loadFile() unit test', () => {
  let moxios: MockAdapter
  let client: GDriveClient

  const expectedFileId = '1mMNM34OJLereW81atiT71YPhOuVwiiNh'

  beforeEach(() => {
    moxios = new MockAdapter(axios)
    client = new GDriveClient()
  })

  afterEach(() => {
    moxios.reset()
  })

  it('Should throw when accessToken provided is expired', async () => {
    moxios
      .onGet(/\/files\/\d+/)
      .reply(401, unauthenticatedResponse)

    await expect(
      client.loadFile(
        'an-unauthenticated-dummy-token',
        expectedFileId
      )
    ).to.eventually.be.rejectedWith('Invalid authentication credentials! Please provide a valid access token!')
  })

  it('Should throw when fileId provided could not be found in user drive', async () => {
    moxios
      .onGet(/\/files\/\d+/)
      .reply(404, couldNotFindFileIdResponse)

    await expect(
      client.loadFile(
        'an-unauthenticated-dummy-token',
        expectedFileId
      )
    ).to.eventually.be.rejectedWith('Unable to locate file as user have moved/removed recovery file. Please contact Me3 for assistance!')
  })

  it('Should throw when its other unexpected error', async () => {
    moxios
      .onGet(/\/files\/\d+/)
      .networkError()

    await expect(
      client.loadFile(
        'an-unauthenticated-dummy-token',
        expectedFileId
      )
    ).to.eventually.be.rejectedWith('Unexpected error while retrieving recovery file from user gDrive! Please contact Me3 and provide the above error log!')
  })

  it('Should return fileId when file upload to gDrive was successful', async () => {
    moxios
      .onGet(/\/files\/\d+/)
      .reply(200, uploadSuccessResponse(expectedFileId))

    const data = await client.loadFile(
      'an-authenticated-dummy-token',
      expectedFileId
    )
    expect(data).to.deep.equal(uploadSuccessResponse(expectedFileId))
  })
})