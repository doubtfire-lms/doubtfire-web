angular.module("doubtfire.config.privacy-policy", [])

.factory('PrivacyPolicy', ($http, api) ->
  privacyPolicy = {
    value: '',
    loaded: false,
  }

  $http.get("#{api}/settings/privacy").then ((response) ->
    console.log(response.data)
    privacyPolicy.value = response.data.privacyPolicy || "Continue to upload."
  )

  privacyPolicy
)
