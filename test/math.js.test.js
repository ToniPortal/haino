// math.test.js

const add = require('../main/shared/math');

test('add function should correctly add two numbers', () => {
  // Arrange
  const a = 5;
  const b = 10;

  // Act
  const result = add(a, b);

  // Assert
  expect(result).toBe(15);
});
