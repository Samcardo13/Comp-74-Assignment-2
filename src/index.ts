#!/usr/bin/env bun
/* A simple GitHub CLI built with Bun and TypeScript
  Comp 74 - Assignment 2 - CLI Client for a Public Web API
  Sam Cardo
  
  This CLI allows users to interact with the GitHub API to fetch user info, repositories, issues, pull requests, and perform searches.
*/

import { ApiError, Errors } from "./errors.ts";

const BASE_URL = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN;

// This function fetchs the json data and then checks for errors and if any error occur then it sends the code plus a user friendly message.
async function fetchJSON(url: string) {
  const headers: any = TOKEN ? { Authorization: `token ${TOKEN}` } : {};
  const res = await fetch(url, { headers });

  if (!res.ok) {
    if (res.status === 404) {
      throw Errors.notFound("Resource not found");
    }

    if (res.status === 400) {
      throw Errors.badRequest("Invalid request");
    }

    if (res.status === 409) {
      throw Errors.conflict("Conflict occurred");
    }

    throw Errors.internal(`HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

// This function is used to print the data in a user friendly format. It can print in pretty format or in table format based on the flags passed by the user.
function print(data: any, pretty: boolean, table: boolean) {
  const unwrap = (d: any) => {
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.items)) return d.items;
    return null;
  };

  const arr = unwrap(data);

  if (table && arr) {
    const formatted = arr.map((item: any) => formatItem(item));
    console.table(formatted);
    return;
  }

  if (table && !arr && typeof data === "object") {
    console.table(formatItem(data));
    return;
  }

  console.log(pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data));
}

function formatItem(item: any) {
  if (!item || typeof item !== "object") return item;

  // Repository
  if ("stargazers_count" in item) {
    return {
      Type: "Repo",
      Name: item.full_name ?? item.name,
      Stars: item.stargazers_count,
      Forks: item.forks_count,
      Language: item.language,
      URL: item.html_url,
    };
  }

  // Issue 
  if ("number" in item && "title" in item && "state" in item) {
    return {
      Type: item.pull_request ? "Pull" : "Issue",
      Number: item.number,
      Title: item.title,
      State: item.state,
      Author: item.user?.login,
      URL: item.html_url,
    };
  }

  // User
  if ("login" in item && "public_repos" in item) {
    return {
      Type: "User",
      Login: item.login,
      Name: item.name,
      Repos: item.public_repos,
      Followers: item.followers,
      Following: item.following,
      URL: item.html_url,
    };
  }

  // Pull request
  if ("merged_at" in item || "head" in item || "base" in item) {
    return {
      Type: "Pull",
      Number: item.number,
      Title: item.title,
      State: item.state,
      Merged: Boolean(item.merged_at),
      URL: item.html_url,
    };
  }

  return item;
}

// This function is used to get the argument from the command line.
//  It takes the arguments array, the index of the argument and a fallback value.
//  If the argument is not present at the index, it returns the fallback value.
function getArg(args: string[], index: number, fallback: any) {
  return args[index] ?? fallback;
}

/*

  This main function is a try and catch block that will handle the user input and by using a switch case structure
  and it will then go to a certain endpoint based off of the user input and it also had filtering, pagination and error handling.
  Also each case uses the base url and fetch's the data and then uses the print function to print the data in a user friendly format.

*/
async function main() {

  // gets the command and the arguments from the command line input
  let [command, ...args] = process.argv.slice(2);

  // gets the flags
  const pretty = args.includes("--pretty");
  if (pretty) args = args.filter(a => a !== "--pretty");

  const table = args.includes("--table");
  if (table) args = args.filter(a => a !== "--table");

  try {
    switch (command) {

      // Gets users infomation
      case "user": {
        if (!args[0]) return console.error("Usage: cli user <username>");
        const data = await fetchJSON(`${BASE_URL}/users/${args[0]}`);
        print(data, pretty, table);
        break;
      }

      // Gets users repositories with pagination
      case "repos": {
        if (!args[0]) return console.error("Usage: cli repos <username> [page] [per_page]");
        const page = getArg(args, 1, 1);
        const per_page = getArg(args, 2, 5);

        const repos = await fetchJSON(
          `${BASE_URL}/users/${args[0]}/repos?page=${page}&per_page=${per_page}`
        );
        print(repos, pretty, table);
        break;
      }

      // Gets a specific repository's information
      case "repo": {
        if (!args[0] || !args[1])
          return console.error("Usage: cli repo <owner> <repo>");
        const repoData = await fetchJSON(`${BASE_URL}/repos/${args[0]}/${args[1]}`);
        print(repoData, pretty, table);
        break;
      }

      // Gets a specific repository's issues with filtering and pagination
      case "issues": {
        if (!args[0] || !args[1])
          return console.error("Usage: cli issues <owner> <repo> [state] [page] [per_page]");

        const state = getArg(args, 2, "open");
        const page = Number(getArg(args, 3, 1));
        if (isNaN(page)) throw Errors.validation("Page must be a number");
        const per_page = getArg(args, 4, 5);

        const issues = await fetchJSON(
          `${BASE_URL}/repos/${args[0]}/${args[1]}/issues?state=${state}&page=${page}&per_page=${per_page}`
        );
        print(issues, pretty, table);
        break;
      }

      // Gets a specific repository's pull requests with filtering and pagination
      case "pulls": {
        if (!args[0] || !args[1])
          return console.error("Usage: cli pulls <owner> <repo> [state] [page] [per_page]");

        const state = getArg(args, 2, "open");
        const page = Number(getArg(args, 3, 1));
        if (isNaN(page)) throw Errors.validation("Page must be a number");
        const per_page = getArg(args, 4, 5);

        const pulls = await fetchJSON(
          `${BASE_URL}/repos/${args[0]}/${args[1]}/pulls?state=${state}&page=${page}&per_page=${per_page}`
        );
        print(pulls, pretty, table);
        break;
      }

      case "search": {
        if (!args[0])
          return console.error("Usage: cli search <query> [page] [per_page] [sort]");

        const query = encodeURIComponent(args[0]);
        const page = getArg(args, 1, 1);
        const per_page = getArg(args, 2, 5);
        const sort = getArg(args, 3, "stars");

        const searchData = await fetchJSON(
          `${BASE_URL}/search/repositories?q=${query}&page=${page}&per_page=${per_page}&sort=${sort}`
        );

        print(searchData, pretty, table);
        break;
      }

      default:
        console.log(`
        GitHub CLI (Bun)

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
                  `);
    }
  } catch (err: any) {
    if (err instanceof ApiError) {
      console.error(`[${err.code}] ${err.message}`);

      if (err.details) {
        console.error("Details:", err.details);
      }
    } else {
      console.error("Unexpected Error:", err.message);
    }
  }
}

main();