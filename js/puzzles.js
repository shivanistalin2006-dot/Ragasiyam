/* ==========================================================================
   RAGASIYAM — 30 Curated Puzzles (9 Riddle Formats & Difficulty Evolution)
   ========================================================================== */

const RIDDLE_TYPES = {
  classic: { name: 'Classic Riddle', icon: '🧠', tag: 'riddle' },
  mystery: { name: 'Mystery Riddle', icon: '🕵️', tag: 'mystery' },
  number: { name: 'Number Puzzle', icon: '🔢', tag: 'number' },
  word: { name: 'Word Puzzle', icon: '🔤', tag: 'word' },
  observation: { name: 'Observation Puzzle', icon: '👀', tag: 'observation' },
  logic: { name: 'Logic Puzzle', icon: '🧩', tag: 'logic' },
  secret_code: { name: 'Secret Code', icon: '🔐', tag: 'code' },
  who_am_i: { name: 'Who Am I?', icon: '🎭', tag: 'whoami' },
  detective_case: { name: 'Detective Case', icon: '🧐', tag: 'detective' }
};

const PUZZLES_DATA = [
  {
    id: 1,
    day: 1,
    dayOfWeek: 'Monday',
    riddleType: 'who_am_i',
    category: 'logic',
    categoryName: 'Who Am I?',
    categoryIcon: '🎭',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "echo",
    alternateAnswers: ["an echo"],
    hints: [
      { cost: 20, text: "It repeats what you say in mountains or caves." },
      { cost: 40, text: "It begins with the letter 'E'." },
      { cost: 60, text: "E _ _ O" }
    ],
    explanation: "An echo is sound waves bouncing off hard surfaces back to your ears without any mouth or physical body.",
    explanationLines: [
      "It travels as invisible sound waves...",
      "It bounces off hard canyon walls and caves...",
      "It repeats your own voice back to you after a moment!"
    ],
    baseScore: 1000,
    timeLimit: 120
  },
  {
    id: 2,
    day: 2,
    dayOfWeek: 'Tuesday',
    riddleType: 'word',
    category: 'word',
    categoryName: 'Word Puzzle',
    categoryIcon: '🔤',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "Unscramble these letters to find a dark shape produced by blocking light:\n\nS H A D O W",
    answer: "shadow",
    alternateAnswers: ["a shadow"],
    hints: [
      { cost: 20, text: "It follows you when you walk under sunshine." },
      { cost: 40, text: "Starts with 'S' and ends with 'W'." },
      { cost: 60, text: "S H A _ _ W" }
    ],
    explanation: "Shadow is formed when light is blocked by an opaque object.",
    explanationLines: [
      "Light travels in straight lines...",
      "Your body blocks the light from passing through...",
      "A dark silhouette appears on the ground behind you!"
    ],
    baseScore: 1000,
    timeLimit: 90
  },
  {
    id: 3,
    day: 3,
    dayOfWeek: 'Wednesday',
    riddleType: 'number',
    category: 'number',
    categoryName: 'Number Puzzle',
    categoryIcon: '🔢',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "What number comes next in this sequence?\n\n2, 6, 12, 20, 30, ?",
    answer: "42",
    type: "options",
    options: ["36", "40", "42", "48"],
    hints: [
      { cost: 20, text: "Look at the differences between terms: +4, +6, +8, +10..." },
      { cost: 40, text: "The next difference to add is +12." },
      { cost: 60, text: "30 + 12 = ?" }
    ],
    explanation: "The differences increase by 2 each step (+4, +6, +8, +10, +12). 30 + 12 = 42.",
    explanationLines: [
      "Step 1: 6 - 2 = +4",
      "Step 2: 12 - 6 = +6",
      "Step 3: 20 - 12 = +8",
      "Step 4: 30 - 20 = +10",
      "Step 5: Add +12 to 30 = 42!"
    ],
    baseScore: 1000,
    timeLimit: 90
  },
  {
    id: 4,
    day: 4,
    dayOfWeek: 'Thursday',
    riddleType: 'detective_case',
    category: 'mystery',
    categoryName: 'Detective Case',
    categoryIcon: '🧐',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "Detective Vance enters a room. A man lies dead with a tape recorder in hand. Vance plays the tape: 'Life is too painful,' followed by a gunshot. Vance immediately knows it was murder. How?",
    answer: "tape was rewound",
    alternateAnswers: ["the tape was rewound", "rewound", "who rewound the tape", "rewound tape"],
    hints: [
      { cost: 20, text: "Think about what happens to a physical tape recorder after someone shoots themselves." },
      { cost: 40, text: "How could the tape be ready to play from the beginning?" },
      { cost: 60, text: "A dead man cannot rewind the tape back to the start!" }
    ],
    explanation: "If the man committed suicide while recording, he couldn't have rewound the tape back to the beginning after dying.",
    explanationLines: [
      "The victim pressed record before dying...",
      "After the gunshot, the victim died instantly...",
      "Someone else had to rewind the tape to the start!"
    ],
    baseScore: 1000,
    timeLimit: 150
  },
  {
    id: 5,
    day: 5,
    dayOfWeek: 'Friday',
    riddleType: 'observation',
    category: 'visual',
    categoryName: 'Observation',
    categoryIcon: '👀',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "How many times between 10:00 AM and 11:00 AM will a digital 12-hour clock display a palindrome time (reads same forward & backward, e.g. 10:01)?",
    answer: "6",
    type: "options",
    options: ["3", "5", "6", "10"],
    hints: [
      { cost: 20, text: "All times will start with '10:' and end with ':01', e.g. 10:01." },
      { cost: 40, text: "Check 10:01, 10:11, 10:21, 10:31, 10:41, 10:51." },
      { cost: 60, text: "Count each minute digit matching '0'." }
    ],
    explanation: "The times are 10:01, 10:11, 10:21, 10:31, 10:41, and 10:51. Exactly 6 times.",
    explanationLines: [
      "The hour is fixed at 10...",
      "The last digit must match the first digit '1'...",
      "The second-to-last digit must match '0'...",
      "Minutes available: 01, 11, 21, 31, 41, 51 -> 6 total times!"
    ],
    baseScore: 1000,
    timeLimit: 120
  },
  {
    id: 6,
    day: 6,
    dayOfWeek: 'Saturday',
    riddleType: 'secret_code',
    category: 'speed',
    categoryName: 'Secret Code',
    categoryIcon: '🔐',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "Quick Code: If 5 cats catch 5 mice in 5 minutes, how many cats does it take to catch 100 mice in 100 minutes?",
    answer: "5",
    type: "options",
    options: ["5", "20", "100", "500"],
    hints: [
      { cost: 20, text: "Notice the catching rate per cat per minute." },
      { cost: 40, text: "1 cat catches 1 mouse in 5 minutes." },
      { cost: 60, text: "In 100 minutes, 1 cat catches 20 mice. So 5 cats catch 100 mice." }
    ],
    explanation: "Each cat catches 1 mouse every 5 minutes. In 100 minutes, 1 cat catches 20 mice. Thus 5 cats catch 100 mice.",
    explanationLines: [
      "1 cat catches 1 mouse in 5 minutes...",
      "In 100 minutes, 1 cat catches 20 mice (100 / 5 = 20)...",
      "5 cats x 20 mice = 100 mice caught!"
    ],
    baseScore: 1000,
    timeLimit: 45
  },
  {
    id: 7,
    day: 7,
    dayOfWeek: 'Sunday',
    isSundayRagasiyam: true,
    riddleType: 'logic',
    category: 'pattern',
    categoryName: '👑 SUNDAY RAGASIYAM',
    categoryIcon: '👑',
    difficulty: 'expert',
    difficultyName: 'Legendary (2x Rewards)',
    question: "👑 SUNDAY RAGASIYAM CHALLENGE:\n\nLook at this sequence:\nFIRST, SECOND, THIRD, FOURTH, FIFTH, SIXTH, SEVENTH, EIGHTH...\n\nWhich letter appears most frequently at the end of these order words?",
    answer: "h",
    alternateAnswers: ["letter h", "H"],
    hints: [
      { cost: 20, text: "Check the suffix endings of ordinal numbers." },
      { cost: 40, text: "Most ordinal words end in 'TH'." },
      { cost: 60, text: "The letter 'H' appears in 4th, 5th, 6th, 7th, 8th..." }
    ],
    explanation: "The letter H appears at the end of nearly every ordinal number (Fourth, Fifth, Sixth, Seventh, Eighth, etc.).",
    explanationLines: [
      "Ordinal numbers end in 'TH' (Fourth, Fifth, Sixth...)",
      "The letter H is present in every suffix starting from 4th...",
      "The letter H is the undisputed champion of ordinal endings!"
    ],
    baseScore: 2000,
    timeLimit: 120
  },
  {
    id: 8,
    day: 8,
    dayOfWeek: 'Monday',
    riddleType: 'detective_case',
    category: 'logic',
    categoryName: 'Detective Case',
    categoryIcon: '🧐',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "Who is lying?\nAlice: 'Bob is lying.'\nBob: 'Charlie is lying.'\nCharlie: 'Alice and Bob are both lying.'\n\nIf exactly ONE person tells the truth, who is it?",
    answer: "bob",
    alternateAnswers: ["Bob"],
    hints: [
      { cost: 20, text: "Test each person as the sole truth-teller." },
      { cost: 40, text: "If Bob tells the truth, Charlie lies and Alice lies." },
      { cost: 60, text: "Bob is the only consistent truth-teller!" }
    ],
    explanation: "If Bob is truthful, Charlie is lying and Alice is lying. Bob is the only consistent truth-teller.",
    explanationLines: [
      "Assume Bob tells the truth...",
      "Then Charlie is lying (consistent)...",
      "Alice says 'Bob lies', which is false, so Alice lies (consistent)...",
      "Therefore, Bob is the sole truth-teller!"
    ],
    baseScore: 1000,
    timeLimit: 120
  },
  {
    id: 9,
    day: 9,
    dayOfWeek: 'Tuesday',
    riddleType: 'word',
    category: 'word',
    categoryName: 'Word Puzzle',
    categoryIcon: '🔤',
    difficulty: 'hard',
    difficultyName: 'Hard',
    question: "I have 7 letters. Remove 1st letter, I am a container. Remove 1st & 2nd, I am an emotion. Remove 1st, 2nd & 3rd, I am a location. What word am I?",
    answer: "storage",
    hints: [
      { cost: 20, text: "7-letter word beginning with S." },
      { cost: 40, text: "Location (4 letters) is 'AGE' or 'RAGE'?" },
      { cost: 60, text: "S T O R A G E" }
    ],
    explanation: "STORAGE: S-T-O-R-A-G-E.",
    explanationLines: [
      "7 letters: S T O R A G E",
      "Remove S -> TORAGE (Storage box)",
      "Remove S, T -> ORAGE/RAGE (Emotion)",
      "Remove S, T, O -> AGE (Time location)!"
    ],
    baseScore: 1200,
    timeLimit: 150
  },
  {
    id: 10,
    day: 10,
    dayOfWeek: 'Wednesday',
    riddleType: 'number',
    category: 'number',
    categoryName: 'Number Puzzle',
    categoryIcon: '🔢',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "A bat and ball cost $1.10. The bat costs $1.00 more than the ball. How much does the ball cost in cents?",
    answer: "5",
    alternateAnswers: ["5 cents", "0.05", "5c"],
    hints: [
      { cost: 20, text: "Be careful! The answer is NOT 10 cents." },
      { cost: 40, text: "Ball = X. Bat = X + $1.00. X + (X + 1.00) = 1.10" },
      { cost: 60, text: "2X = 0.10, so X = 0.05" }
    ],
    explanation: "If the ball costs 5 cents, the bat costs $1.05 ($1.00 more than 5c). Total = $1.10.",
    explanationLines: [
      "Bat + Ball = $1.10",
      "Bat = Ball + $1.00",
      "(Ball + $1.00) + Ball = $1.10",
      "2 x Ball = $0.10 -> Ball = 5 cents!"
    ],
    baseScore: 1000,
    timeLimit: 90
  },
  {
    id: 11,
    day: 11,
    dayOfWeek: 'Thursday',
    riddleType: 'mystery',
    category: 'mystery',
    categoryName: 'Mystery Riddle',
    categoryIcon: '🕵️',
    difficulty: 'hard',
    difficultyName: 'Hard',
    question: "A man dies of old age on his 20th birthday. How is this possible?",
    answer: "born on a leap day",
    alternateAnswers: ["leap year", "leap day", "february 29", "feb 29"],
    hints: [
      { cost: 20, text: "Think about his birthday calendar date." },
      { cost: 40, text: "His birthday occurs once every 4 years!" },
      { cost: 60, text: "He was born on February 29th." }
    ],
    explanation: "He was born on February 29th of a leap year, celebrating his birthday once every 4 years. His 20th birthday is when he is 80 years old!",
    explanationLines: [
      "Leap years occur once every 4 years...",
      "He only celebrates a birthday on leap years...",
      "20 birthdays x 4 years = 80 years old!"
    ],
    baseScore: 1200,
    timeLimit: 120
  },
  {
    id: 12,
    day: 12,
    dayOfWeek: 'Friday',
    riddleType: 'observation',
    category: 'visual',
    categoryName: 'Observation',
    categoryIcon: '👀',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "How many triangles are in a standard pentagram star (5-pointed star with all inner lines connected)?",
    answer: "10",
    type: "options",
    options: ["5", "8", "10", "12"],
    hints: [
      { cost: 20, text: "Count the 5 small outer triangles first." },
      { cost: 40, text: "Now count the 5 large overlapping inner triangles." },
      { cost: 60, text: "5 outer + 5 inner = 10." }
    ],
    explanation: "A pentagram star contains 5 small outer triangles and 5 large overlapping inner triangles = 10 total.",
    explanationLines: [
      "5 small outer points = 5 triangles",
      "5 large overlapping triangles across 3 points = 5 triangles",
      "Total = 10 triangles!"
    ],
    baseScore: 1000,
    timeLimit: 90
  },
  {
    id: 13,
    day: 13,
    dayOfWeek: 'Saturday',
    riddleType: 'secret_code',
    category: 'speed',
    categoryName: 'Secret Code',
    categoryIcon: '🔐',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "Multiply all numbers on a telephone keypad together (1x2x3x4x5x6x7x8x9x0). What is the result?",
    answer: "0",
    type: "options",
    options: ["362880", "1000", "0", "99"],
    hints: [
      { cost: 20, text: "Look closely at all keys on the keypad." },
      { cost: 40, text: "What happens when you multiply by zero?" },
      { cost: 60, text: "The zero key ('0') turns everything to 0!" }
    ],
    explanation: "Multiplying any sequence of numbers by zero results in 0.",
    explanationLines: [
      "Keypad includes 1, 2, 3, 4, 5, 6, 7, 8, 9, AND 0...",
      "Any number multiplied by 0 equals 0...",
      "Result = 0!"
    ],
    baseScore: 1000,
    timeLimit: 30
  },
  {
    id: 14,
    day: 14,
    dayOfWeek: 'Sunday',
    isSundayRagasiyam: true,
    riddleType: 'classic',
    category: 'pattern',
    categoryName: '👑 SUNDAY RAGASIYAM',
    categoryIcon: '👑',
    difficulty: 'expert',
    difficultyName: 'Legendary (2x Rewards)',
    question: "👑 SUNDAY RAGASIYAM CHALLENGE:\nWhat is the next letter in this sequence?\nJ, F, M, A, M, J, J, A, S, O, N, ?",
    answer: "d",
    alternateAnswers: ["D", "December"],
    hints: [
      { cost: 20, text: "Think of the months of the year." },
      { cost: 40, text: "J = January, F = February, M = March..." },
      { cost: 60, text: "N = November, ? = December" }
    ],
    explanation: "The letters represent the initials of the twelve calendar months (January to December). The last letter is D for December.",
    explanationLines: [
      "J = January, F = February, M = March...",
      "O = October, N = November...",
      "Next is December -> D!"
    ],
    baseScore: 2000,
    timeLimit: 90
  },
  {
    id: 15,
    day: 15,
    dayOfWeek: 'Monday',
    riddleType: 'who_am_i',
    category: 'logic',
    categoryName: 'Who Am I?',
    categoryIcon: '🎭',
    difficulty: 'expert',
    difficultyName: 'Expert',
    question: "Two fathers and two sons go fishing. They catch 3 fish in total and each person gets one fish. How?",
    answer: "three generations",
    alternateAnswers: ["grandfather father son", "3 generations"],
    hints: [
      { cost: 20, text: "Count the actual number of people." },
      { cost: 40, text: "Grandfather, Father, Son." },
      { cost: 60, text: "The father is both a son and a father!" }
    ],
    explanation: "The fishing group consists of a grandfather, father, and grandson (3 people total).",
    explanationLines: [
      "Grandfather is a father...",
      "Father is both a son and a father...",
      "Grandson is a son...",
      "3 people = 2 fathers and 2 sons!"
    ],
    baseScore: 1500,
    timeLimit: 120
  },
  {
    id: 16,
    day: 16,
    dayOfWeek: 'Tuesday',
    riddleType: 'word',
    category: 'word',
    categoryName: 'Word Puzzle',
    categoryIcon: '🔤',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "What word is spelled INCORRECTLY in every single dictionary?",
    answer: "incorrectly",
    alternateAnswers: ["INCORRECTLY"],
    hints: [
      { cost: 20, text: "Take the riddle literally!" },
      { cost: 40, text: "It's the word itself in quotes." },
      { cost: 60, text: "I N C O R R E C T L Y" }
    ],
    explanation: "The word 'incorrectly' is spelled I-N-C-O-R-R-E-C-T-L-Y in all dictionaries.",
    explanationLines: [
      "Look at the quotes...",
      "The word 'incorrectly' is literally spelled i-n-c-o-r-r-e-c-t-l-y!",
      "It is spelled 'incorrectly'!"
    ],
    baseScore: 1000,
    timeLimit: 60
  },
  {
    id: 17,
    day: 17,
    dayOfWeek: 'Wednesday',
    riddleType: 'number',
    category: 'number',
    categoryName: 'Number Puzzle',
    categoryIcon: '🔢',
    difficulty: 'hard',
    difficultyName: 'Hard',
    question: "If 3 workers take 3 hours to build 3 tables, how many hours does it take 6 workers to build 6 tables?",
    answer: "3",
    type: "options",
    options: ["3", "6", "9", "12"],
    hints: [
      { cost: 20, text: "Calculate how long 1 worker takes to build 1 table." },
      { cost: 40, text: "1 worker builds 1 table in 3 hours." },
      { cost: 60, text: "6 workers building 6 tables simultaneously still take 3 hours!" }
    ],
    explanation: "1 worker takes 3 hours for 1 table. 6 workers on 6 tables simultaneously take 3 hours.",
    explanationLines: [
      "1 worker = 1 table in 3 hours",
      "6 workers working in parallel on 6 tables...",
      "Still takes 3 hours total!"
    ],
    baseScore: 1200,
    timeLimit: 90
  },
  {
    id: 18,
    day: 18,
    dayOfWeek: 'Thursday',
    riddleType: 'detective_case',
    category: 'mystery',
    categoryName: 'Detective Case',
    categoryIcon: '🧐',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "A woman shoots her husband, holds him under water for 5 minutes, and hangs him. Later, they enjoy dinner together. How?",
    answer: "she is a photographer",
    alternateAnswers: ["photographer", "photo"],
    hints: [
      { cost: 20, text: "Think of darkroom film photography." },
      { cost: 40, text: "Shooting a picture, developing in liquid, hanging to dry." },
      { cost: 60, text: "She took a photograph!" }
    ],
    explanation: "She is a photographer who took his photo, developed the film in liquid, and hung it up to dry.",
    explanationLines: [
      "Shooting = Taking a photo...",
      "Under water = Developing film in darkroom developer...",
      "Hanging = Hanging the photo print to dry!"
    ],
    baseScore: 1000,
    timeLimit: 120
  },
  {
    id: 19,
    day: 19,
    dayOfWeek: 'Friday',
    riddleType: 'observation',
    category: 'visual',
    categoryName: 'Observation',
    categoryIcon: '👀',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "Which 3D geometric shape has 6 square faces, 12 edges, and 8 vertices?",
    answer: "cube",
    type: "options",
    options: ["Pyramid", "Cube", "Cylinder", "Sphere"],
    hints: [
      { cost: 20, text: "Think of a playing die." },
      { cost: 40, text: "All sides are equal squares." },
      { cost: 60, text: "C U B E" }
    ],
    explanation: "A cube is a regular solid with 6 square faces, 12 edges, and 8 vertices.",
    explanationLines: [
      "6 square faces...",
      "12 equal edges...",
      "8 corner vertices = Cube!"
    ],
    baseScore: 1000,
    timeLimit: 60
  },
  {
    id: 20,
    day: 20,
    dayOfWeek: 'Saturday',
    riddleType: 'secret_code',
    category: 'speed',
    categoryName: 'Secret Code',
    categoryIcon: '🔐',
    difficulty: 'hard',
    difficultyName: 'Hard',
    question: "Speed Scramble: Unscramble this 8-letter brain term in under 45 seconds:\n\nN E U R O N A L",
    answer: "neuronal",
    alternateAnswers: ["NEURONAL"],
    hints: [
      { cost: 20, text: "Relates to nerve cells in the brain." },
      { cost: 40, text: "Starts with N and ends with AL." },
      { cost: 60, text: "N E U R O N A L" }
    ],
    explanation: "NEURONAL pertains to neurons and nerve pathways.",
    explanationLines: [
      "Unscrambling N E U R O N A L...",
      "N-E-U-R-O-N-A-L",
      "Relating to brain nerve cells!"
    ],
    baseScore: 1200,
    timeLimit: 45
  },
  {
    id: 21,
    day: 21,
    dayOfWeek: 'Sunday',
    isSundayRagasiyam: true,
    riddleType: 'logic',
    category: 'pattern',
    categoryName: '👑 SUNDAY RAGASIYAM',
    categoryIcon: '👑',
    difficulty: 'expert',
    difficultyName: 'Legendary (2x Rewards)',
    question: "👑 SUNDAY RAGASIYAM CHALLENGE:\nWhat is the next Fibonacci number in this sequence?\n1, 1, 2, 3, 5, 8, 13, 21, ?",
    answer: "34",
    type: "options",
    options: ["29", "34", "36", "42"],
    hints: [
      { cost: 20, text: "Add the last two terms together." },
      { cost: 40, text: "13 + 21 = ?" },
      { cost: 60, text: "34" }
    ],
    explanation: "In Fibonacci sequence, each term is the sum of the preceding two: 13 + 21 = 34.",
    explanationLines: [
      "Fibonacci rule: Term N = Term N-1 + Term N-2",
      "13 + 21 = 34",
      "Next term = 34!"
    ],
    baseScore: 2000,
    timeLimit: 60
  },
  {
    id: 22,
    day: 22,
    dayOfWeek: 'Monday',
    riddleType: 'logic',
    category: 'logic',
    categoryName: 'Logic Puzzle',
    categoryIcon: '🧩',
    difficulty: 'hard',
    difficultyName: 'Hard',
    question: "You have two ropes taking 1 hour to burn non-uniformly. How do you measure 45 minutes?",
    answer: "light both ends of first rope and one end of second",
    alternateAnswers: ["light both ends", "45 minutes rope"],
    hints: [
      { cost: 20, text: "Lighting a rope at both ends burns it in 30 mins." },
      { cost: 40, text: "Light Rope 1 at both ends and Rope 2 at 1 end. When Rope 1 burns out (30m), light 2nd end of Rope 2." },
      { cost: 60, text: "30m + 15m = 45m!" }
    ],
    explanation: "Rope 1 lit at both ends burns in 30m. Lighting Rope 2's other end then takes 15m. Total = 45 minutes.",
    explanationLines: [
      "Light Rope 1 both ends -> 30 mins to burn out",
      "Simultaneously light Rope 2 one end -> 30 mins burned",
      "When Rope 1 finishes, light Rope 2's other end -> burns remaining 30 mins in 15 mins",
      "Total time = 30 + 15 = 45 minutes!"
    ],
    baseScore: 1200,
    timeLimit: 150
  },
  {
    id: 23,
    day: 23,
    dayOfWeek: 'Tuesday',
    riddleType: 'who_am_i',
    category: 'word',
    categoryName: 'Who Am I?',
    categoryIcon: '🎭',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "I have keys but no locks. I have space but no room. You can enter but can't go outside. What am I?",
    answer: "keyboard",
    alternateAnswers: ["a keyboard", "computer keyboard"],
    hints: [
      { cost: 20, text: "You are using one right now to type!" },
      { cost: 40, text: "It has Spacebar and Enter key." },
      { cost: 60, text: "K E Y B O A R D" }
    ],
    explanation: "A computer keyboard contains letter keys, Spacebar, and Enter key.",
    explanationLines: [
      "Keys = Letter & Number keys",
      "Space = Spacebar",
      "Enter = Enter key -> Keyboard!"
    ],
    baseScore: 1000,
    timeLimit: 90
  },
  {
    id: 24,
    day: 24,
    dayOfWeek: 'Wednesday',
    riddleType: 'secret_code',
    category: 'number',
    categoryName: 'Secret Code',
    categoryIcon: '🔐',
    difficulty: 'expert',
    difficultyName: 'Expert',
    question: "Find the missing code number in this grid:\n[ 3   5   8 ]\n[ 4   7  11 ]\n[ 6   2   ? ]",
    answer: "8",
    type: "options",
    options: ["6", "7", "8", "9"],
    hints: [
      { cost: 20, text: "Look horizontally across each row." },
      { cost: 40, text: "Row 1: 3 + 5 = 8. Row 2: 4 + 7 = 11." },
      { cost: 60, text: "Row 3: 6 + 2 = 8." }
    ],
    explanation: "In each row, column 3 = column 1 + column 2. 6 + 2 = 8.",
    explanationLines: [
      "Row 1: 3 + 5 = 8",
      "Row 2: 4 + 7 = 11",
      "Row 3: 6 + 2 = 8!"
    ],
    baseScore: 1500,
    timeLimit: 120
  },
  {
    id: 25,
    day: 25,
    dayOfWeek: 'Thursday',
    riddleType: 'detective_case',
    category: 'mystery',
    categoryName: 'Detective Case',
    categoryIcon: '🧐',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "A man lives on floor 10. He takes elevator down to 1st floor every morning. Returning evening, he takes elevator to 7th floor & walks up to 10th, UNLESS it rains. Why?",
    answer: "he is short",
    alternateAnswers: ["dwarf", "too short"],
    hints: [
      { cost: 20, text: "Consider his height!" },
      { cost: 40, text: "He cannot reach floor 10 button." },
      { cost: 60, text: "On rainy days he uses umbrella to press 10!" }
    ],
    explanation: "He is too short to reach button 10. On rainy days he presses button 10 with his umbrella.",
    explanationLines: [
      "He can only reach up to button 7...",
      "On rainy days, he uses his umbrella tip to press button 10!",
      "Otherwise he walks from floor 7 to floor 10!"
    ],
    baseScore: 1000,
    timeLimit: 120
  },
  {
    id: 26,
    day: 26,
    dayOfWeek: 'Friday',
    riddleType: 'observation',
    category: 'visual',
    categoryName: 'Observation',
    categoryIcon: '👀',
    difficulty: 'hard',
    difficultyName: 'Hard',
    question: "If a mirror flips left and right, why doesn't it flip top and bottom?",
    answer: "it reflects front to back",
    alternateAnswers: ["front to back", "z axis"],
    hints: [
      { cost: 20, text: "Think of 3D spatial axes." },
      { cost: 40, text: "Mirrors reflect along depth (front to back)." },
      { cost: 60, text: "It reverses front to back!" }
    ],
    explanation: "Mirrors actually flip along the Z-axis (front-to-back), not left-to-right.",
    explanationLines: [
      "Mirrors reflect depth (Z-axis)...",
      "Front becomes back...",
      "Our brains interpret front-back reversal as left-right flipping!"
    ],
    baseScore: 1200,
    timeLimit: 120
  },
  {
    id: 27,
    day: 27,
    dayOfWeek: 'Saturday',
    riddleType: 'word',
    category: 'speed',
    categoryName: 'Word Puzzle',
    categoryIcon: '🔤',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "How many months in a calendar year have 28 days?",
    answer: "12",
    type: "options",
    options: ["1", "2", "6", "12"],
    hints: [
      { cost: 20, text: "Read carefully!" },
      { cost: 40, text: "All months have AT LEAST 28 days." },
      { cost: 60, text: "All 12 months!" }
    ],
    explanation: "All 12 months of the year have at least 28 days.",
    explanationLines: [
      "February has 28 or 29 days...",
      "January has 31 days (which includes 28 days!)...",
      "All 12 months have at least 28 days!"
    ],
    baseScore: 1000,
    timeLimit: 30
  },
  {
    id: 28,
    day: 28,
    dayOfWeek: 'Sunday',
    isSundayRagasiyam: true,
    riddleType: 'secret_code',
    category: 'pattern',
    categoryName: '👑 SUNDAY RAGASIYAM',
    categoryIcon: '👑',
    difficulty: 'expert',
    difficultyName: 'Legendary (2x Rewards)',
    question: "👑 SUNDAY RAGASIYAM CHALLENGE:\nLook at: 1, 11, 21, 1211, 111221, ?\nWhat is the next line in this Look-and-Say sequence?",
    answer: "312211",
    type: "options",
    options: ["312211", "13112221", "211211", "111321"],
    hints: [
      { cost: 20, text: "Read '111221' out loud: three 1s, two 2s, one 1." },
      { cost: 40, text: "Three 1s (31), two 2s (22), one 1 (11)." },
      { cost: 60, text: "312211" }
    ],
    explanation: "'111221' has three 1s (31), two 2s (22), one 1 (11) -> 312211.",
    explanationLines: [
      "Read out previous line '111221':",
      "Three 1s -> 31",
      "Two 2s -> 22",
      "One 1 -> 11",
      "Result = 312211!"
    ],
    baseScore: 2000,
    timeLimit: 120
  },
  {
    id: 29,
    day: 29,
    dayOfWeek: 'Monday',
    riddleType: 'logic',
    category: 'logic',
    categoryName: 'Logic Puzzle',
    categoryIcon: '🧩',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "With a 3-gallon jug and a 5-gallon jug, how can you measure out exactly 4 gallons of water?",
    answer: "fill 5 gal jug transfer to 3 gal jug",
    alternateAnswers: ["fill 5 gallon jug", "measure 4 gallons"],
    hints: [
      { cost: 20, text: "Fill 5-gal jug, pour into 3-gal jug (leaves 2 gal)." },
      { cost: 40, text: "Empty 3-gal jug, pour 2 gal in. Fill 5-gal jug and top off 3-gal jug (takes 1 gal)." },
      { cost: 60, text: "5 gal minus 1 gal = 4 gal!" }
    ],
    explanation: "Fill 5-gal jug, pour into 3-gal jug (leaves 2 gal). Empty 3-gal, pour 2 gal in. Fill 5-gal, top off 3-gal (takes 1 gal). Leaves 4 gal!",
    explanationLines: [
      "Fill 5-gal jug -> pour to 3-gal jug (2 gal left in 5-gal)",
      "Empty 3-gal jug -> pour the 2 gal into 3-gal jug",
      "Fill 5-gal jug again -> top off 3-gal jug (needs 1 gal)",
      "5 gal jug now contains exactly 4 gallons!"
    ],
    baseScore: 1000,
    timeLimit: 150
  },
  {
    id: 30,
    day: 30,
    dayOfWeek: 'Tuesday',
    riddleType: 'who_am_i',
    category: 'mystery',
    categoryName: 'Who Am I?',
    categoryIcon: '🎭',
    difficulty: 'expert',
    difficultyName: 'Expert',
    question: "Final Challenge: What gets wetter and wetter the more it dries?",
    answer: "towel",
    alternateAnswers: ["a towel"],
    hints: [
      { cost: 20, text: "You use it after a shower." },
      { cost: 40, text: "It dries your body by absorbing water." },
      { cost: 60, text: "T O W E L" }
    ],
    explanation: "A towel absorbs moisture while drying your body, becoming wetter itself.",
    explanationLines: [
      "It absorbs water from your skin...",
      "While drying you...",
      "It gets wetter itself -> Towel!"
    ],
    baseScore: 1500,
    timeLimit: 90
  }
];

function getTodayPuzzle() {
  const startDate = new Date(2026, 0, 1);
  const now = new Date();
  const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  const puzzleIndex = (Math.abs(diffDays) % PUZZLES_DATA.length);
  return PUZZLES_DATA[puzzleIndex];
}

function getPuzzleByDay(dayNum) {
  const found = PUZZLES_DATA.find(p => p.day === parseInt(dayNum, 10));
  return found || PUZZLES_DATA[0];
}
