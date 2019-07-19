const _ = require('lodash')
const { Probot } = require('probot')
const nock = require('nock')

const myProbotApp = require('..')

nock.disableNetConnect()
nock.emitter.on('no match', (overridenReq, originalReq) => {
  const req = originalReq || overridenReq
  console.error(req.method, req.href)
})

const github = nock('https://api.github.com')

let probot

beforeEach(() => {
  probot = new Probot({})
  // Load our app into probot
  const app = probot.load(myProbotApp)

  // just return a test token
  app.app = { getSignedJsonWebToken: () => 'test' }
})

beforeEach(() => {
  github.get(/contents\/\.github\/delete-merged-branch-config\.yml$/).reply(404)
})

describe('when pull request closed', () => {
  const payload = require('./fixtures/pull_request.closed')

  payload.pull_request.merged = true

  it('should try to remove the reference', async () => {
    github.delete(/^\/repos\/owner\/repository\/git\/refs\/heads\//).reply(200)

    await probot.receive({ name: 'pull_request', payload })
  })
})
