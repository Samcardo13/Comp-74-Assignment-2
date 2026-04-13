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


## Supported Commands and Flags

Commands:
```
- user <username>
- repo <owner> <repo>
- searchRepos <query>
- issues <owner> <repo> <state>
- pulls <owner> <repo>
- repos <username> < --page <number> > < --per_page <number> >
```

Flags:
```
  --pretty : Pretty print the JSON output
  --table : Display output in a table format
  --state <state> : Filter issues by state (open, closed, all)
  
```

## Authentication 
if needed just add your token

"dollar sign"env:GITHUB_TOKEN="your_token_here"

  ## Usage Examples:

  Gets User's Infomation
  ``` typescript
  bun run src/index.ts user octocat
  ```

  List Repositories by a user with pagination 
  ``` typescript
  bun run src/index.ts repos octocat 1 5
  ```

  Gets Repositories Details
  ``` typescript
  bun run src/index.ts repo octocat Hello-World
  ```

  Lists issues in a User's repository
  ``` typescript
  bun run src/index.ts issues octocat Hello-World open
  ```

  Searchs inside a repository 
  ``` typescript
  bun run src/index.ts search bun 1 5 stars
  ```

  # Examples of the flags in use
  ``` typescript
  bun run src/index.ts repos octocat --pretty 
  bun run src/index.ts repos octocat --table
  ```

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
