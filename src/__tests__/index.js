const _ = require('lodash')
const myProbotApp = require('..')
const { Probot } = require('probot')
const defaultPayload = require('./fixtures/pull_request.review_requested')

describe('My Probot app', () => {
  let probot
  let payload

  beforeEach(() => {
    probot = new Probot({})
    // Load our app into probot
    const app = probot.load(myProbotApp)

    // just return a test token
    app.app = { getSignedJsonWebToken: () => 'test' }

    payload = _.cloneDeep(defaultPayload)
  })

  it('placeholder', () => {})
})
