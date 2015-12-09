
# Contributing

We follow a [Gitflow workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

## Forking

If you do not have direct write access, please fork this repository.

When you are happy with your changes, submit a pull request for code review.

## Branching

### Gitflow Workflow

![Feature Branches](http://puu.sh/lP4eT/43f3131730.png)

We try to keep two main branches at all times:

- `master` for production
- `develop` for current development, a branch off `master`

That way, we follow the workflow:

1. branch off `develop`, giving your branch one of the prefixes defined below,
2. make your changes in that branch,
3. merge your branch back into `develop`,
4. delete your branch to clean up

In some cases, your branches may only consist of one or two commits. This is still okay as you can submit a pull request for code review back into `develop`.

You may want to branch again, e.g.:

```
* master
|\
| \
| |
| (b1) develop
| |\
| | (b2) feature/my-new-feature
| | |\
| | | (b3) test/unit-tests-for-new-feature
| | |/
| | (m1)
| |/
| (m2)
| |\
| | (b4) fix/broken-thing
| |/
| (m3)
| /|
|/ | 
(m4)
|  |
|  |
*  *
 ```
 
Here, we:
 
 1. branched off `master` to create our `develop` branch, at **`b1`**
 2. branched off `develop` to create a new feature under the new branch `feature/my-new-feature`, at **`b2`**
 3. branched off `feature/my-new-feature` to create some unit tests for that feature under `test/unit-tests-for-new-feature`, at **`b3`**
 4. merged those unit tests back into `feature/my-new-feature`, at **`m1`**
 5. merged the new feature back into `develop`, at **`m2`**
 6. found a new bug in the feature later on, so branched off `develop` into `fix/broken-thing`, at **`b4`**
 7. after we fixed our bug, we merged `fix/broken-thing` back into `develop`, at **`m3`**
 8. decide we're ready to release, so merge `develop` into `master`, at **`m4`**

Note that along the way **we're deleting branches after we don't need them**. This helps us keep *short-lived* branches that don't go *stale* after months of inactivity, and prevents us from forgetting about open branches. The only branch we kept open was `develop`, which we can always branch off for new, un-released changes again.
  
Ideally, any changes that are merged into `master` have been **code-reviewed** before they were merged into `develop`. **You should always code review before merging back into `develop`**. You can do this by performing a Pull Request, where the reviewer can see the changes you want to merge in to `develop`.

### Branch Prefixes

When branching, try to prefix your branch with one of the following:

Prefix     | Description                                                               | Example
-----------|---------------------------------------------------------------------------|--------------------------------------------------------------------
`feature/` | New feature was added                                                     | `feature/add-learning-outcome-alignment`
`fix/`     | A bug was fixed                                                           | `fix/crash-when-code-submission-finished`
`enhance/` | Improvement to existing feature, but not visual enhancement (See `LOOKS`) | `enhance/allow-code-files-to-be-submitted`
`looks/`   | UI Refinement, but not functional change (See `ENHANCE`)                  | `looks/rebrand-ui-for-version-2-marketing`
`quality/` | Refactoring of existing code                                              | `quality/make-code-convention-consistent`
`doc/`     | Documentation-related changes                                             | `doc/add-new-api-documentation`
`config/`  | Project configuration changes                                             | `config/add-framework-x-to-project`
`speed/`   | Performance-related improvements                                          | `speed/new-algorithm-to-process-foo`
`test/`    | Test addition or enhancement                                              | `test/unit-tests-for-new-feature-x`

## Commits

When writing commits, try to follow this guide:

### Prefix your commits message subjects with tags

Each one of your commit messages should be prefixed with one of the following:

Tag        | Description                                                               | Example
-----------|---------------------------------------------------------------------------|--------------------------------------------------------------------
`NEW`      | New feature was added                                                     | _**NEW** Add unit outcome alignment tab_
`​FIX`      | A bug was fixed                                                           | _**FIX** Amend typo throwing error_
`​​ENHANCE`  | Improvement to existing feature, but not visual enhancement (See `LOOKS`) | _**ENHACNE** Calculate time between classes to show on timetable_
`​LOOKS`    | UI Refinement, but not functional change (See `ENHANCE`)                  | _**LOOKS** Make plagiarism tab consistent with other tabs_
`​QUALITY`  | Refactoring of existing code                                              | _**QUALITY** Make directives in consistent format with eachother_
`​DOC`      | Documentation-related changes                                             | _**DOC** Write guide on writing commit messages_
`CONFIG`   | Project configuration changes                                             | _**CONFIG** Add new scheme for UI automation testing_
`​SPEED`    | Performance-related improvements                                          | _**SPEED** Reduce time needed to batch process PDF submissions_
`TEST`     | Test addition or enhancement                                              | _**TEST** Add unit tests for tutorial administration_

### Formatting your messages

Capitalise your commit messages and do not end the subject line with a period

```
FIX: Change the behaviour of the logging system
```

and not

```
fix: change the behaviour of the logging system.
```

### Use the imperative mood in your commit message subjects

Write your commits in the imperative mood and not the indicative mood

- "Fix a bug" and **not** "Fix*ed* a bug"
- "Change the behaviour of Y" and **not** "*Changed* the behaviour of Y"
- "Add new API methods" and **not** "Sweet new API methods"

A properly formed git commit subject line should always be able to complete the following sentence:

> If applied, this commit will **your subject line here**
> 
> If applied, this commit will **fix a bug**
>
> If applied, this commit will **change the behaviour of Y**

and not

> If applied, this commit will **sweet new API methods**


### Subject and body lines

Write a commit subject, and explain that commit on a new line (if need be):

```
FIX: Derezz the master control program

MCP turned out to be evil and had become intent on world domination.
This commit throws Tron's disc into MCP (causing its deresolution)
and turns it back into a chess game.
```

Keep the subject line (top line) concise; keep it **within 50 characters**.

Use the body (lines after the top line) to explain why and what and *not* how; keep it **within 72 characters**.

#### But how can I write new lines if I'm using `git commit -m "Message"`?

Don't use the `-m` switch. Use a text editor to write your commit message instead.

If you are using the command line to write your commits, it is useful to set your git editor to make writing a commit body easier. You can use the following command to set your editor to `emacs`, `vim`, `atom`.

```
$ git config --global core.editor emacs
$ git config --global core.editor vim
$ git config --global core.editor "atom --wait"
```

If you want to use Sublime Text as your editor, follow [this guide](https://help.github.com/articles/associating-text-editors-with-git/#using-sublime-text-as-your-editor).

If you are not using the command line for git, you probably [should be](http://try.github.io).