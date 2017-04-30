const query = `
subscription clockSubscription {
  clock @defer
}

subscription cookiesSubscription {
  cookies {
    _id
    eaten
  }
}

mutation addOne {
  addCookie {
    eaten
    _id
  }
}

query intTest {
  someInt
}
`;

export default query;
