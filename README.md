#Developer notes

## Scripts

`yarn bootstrap`: Does `yarn install` and `yarn build` using lerna for all packages in the monorepo

`yarn run dev`: Serve app.ts in sample app with hot-reload. Also rebuilds keysmith when changes are detected in packages/keysmith/src. Logs are streamed for both packages in the same terminal window.

---

## Playground

Within `/packages/keysmith`, there is a playground dir where you can experiment with `Me3` class  with hot-reload capabilities

###Steps:
1. Go to root and run `yarn playground`
2. Make your changes in `packages/keysmith/src/__playgrounds__/index.ts` accordingly


--- 

## Publishing

###Prerequisites:
- Requires R/W `.npmrc` -> Obtain from @Ailin
- `lerna` global installed on your machine

###Steps:
1. Commit your changes
2. On the root of the repo, `lerna publish`
3. Choose the version bump, please follow semantic versioning and feel free to make use of alpha versions if you're testing unstable code
4. The publish process would actually run `eslint -fix` so you might end up with some uncommitted eslint changes. You can either make another commit

###What happens if your publish fails:
TBC
Reminder of things to cover:
1. possible types of errors
   1. type errors
   2. failed tests
   3. git tag already exists
   4. no changes to publish
2. how to completely recover from a failed publish attempt 

---

## Documentation

- We have a separate GitHub Pages for Keysmith documentation
- Please go to [Me3Keysmith-Documentation](https://github.com/me3wallet/Me3Keysmith-Documentation) and update the documentation accordingly