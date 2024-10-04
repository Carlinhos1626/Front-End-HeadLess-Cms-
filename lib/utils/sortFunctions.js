// Função para ordenar por data
export const sortByDate = (array) => {
  const sortedArray = array.sort((a, b) => {
    const dateA = a.frontmatter?.date ? new Date(a.frontmatter.date) : new Date(0);
    const dateB = b.frontmatter?.date ? new Date(b.frontmatter.date) : new Date(0);
    return dateB - dateA;
  });
  return sortedArray;
};

// Função para ordenar produtos por peso
export const sortByWeight = (array) => {
  const withWeight = array.filter((item) => item.frontmatter?.weight);
  const withoutWeight = array.filter((item) => !item.frontmatter?.weight);

  const sortedWeightedArray = withWeight.sort((a, b) => {
    const weightA = a.frontmatter?.weight || 0;
    const weightB = b.frontmatter?.weight || 0;
    return weightA - weightB;
  });

  const sortedArray = [...new Set([...sortedWeightedArray, ...withoutWeight])];
  return sortedArray;
};
