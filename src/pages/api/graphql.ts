import { useResponseCache } from '@graphql-yoga/plugin-response-cache'
import { createYoga } from 'graphql-yoga'
import { schema } from './schema/schema'

export default createYoga({
  schema,
  graphqlEndpoint: '/api/graphql',
  plugins: [
    // Although this method is named use*, it is not a React hook!
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useResponseCache({
      // for everyone
      session: () => null,
    })
  ],
  // yoga by default replies to preflighted requests with allow origin * and then allow origin <whatever origin requested> later
})