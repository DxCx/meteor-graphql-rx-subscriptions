import { MongoObservable } from 'meteor-rxjs';
// XXX: Schema shouldn't be aware of this, this should come from main :)
export const Cookies = new MongoObservable.Collection('cookies');

export const typeDefs = `
type Query {
  cookies: [Cookie]
}

type Subscription {
  clock: String
  lastCookie: Cookie
}

type Mutation {
  addCookie: Cookie
  clearCookies: Int,
}

type Cookie {
  _id: String
  eaten: Boolean
}
`;

export const resolvers = {
    Query: {
      cookies: (root, args, ctx) => ctx.Cookies.find({}),
    },
    Mutation: {
      addCookie: (root, args, ctx) => {
        return ctx.Cookies.insert({eaten: false})
          .map((newCookieId) => {
            return ctx.Cookies.findOne({ _id: newCookieId });
          })
          .do((lastCookie) => ctx.lastCookie.next(lastCookie));
      },
      clearCookies: (root, args, ctx) => ctx.Cookies.remove({}),
    },
    Subscription: {
      lastCookie: (root, args, ctx) => ctx.lastCookie,
    },
};
