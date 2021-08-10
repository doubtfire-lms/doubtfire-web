# Contributing

Please read through this document before contributing to Doubtfire.

Before continuing, **please read the [contributing document](https://github.com/doubtfire-lms/doubtfire-api/blob/development/CONTRIBUTING.md) of the API**, as this outlines the Git workflow you should be following.

## Commit Styles
Commit Message Format

We have very precise rules over how our Git commit messages must be formatted. This format leads to easier to read commit history.

Each commit message consists of a header, a body, and a footer.
```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```
The `header` is mandatory and must conform to the Commit Message Header format.

The `body` is mandatory for all commits except for those of type "docs". When the body is present it must be at least 20 characters long and must conform to the Commit Message Body format.

The `footer` is optional. The Commit Message Footer format describes what the footer is used for and the structure it must have.

Any line of the commit message cannot be longer than 100 characters.
```
Commit Message Header
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope (optional): animations|common|style|forms|http|router|service-worker|
  │                                     upgrade|changelog|dev-infra|docs-infra|migrations|
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```
The `<type>` and `<summary>` fields are mandatory, the (<scope>) field is optional.

Type
Must be one of the following:

**build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
**ci**: Changes to our CI configuration files and scripts (example scopes: Circle, BrowserStack, SauceLabs)
**docs**: Documentation only changes
**feat**: A new feature
**fix**: A bug fix
**perf**: A code change that improves performance
**refactor**: A code change that neither fixes a bug nor adds a feature
**test**: Adding missing tests or correcting existing tests

## Coding Guidelines

For extendability and maintenance purposes, following these guidelines:

- Name a directive with it's role in mind (i.e., as a **[Agent Noun](https://en.wikipedia.org/wiki/Agent_noun)**) to give a small summary as to what the directive *does*:
  - when *viewing* a project or task, the directive is project-**viewer** and task-**viewer**
  - when *assessing* task submissions, the directive is task-submission-**assessor**
  - when *editing* a unit's tutorials, the directive is unit-tutorial-**editor**
- Name directives that show lots of data in one directive in a table a list: e.g.: `unit-student-list`, `group-member-list`
- Name directives with a series of steps to perform a goal a `wizard`, e.g.: `project-portfolio-wizard`, `new-user-wizard`
- Always name modals in Pascal Case `SomeModal` and create them as a factory/controller pair CoffeeScript file which can then be easily created on the fly:

```coffeescript
# foo/modals/create-foo-modal.coffee
angular.module('doubfire.foo.modals.create-foo-modal', [])

#
# Prompts the user to create a Foo using a bar and qux variable
#
.factory('CreateFooModal', ($modal) ->
  CreateFooModal = {}

  CreateFooModal.show = (bar, qux) ->
    $modal.open
      templateUrl: 'foo/modals/create-foo-modal.tpl.html'
      controller: 'CreateFooModalCtrl'
      resolve:
        bar: -> bar
        qux: -> qux

  CreateFooModal
)

.controller('CreateFooModalCtrl', ($scope, bar, qux) ->
  # Does stuff with bar and qux to create a foo
  $scope.bar = bar
  $scope.qux = qux
)
```

```coffeescript
# foo/states/foo-view/foo-view.coffee
# ...
.controller('FooViewCtrl', ($scope, CreateFooModal) ->
  # ...
  $createNewFoo = ->
    CreateFooModal.show($scope.bar, $scope.qux)
)
```

- Always name non-anonymous controllers with a `Ctrl` suffix
- Case correctly:
  - `directiveName` should be camelCase - refer to this [Angular documentation](https://docs.angularjs.org/guide/directive#normalization)
  - `ServiceName`, `ControllerNameCtrl` should be in PascalCase
  - Regardless of abbreviations, stick to these conventions (e.g., `pdfPanelViewer` directive works, but `PDFPanelViewer` won't work as it needs to be camelCase)
- Place modals and states in a `modals` and `states` folder under the root. All else can be in their own folders unless they are of a related concept (see the `project-portfolio-wizard` folder under `project`, `stats` under `tasks` and `units`)
- The name of a module should follow the directory structure of where it has been placed (i.e., in the above example, the template file was at `foo/modals/create-foo-modal.tpl.html`, the CoffeeScript file was at `foo/modals/create-foo-modal.coffee`, and thus the module is `doubtfire.foo.modals.create-foo-modal`
- Try to give a brief summary of what the directive, state or factory does. E.g., the comment in the example above for `CreateFooModal` is sufficient.
- Try to abstract as much code inside a model class as possible. At present a lot of this code is in a model's service, and it should be moved into the model's resource definition as much as possible:

```coffeescript
Unit.addTutorial tutorialData
```

instead of:

```coffeescript
unitService.addTutorial unit, tutorialData
```
