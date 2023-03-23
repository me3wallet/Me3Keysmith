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

  beforeEach(() => {
    moxios = new MockAdapter(axios)
  })

  afterEach(() => {
    moxios.reset()
  })

  it('Should throw when accessToken provided is expired', async () => {
    moxios
      .onPost('/upload/drive/v3/files')
      .reply(401, unauthenticatedResponse)

    await expect(
      new GDriveClient('an-unauthenticated-dummy-token').saveFile(
        { foo: 'bar' },
        'foo_bar.json',
      ),
    ).to.eventually.be.rejectedWith('Invalid authentication credentials! Please provide a valid access token!')
  })

  it('Should throw when its other unexpected error', async () => {
    moxios
      .onPost('/upload/drive/v3/files')
      .networkError()

    await expect(
      new GDriveClient('an-unauthenticated-dummy-token').saveFile(
        { foo: 'bar' },
        'foo_bar.json',
      ),
    ).to.eventually.be.rejectedWith('Unexpected error while uploading recovery file to user gDrive! Please contact Me3 and provide the above error log!')
  })

  it('Should return fileId when file upload to gDrive was successful', async () => {
    const expectedFileId = '1mMNM34OJLereW81atiT71YPhOuVwiiNh'
    moxios
      .onPost('/upload/drive/v3/files')
      .reply(200, uploadSuccessResponse(expectedFileId))

    const fileId = await new GDriveClient('an-authenticated-dummy-token').saveFile(
      { foo: 'bar' },
      'foo_bar.json',
    )
    expect(fileId).to.deep.equal(expectedFileId)
  })
})

describe('GDriveClient.retrieveFile() unit test', () => {
  let moxios: MockAdapter

  const expectedFileId = '1mMNM34OJLereW81atiT71YPhOuVwiiNh'

  beforeEach(() => {
    moxios = new MockAdapter(axios)
  })

  afterEach(() => {
    moxios.reset()
  })

  it('Should throw when accessToken provided is expired', async () => {
    moxios
      .onGet(/\/drive\/v3\/files\/\d+/)
      .reply(401, unauthenticatedResponse)

    await expect(
      new GDriveClient('an-unauthenticated-dummy-token').retrieveFile(expectedFileId),
    ).to.eventually.be.rejectedWith('Invalid authentication credentials! Please provide a valid access token!')
  })

  it('Should throw when fileId provided could not be found in user drive', async () => {
    moxios
      .onGet(/\/drive\/v3\/files\/\d+/)
      .reply(404, couldNotFindFileIdResponse)

    await expect(
      new GDriveClient('an-unauthenticated-dummy-token').retrieveFile(expectedFileId),
    ).to.eventually.be.rejectedWith('Unable to locate file as user have moved/removed recovery file. Please contact Me3 for assistance!')
  })

  it('Should throw when its other unexpected error', async () => {
    moxios
      .onGet(/\/drive\/v3\/files\/\d+/)
      .networkError()

    await expect(
      new GDriveClient('an-unauthenticated-dummy-token').retrieveFile(expectedFileId),
    ).to.eventually.be.rejectedWith('Unexpected error while retrieving recovery file from user gDrive! Please contact Me3 and provide the above error log!')
  })

  it('Should return fileId when file upload to gDrive was successful', async () => {
    moxios
      .onGet(/\/drive\/v3\/files\/\d+/)
      .reply(200, uploadSuccessResponse(expectedFileId))

    const data = await new GDriveClient('an-authenticated-dummy-token').retrieveFile(expectedFileId)
    expect(data).to.deep.equal(uploadSuccessResponse(expectedFileId))
  })
})