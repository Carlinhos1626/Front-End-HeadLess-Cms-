import config from "@config/config.json";
import PostSingle from "@layouts/PostSingle";
import { getSinglePage } from "@lib/contentParser";
import { getTaxonomy } from "@lib/taxonomyParser";
import parseMDX from "@lib/utils/mdxParser";
const { blog_folder } = config.settings;

// post single layout
const Article = ({
  post,
  mdxContent,
  slug,
  allCategories,
  relatedPosts,
  posts,
}) => {
  const { frontmatter, content } = post;

  return (
    <PostSingle
      frontmatter={frontmatter}
      content={content}
      mdxContent={mdxContent}
      slug={slug}
      allCategories={allCategories}
      relatedPosts={relatedPosts}
      posts={posts}
    />
  );
};

// get post single slug
export const getStaticPaths = () => {
  const allSlug = getSinglePage(`content/${blog_folder}`);

  // Verifica se allSlug é um array antes de mapear
  const paths = Array.isArray(allSlug) ? allSlug.map((item) => ({
    params: {
      single: item.slug,
    },
  })) : []; // Retorna um array vazio se não for um array

  return {
    paths,
    fallback: false,
  };
};

// get post single content
export const getStaticProps = async ({ params }) => {
  const { single } = params;
  const posts = getSinglePage(`content/${blog_folder}`) || []; // Garante que seja um array

  // Encontra o post correspondente ao slug
  const post = posts.find((p) => p.slug === single);

  // Se o post não for encontrado, você pode lançar um erro ou redirecionar
  if (!post) {
    return {
      notFound: true,
    };
  }

  const mdxContent = await parseMDX(post.content);

  // related posts
  const relatedPosts = posts.filter((p) =>
    post.frontmatter.categories.some((cate) =>
      p.frontmatter.categories.includes(cate)
    )
  );

  // all categories
  const categories = getTaxonomy(`content/${blog_folder}`, "categories");
  const categoriesWithPostsCount = categories.map((category) => {
    const filteredPosts = posts.filter((post) =>
      post.frontmatter.categories.includes(category)
    );
    return {
      name: category,
      posts: filteredPosts.length,
    };
  });

  return {
    props: {
      post,
      mdxContent,
      slug: single,
      allCategories: categoriesWithPostsCount,
      relatedPosts,
      posts,
    },
  };
};

export default Article;
