module.exports = app => {
  app.on('pull_request.opened', async context => {
    const { user } = context.payload.pull_request

    await context.github.issues.addAssignees(
      context.issue({
        assignees: [user.login],
      }),
    )
  })
}
