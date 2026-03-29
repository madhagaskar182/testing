// Hash password
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

// GitHub API helper
async function githubUploadFile(token, repo, path, content, message) {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const encodedContent = btoa(unescape(encodeURIComponent(content)));
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({ message, content: encodedContent })
  });
  return res.json();
}