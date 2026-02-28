import { BiblePassage, ContextQuestion, VerseMatchItem } from "./types";

// ── 5 Sample Bible Passages ─────────────────────────────────

export const BIBLE_PASSAGES: BiblePassage[] = [
  {
    reference: "Philippians 4:13",
    text: "I can do all things through Christ who strengthens me.",
    book: "Philippians",
    chapter: 4,
    verses: "13",
  },
  {
    reference: "Joshua 1:9",
    text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    book: "Joshua",
    chapter: 1,
    verses: "9",
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
    book: "Proverbs",
    chapter: 3,
    verses: "5-6",
  },
  {
    reference: "Romans 8:28",
    text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    book: "Romans",
    chapter: 8,
    verses: "28",
  },
  {
    reference: "Isaiah 40:31",
    text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    book: "Isaiah",
    chapter: 40,
    verses: "31",
  },
  {
    reference: "Psalm 23:1-4",
    text: "The Lord is my shepherd; I shall not want. He makes me to lie down in green pastures; He leads me beside the still waters. He restores my soul; He leads me in the paths of righteousness for His name's sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil; for You are with me; Your rod and Your staff, they comfort me.",
    book: "Psalm",
    chapter: 23,
    verses: "1-4",
  },
  {
    reference: "Matthew 5:3-6",
    text: "Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they will be comforted. Blessed are the meek, for they will inherit the earth. Blessed are those who hunger and thirst for righteousness, for they will be filled.",
    book: "Matthew",
    chapter: 5,
    verses: "3-6",
  },
];

// ── 10 Context Questions ────────────────────────────────────

export const CONTEXT_QUESTIONS: ContextQuestion[] = [
  {
    id: "q1",
    passageReference: "Philippians 4:13",
    question: "Who wrote the book of Philippians?",
    options: ["Peter", "Paul", "James", "John"],
    correctIndex: 1,
  },
  {
    id: "q2",
    passageReference: "Philippians 4:13",
    question: "Where was Paul when he wrote Philippians?",
    options: ["In the temple", "At sea", "In prison", "In Philippi"],
    correctIndex: 2,
  },
  {
    id: "q3",
    passageReference: "Joshua 1:9",
    question: "Who is God speaking to in this passage?",
    options: ["Moses", "Joshua", "David", "Abraham"],
    correctIndex: 1,
  },
  {
    id: "q4",
    passageReference: "Joshua 1:9",
    question: "What event preceded this command?",
    options: [
      "The Exodus from Egypt",
      "The death of Moses",
      "The fall of Jericho",
      "David becoming king",
    ],
    correctIndex: 1,
  },
  {
    id: "q5",
    passageReference: "Proverbs 3:5-6",
    question: "What genre is the book of Proverbs?",
    options: ["History", "Prophecy", "Wisdom Literature", "Gospel"],
    correctIndex: 2,
  },
  {
    id: "q6",
    passageReference: "Proverbs 3:5-6",
    question: "Who is traditionally credited with writing most of Proverbs?",
    options: ["David", "Solomon", "Moses", "Samuel"],
    correctIndex: 1,
  },
  {
    id: "q7",
    passageReference: "Romans 8:28",
    question: "Who is the primary audience of the book of Romans?",
    options: [
      "Jewish believers only",
      "The church in Rome",
      "The Pharisees",
      "The disciples",
    ],
    correctIndex: 1,
  },
  {
    id: "q8",
    passageReference: "Romans 8:28",
    question: "What is the main theme of Romans chapter 8?",
    options: [
      "The Law of Moses",
      "Life in the Spirit",
      "The Second Coming",
      "Church leadership",
    ],
    correctIndex: 1,
  },
  {
    id: "q9",
    passageReference: "Isaiah 40:31",
    question: "Isaiah was a prophet to which kingdom?",
    options: ["Israel (Northern)", "Judah (Southern)", "Babylon", "Persia"],
    correctIndex: 1,
  },
  {
    id: "q10",
    passageReference: "Isaiah 40:31",
    question: "What is the context of Isaiah chapter 40?",
    options: [
      "Judgment on sin",
      "Comfort and restoration for God's people",
      "Instructions for worship",
      "Genealogy records",
    ],
    correctIndex: 1,
  },
];

// ── 10 Verse Match Items ────────────────────────────────────

export const VERSE_MATCH_ITEMS: VerseMatchItem[] = [
  {
    reference: "Philippians 4:13",
    text: "I can do all things through Christ who strengthens me.",
  },
  {
    reference: "Joshua 1:9",
    text: "Be strong and courageous. Do not be afraid; do not be discouraged.",
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all your heart and lean not on your own understanding.",
  },
  {
    reference: "Romans 8:28",
    text: "In all things God works for the good of those who love him.",
  },
  {
    reference: "Isaiah 40:31",
    text: "Those who hope in the Lord will renew their strength.",
  },
  {
    reference: "Jeremiah 29:11",
    text: "For I know the plans I have for you, declares the Lord.",
  },
  {
    reference: "Psalm 23:1",
    text: "The Lord is my shepherd; I shall not want.",
  },
  {
    reference: "John 3:16",
    text: "For God so loved the world that he gave his one and only Son.",
  },
  {
    reference: "Galatians 5:22-23",
    text: "The fruit of the Spirit is love, joy, peace, forbearance, kindness.",
  },
  {
    reference: "2 Timothy 1:7",
    text: "God has not given us a spirit of fear, but of power, love, and self-discipline.",
  },
];
