import { Observable } from 'rxjs';
import { MongoObservable } from 'meteor-rxjs';
const Fiber = Npm.require('fibers');

export const typeDefs = `
type Query {
  someInt: Int
}

type Subscription {
  clock: String
  cookies: [Cookie]
}

type Mutation {
  addCookie: Cookie
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
Meteor.startup(() => Meteor.setInterval(() => Cookies.insert({eaten: false}), 2000))

// TODO: Should be really in meteor-rxjs if not in fiber.
const observableToFiber = (observable) => {
  return new Observable((observer) => {
    let subscriptionHandle;

    Fiber(() => {
      subscriptionHandle = observable.subscribe(observer);
    }).run();

    return () => {
      process.nextTick(() => subscriptionHandle && subscriptionHandle.unsubscribe())
    };
  });
};

export const resolvers = {
    Query: {
      someInt: () => 123,
    },
    Mutation: {
      // TODO: Inserting from GraphQL still yield Error.
      addCookie: (root, args, ctx) => observableToFiber(ctx.Cookies.insert({eaten: false})),
    },
    Subscription: {
      clock: (root, args, ctx) => ctx.clockSource,
      // cookies: (root, args, ctx) => new Observable(observer => ({
      //   onNext: Meteor.bindEnvironment(() => ctx.Cookies.find({})),
      // }))
      cookies: (root, args, ctx) => observableToFiber(ctx.Cookies.find({})),
    },
};
