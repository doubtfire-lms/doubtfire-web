angular.module("doubtfire.config.privacy-policy", [])

.factory('PrivacyPolicy', ($http, api) ->
  privacyPolicy = {
    privacy: '',
    plagiarism: '',
    loaded: false,
  }

  $http.get("#{api}/settings/privacy").then ((response) ->
    console.log(response.data)
    privacyPolicy.privacy = response.data.privacy
    privacyPolicy.plagiarism = response.data.plagiarism
    privacyPolicy.loaded = true
  )

  privacyPolicy
)
