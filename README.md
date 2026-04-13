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
  
  --page <number> (only for User Repos, issues, pulls, search)  must use both flags 
  --per_page <number> (only for User Repos, issues, pulls, search) 
  
```

  # To input Your Github API Token 
  - Go To token.env 
  - Replace your_token_here with your token
  - Then run commands with your token inside


  ## Usage Examples:

  Gets User's Infomation
  ``` typescript
  bun run index.ts user octocat
  ```

  List Repositories from a user 
  ``` typescript
  bun run index.ts repos octocat
  ```

  Gets Repositories Details
  ``` typescript
  bun run index.ts repo octocat Hello-World
  ```

  Lists issues in a User's repository
  ``` typescript
  bun run index.ts issues octocat Hello-World
  ```

  Searchs inside a repository 
  ``` typescript
  bun run index.ts searchRepos bun
  ```

  Pulls 
  ``` typescript
  bun run index.ts pulls octocat Hello-World
  ```

  # Examples of the flags in use
  ``` typescript
  bun run index.ts repos octocat --pretty 
  bun run index.ts repos octocat --table
  bun run src/index.ts repos octocat --page 1 --per_page 5
  bun run index.ts issues octocat Hello-World --state open
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
