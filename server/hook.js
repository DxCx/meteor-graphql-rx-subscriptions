// THIS SHOULD LIVE IN INTEGRATION PACKAGE
import { Observable } from 'rxjs';
const Fiber = Npm.require('fibers');

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

const resolveWithFibers = (resolver: (root, args, ctx, info) => any) => {
  return (root, args, ctx, info) => {
    // run resolver under Fiber
    const res = Fiber(() => {
      return resolver(root, args, ctx, info);
    }).run();

    // We have an observable, we will run it under fiber as well.
    if ( res && typeof res.subscribe === 'function' ) {
      return observableToFiber(res);
    }

    return res;
  }
}

export function addFiberToResolvers(schema): void {
  // TODO test that schema is a schema, fn is a function
  const rootTypes = ([
    schema.getQueryType(),
    schema.getMutationType(),
    schema.getSubscriptionType(),
  ]).filter(x => !!x);
  rootTypes.forEach((type) => {
    // XXX this should run at most once per request to simulate a true root resolver
    // for graphql-js this is an approximation that works with queries but not mutations
    const fields = type.getFields();
    Object.keys(fields).forEach((fieldName) => {
			if ( fields[fieldName].resolve ) {
				fields[fieldName].resolve = resolveWithFibers(fields[fieldName].resolve);
			}
    });
  });
}
