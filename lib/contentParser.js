import parseMDX from "@lib/utils/mdxParser";
import matter from "gray-matter";
import path from "path";
import fs from 'fs/promises';

// Helper function to read file content
async function readFileContent(filePath) {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// get list page data, ex: _index.md
export const getListPage = async (filePath) => {
  const pageData = await readFileContent(filePath);
  const notFoundPage = await readFileContent("content/404.md");
  
  let pageDataParsed, notFoundDataParsed;
  if (pageData) pageDataParsed = matter(pageData);
  if (notFoundPage) notFoundDataParsed = matter(notFoundPage);

  let frontmatter, content;

  if (pageDataParsed) {
    content = pageDataParsed.content;
    frontmatter = pageDataParsed.data;
  } else if (notFoundDataParsed) {
    content = notFoundDataParsed.content;
    frontmatter = notFoundDataParsed.data;
  } else {
    // Fallback content if both page and 404 are not found
    content = "# Page Not Found\n\nSorry, the page you are looking for does not exist.";
    frontmatter = { title: "Page Not Found", layout: "404" };
  }

  const mdxContent = await parseMDX(content);

  return {
    frontmatter,
    content,
    mdxContent,
  };
};

// get all single pages, ex: blog/post.md
export const getSinglePage = async (folder) => {
  const filesPath = await fs.readdir(folder);
  const sanitizeFiles = filesPath.filter((file) => file.endsWith(".md"));
  const filterSingleFiles = sanitizeFiles.filter((file) =>
    file.match(/^(?!_)/)
  );
  const singlePages = await Promise.all(filterSingleFiles.map(async (filename) => {
    const slug = filename.replace(".md", "");
    const pageData = await readFileContent(path.join(folder, filename));
    const pageDataParsed = matter(pageData);
    const frontmatterString = JSON.stringify(pageDataParsed.data);
    const frontmatter = JSON.parse(frontmatterString);
    const content = pageDataParsed.content;
    const url = frontmatter.url ? frontmatter.url.replace("/", "") : slug;
    return { frontmatter: frontmatter, slug: url, content: content };
  }));

  const publishedPages = singlePages.filter(
    (page) =>
      !page.frontmatter.draft && page.frontmatter.layout !== "404" && page
  );
  const filterByDate = publishedPages.filter(
    (page) => new Date(page.frontmatter.date || new Date()) <= new Date()
  );

  return filterByDate;
};

// get a regular page data from many pages, ex: about.md
export const getRegularPage = async (slug) => {
  const publishedPages = await getSinglePage("content");
  const pageData = publishedPages.filter((data) => data.slug === slug);
  const notFoundPage = await readFileContent("content/404.md");
  const notFoundDataParsed = matter(notFoundPage);

  let frontmatter, content;
  if (pageData[0]) {
    content = pageData[0].content;
    frontmatter = pageData[0].frontmatter;
  } else {
    content = notFoundDataParsed.content;
    frontmatter = notFoundDataParsed.data;
  }
  const mdxContent = await parseMDX(content);

  return {
    frontmatter,
    content,
    mdxContent,
  };
};