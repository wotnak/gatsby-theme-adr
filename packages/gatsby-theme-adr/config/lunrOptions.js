const lunrOptions = {
  name: 'adr-pages',
  engine: 'lunr',
  query: `
    {
      allMarkdownRemark {
        edges {
          node {
            id
            frontmatter {
              title
              deck
            }
            fields {
              slug
            }
            html
          }
        }
      }
    }
  `,
  index: ['title', 'deck', 'html'],
  store: ['title', 'slug', 'deck'],
  normalizer: ({ data }) =>
    data.allMarkdownRemark.edges.map(({ node }) => ({
      id: node.id,
      title: node.frontmatter.title,
      deck: node.frontmatter.deck,
      slug: node.fields.slug,
      html: node.html,
    })),
};

module.exports = lunrOptions;
