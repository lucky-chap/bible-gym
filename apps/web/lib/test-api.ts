async function test() {
  const reference = "John 3:16-18";
  const url = `https://bible-api.com/John%203%3A16-18`;
  console.log("Fetching: " + url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Reference: " + data.reference);
    console.log("Text preview: " + data.text.substring(0, 100));
    console.log("Verses count: " + data.verses.length);
  } catch (e) {
    console.error(e);
  }
}
test();
