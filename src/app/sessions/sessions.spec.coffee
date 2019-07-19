# Uses angular-mocks to simulate HTTP requests. For more info, see:
# http://docs.angularjs.org/api/ngMock.$httpBackend
# http://docs.angularjs.org/tutorial/step_05

describe "Sessions module", ->
  auth = null
  currentUser = null
  defaultAnonymousUser = null
  api = null
  authenticationUrl = null
  httpBackend = null
  http = null
  rootScope = null

  beforeEach module "doubtfire.sessions"

  beforeEach inject (_auth_, _currentUser_, _api_, _$httpBackend_, _$http_, _$rootScope_) ->
    auth = _auth_
    currentUser = _currentUser_
    defaultAnonymousUser = _.clone currentUser
    api = _api_
    authenticationUrl = api + "/auth"
    httpBackend = _$httpBackend_
    http = _$http_
    rootScope = _$rootScope_

  it "should change user when signing in and out", ->
    userCredentials = { username: "user", password: "abc123" }

    signInResponse =
      success: true
      auth_token: "a_fake_token"
      user:
        id: 1
        system_role: "Admin"
        first_name: "Test"
        last_name: "User"
        nickname: "anon"

    # Pre-sign in.
    expect(currentUser).toEqual defaultAnonymousUser

    # Sign in.
    httpBackend.expectPOST(authenticationUrl, { user: userCredentials }).respond(signInResponse)
    auth.signIn authenticationUrl, { user: userCredentials }
    httpBackend.flush()
    expect(currentUser).not.toEqual defaultAnonymousUser
    expect(currentUser.id).toEqual signInResponse.user.id

    # Sign out.
    auth.signOut()
    expect(currentUser).toEqual defaultAnonymousUser

  it "should not change user when signing in fails", ->
    expect(currentUser).toEqual defaultAnonymousUser
    httpBackend.expectPOST(authenticationUrl).respond(401) # simulate unauthorised 401 request
    auth.signIn authenticationUrl, { username: "user@localhost", password: "abc123" }
    httpBackend.flush()
    expect(currentUser).toEqual defaultAnonymousUser # user should not change

  it "should not allow a user to sign in with an unsupported role", ->
    signInResponse =
      success: true
      auth_token: "a_fake_token"
      user:
        id: 1
        system_role: "unsupported role"
        first_name: "Test"
        last_name: "User"
        nickname: "anon"

    expect(currentUser).toEqual defaultAnonymousUser
    httpBackend.expectPOST(authenticationUrl).respond(signInResponse)
    auth.signIn authenticationUrl, { username: "user@localhost", password: "abc123" }
    httpBackend.flush()
    expect(currentUser).toEqual defaultAnonymousUser # user should not change

  it "should authorise user roles correctly", ->
    roleWhitelist = [ "Student", "Admin" ]
    expect(auth.isAuthorised(roleWhitelist, "anon")).toBe(false)
    expect(auth.isAuthorised(roleWhitelist, "Student")).toBe(true)
    expect(auth.isAuthorised(roleWhitelist, "Admin")).toBe(true)

    roleWhitelist = [ "Admin" ]
    expect(auth.isAuthorised(roleWhitelist, "anon")).toBe(false)
    expect(auth.isAuthorised(roleWhitelist, "Student")).toBe(false)
    expect(auth.isAuthorised(roleWhitelist, "Admin")).toBe(true)

    # An empty whitelist should not authorise anyone.
    roleWhitelist = []
    expect(auth.isAuthorised(roleWhitelist, "anon")).toBe(false)
    expect(auth.isAuthorised(roleWhitelist, "Student")).toBe(false)
    expect(auth.isAuthorised(roleWhitelist, "Admin")).toBe(false)

    # If no whitelist is specified, anyone should be authorised.
    roleWhitelist = undefined
    expect(auth.isAuthorised(roleWhitelist, "anon")).toBe(true)
    expect(auth.isAuthorised(roleWhitelist, "Student")).toBe(true)
    expect(auth.isAuthorised(roleWhitelist, "Admin")).toBe(true)

  it "should automatically intercept unauthorised API responses", ->
    intercepted = false
    rootScope.$on "unauthorisedRequestIntercepted", -> intercepted = true

    unauthorisedApiUrl = api + "/an_unauthorised_endpoint"
    httpBackend.expectGET(unauthorisedApiUrl).respond(401)
    http.get(unauthorisedApiUrl)
    httpBackend.flush()
    expect(intercepted).toBe(true)

    intercepted = false
    authorisedApiUrl = api + "/an_authorised_endpoint"
    httpBackend.expectGET(authorisedApiUrl).respond(200)
    http.get(authorisedApiUrl)
    httpBackend.flush()
    expect(intercepted).toBe(false)

    # Responses not from the API should not be intercepted as they're not really under our "jurisdiction".
    intercepted = false
    nonApiUrl = "http://not_an_api_endpoint"
    httpBackend.expectGET(nonApiUrl).respond(401)
    http.get(nonApiUrl)
    httpBackend.flush()
    expect(intercepted).toBe(false)

  it "should automatically intercept API requests and inject the user's authentication token", ->
    authorisedApiUrl = api + "/an_authorised_endpoint"

    # Before sign in: no auth token should be injected in API requests.
    httpBackend.expectPOST(authorisedApiUrl).respond(401)
    http.post(authorisedApiUrl)
    httpBackend.flush()

    # Sign in.
    signInResponse =
      success: true
      auth_token: "a_fake_token"
      user:
        id: 1
        system_role: "Admin"
        first_name: "Test"
        last_name: "User"
        nickname: "anon"

    httpBackend.expectPOST(authenticationUrl).respond(signInResponse)
    auth.signIn authenticationUrl, { username: "user", password: "abc123" }
    httpBackend.flush()

    # After sign in: the current user's auth token should be present in API request params.
    httpBackend.expectPOST(authorisedApiUrl + "?auth_token=" + currentUser.authenticationToken).respond(200)
    http.post(authorisedApiUrl)
    httpBackend.flush()

    # Auth token should not be injected for non-API requests.
    nonApiUrl = "http://not_an_api_endpoint"
    httpBackend.expectPOST(nonApiUrl).respond(200)
    http.post(nonApiUrl)
    httpBackend.flush()
