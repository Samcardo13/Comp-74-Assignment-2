export interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  state: string;
  html_url: string;
}