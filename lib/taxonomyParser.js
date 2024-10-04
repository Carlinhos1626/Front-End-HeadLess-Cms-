import { getSinglePage } from "@lib/contentParser";
import { slugify } from "@lib/utils/textConverter";

export const getTaxonomy = async (folder, name) => {
  try {
    const singlePages = await getSinglePage(folder);
    if (!Array.isArray(singlePages)) {
      console.error('getSinglePage did not return an array:', singlePages);
      return [];
    }

    const taxonomyPages = singlePages.map((page) => page.frontmatter[name]);
    let taxonomies = [];
    for (let i = 0; i < taxonomyPages.length; i++) {
      if (taxonomyPages[i] === undefined) {
        continue;
      }
      const isArray = Array.isArray(taxonomyPages[i]);
      const categoryArray = isArray ? taxonomyPages[i] : [taxonomyPages[i]];
      for (let j = 0; j < categoryArray.length; j++) {
        taxonomies.push(slugify(categoryArray[j]));
      }
    }
    const taxonomy = [...new Set(taxonomies)];
    return taxonomy;
  } catch (error) {
    console.error('Error in getTaxonomy:', error);
    return [];
  }
};