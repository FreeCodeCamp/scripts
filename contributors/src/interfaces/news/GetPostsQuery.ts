export interface GetPostsQuery {
  publication: {
    posts: {
      edges: {
        node: {
          publishedAt: string;
          author: {
            name: string;
            username: string;
          };
        };
      }[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor?: string;
      };
    };
  };
}
