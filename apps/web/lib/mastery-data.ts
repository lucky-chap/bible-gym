import { BiblePassage } from "./types";

export interface MasteryPack {
  id: string;
  name: string;
  description: string;
  verses: BiblePassage[];
}

export const MASTERY_PACKS: MasteryPack[] = [
  {
    id: "salvation",
    name: "Salvation",
    description: "The foundations of the Gospel and God's gift of eternal life.",
    verses: [
      {
        reference: "John 3:16",
        text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
        book: "John",
        chapter: 3,
        verses: "16",
      },
      {
        reference: "Romans 5:8",
        text: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.",
        book: "Romans",
        chapter: 5,
        verses: "8",
      },
      {
        reference: "Ephesians 2:8-9",
        text: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast.",
        book: "Ephesians",
        chapter: 2,
        verses: "8-9",
      },
      {
        reference: "Romans 10:9",
        text: "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.",
        book: "Romans",
        chapter: 10,
        verses: "9",
      },
      {
        reference: "Acts 4:12",
        text: "Neither is there salvation in any other: for there is none other name under heaven given among men, whereby we must be saved.",
        book: "Acts",
        chapter: 4,
        verses: "12",
      },
    ],
  },
  {
    id: "faith",
    name: "Faith",
    description: "Trusting in God's promises and walking by his Spirit.",
    verses: [
      {
        reference: "Hebrews 11:1",
        text: "Now faith is the substance of things hoped for, the evidence of things not seen.",
        book: "Hebrews",
        chapter: 11,
        verses: "1",
      },
      {
        reference: "2 Corinthians 5:7",
        text: "For we walk by faith, not by sight.",
        book: "2 Corinthians",
        chapter: 5,
        verses: "7",
      },
      {
        reference: "Proverbs 3:5-6",
        text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
        book: "Proverbs",
        chapter: 3,
        verses: "5-6",
      },
      {
        reference: "Matthew 17:20",
        text: "If ye have faith as a grain of mustard seed, ye shall say unto this mountain, Remove hence to yonder place; and it shall remove; and nothing shall be impossible unto you.",
        book: "Matthew",
        chapter: 17,
        verses: "20",
      },
      {
        reference: "Galatians 2:20",
        text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me: and the life which I now live in the flesh I live by the faith of the Son of God, who loved me, and gave himself for me.",
        book: "Galatians",
        chapter: 2,
        verses: "20",
      },
    ],
  },
  {
    id: "identity",
    name: "Identity in Christ",
    description: "Who we are in the eyes of our Creator and Redeemer.",
    verses: [
      {
        reference: "2 Corinthians 5:17",
        text: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
        book: "2 Corinthians",
        chapter: 5,
        verses: "17",
      },
      {
        reference: "1 Peter 2:9",
        text: "But ye are a chosen generation, a royal priesthood, an holy nation, a peculiar people; that ye should shew forth the praises of him who hath called you out of darkness into his marvellous light.",
        book: "1 Peter",
        chapter: 2,
        verses: "9",
      },
      {
        reference: "Genesis 1:27",
        text: "So God created man in his own image, in the image of God created he him; male and female created he them.",
        book: "Genesis",
        chapter: 1,
        verses: "27",
      },
      {
        reference: "Psalm 139:14",
        text: "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.",
        book: "Psalm",
        chapter: 139,
        verses: "14",
      },
      {
        reference: "Ephesians 2:10",
        text: "For we are his workmanship, created in Christ Jesus unto good works, which God hath before ordained that we should walk in them.",
        book: "Ephesians",
        chapter: 2,
        verses: "10",
      },
    ],
  },
  {
    id: "wisdom",
    name: "Wisdom",
    description: "Gaining understanding and discernment from God's Word.",
    verses: [
      {
        reference: "Proverbs 1:7",
        text: "The fear of the LORD is the beginning of knowledge: but fools despise wisdom and instruction.",
        book: "Proverbs",
        chapter: 1,
        verses: "7",
      },
      {
        reference: "James 1:5",
        text: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.",
        book: "James",
        chapter: 1,
        verses: "5",
      },
      {
        reference: "Psalm 119:105",
        text: "Thy word is a lamp unto my feet, and a light unto my path.",
        book: "Psalm",
        chapter: 119,
        verses: "105",
      },
      {
        reference: "Colossians 3:16",
        text: "Let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another in psalms and hymns and spiritual songs, singing with grace in your hearts to the Lord.",
        book: "Colossians",
        chapter: 3,
        verses: "16",
      },
      {
        reference: "Proverbs 4:7",
        text: "Wisdom is the principal thing; therefore get wisdom: and with all thy getting get understanding.",
        book: "Proverbs",
        chapter: 4,
        verses: "7",
      },
    ],
  },
  {
    id: "discipline",
    name: "Spiritual Discipline",
    description: "Training ourselves in godliness and persevering in our faith.",
    verses: [
      {
        reference: "1 Timothy 4:7-8",
        text: "But refuse profane and old wives' fables, and exercise thyself rather unto godliness. For bodily exercise profiteth little: but godliness is profitable unto all things, having promise of the life that now is and of that which is to come.",
        book: "1 Timothy",
        chapter: 4,
        verses: "7-8",
      },
      {
        reference: "1 Corinthians 9:24-27",
        text: "Know ye not that they which run in a race run all, but one receiveth the prize? So run, that ye may obtain. And every man that striveth for the mastery is temperate in all things. Now they do it to obtain a corruptible crown; but we an incorruptible. I therefore so run, not as uncertainly; so fight I, not as one that beateth the air: But I keep under my body, and bring it into subjection: lest that by any means, when I have preached to others, I myself should be a castaway.",
        book: "1 Corinthians",
        chapter: 9,
        verses: "24-27",
      },
      {
        reference: "2 Timothy 2:3",
        text: "Thou therefore endure hardness, as a good soldier of Jesus Christ.",
        book: "2 Timothy",
        chapter: 2,
        verses: "3",
      },
      {
        reference: "Hebrews 12:1-2",
        text: "Wherefore seeing we also are compassed about with so great a cloud of witnesses, let us lay aside every weight, and the sin which doth so easily beset us, and let us run with patience the race that is set before us, Looking unto Jesus the author and finisher of our faith; who for the joy that was set before him endured the cross, despising the shame, and is set down at the right hand of the throne of God.",
        book: "Hebrews",
        chapter: 12,
        verses: "1-2",
      },
      {
        reference: "Galatians 6:9",
        text: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
        book: "Galatians",
        chapter: 6,
        verses: "9",
      },
    ],
  },
];
