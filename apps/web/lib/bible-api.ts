"use server";

export async function fetchBibleVerse(reference: string): Promise<{
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verses: string;
}> {
  // Use bible-api.com
  const url = `https://bible-api.com/${encodeURIComponent(reference)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch Bible verse: ${reference}`);
  }
  const data = await res.json();
  
  // Format the returned data to match our BiblePassage interface
  const bookName = data.verses?.[0]?.book_name || "";
  const chapterStr = data.verses?.[0]?.chapter || "1";
  
  // Map verses ranges
  const firstVerse = data.verses?.[0]?.verse;
  const lastVerse = data.verses?.[data.verses.length - 1]?.verse;
  const versesString = firstVerse === lastVerse ? `${firstVerse}` : `${firstVerse}-${lastVerse}`;

  return {
    reference: data.reference,
    text: (data.text || "").trim(),
    book: bookName,
    chapter: parseInt(chapterStr, 10),
    verses: versesString,
  };
}
