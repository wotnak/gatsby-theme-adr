const fs = require('fs');
const { createFilePath } = require('gatsby-source-filesystem');

const slugify = (input) =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9-]/, '-')
    .replace(/-+/, '-')
    .replace(/^-/, '')
    .replace(/-$/, '');

const createTagFilteredListings = async (createPage, graphql, reporter) => {
  // Query for markdown nodes to use in creating pages.
  const result = await graphql(
    `
      {
        allMarkdownRemark {
          edges {
            node {
              frontmatter {
                tags
              }
            }
          }
        }
      }
    `,
  );

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    return;
  }

  // Create pages for each markdown file.
  const adrsTemplate = require.resolve('./src/pages/adrs.tsx');
  const allTags = result.data.allMarkdownRemark.edges.reduce(
    (tags, edge) =>
      (edge.node.frontmatter.tags || []).reduce((carry, tag) => {
        carry.add(tag);
        return carry;
      }, tags),
    new Set(),
  );
  Array.from(allTags).forEach((tag) => {
    const path = `/adrs/${slugify(tag)}`;
    createPage({ path, component: adrsTemplate, context: { tag } });
  });
};

const createAdrDetail = async (createPage, graphql, reporter) => {
  // Define a template for blog post
  const adrTemplate = require.resolve('./src/templates/AdrTemplate.tsx');

  // Get all markdown blog posts sorted by date
  const result = await graphql(`
    {
      allMarkdownRemark(sort: { frontmatter: { date: ASC } }) {
        edges {
          node {
            id
            fields {
              slug
            }
            internal {
              contentFilePath
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your adrs`,
      result.errors,
    );
    return;
  }

  const adrs = result.data.allMarkdownRemark.edges;

  // Create adr pages
  // But only if there's at least one markdown file found at "content/adr" (defined in gatsby-config.js)
  // `context` is available in the template as a prop and as a variable in GraphQL

  if (adrs.length > 0) {
    adrs.forEach(
      (
        {
          node: {
            fields: { slug },
            internal: { contentFilePath },
            id,
          },
        },
        index,
      ) => {
        const previousAdrId = index === 0 ? null : adrs[index - 1].node.id;
        const nextAdrId =
          index === adrs.length - 1 ? null : adrs[index + 1].node.id;

        createPage({
          path: slug,
          component: `${adrTemplate}?__contentFilePath=${contentFilePath}`,
          context: {
            id,
            previousAdrId,
            nextAdrId,
          },
        });
      },
    );
  }
};

// Make sure the data directory exists
exports.onPreBootstrap = ({ reporter }, { contentPath }) => {
  if (!fs.existsSync(contentPath)) {
    reporter.info(`creating the ${contentPath} directory`);
    fs.mkdirSync(contentPath);
  }
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'MarkdownRemark') {
    console.log('slug', node)
    createNodeField({
      node,
      name: `slug`,
      value: `/adr/${createFilePath({ node, getNode }).replace(/^\//, '')}`,
    });
  }
};

// Implement the Gatsby API “createPages”. This is called once the
// data layer is bootstrapped to let plugins create pages from data.
exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;
  return Promise.all([
    createTagFilteredListings(createPage, graphql, reporter),
    createAdrDetail(createPage, graphql, reporter),
  ]);
};

// Define SiteMetadata type schema to allow for optional socialLinks.
exports.createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type Site {
      siteMetadata: SiteMetadata!
    }

    type SiteMetadata {
      siteUrl: String!
      title: String!
      description: String!
      image: String!
      menuLinks: [IconLink!]!
      socialLinks: [IconLink!]
    }

    type IconLink {
      name: String!
      uri: String!
      iconName: String
    }
  `);
};
