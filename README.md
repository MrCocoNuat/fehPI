# Turnwheel

## Overview
Simulate Arena / Aether Raids / etc. battles in the Fire Emblem Heroes (FEH) mobile game. Form teams of units and see the outcomes of each action and combat with a reference computer player or yourself, reversing course and trying a different branch from the action tree if you like.

Test: this change can only be merged/pushed into main through an approved PR, even by repository admins

## Building

### Octokit

This application optionally makes use of the [Octokit](https://github.com/octokit/octokit.js/) library to access a remote repository at https://github.com/Hertz-Devil/feh-assets-json. You will need to supply your own GitHub PAT at `src/api-client/keys.json`:
```
{
  "octokit": "YOUR_PERSONAL_ACCESS_TOKEN_HERE"
}
```
It does not need any permissions besides ordinary public repository access (so don't check any checkboxes).

Alternatively, you can choose to clone the remote repository into `src/api-client/github/local-clone`, and then make sure that the relevant repository is marked `useLocal: true` in `src/dao/remote-data/remote-data.json`. The application will then pull from the local copy.

After this setup, running should be mostly straightforward - 
```
git clone ...
cd turnwheel/src
npm install
npx next build
npm run start
```

or just `npm run dev` if you're running in an development environment.

## Dependencies

Many thanks to maintainers of and contributors to:
- [feh-assets-json](https://github.com/Hertz-Devil/feh-assets-json)
- [Fire Emblem Heroes Fandom Wiki](https://feheroes.fandom.com/)

- [Next.js](https://github.com/vercel/next.js) (MIT)
- [Yoga GraphQL server](https://github.com/dotansimha/graphql-yoga) (MIT)
- [Pothos GraphQL schema](https://github.com/hayes/pothos) (ISC)
- [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) (MIT)
- [Apollo GraphQL client](https://github.com/apollographql/apollo-client) (MIT)
- [Octokit](https://github.com/octokit/octokit.js) (MIT)
- and more
