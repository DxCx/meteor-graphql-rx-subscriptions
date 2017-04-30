const query = `
subscription cookiesSubscription {
  lastCookie {
    _id
    eaten
  }
}

mutation addOne {
  addCookie @defer {
    eaten
    _id
  }
}

mutation cleanup {
  clearCookies
}

query LiveCookies {
  cookies @live {
    _id
  }
}
`;

export default query;
