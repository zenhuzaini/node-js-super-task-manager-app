const {
  math,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  calculatePromise,
} = require("../playground/math");

test("sshould return true", () => {
  const total = math(10, 0.3); //.3 means %

  if (total !== 13) {
    throw new Error("total tip should be " + total);
  }
});

//using expect as the assertion library
test("should return true", () => {
  const total = math(10, 0.3); //.3 means %
  expect(total).toBe(13);
});

test("should convert 32 f to 0 c ", () => {
  const result = fahrenheitToCelsius(32);
  expect(result).toBe(0);
});

test("should convert o c to 30 c ", () => {
  const result = celsiusToFahrenheit(0);
  expect(result).toBe(32);
});

// test("this must thrown no error", () => {
//   //because jest will immediately execute this function, before the result is performed
//   //tehereofe true will be thrown
//   setTimeout(() => {
//     expect(1).toBe(2);
//   }, 2000);
// });

//teherfore we need to perform done
test("this must thrown  error", (done) => {
  // so the test will be finished, until the done() is called
  setTimeout(() => {
    // expect(1).toBe(2); take this
    expect(1).toBe(1);
    done();
  }, 2000);
});

//what about using async await
test("using async await", async () => {
  const res = await calculatePromise(2, 3);
  expect(res).toBe(5);
});
