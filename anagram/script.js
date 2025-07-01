function isAnagram(str1, str2) {
  const clean = str => str.replace().toLowerCase().split("").sort().join("");
  return clean(str1) === clean(str2);
}

function checkAnagram() {
  const word1 = document.getElementById("word1").value;
  const word2 = document.getElementById("word2").value;
  const result = document.getElementById("result");

  if (!word1 || !word2) {
    result.textContent = "Please enter both words.";
    result.style.color = "blue";
    return;
  }

  if (isAnagram(word1, word2)) {
    result.textContent =` "${word1}" and "${word2}" are anagrams! ✅`;
    result.style.color = "green";
  } else {
    result.textContent = `"${word1}" and "${word2}" are not anagrams ❌`;
    result.style.color = "red";
  }
}