# Assignment 2 CLI

## Overview
This CLI client was built using bun and typescript that uses Github’s Rest API and this client help users to search and get many different things from GitHub and allows them to input simple command and makes it easier to get information from GitHub with simple commands.

## Features 
- Gets User infomation from github
- Lists all the repositories that the user created
- View the Details of the repository 
- Gets the issues and pull requests from a specfic repository 
- Configuration via environment variables or config files
- Output Formatting Options

# =========================================================================================================================================

## Supported Commands and Flags

Commands:
  user <username>
  repos <username> [page] [per_page]
  repo <owner> <repo>
  issues <owner> <repo> [state] [page] [per_page]
  pulls <owner> <repo> [state] [page] [per_page]
  search <query> [page] [per_page] [sort]

Flags:
  --pretty
  --table

Examples of usage:
bun run src/index.ts user octocat --pretty
bun run src/index.ts repos torvalds 1 5 --table
bun run src/index.ts repo facebook react --pretty
bun run src/index.ts issues microsoft vscode open 1 5 --table
bun run src/index.ts pulls nodejs node open 1 5 --table
bun run src/index.ts search "react cli" 1 5 stars --table


# =========================================================================================================================================

## Authentication 
if needed just add your token

"dollar sign"env:GITHUB_TOKEN="your_token_here"


# =========================================================================================================================================

  ## Usage Examples:

  # Gets User's Infomation
  bun run src/index.ts user octocat

  # List Repositories by a user with pagination 
  bun run src/index.ts repos octocat 1 5

  # Gets Repositories Details
  bun run src/index.ts repo octocat Hello-World

  # Lists issues in a User's repository
  bun run src/index.ts issues octocat Hello-World open

  # Searchs inside a repository 
  bun run src/index.ts search bun 1 5 stars

  # Examples of the flags in use
  bun run src/index.ts repos octocat --pretty 
  bun run src/index.ts repos octocat --table


# =========================================================================================================================================

## To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts <command> [Arguements]

Example 
bun run src/index.ts user octocat
```

This project was created using `bun init` in bun v1.3.8. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.