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

describe('when pull request opened', () => {
  const payload = require('./fixtures/pull_request.opened')

  it('should assign the pull request to the author', async () => {
    let postdata

    github
      .post('/repos/owner/repository/issues/100/assignees', data => {
        return (postdata = data)
      })
      .reply(200)

    await probot.receive({ name: 'pull_request', payload })

    expect(postdata).toEqual({ assignees: ['author-login'] })
  })
})
