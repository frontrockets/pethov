const moduleAutoAssign = require('./modules/autoAssign')
const moduleDeleteMergedBranch = require('./modules/deleteMergedBranch')
const moduleDismissReviews = require('./modules/dismissReviews')

module.exports = app => {
  moduleAutoAssign(app)
  moduleDeleteMergedBranch(app)
  moduleDismissReviews(app)
}
