angular.module("doubtfire.api.models.portfolio-submission", [
  "ngFileUpload"
])

.factory("PortfolioSubmission", (DoubtfireConstants, $window, FileUploader, currentUser, alertService, resourcePlus) ->
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
      "#{DoubtfireConstants.API_URL}/submission/project/#{project.project_id}/portfolio?auth_token=#{currentUser.authenticationToken}"

    resource.portfolioUrlAsAttachment =
      resource.portfolioUrl + "&as_attachment=true"

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

  PortfolioSubmission.getPortfolioUrl = (project, asAttachment = false) ->
    url = "#{DoubtfireConstants.API_URL}/submission/project/#{project.project_id}/portfolio?auth_token=#{currentUser.authenticationToken}"
    url += "&as_attachment=true" if asAttachment
    url

  PortfolioSubmission
)
