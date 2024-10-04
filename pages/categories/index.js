import config from "@config/config.json";
import Base from "@layouts/Baseof";
import { getTaxonomy } from "@lib/taxonomyParser";
import { humanize, markdownify } from "@lib/utils/textConverter";
import Link from "next/link";
import { getSinglePage } from "@lib/contentParser";
import { FaFolder } from "react-icons/fa";
import { slugify } from "@lib/utils/textConverter";

const { blog_folder } = config.settings;

const Categories = ({ categories }) => {
  return (
    <Base title={"Categories"}>
      <section className="section pt-0">
        {markdownify(
          "Categories",
          "h1",
          "h2 mb-16 bg-theme-light dark:bg-darkmode-theme-dark py-12 text-center lg:text-[55px]"
        )}
        <div className="container pt-12 text-center">
          <ul className="row">
            {categories.map((category, i) => (
              <li
                key={`category-${i}`}
                className="mt-4 block lg:col-4 xl:col-3"
              >
                <Link
                  href={`/categories/${slugify(category.name)}`} // Usando slugify para gerar o link
                  className="flex w-full items-center justify-center rounded-lg bg-theme-light px-4 py-4 font-bold text-dark transition hover:bg-primary hover:text-white dark:bg-darkmode-theme-dark dark:text-darkmode-light dark:hover:bg-primary dark:hover:text-white"
                >
                  <FaFolder className="mr-1.5" />
                  {humanize(category.name)} ({category.posts})
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Base>
  );
};

export default Categories;

// Função para obter dados de categorias
export const getStaticProps = () => {
  const posts = getSinglePage(`content/${blog_folder}`) || []; // Garantir que seja um array
  const categories = getTaxonomy(`content/${blog_folder}`, "categories") || []; // Garantir que seja um array

  // Verificando se categories é um array
  if (!Array.isArray(categories)) {
    console.error("Categories não é um array:", categories);
    return {
      props: {
        categories: [], // Retornar array vazio em caso de erro
      },
    };
  }

  // Contando posts em cada categoria
  const categoriesWithPostsCount = categories.map((category) => {
    const filteredPosts = posts.filter((post) =>
      post.frontmatter.categories.map(e => slugify(e)).includes(category)
    );
    return {
      name: category,
      posts: filteredPosts.length,
    };
  });

  return {
    props: {
      categories: categoriesWithPostsCount,
    },
  };
};
