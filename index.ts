#!/usr/bin/env bun

//imports
import * as fs from 'fs';
import * as path from 'path';
import "dotenv/config";

// Constants
const BASE_URL = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN;

let cacheData: Record<string, any> = {};

// Function to fetch data from GitHub API with caching feature.
async function fetchData(url: string): Promise<any> {
    console.log("Fetching URL:", url);
    const filePath = path.join(__dirname, 'cache.json');

    // Check if cache file exists and if it contains a valid response for the requested URL
    try {
        if (fs.existsSync(filePath)) {
            const cacheContent = fs.readFileSync(filePath, 'utf-8').trim();

            if (cacheContent) {
                cacheData = JSON.parse(cacheContent);
            } else {
                console.log("Cache file is empty, initializing new cache.");
            }
        }
    } catch (err: any) {
        console.log("Error reading cache file, resetting cache:", err.message);
        cacheData = {};
    }

    try {
        const headers: HeadersInit = {
            Accept: 'application/vnd.github+json'
        };

        if (TOKEN) {
            headers['Authorization'] = `token ${TOKEN}`;
        }

        const response = await fetch(url, { headers });

        // Cache the response data along with the URL for future requests
        const cacheData = {
            response: await response.clone().json(),
            url: url
        };

        // Save the response to cache file
        fs.writeFile(filePath, JSON.stringify(cacheData, null, 2), (err) => {
            if (err) throw err;
            console.log('Cache saved to cache.json');
        })

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Resource not found (check username/repo)");
            }
            if (response.status === 403) {
                throw new Error("Rate limit exceeded or access denied");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Function to print data in different formats based on flags
async function printData(data: any, pretty: boolean, table: boolean) {
    if (table) {
        console.table(data);
    } else if (pretty) {
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.log(data);
    }
}


async function main() {

    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    const parm1 = args[1];
    const parm2 = args[2];

    // Format Flags
    const pretty = args.includes('--pretty');
    const table = args.includes('--table');
    const help = args.includes('--help') || args.includes('-h');

    if (help) {
        console.log(
            `
            GitHub CLI Tool - Commands and Usage:
            Commands:
            - user <username> : Fetch user information by username
            - repo <owner> <repo> : Fetch repository information by owner and repo name
            - searchRepos <query> : Search repositories by query string, sorted by stars in descending order
            - issues <owner> <repo> <state> : Issues filtered by state: open, closed, or all
            - pulls <owner> <repo> : Fetch pull requests for a repository
            - repos <username> : List user repositories
            Flags:
            --pretty : Pretty print the JSON output
            --table : Display output in a table format
            --state <state> : Filter issues by state (open, closed, all)
            Example usage:
            - bun run index.ts user octocat
            `
        );
        return;
    }


    try {
        switch (command) {
            // Fetch user information by username
            case "user":
                if (!parm1) {
                    console.error("Username is required for 'user' command");
                    return;
                }
                const userData = await fetchData(`${BASE_URL}/users/${parm1}`);
                printData(userData, pretty, table);
                break;

            // Fetch repository information by owner and repo name
            case "repo":

                if (!parm1 || !parm2) {
                    console.error("Owner and repository name are required for 'repo' command");
                    return;
                }
                const repoData = await fetchData(`${BASE_URL}/repos/${parm1}/${parm2}`);
                printData(repoData, pretty, table);
                break;

            // Search repositories by query string, sorted by stars in descending order and mapping results for table display if --table flag is used
            case "searchRepos": {

                if (args.length < 2) {
                    console.error("Search query is required for 'searchRepos' command");
                    return;
                }
                const query = args.slice(1).join(" ");
                const searchData = await fetchData(
                    `${BASE_URL}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`
                );

                // mapping the search results to a simpler format for table display
                if (args.includes("--table")) {
                    const items = searchData.items.map((item: any) => ({
                        name: item.name,
                        owner: item.owner.login,
                        stars: item.stargazers_count,
                        url: item.html_url
                    }));

                    printData(items, pretty, table);
                    return;

                } else if (args.includes("--page") && args.includes("--per_page")) {
                    const pageIndex = args.indexOf("--page");
                    const perPageIndex = args.indexOf("--per_page");

                    const page = Number(args[pageIndex + 1]);
                    const per_page = Number(args[perPageIndex + 1]);

                    const paginatedData = await fetchData(
                        `${BASE_URL}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&page=${page}&per_page=${per_page}`
                    );
                    printData(paginatedData, pretty, table);
                    return;

                } else {
                    printData(searchData, pretty, table);
                }

                break;
            }

            // Issues filtered by state: open, closed, or all
            case "issues": {

                if (!parm1 || !parm2) {
                    console.error("Owner and repository name are required for 'issues' command");
                    return;
                }

                if (args.includes('--state')) {
                    const state = args[4];
                    const statefiltered = await fetchData(
                        `${BASE_URL}/repos/${parm1}/${parm2}/issues?state=${state}`
                    );
                    printData(statefiltered, pretty, table);
                    return;
                }

                else if (args.includes("--table")) {
                    const issuesTableData = await fetchData(`${BASE_URL}/repos/${parm1}/${parm2}/issues`);
                    const items = issuesTableData.map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        user: item.user.login,
                        state: item.state,
                        url: item.html_url
                    }));

                    printData(items, pretty, table);
                    return;

                } else if (args.includes("--page") && args.includes("--per_page")) {
                    const pageIndex = args.indexOf("--page");
                    const perPageIndex = args.indexOf("--per_page");

                    const page = Number(args[pageIndex + 1]);
                    const per_page = Number(args[perPageIndex + 1]);

                    const paginatedData = await fetchData(
                        `${BASE_URL}/repos/${parm1}/${parm2}/issues?page=${page}&per_page=${per_page}`
                    );

                    printData(paginatedData, pretty, table);
                    return;

                } else {
                    const issuesData = await fetchData(
                        `${BASE_URL}/repos/${parm1}/${parm2}/issues`
                    );

                    printData(issuesData, pretty, table);
                    break;
                }
            }

            // Fetch pull requests for a repository
            case "pulls":
                if (!parm1 || !parm2) {
                    console.error("Owner and repository name are required for 'pulls' command");
                    return;
                }
                const pullsData = await fetchData(`${BASE_URL}/repos/${parm1}/${parm2}/pulls`);

                if (args.includes("--table")) {
                    const items = pullsData.map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        user: item.user.login,
                        state: item.state,
                        url: item.html_url
                    }));
                    printData(items, pretty, table);
                    return;
                } else if (args.includes("--page") && args.includes("--per_page")) {
                    const pageIndex = args.indexOf("--page");
                    const perPageIndex = args.indexOf("--per_page");

                    const page = Number(args[pageIndex + 1]);
                    const per_page = Number(args[perPageIndex + 1]);

                    const paginatedData = await fetchData(
                        `${BASE_URL}/repos/${parm1}/${parm2}/pulls?page=${page}&per_page=${per_page}`
                    );

                    printData(paginatedData, pretty, table);
                    return;
                } else {
                    printData(pullsData, pretty, table);
                    break;
                }

            // List user repositories and checks for pagination parameters and also for table and puts the data in map format for table display if --table flag is used
            case "repos": {

                if (!parm1) {
                    console.error("Username is required for 'repos' command");
                    return;
                }
                const user = args[1];
                if (args.includes("--page") && args.includes("--per_page")) {
                    const pageIndex = args.indexOf("--page");
                    const perPageIndex = args.indexOf("--per_page");

                    const page = Number(args[pageIndex + 1]);
                    const per_page = Number(args[perPageIndex + 1]);

                    const reposData = await fetchData(
                        `${BASE_URL}/users/${user}/repos?page=${page}&per_page=${per_page}`
                    );
                    printData(reposData, pretty, table);

                } else if (args.includes("--table")) {
                    const reposData = await fetchData(`${BASE_URL}/users/${user}/repos`);
                    const items = reposData.map((item: any) => ({
                        id: item.id,
                        name: item.name,
                        full_name: item.full_name,
                        stars: item.stargazers_count,
                        url: item.html_url
                    }));

                    printData(items, pretty, table);
                    return;

                } else {
                    const reposData = await fetchData(`${BASE_URL}/users/${user}/repos`);
                    printData(reposData, pretty, table);
                }

                break;
            }

            default:
                console.log(
                    `
                    Invalid command. Please use one of the following commands:

                    - user <username>
                    - repo <owner> <repo>
                    - searchRepos <query>
                    - issues <owner> <repo> <state>
                    - pulls <owner> <repo>
                    - repos <username> < --page <number> > < --per_page <number> >

                    flags:
                    --pretty : Pretty print the JSON output
                    --table : Display output in a table format 
                    --state <state> : Filter issues by state (open, closed, all)

                    Example usage:
                    - bun run index.ts user octocat

                    if Help is needed, use --help or -h flag
                    
                    `
                );
        }

    } catch (error) {
        console.error('Error:', error);
    }

}

main();

