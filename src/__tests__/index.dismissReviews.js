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

const buildGithubReview = (id, state, user) => ({
  id,
  state,
  user,
  submitted_at: new Date(`01/02/${id}`),
})

describe('when new review requested', () => {
  let payload

  const requestedReviewerOne = { id: 201 }
  const requestedReviewerTwo = { id: 202 }

  beforeEach(() => {
    payload = require('./fixtures/pull_request.review_requested')

    payload.pull_request.requested_reviewers = [
      requestedReviewerOne,
      requestedReviewerTwo,
    ]
  })

  describe('when there are other reviews from newly requested reviewer', () => {
    beforeEach(() => {
      github
        .get('/repos/owner/repository/pulls/100/reviews')
        .reply(200, [
          buildGithubReview(301, 'CHANGES_REQUESTED', requestedReviewerOne),
          buildGithubReview(302, 'ANY', requestedReviewerOne),
          buildGithubReview(303, 'DISMISSED', requestedReviewerOne),

          buildGithubReview(401, 'APPROVED', requestedReviewerTwo),
          buildGithubReview(402, 'ANY', requestedReviewerTwo),
          buildGithubReview(403, 'COMMENTED', requestedReviewerTwo),
        ])
    })

    it('dismisses each previous review', async () => {
      const dismissingReviews = []

      github
        .persist()
        .put(uri => {
          const [_, id] = uri.match(
            /^\/repos\/owner\/repository\/pulls\/100\/reviews\/(\d+)\/dismissals$/,
          )
          dismissingReviews.push(id)
          return !!id
        })
        .reply(200)

      await probot.receive({ name: 'pull_request', payload })

      expect(dismissingReviews).toEqual(['301', '302', '401', '402'])
    })
  })
})
