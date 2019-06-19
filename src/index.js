const deleteMergedBranch = require('probot-delete-merged-branch/lib/delete-merged-branch')

module.exports = app => {
  app.on('pull_request.review_requested', async context => {
    const { requested_reviewers } = context.payload.pull_request

    const relatedPullRequest = context.issue()

    const reviews = await context.github.pulls
      .listReviews(relatedPullRequest)
      .then(response => response.data)

    const reviewsToDismiss = []

    requested_reviewers.forEach(reviewRequest => {
      const userId = reviewRequest.id

      reviews
        .filter(review => review.user.id === userId)
        .filter(review => review.state !== 'DISMISSED')
        .forEach(review => {
          reviewsToDismiss.push(review.id)
        })
    })

    await Promise.all(
      reviewsToDismiss.map(id =>
        context.github.pulls.dismissReview({
          ...relatedPullRequest,
          review_id: id,
          message:
            'This person was requested to review again, so dismissing the previous review',
        }),
      ),
    )
  })

  app.on('pull_request.closed', deleteMergedBranch)
}
