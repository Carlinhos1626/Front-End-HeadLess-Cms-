import config from "@config/config.json";
import ImageFallback from "@layouts/components/ImageFallback";
import dateFormat from "@lib/utils/dateFormat";
import Link from "next/link";
import { gql, useQuery } from "@apollo/client";
import { FaRegCalendar, FaUserAlt } from "react-icons/fa";


const GET_POSTS = gql`
  query GetPosts {
    posts { 
      edges {
        node {
          id
          title
          content
          date
          featuredImage {
            node {
              mediaDetails {
                file
              }
            }
          }
          author {
            node {
              id
              name
            }
          }
        }
      }
    }
  }
`;



const Post = () => {
  const { summary_length, blog_folder } = config.settings;
  const { meta_author } = config.metadata;

  // Use Apollo Client para buscar o primeiro post
  const { loading, error, data } = useQuery(GET_POSTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Verifica se há posts retornados
  if (data.posts.edges.length === 0) {
    return <p>No posts available.</p>;
  }

  // Trabalha apenas com o primeiro post retornado
  const node = data.posts.edges[0].node;
  const author = node.author?.node?.name || meta_author;

  // Formatação do caminho completo da imagem
  const featuredImage = node.featuredImage?.node?.mediaDetails?.file
    ? `https://head.agenciaplanner.dev/wp-content/uploads/${node.featuredImage.node.mediaDetails.file}`
    : "/default.jpg";

  const postDate = dateFormat(node.date);

  return (
    <div className="post-list">
      <div className="post" key={node.id}>
        <div className="relative">
          {featuredImage && (
            <ImageFallback
              className="rounded"
              src={featuredImage}
              alt={node.title}
              width={405}
              height={208}
            />
          )}
        </div>
        <h3 className="h5 mb-2 mt-4">
          <Link
            href={`/${blog_folder}/${node.id}`}
            className="block hover:text-primary"
          >
            {node.title}
          </Link>
        </h3>
        <ul className="flex items-center space-x-4">
          <li>
            <Link
              className="inline-flex items-center font-secondary text-xs leading-3"
              href="/about"
            >
              <FaUserAlt className="mr-1.5" />
              {author}
            </Link>
          </li>
          <li className="inline-flex items-center font-secondary text-xs leading-3">
            <FaRegCalendar className="mr-1.5" />
            {postDate}
          </li>
        </ul>
        <p>{node.content.slice(0, Number(summary_length))}</p>
        <Link
          className="btn btn-outline-primary mt-4"
          href={`/${blog_folder}/${node.id}`}
        >
          Read More
        </Link>
      </div>
    </div>
  );
};

export default Post;
