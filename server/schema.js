import { Observable } from 'rxjs';
import { MongoObservable } from 'meteor-rxjs';

export const typeDefs = `
type Query {
  someInt: Int
}

type Subscription {
  clock: String
  cookies: [Cookie]
}

type Cookie {
  _id: String
  eaten: Boolean
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
      cookies: Meteor.bindEnvironment(
        (root, args, ctx) => {
          return ctx.Cookies.find({})
        }
      ),
    },
};
