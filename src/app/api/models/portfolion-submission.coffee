angular.module("doubtfire.api.models.portfolio-submission", [
  "ngFileUpload"
])

.factory("PortfolioSubmission", (api, $window, FileUploader, currentUser, alertService, resourcePlus) ->
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

  return PortfolioSubmission

  this.openPortfolio = (project) ->
    $window.open this.getTaskUrl(task), "_blank"

  # TODO: Kill below

  this.fileUploader = (scope, project) ->
    # per scope or task
    uploadUrl =
    fileUploader = new FileUploader {
      scope: scope,
      url: uploadUrl
      method: "POST",
      queueLimit: 1
    }

    fileUploader.project = project

    extWhitelist = (name, exts) ->
      # no extension
      parts = name.toLowerCase().split('.')
      return false if parts.length == 0
      ext = parts.pop()
      ext in exts

    fileFilter = (acceptList, type, item) ->
      valid = extWhitelist item.name, acceptList
      if not valid
        alertService.add("info", "#{item.name} is not a valid #{type} file (accepts <code>#{_.flatten(acceptList)}</code>)", 6000)
      valid

    fileUploader.filters.push {
      name: 'is_code'
      fn: (item) ->
        fileFilter ['pas', 'cpp', 'c', 'cs', 'h', 'java'], "code" , item
    }
    fileUploader.filters.push {
      name: 'is_document'
      fn: (item) ->
        fileFilter ['pdf'], "document" , item
    }
    fileUploader.filters.push {
      name: 'is_image'
      fn: (item) ->
        fileFilter ['png', 'gif', 'bmp', 'tiff', 'tif', 'jpeg', 'jpg'], "image" , item
    }

    fileUploader.onBeforeUploadItem = (item) ->
      # ensure this item will be uploading for this unit it...
      item.formData = fileUploader.formData

    fileUploader.uploadPortfolioPart = (name, kind) ->
      fileUploader.formData = [ {name: name}, {kind: kind} ]
      fileUploader.uploadAll()

    fileUploader.onSuccessItem = (item, response)  ->
      alertService.add("success", "File uploaded successfully!", 2000)
      if not _.find(fileUploader.project.portfolio_files, response)
        fileUploader.project.portfolio_files.push(response)
      fileUploader.clearQueue()

    fileUploader.onErrorItem = (response) ->
      alertService.add("danger", "File Upload Failed: #{response.error}")
      fileUploader.clearQueue()

    fileUploader.api = resourcePlus "/submission/project/:id/portfolio", { id: "@id" }

    fileUploader
  return this
)
