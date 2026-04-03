# GitHub Pages Deployment

This project deploys to GitHub Pages with GitHub Actions.

## Current Deployment Flow

The workflow is defined in `.github/workflows/deploy.yml`.

It currently:

1. Checks out the repository
2. Sets up Node.js 24
3. Runs `npm ci`
4. Runs `npm run build:prod`
5. Publishes `dist/aviation-tools/browser` to the `gh-pages` branch

The workflow triggers on:

- Push to `main`
- Push to `work`
- Manual run from the GitHub Actions UI

## Repo Settings

In GitHub, configure:

1. `Settings -> Pages`
2. Source: `Deploy from a branch`
3. Branch: `gh-pages` / `root`

Also configure:

1. `Settings -> Actions -> General`
2. Workflow permissions: `Read and write permissions`

## Required Project Values

If the repository name is `AviationTools`, these values should stay aligned:

In `package.json`:

```json
"homepage": "https://YOUR-USERNAME.github.io/AviationTools",
"build:prod": "ng build --configuration production --base-href /AviationTools/"
```

If you rename the repository, update both:

- `homepage`
- `build:prod` base href

## Local Verification

Use these commands before pushing:

```bash
npm ci
npm run build:prod
```

Expected deployable output:

```text
dist/aviation-tools/browser
```

## Typical Release

```bash
git add .
git commit -m "Update deployment"
git push
```

After the push:

1. Open the `Actions` tab
2. Check the latest `Deploy to GitHub Pages` run
3. Wait for the `gh-pages` branch update

## Troubleshooting

### `npm ci` fails

This usually means `package-lock.json` is out of sync with `package.json`.

Fix:

```bash
Remove-Item -Recurse -Force .\node_modules
Remove-Item -Force .\package-lock.json
npm install
```

Commit the updated `package-lock.json` before pushing.

### Build succeeds locally but Pages is blank

Check:

- `homepage` matches the GitHub Pages URL
- `build:prod` uses the correct `--base-href`
- GitHub Pages is serving the `gh-pages` branch

### Workflow fails on permissions

Check:

- Repository Actions permissions are set to `Read and write permissions`
- The workflow still has `contents: write`

## Important Files

- `.github/workflows/deploy.yml`
- `package.json`
- `angular.json`
- `ngsw-config.json`
- `src/manifest.json`
- `src/.nojekyll`

## Deployment URL

When configured for GitHub Pages, the app is served at:

```text
https://YOUR-USERNAME.github.io/AviationTools
```
