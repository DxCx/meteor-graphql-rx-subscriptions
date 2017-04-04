const query = `
subscription clockSubscription {
  clock
}

subscription cookiesSubscription {
  cookies {
    _id
    eaten
  }
}

query intTest {
  someInt
}
`;

export default query;
