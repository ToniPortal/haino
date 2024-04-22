const path = require('path');

function longestCommonSubstring(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const matrix = Array.from(Array(m + 1), () => Array(n + 1).fill(0));
  let maxCommonLength = 0;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
        maxCommonLength = Math.max(maxCommonLength, matrix[i][j]);
      }
    }
  }

  return maxCommonLength;
}

function findClosestMatch(string, linkFiles) {
  let closestMatch = null;
  let maxCommonSubstringLength = -1;

  linkFiles.forEach((file) => {
    const fileName = path.basename(file).replace('.lnk', '');
    const commonSubstringLength = longestCommonSubstring(string.toLowerCase(), fileName.toLowerCase());

    if (commonSubstringLength > maxCommonSubstringLength) {
      maxCommonSubstringLength = commonSubstringLength;
      closestMatch = file;
    }
  });

  return closestMatch;
}

module.exports = { findClosestMatch };
