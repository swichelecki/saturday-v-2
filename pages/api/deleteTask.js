// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

/* import { GraphQLClient, gql } from 'graphql-request';

const graphqlAPI = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;
const hygraphToken = process.env.HYGRAPH_TOKEN;

export default async function deleteTask(req, res) {
  const graphQLClient = new GraphQLClient(graphqlAPI, {
    headers: {
      authorization: `Bearer ${hygraphToken}`,
    },
  });

  const query = gql`
    mutation DeleteTask($id: ID) {
      deleteTask(where: { id: $id }) {
        id
      }
    }
  `;

  try {
    const result = await graphQLClient.request(query, req.body);
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}
 */
