import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'accounts', url: 'http://localhost:4001' },
      { name: 'collaboration', url: 'http://localhost:4002' },
      { name: 'analytics', url: 'http://localhost:4003' },
    ],
  }),
});

const server = new ApolloServer({ gateway });

const PORT = process.env.GATEWAY_PORT || 4000;

const { url } = await startStandaloneServer(server, {
  listen: { port: PORT },
});

console.log(`🚀 GraphQL Gateway ready at ${url}`);
