const query = `
subscription clockSubscription {
  clock
}

subscription cookiesSubscription {
  cookies
}

query intTest {
  someInt
}
`;

export default query;
