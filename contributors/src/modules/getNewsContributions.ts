import { gql, request } from "graphql-request";

import { globalConfig } from "../config/globalConfig";
import { NewsContributor } from "../interfaces/news/NewsContributor";
import { logHandler } from "../utils/logHandler";

import type { GetPostsQuery } from "../interfaces/news/GetPostsQuery.js";

const parseNewsData = (
  data: GetPostsQuery["publication"]["posts"]["edges"]
): { news: NewsContributor[] } => {
  const results: NewsContributor[] = [];
  for (const datum of data) {
    const name = datum.node.author.name;
    const username = datum.node.author.username;
    const url = `https://freecodecamp.org/news/author/${username}`;
    const exists = results.find((el) => el.name === name);

    if (exists) {
      exists.posts++;
    } else {
      results.push({ name, username, url, posts: 1 });
    }
  }
  return { news: results };
};

/**
 * Module to query posts from Hashnode and aggregate them into a list of contributors
 * by number of posts published.
 *
 * @returns {Promise<NewsContributor[]>} A list of news contributors.
 */
export const getNewsData = async (): Promise<{ news: NewsContributor[] }> => {
  try {
    const posts: GetPostsQuery["publication"]["posts"]["edges"] = [];
    const initialQuery = gql`
      query getPosts {
        publication(host: "freecodecamp.org/news") {
          posts(first: 50) {
            edges {
              node {
                publishedAt
                author {
                  name
                  username
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `;
    logHandler.log("info", "Fetching initial news posts from Hashnode.");
    let data = (await request(
      "https://gql.hashnode.com",
      initialQuery
    )) as GetPostsQuery;
    posts.push(...data.publication.posts.edges);
    while (
      data.publication.posts.pageInfo.hasNextPage &&
      data.publication.posts.edges.length > 0 &&
      new Date(
        data.publication.posts.edges.at(-1)!.node.publishedAt
      ).getTime() >= globalConfig.start
    ) {
      logHandler.log(
        "info",
        `Fetching posts after ${
          data.publication.posts.edges.at(-1)?.node.publishedAt
        }`
      );
      const query = gql`
        query getPosts {
          publication(host: "freecodecamp.org/news") {
            posts(first: 50, after: "${data.publication.posts.pageInfo.endCursor}") {
              edges {
                node {
                  publishedAt
                  author {
                    name
                    username
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      `;
      data = (await request(
        "https://gql.hashnode.com",
        query
      )) as GetPostsQuery;
      posts.push(...data.publication.posts.edges);
    }
    logHandler.log("info", "Parsing news data.");
    return parseNewsData(posts);
  } catch (err) {
    logHandler.log("error", err);
    process.exit(1);
  }
};
