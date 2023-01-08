import { useResponseCache } from '@graphql-yoga/plugin-response-cache'
import { createYoga } from 'graphql-yoga'
import { schema } from './schema/schema'

export default createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  plugins: [
    useResponseCache({
      // for everyone
      session: () => null,
    })
  ]
})