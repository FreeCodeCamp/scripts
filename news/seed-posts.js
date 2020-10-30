require('dotenv').config();

const GhostAdminAPI = require('@tryghost/admin-api');
const { wait } = require('./utils');

const keys = {
  getter: {
    url: process.env.GETTER_NEWS_API_URL,
    key: process.env.GETTER_NEWS_API_ADMIN_KEY,
    version: process.env.GETTER_NEWS_API_VERSION || 'v2',
  },
  setter: {
    url: process.env.SETTER_NEWS_API_URL,
    key: process.env.SETTER_NEWS_API_ADMIN_KEY,
    version: process.env.SETTER_NEWS_API_VERSION || 'v2',
  },
};

const apiGetter = new GhostAdminAPI({ ...keys.getter });
const apiSetter = new GhostAdminAPI({ ...keys.setter });

const seedPosts = async () => {
  let currPage = 1;
  let lastPage = 5;

  while (currPage && currPage <= lastPage) {
    const data = await apiGetter.posts.browse({ page: currPage, formats: ['html', 'mobiledoc'] });
    const posts = [ ...data ];

    currPage = data.meta.pagination.next;
    lastPage = data.meta.pagination.pages;

    for (let i in posts) {
      const post = posts[i];
      const {
        id,
        title,
        slug,
        html,
        mobiledoc,
        authors,
        feature_image,
        featured,
        status,
        created_at,
        updated_at,
        published_at
      } = post;
      // Handle tags differently to prevent duplicate tags
      const tags = post.tags.map(tag => {
        const { name, slug } = tag;
        return { 
          name,
          slug
        }
      });

      apiSetter.posts.add({
        id,
        title,
        slug,
        html,
        mobiledoc,
        authors,
        tags,
        feature_image,
        featured,
        status,
        created_at,
        updated_at,
        published_at
      })
        .then(res => {
          console.log('---- :Seeding: ----');
          console.log(id);
          console.log(slug);
          console.log(title);
          console.log(tags);
          console.log('---- :Seeding: ----\n');
        })
        .then(() => console.log(`Added post: ${title}\n`))
        .catch(err => console.error(err));

      await wait(1);
    }
  }
};

seedPosts();
