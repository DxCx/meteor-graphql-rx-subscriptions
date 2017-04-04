import { Observable } from 'rxjs';

export const typeDefs = `
type Query {
  someInt: Int
}

type Subscription {
  clock: String
}
`;

const clockSource = Observable.interval(1000)
                      .map(() => new Date())
                      .publishReplay(1)
                      .refCount();

export const resolvers = {
    Query: {
      someInt: () => 123,
    },
    Subscription: {
      clock: (root, args, ctx) => ctx.clockSource,
    },
};
