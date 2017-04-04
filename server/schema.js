import { Observable } from 'rxjs';
import { MongoObservable } from 'meteor-rxjs';

export const typeDefs = `
type Query {
  someInt: Int
}

type Subscription {
  clock: String
  cookiesTotal: Int
}
`;

export const clockSource = Observable.interval(1000)
                      .map(() => new Date())
                      .publishReplay(1)
                      .refCount();

export const Cookies = new MongoObservable.Collection('cookies');
// Meteor.startup(() => Meteor.setInterval(Cookies.insert({eaten: false}), 2000))

export const resolvers = {
    Query: {
      someInt: () => 123,
    },
    Subscription: {
      clock: (root, args, ctx) => ctx.clockSource,
      cookiesTotal: (root, args, ctx) => ctx.Cookies.find().map(cookies => cookies.length),
    },
};
