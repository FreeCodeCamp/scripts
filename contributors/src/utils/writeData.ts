import { writeFile } from "fs/promises";
import { join } from "path";

import { CrowdinContributor } from "../interfaces/crowdin/CrowdinContributor";
import { ForumContributor } from "../interfaces/forum/ForumContributor";
import { GithubContributor } from "../interfaces/github/GitHubContributor";
import { NewsContributor } from "../interfaces/news/NewsContributor";

/**
 * Utility to parse data into a CSV format and write it to a file.
 *
 * @param {GithubContributor[] | ForumContributor[] | NewsContributor[] | CrowdinContributor[]} data The data to parse.
 * @param {string} type The type of data being parsed. Either GitHub, Forum, or News.
 * @param {string} fileName The name of the file to write to. Will be written as `/data/{fileName}.csv`.
 */
export const writeData = async (
  data:
    | GithubContributor[]
    | ForumContributor[]
    | NewsContributor[]
    | CrowdinContributor[]
    | string[],
  type: "GitHub" | "Forum" | "News" | "Crowdin" | "News URLS",
  fileName: string
) => {
  let parsedData = "";

  if (type === "GitHub") {
    parsedData += "name,github-url,merged-prs,email\n";
    (data as GithubContributor[]).forEach((datum) => {
      parsedData += `${datum.name},${datum.url},${datum.mergedPrs},${datum.email}\n`;
    });
  }

  if (type === "Forum") {
    parsedData += "name,forum-url,solutions,email\n";
    (data as ForumContributor[]).forEach((datum) => {
      parsedData += `${datum.name},${datum.url},${datum.likes},${datum.email}\n`;
    });
  }

  if (type === "News") {
    parsedData += "name,news-url,posts\n";
    (data as NewsContributor[]).forEach((datum) => {
      parsedData += `${datum.name},${datum.url},${datum.posts}\n`;
    });
  }

  if (type === "Crowdin") {
    parsedData += "name,username,contributions\n";
    (data as CrowdinContributor[]).forEach((datum) => {
      parsedData += `${datum.name},${datum.username},${datum.contributions}\n`;
    });
  }

  if (type === "News URLS") {
    parsedData += "staffUrl,email\n";
    (data as string[]).forEach((datum) => {
      parsedData += `${datum},\n`;
    });
  }

  await writeFile(join(process.cwd(), "data", `${fileName}.csv`), parsedData);
};
