![Doubtfire Logo](http://puu.sh/lyClF/fde5bfbbe7.png)

# Doubtfire Web - Angular.js to Angular migration guide

This guide will provide the basic steps you can follow in order to successfully migrate a Doubtfire component from CoffeeScript and Angular.js to TypeScript and Angular.

Here we will demonstrate what to do using the changes associated with the Task Description card.

## Step 1 - Create a branch

Ok, this should be a given but it is always going to be important to isolate the changes for these migrations. So start by checking out a new branch for this change.

For the task description card this was done using the following command in the Terminal:

```bash
git checkout -b migrate/task-description-card
```

## Step 2 - Create replacement files

Create a typescript, scss, and html file to replace the coffeescript, scss, and html files from the angular.js project.

For the Task Description Card we had the files:

- task-description-card.coffee
- task-description-card.tpl.html
- task-description-card.scss

In the same folder we can start by creating the following files:

- task-description-card.component.ts
- task-description-card.component.html
- task-description-card.component.scss

Notice the naming convention. When migrating a component we use the format *name*.**component**.*extension*.

Add the start of the typescript using something based on the following:

```typescript
import { Component, Input, Inject } from '@angular/core';

@Component({
  selector: 'task-description-card',
  templateUrl: 'task-description-card.component.html',
  styleUrls: ['task-description-card.component.scss']
})
export class TaskDescriptionCardComponent {

  constructor(
  ) {
  }

}
```

We cant see any of these changes yet, but it is a good clean start so lets commit this before we move on.

```bash
git add task-description-card.component.ts
git add task-description-card.component.html
git add task-description-card.component.scss
# or "git add ." if you have a clean repository and only these files are changed.
git commit -m "NEW: Create initial files for migration of task-description-card"
```

Then we should make sure to push this back to GitHub so that others can see our progress. As this is a new branch you will need set the upstream branch, but if you forget the `git push` will remind you anyway.

```bash
git push --set-upstream origin migrate/task-description-card
```

You should see a suggestion to create a pull request when you add this branch. This is also a good idea. At this stage you can create a [Draft Pull Request](https://github.blog/2019-02-14-introducing-draft-pull-requests/) which will get updated as you push your changes. Use this to get a quick screenshot of the component in action currently. Then you can include this as a "from" image.

See the resulting [commit](933df7b673b5d57dc162fb42f79c511444f5fbe3) and [pull request](https://github.com/doubtfire-lms/doubtfire-web/pull/321). Its great that you can go back and see how things evolved.

## Step 3 - Unlink old component and add in new

We want to make sure we can see our progress as quickly as possible. So lets start by replacing the old component with the new one.

There are a few files we need to update to achieve this.

- Remove link to component from the angular module.
  - Open the component's CoffeeScript file and make a note of the name of the module.
    ```coffeescript
    angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-description-card', [])
    ```

    The name is `doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-description-card`
  - Search for where this is referenced. For the task-description-card this was in file `src/app/projects/states/dashboard/directives/task-dashboard/directives/directives.coffee`... hence the suggestion to search :satisfied:.
  - Remove the reference. This will mean that the component is no longer loaded by angular.js.
- Setup the new component in **doubtfire-angular.module.ts**
  - Import like this:
    ```ts
    import { TaskDescriptionCardComponent } from './projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.component';
    ```
  - Then add the component name to the list of **declarations**. Now the component will be available in Angular.
- Remove the old and downgrade the new in **doubtfire-angularjs.module.ts**
  - Remove the line importing the old javascript file:
    ```typescript
    import 'build/src/app/projects/states/dashboard/directives/task-dashboard/directives/task-description-card/task-description-card.js';
    ```
  - Import the new component... *it is the same code as importing to the angular module*.
  - Downgrade to make the new component available to Angular.js
    ```typescript
    DoubtfireAngularJSModule.directive('taskDescriptionCard', downgradeComponent({ component: TaskDescriptionCardComponent}));
    ```

Now we can compile to see if this has all worked... :crossed_fingers:. When you change the config in this way I generally find you need to kill any old build processes and start them again. So we can compile now using:

```bash
npm start
```

Open your local copy of Doubtfire and navigate somewhere that you can see the lack of the old component. As we have no HTML yet, there should be nothing in its place but we are mostly checking that we have connected this all up correctly.

See the resulting [commit](52eeb9b598aa1bd5218d76857901dd77fe364c1c) for all of these changes.
