_ = require('lodash')
ngFileUpload = require('ng-file-upload')

mod = angular.module("doubtfire.api.models.portfolio-submission", [
  "ngFileUpload"
])

.factory("PortfolioSubmission", (api, $window, currentUser, alertService, resourcePlus) ->
  #
  # Creates a new instance of a PortfolioSubmission object. Requires
  # a project object parameter.
  #
  PortfolioSubmission = (project) ->
    resource = resourcePlus "/submission/project/:id/portfolio", { id: "@id" }

    #
    # Url which is generated for the portfolio to be submitted for each
    # PortfolioSubmission object
    #
    resource.portfolioUrl =
      "#{api}/submission/project/#{project.project_id}/portfolio?auth_token=#{currentUser.authenticationToken}"

    #
    # Object that defines file upload requirements of an LSR
    #
    resource.learningSummaryReportFileUploadData = {
      type: {
        file0: { name: "Learning Summary Report", type: "document" }
      },
      payload: {
        name: "LearningSummaryReport" # DO NOT MODIFY - case senstitive on API
        kind: "document"
      }
    }

    #
    # Object that defines non-LSR extra files to be added
    #
    resource.otherFileFileUploadData = (type) ->
      type: {
        file0: { name: "Other", type: type }
      },
      payload: {
        name: "Other"
        kind: type
      }

    #
    # Delete file from portfolio
    #
    resource.deleteFile = (project, file) ->
      data = angular.extend file, { id: project.project_id }
      successFn = ->
        project.portfolio_files = _.without(project.portfolio_files, file)
      resource.delete data, successFn

    resource

  PortfolioSubmission.getPortfolioUrl = (project) ->
    "#{api}/submission/project/#{project.project_id}/portfolio?auth_token=#{currentUser.authenticationToken}"

  PortfolioSubmission
)

module.exports = mod.name
