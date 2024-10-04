import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://head.agenciaplanner.dev/graphql',  // Coloque a URL do seu WordPress aqui
  cache: new InMemoryCache(),
});

export default client;
