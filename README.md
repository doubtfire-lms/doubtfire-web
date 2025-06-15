![Doubtfire Logo](src/assets/icons/android-chrome-192x192.png)

# Doubtfire Web [![CI](https://img.shields.io/github/workflow/status/doubtfire-lms/doubtfire-web/Node.js%20CI?label=CI&logo=GitHub)](https://github.com/doubtfire-lms/doubtfire-web/actions/workflows/nodejs-ci.yml)

A modern, lightweight learning management system.

> ## 🛠 Migration Status: In Development
>
> Doubtfire web migration from AngularJS/Coffeescript to Angular/Typescript, including refactoring all components, is currently in development.
>
> See the progress of component migration below.

## Migration Progress

SUMMARY:

73 / 132 components migrated

MIGRATED:

- [x] ./src/app/home/splash-screen/splash-screen.component.ts
- [x] ./src/app/home/states/home/home.component.ts
- [x] ./src/app/tasks/task-submission-history/task-submission-history.component.ts
- [x] ./src/app/tasks/task-comments-viewer/task-assessment-comment/task-assessment-comment.component.ts
- [x] ./src/app/tasks/task-comments-viewer/extension-comment/extension-comment.component.ts
- [x] ./src/app/tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-player.component.ts
- [x] ./src/app/tasks/task-comments-viewer/intelligent-discussion-player/intelligent-discussion-recorder/intelligent-discussion-recorder.component.ts
- [x] ./src/app/tasks/task-comments-viewer/pdf-image-comment/pdf-image-comment.component.ts
- [x] ./src/app/tasks/task-comments-viewer/comment-bubble-action/comment-bubble-action.component.ts
- [x] ./src/app/tasks/task-comments-viewer/task-comments-viewer.component.ts
- [x] ./src/app/tasks/task-comment-composer/task-comment-composer.component.ts
- [x] ./src/app/tasks/task-comment-composer/discussion-prompt-composer/discussion-prompt-composer.component.ts
- [x] ./src/app/projects/states/dashboard/directives/student-task-list/create-portfolio-task-list-item/create-portfolio-task-list-item.component.ts
- [x] ./src/app/projects/states/dashboard/directives/student-task-list/task-list-item/task-list-item.component.ts
- [x] ./src/app/projects/states/dashboard/directives/task-dashboard/directives/task-assessment-card/task-assessment-card.component.ts
- [x] ./src/app/projects/states/dashboard/directives/task-dashboard/directives/task-similarity-view/task-similarity-view.component.ts
- [x] ./src/app/projects/states/dashboard/directives/task-dashboard/directives/task-submission-card/task-submission-card.component.ts
- [x] ./src/app/projects/states/dashboard/directives/task-dashboard/directives/task-due-card/task-due-card.component.ts
- [x] ./src/app/projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.component.ts
- [x] ./src/app/projects/states/dashboard/directives/task-dashboard/directives/task-status-card/task-status-card.component.ts
- [x] ./src/app/projects/states/dashboard/directives/task-dashboard/task-dashboard.component.ts
- [x] ./src/app/admin/institution-settings/overseer-images/overseer-image-list.component.ts
- [x] ./src/app/admin/institution-settings/institution-settings.component.ts
- [x] ./src/app/admin/institution-settings/campuses/campus-list/campus-list.component.ts
- [x] ./src/app/admin/institution-settings/activity-type-list/activity-type-list.component.ts
- [x] ./src/app/admin/tii-action-log/tii-action-log.component.ts
- [x] ./src/app/admin/states/teaching-periods/teaching-period-list/teaching-period-list.component.ts
- [x] ./src/app/admin/states/teaching-periods/teaching-period-unit-import/teaching-period-unit-import.dialog.ts
- [x] ./src/app/eula/accept-eula/accept-eula.component.ts
- [x] ./src/app/welcome/welcome.component.ts
- [x] ./src/app/units/states/tasks/inbox/directives/staff-task-list/staff-task-list.component.ts
- [x] ./src/app/units/states/tasks/inbox/inbox.component.ts
- [x] ./src/app/units/states/edit/directives/unit-students-editor/student-tutorial-select/student-tutorial-select.component.ts
- [x] ./src/app/units/states/edit/directives/unit-students-editor/unit-students-editor.component.ts
- [x] ./src/app/units/states/edit/directives/unit-students-editor/student-campus-select/student-campus-select.component.ts
- [x] ./src/app/units/states/edit/directives/unit-tutorials-manager/unit-tutorials-manager.component.ts
- [x] ./src/app/units/states/edit/directives/unit-tutorials-list/unit-tutorials-list.component.ts
- [x] ./src/app/units/states/edit/directives/unit-tasks-editor/unit-task-editor.component.ts
- [x] ./src/app/units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-who/task-definition-who.component.ts
- [x] ./src/app/units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-dates/task-definition-dates.component.ts
- [x] ./src/app/units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-options/task-definition-options.component.ts
- [x] ./src/app/units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-resources/task-definition-resources.component.ts
- [x] ./src/app/units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-overseer/task-definition-overseer.component.ts
- [x] ./src/app/units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-editor.component.ts
- [x] ./src/app/units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-general/task-definition-general.component.ts
- [x] ./src/app/units/states/edit/directives/unit-tasks-editor/task-definition-editor/task-definition-upload/task-definition-upload.component.ts
- [x] ./src/app/units/states/analytics/unit-analytics-route.component.ts
- [x] ./src/app/common/footer/footer.component.ts
- [x] ./src/app/common/audio-recorder/audio/audio-comment-recorder/audio-comment-recorder.ts
- [x] ./src/app/common/audio-recorder/audio/microphone-tester/microphone-tester.component.ts
- [x] ./src/app/common/audio-player/audio-player.component.ts
- [x] ./src/app/common/edit-profile-form/edit-profile-form.component.ts
- [x] ./src/app/common/file-drop/file-drop.component.ts
- [x] ./src/app/common/modals/extension-modal/extension-modal.component.ts
- [x] ./src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component.ts
- [x] ./src/app/common/modals/calendar-modal/calendar-modal.component.ts
- [x] ./src/app/common/modals/task-assessment-modal/task-assessment-modal.component.ts
- [x] ./src/app/common/pdf-viewer/pdf-viewer.component.ts
- [x] ./src/app/common/obect-select/object-select.component.ts
- [x] ./src/app/common/hero-sidebar/hero-sidebar.component.ts
- [x] ./src/app/common/project-progress-bar/project-progress-bar.component.ts
- [x] ./src/app/common/f-chip/f-chip.component.ts
- [x] ./src/app/common/status-icon/status-icon.component.ts
- [x] ./src/app/common/user-badge/user-badge.component.ts
- [x] ./src/app/common/file-viewer/file-viewer.component.ts
- [x] ./src/app/common/user-icon/user-icon.component.ts
- [x] ./src/app/common/pdf-viewer-panel/pdf-viewer-panel.component.ts
- [x] ./src/app/common/header/header.component.ts
- [x] ./src/app/common/header/task-dropdown/task-dropdown.component.ts
- [x] ./src/app/common/header/unit-dropdown/unit-dropdown.component.ts
- [x] ./src/app/common/services/alert.service.ts
- [x] ./src/app/sessions/states/sign-in/sign-in.component.ts
- [x] ./src/app/account/edit-profile/edit-profile.component.ts

TODO:

- [ ] ./src/app/visualisations/alignment-bar-chart.coffee
- [ ] ./src/app/visualisations/summary-task-status-scatter.coffee
- [ ] ./src/app/visualisations/target-grade-pie-chart.coffee
- [ ] ./src/app/visualisations/achievement-custom-bar-chart.coffee
- [ ] ./src/app/visualisations/student-task-status-pie-chart.coffee
- [ ] ./src/app/visualisations/alignment-bullet-chart.coffee
- [ ] ./src/app/visualisations/progress-burndown-chart.coffee
- [ ] ./src/app/visualisations/task-status-pie-chart.coffee
- [ ] ./src/app/visualisations/achievement-box-plot.coffee
- [ ] ./src/app/visualisations/task-completion-box-plot.coffee
- [ ] ./src/app/visualisations/visualisations.coffee
- [ ] ./src/app/tasks/task-status-selector/task-status-selector.coffee
- [ ] ./src/app/tasks/tasks.coffee
- [ ] ./src/app/tasks/modals/modals.coffee
- [ ] ./src/app/tasks/modals/upload-submission-modal/upload-submission-modal.coffee
- [ ] ./src/app/tasks/modals/grade-task-modal/grade-task-modal.coffee
- [ ] ./src/app/tasks/task-definition-selector/task-definition-selector.coffee
- [ ] ./src/app/tasks/project-tasks-list/project-tasks-list.coffee
- [ ] ./src/app/tasks/task-ilo-alignment/task-ilo-alignment-rater/task-ilo-alignment-rater.coffee
- [ ] ./src/app/tasks/task-ilo-alignment/modals/task-ilo-alignment-modal/task-ilo-alignment-modal.coffee
- [ ] ./src/app/tasks/task-ilo-alignment/modals/task-ilo-alignment.coffee
- [ ] ./src/app/tasks/task-ilo-alignment/task-ilo-alignment-editor/task-ilo-alignment-editor.coffee
- [ ] ./src/app/tasks/task-ilo-alignment/task-ilo-alignment.coffee
- [ ] ./src/app/tasks/task-ilo-alignment/task-ilo-alignment-viewer/task-ilo-alignment-viewer.coffee
- [ ] ./src/app/config/privacy-policy/privacy-policy.coffee
- [ ] ./src/app/config/config.coffee
- [ ] ./src/app/config/runtime/runtime.coffee
- [ ] ./src/app/config/root-controller/root-controller.coffee
- [ ] ./src/app/config/local-storage/local-storage.coffee
- [ ] ./src/app/config/routing/routing.coffee
- [ ] ./src/app/config/vendor-dependencies/vendor-dependencies.coffee
- [ ] ./src/app/config/analytics/analytics.coffee
- [ ] ./src/app/config/debug/debug.coffee
- [ ] ./src/app/projects/projects.coffee
- [ ] ./src/app/projects/project-progress-dashboard/project-progress-dashboard.coffee
- [ ] ./src/app/projects/states/states.coffee
- [ ] ./src/app/projects/states/all/directives/directives.coffee
- [ ] ./src/app/projects/states/all/directives/all-projects-list/all-projects-list.coffee
- [ ] ./src/app/projects/states/all/all.coffee
- [ ] ./src/app/projects/states/groups/groups.coffee
- [ ] ./src/app/projects/states/feedback/feedback.coffee
- [ ] ./src/app/projects/states/dashboard/directives/directives.coffee
- [ ] ./src/app/projects/states/dashboard/directives/progress-dashboard/progress-dashboard.coffee
- [ ] ./src/app/projects/states/dashboard/directives/student-task-list/student-task-list.coffee
- [ ] ./src/app/projects/states/dashboard/directives/task-dashboard/directives/directives.coffee
- [ ] ./src/app/projects/states/dashboard/directives/task-dashboard/directives/task-outcomes-card/task-outcomes-card.coffee
- [ ] ./src/app/projects/states/dashboard/directives/task-dashboard/task-dashboard.coffee
- [ ] ./src/app/projects/states/dashboard/dashboard.coffee
- [ ] ./src/app/projects/states/outcomes/outcomes.coffee
- [ ] ./src/app/projects/states/portfolio/directives/portfolio-review-step/portfolio-review-step.coffee
- [ ] ./src/app/projects/states/portfolio/directives/directives.coffee
- [ ] ./src/app/projects/states/portfolio/directives/portfolio-learning-summary-report-step/portfolio-learning-summary-report-step.coffee
- [ ] ./src/app/projects/states/portfolio/directives/portfolio-add-extra-files-step/portfolio-add-extra-files-step.coffee
- [ ] ./src/app/projects/states/portfolio/directives/portfolio-grade-select-step/portfolio-grade-select-step.coffee
- [ ] ./src/app/projects/states/portfolio/directives/portfolio-welcome-step/portfolio-welcome-step.coffee
- [ ] ./src/app/projects/states/portfolio/directives/portfolio-tasks-step/portfolio-tasks-step.coffee
- [ ] ./src/app/projects/states/portfolio/portfolio.coffee
- [ ] ./src/app/projects/states/index/index.coffee
- [ ] ./src/app/projects/states/tutorials/tutorials.coffee
- [ ] ./src/app/projects/project-outcome-alignment/project-outcome-alignment.coffee
- [ ] ./src/app/admin/modals/modals.coffee
- [ ] ./src/app/admin/modals/create-unit-modal/create-unit-modal.coffee
- [ ] ./src/app/admin/states/states.coffee
- [ ] ./src/app/admin/states/units/units.coffee
- [ ] ./src/app/admin/states/users/users.coffee
- [ ] ./src/app/admin/admin.coffee
- [ ] ./src/app/groups/group-selector/group-selector.coffee
- [ ] ./src/app/groups/group-set-manager/group-set-manager.coffee
- [ ] ./src/app/groups/group-member-contribution-assigner/group-member-contribution-assigner.coffee
- [ ] ./src/app/groups/group-member-list/group-member-list.coffee
- [ ] ./src/app/groups/group-set-selector/group-set-selector.coffee
- [ ] ./src/app/groups/tutor-group-manager/tutor-group-manager.coffee
- [ ] ./src/app/groups/groups.coffee
- [ ] ./src/app/units/modals/unit-student-enrolment-modal/unit-student-enrolment-modal.coffee
- [ ] ./src/app/units/modals/modals.coffee
- [ ] ./src/app/units/modals/unit-ilo-edit-modal/unit-ilo-edit-modal.coffee
- [ ] ./src/app/units/units.coffee
- [ ] ./src/app/units/states/states.coffee
- [ ] ./src/app/units/states/tasks/inbox/inbox.coffee
- [ ] ./src/app/units/states/tasks/tasks.coffee
- [ ] ./src/app/units/states/tasks/viewer/directives/directives.coffee
- [ ] ./src/app/units/states/tasks/viewer/directives/task-sheet-view/task-sheet-view.coffee
- [ ] ./src/app/units/states/tasks/viewer/directives/task-details-view/task-details-view.coffee
- [ ] ./src/app/units/states/tasks/viewer/directives/unit-task-list/unit-task-list.coffee
- [ ] ./src/app/units/states/tasks/viewer/viewer.coffee
- [ ] ./src/app/units/states/tasks/definition/definition.coffee
- [ ] ./src/app/units/states/portfolios/portfolios.coffee
- [ ] ./src/app/units/states/all/directives/all-units-list/all-units-list.coffee
- [ ] ./src/app/units/states/all/directives/directives.coffee
- [ ] ./src/app/units/states/all/all.coffee
- [ ] ./src/app/units/states/groups/groups.coffee
- [ ] ./src/app/units/states/edit/directives/directives.coffee
- [ ] ./src/app/units/states/edit/directives/unit-group-set-editor/unit-group-set-editor.coffee
- [ ] ./src/app/units/states/edit/directives/unit-details-editor/unit-details-editor.coffee
- [ ] ./src/app/units/states/edit/directives/unit-staff-editor/unit-staff-editor.coffee
- [ ] ./src/app/units/states/edit/directives/unit-ilo-editor/unit-ilo-editor.coffee
- [ ] ./src/app/units/states/edit/edit.coffee
- [ ] ./src/app/units/states/rollover/directives/directives.coffee
- [ ] ./src/app/units/states/rollover/directives/unit-dates-selector/unit-dates-selector.coffee
- [ ] ./src/app/units/states/rollover/rollover.coffee
- [ ] ./src/app/units/states/index/index.coffee
- [ ] ./src/app/units/states/students-list/students-list.coffee
- [ ] ./src/app/units/states/analytics/analytics.coffee
- [ ] ./src/app/common/filters/filters.coffee
- [ ] ./src/app/common/content-editable/content-editable.coffee
- [ ] ./src/app/common/alert-list/alert-list.coffee
- [ ] ./src/app/common/modals/confirmation-modal/confirmation-modal.coffee
- [ ] ./src/app/common/modals/comments-modal/comments-modal.coffee
- [ ] ./src/app/common/modals/modals.coffee
- [ ] ./src/app/common/modals/csv-result-modal/csv-result-modal.coffee
- [ ] ./src/app/common/modals/progress-modal/progress-modal.coffee
- [ ] ./src/app/common/grade-icon/grade-icon.coffee
- [ ] ./src/app/common/file-uploader/file-uploader.coffee
- [ ] ./src/app/common/common.coffee
- [ ] ./src/app/common/services/grade-service.coffee
- [ ] ./src/app/common/services/date-service.coffee
- [ ] ./src/app/common/services/alert-service.coffee
- [ ] ./src/app/common/services/media-service.coffee
- [ ] ./src/app/common/services/recorder-service.coffee
- [ ] ./src/app/common/services/outcome-service.coffee
- [ ] ./src/app/common/services/listener-service.coffee
- [ ] ./src/app/common/services/analytics-service.coffee
- [ ] ./src/app/common/services/services.coffee
- [ ] ./src/app/sessions/auth/http-auth-injector.coffee
- [ ] ./src/app/sessions/sessions.coffee
- [ ] ./src/app/errors/errors.coffee
- [ ] ./src/app/errors/states/states.coffee
- [ ] ./src/app/errors/states/unauthorised/unauthorised.coffee
- [ ] ./src/app/errors/states/not-found/not-found.coffee
- [ ] ./src/app/errors/states/timeout/timeout.coffee

## Table of Contents

- [Doubtfire Web ![CI](https://github.com/doubtfire-lms/doubtfire-web/actions/workflows/nodejs-ci.yml)](#doubtfire-web-)
  - [Migration Progress](#migration-progress)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Deployment](#deployment)
  - [Resources](#resources)
  - [Contributing](#contributing)
  - [License](#license)

## Getting Started

If you will be using [Docker](https://github.com/doubtfire-lms/doubtfire-api/#getting-started-via-docker), follow the instructions there.

Before you get started, make sure you have the [Doubtfire API](https://github.com/doubtfire-lms/doubtfire-api) up and running. You will need to do this before continuing.

First, clone the web repository, and change to the root directory:

```sh
git clone https://github.com/doubtfire-lms/doubtfire-web.git
cd ./doubtfire-web
```

You can automate the installation process by running the automated setup script:

```sh
./setup.sh
```

Or, you can continue following the below steps to manually install `doubtfire-web`.

Install [Node.js](http://nodejs.org/) either by [downloading it](http://nodejs.org/download/) and installing it manually, or via [Homebrew](http://brew.sh) on OS X:

```sh
brew install node
```

_or_ by using `apt-get` on Linux:

```sh
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install nodejs
```

Install Ruby [SASS](http://sass-lang.com):

```sh
gem install sass
```

If `gem` fails, you should read the Doubtfire API README to install ruby. If you are _not_ using `rbenv`, e.g., using Docker instead, you may need to prepend `sudo` to the above commands to have root write access.

If using `rbenv`, rehash to ensure each of the gems are on your `PATH`:

```sh
rbenv rehash
```

Install all node dependencies using `npm`, as well as [grunt-cli](http://gruntjs.com/using-the-cli) globally:

```sh
npm install
```

**Note:** You may need to install `grunt-cli` globally in Linux using `sudo`.

Lastly, to compile and run a watch server and web server, use `npm start`:

```sh
npm start
```

This will automatically run the angular 1 `grunt watch`, and the angular 7 `ng serve`.

You can then navigate to the Doubtfire web interface at **http://localhost:8000**.

## Deployment

To compile the front-end, ensure `doubtfire-api` is placed as a sibling directory to `doubtfire-web`, then run:

```sh
cd /path/to/repos
ls
doubtfire-api    doubtfire-web
cd ./doubtfire-api
grunt deploy
```

You may prefix this command with the following environment variables:

- `DF_API_URL` - the URL of the API (e.g., `https://doubtfire.com/api`). This will default to `window.location.host` if not set and dynamically generate a URL.
- `DF_EXTERNAL_NAME` - a new name that removes references to the _Doubtfire_ name should you so want to not use such its original name (😢).

## Resources

Doubtfire Web is an [Angular](http://angularjs.org) application built using [Bootstrap](http://getbootstrap.com). It uses many Open Source libraries, which you can read up on:

- [Lodash](http://lodash.com/docs)
- [Moment.js](http://momentjs.com)
- [Font Awesome](http://fontawesome.io)
- [UI Router](https://github.com/angular-ui/ui-router)
- [UI Bootstrap](http://angular-ui.github.io/bootstrap/versioned-docs/0.13.4/)
- [UI Select](https://github.com/angular-ui/ui-select)
- [NVD3 Charts](http://krispo.github.io/angular-nvd3/#/)
- [Angular X-Editable](http://vitalets.github.io/angular-xeditable/)
- [Angular Filters](https://github.com/a8m/angular-filter)
- [Angular Markdown Filter](https://github.com/vpegado/angular-markdown-filter)

## Contributing

Refer to [CONTRIBUTING.md](CONTRIBUTING.md)

## License

Licensed under GNU Affero General Public License (AGPL) v3
