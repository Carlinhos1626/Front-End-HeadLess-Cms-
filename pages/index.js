import config from "@config/config.json";
import { gql } from '@apollo/client';
import client from '../lib/apollo-client';
import Base from "@layouts/Baseof";
import ImageFallback from "@layouts/components/ImageFallback";
import Pagination from "@layouts/components/Pagination";
import Post from "@layouts/partials/Post";
import Sidebar from "@layouts/partials/Sidebar";
import { getListPage } from "@lib/contentParser";
import { getTaxonomy } from "@lib/taxonomyParser";
import { markdownify } from "@lib/utils/textConverter";
import Link from "next/link";
import { FaRegCalendar } from "react-icons/fa";
const { blog_folder, pagination } = config.settings;

const Home = ({
  banner,
  featured_posts,
  recent_posts,
  promotion,
  posts,
  categories,
}) => {
  const sortPostByDate = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  const featuredPosts = sortPostByDate.slice(0, 4);
  const showPosts = pagination;

  return (
    <Base>
      {/* Banner */}
      <section className="section banner relative pb-0">
        <ImageFallback
          className="absolute bottom-0 left-0 z-[-1] w-full"
          src={"/images/banner-bg-shape.svg"}
          width={1905}
          height={295}
          alt="banner-shape"
          priority
        />

        <div className="container">
          <div className="row flex-wrap-reverse items-center justify-center lg:flex-row">
            <div className={banner.image_enable ? "mt-12 text-center lg:mt-0 lg:text-left lg:col-6" : "mt-12 text-center lg:mt-0 lg:text-left lg:col-12"}>
              <div className="banner-title">
                {markdownify(banner.title, "h1")}
                {markdownify(banner.title_small, "span")}
              </div>
              {markdownify(banner.content, "p", "mt-4")}
              {banner.button.enable && (
                <Link
                  className="btn btn-primary mt-6"
                  href={banner.button.link}
                  rel={banner.button.rel}
                >
                  {banner.button.label}
                </Link>
              )}
            </div>
            {banner.image_enable && (
              <div className="col-9 lg:col-6">
                <ImageFallback
                  className="mx-auto object-contain"
                  src={banner.image}
                  width={548}
                  height={443}
                  priority={true}
                  alt="Banner Image"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Home main */}
      <section className="section">
        <div className="container">
          <div className="row items-start">
            <div className="mb-12 lg:mb-0 lg:col-8">
              {/* Featured posts */}
              {featured_posts.enable && (
                <div className="section">
                  {markdownify(featured_posts.title, "h2", "section-title")}
                  <div className="rounded border border-border p-6 dark:border-darkmode-border">
                    <div className="row">
                      <div className="md:col-6">
                        {featuredPosts[0] && (
                          <Post post={featuredPosts[0]} />
                        )}
                      </div>
                      <div className="scrollbar-w-[10px] mt-8 max-h-[480px] scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-border dark:scrollbar-track-gray-800 dark:scrollbar-thumb-darkmode-theme-dark md:mt-0 md:col-6">
                        {featuredPosts.slice(1).map((post, i, arr) => (
                          <div
                            className={`mb-6 flex items-center pb-6 ${
                              i !== arr.length - 1 &&
                              "border-b border-border dark:border-darkmode-border"
                            }`}
                            key={post.id}
                          >
                            {post.image && (
                              <ImageFallback
                                className="mr-3 h-[85px] rounded object-cover"
                                src={post.image}
                                alt={post.title}
                                width={105}
                                height={85}
                              />
                            )}
                            <div>
                              <h3 className="h5 mb-2">
                                <Link
                                  href={`/posts/${post.slug}`}
                                  className="block hover:text-primary"
                                >
                                  {post.title}
                                </Link>
                              </h3>
                              <p className="inline-flex items-center font-bold">
                                <FaRegCalendar className="mr-1.5" />
                                {new Date(post.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Promotion */}
              {promotion.enable && (
                <Link href={promotion.link} className="section block pt-0">
                  <ImageFallback
                    className="h-full w-full"
                    height="115"
                    width="800"
                    src={promotion.image}
                    alt="promotion"
                  />
                </Link>
              )}

              {/* Recent Posts */}
              {recent_posts.enable && (
                <div className="section pt-0">
                  {markdownify(recent_posts.title, "h2", "section-title")}
                  <div className="rounded border border-border px-6 pt-6 dark:border-darkmode-border">
                    <div className="row">
                      {sortPostByDate.slice(0, showPosts).map((post) => (
                        <div className="mb-8 md:col-6" key={post.slug}>
                          <Post post={post} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Pagination
                totalPages={Math.ceil(sortPostByDate.length / showPosts)}
                currentPage={1}
              />
            </div>
            {/* sidebar */}
            <Sidebar
              className={"lg:mt-[9.5rem]"}
              posts={sortPostByDate}
              categories={categories}
            />
          </div>
        </div>
      </section>
    </Base>
  );
};

export default Home;

export const getStaticProps = async () => {
  try {
    const homepage = await getListPage("content/_index.md");
    const { frontmatter } = homepage;
    const { banner, featured_posts, recent_posts, promotion } = frontmatter;

    // Fetch posts do WordPress
    const { data } = await client.query({
      query: gql`
        query GetPosts {
          posts {
            edges {
              node {
                id
                title
                content
                date
                slug
                featuredImage {
                  node {
                    mediaDetails {
                      file
                    }
                  }
                }
              }
            }
          }
        }
      `,
    });

    // Formatando os dados recebidos
    const posts = data.posts.edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      content: edge.node.content,
      date: edge.node.date,
      slug: edge.node.slug,
      image: edge.node.featuredImage
        ? `https://head.agenciaplanner.dev/wp-content/uploads/${edge.node.featuredImage.node.mediaDetails.file}`
        : null,
    }));

    const categories = await getTaxonomy(`content/${blog_folder}`, "categories");

    return {
      props: {
        banner,
        featured_posts,
        recent_posts,
        promotion,
        posts,
        categories,
      },
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      props: {
        banner: {},
        featured_posts: {},
        recent_posts: {},
        promotion: {},
        posts: [],
        categories: [],
      },
    };
  }
};