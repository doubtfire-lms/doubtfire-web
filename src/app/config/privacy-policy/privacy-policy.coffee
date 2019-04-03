angular.module("doubtfire.config.privacy-policy", [])

.factory('PrivacyPolicy', ($http, DoubtfireConstants) ->
  privacyPolicy = {
    privacy: '',
    plagiarism: '',
    loaded: false,
  }

  $http.get("#{DoubtfireConstants.API_URL}/settings/privacy").then ((response) ->
    privacyPolicy.privacy = response.data.privacy
    privacyPolicy.plagiarism = response.data.plagiarism
    privacyPolicy.loaded = true
  )

  privacyPolicy
)
