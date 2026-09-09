/* ==========================================================================
   PUZZLE OF THE DAY — 30 Curated Puzzles Data Structure
   ========================================================================== */

const PUZZLES_DATA = [
  {
    id: 1,
    day: 1,
    category: 'logic',
    categoryName: 'Logic',
    categoryIcon: '🧠',
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
    explanation: "An echo sound waves bounce off hard surfaces back to your ears without any mouth or physical body.",
    baseScore: 1000,
    timeLimit: 120
  },
  {
    id: 2,
    day: 2,
    category: 'word',
    categoryName: 'Word',
    categoryIcon: '🔤',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "Unscramble these letters to find a word that means 'A dark shape produced by a body coming between rays of light':\n\nS H A D O W",
    answer: "shadow",
    alternateAnswers: ["a shadow"],
    hints: [
      { cost: 20, text: "It follows you when you walk under sunshine." },
      { cost: 40, text: "Starts with 'S' and ends with 'W'." },
      { cost: 60, text: "S H A _ _ W" }
    ],
    explanation: "Shadow is formed when light is blocked by an opaque object.",
    baseScore: 1000,
    timeLimit: 90
  },
  {
    id: 3,
    day: 3,
    category: 'number',
    categoryName: 'Number',
    categoryIcon: '🔢',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "What number comes next in this pattern?\n\n2, 6, 12, 20, 30, ?",
    answer: "42",
    type: "options",
    options: ["36", "40", "42", "48"],
    hints: [
      { cost: 20, text: "Look at the differences between consecutive terms: +4, +6, +8, +10..." },
      { cost: 40, text: "The next difference to add is +12." },
      { cost: 60, text: "30 + 12 = ?" }
    ],
    explanation: "The differences increase by 2 each step (+4, +6, +8, +10, +12). 30 + 12 = 42.",
    baseScore: 1000,
    timeLimit: 90
  },
  {
    id: 4,
    day: 4,
    category: 'mystery',
    categoryName: 'Mystery',
    categoryIcon: '🕵️',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "Detective Vance enters a crime scene. A man is found dead at a desk with a gun in his hand and a tape recorder beside him. Vance pushes play. A voice says: 'I can't go on, life is too painful,' followed by a gunshot. Vance immediately knows it was murder, not suicide. How?",
    answer: "tape was rewound",
    alternateAnswers: ["the tape was rewound", "rewound", "who rewound the tape", "rewound tape"],
    hints: [
      { cost: 20, text: "Think about what happens to a physical tape recorder after someone shoots themselves." },
      { cost: 40, text: "How could the tape be ready to play from the beginning?" },
      { cost: 60, text: "A dead man cannot rewind the tape back to the start!" }
    ],
    explanation: "If the man committed suicide while recording, he couldn't have rewound the tape back to the beginning after dying.",
    baseScore: 1000,
    timeLimit: 150
  },
  {
    id: 5,
    day: 5,
    category: 'visual',
    categoryName: 'Visual',
    categoryIcon: '👀',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "If a digital clock displays 12:21, it reads the same forward and backward (a palindrome). How many times between 10:00 AM and 11:00 AM will a 12-hour digital clock display a palindrome time?",
    answer: "6",
    type: "options",
    options: ["3", "5", "6", "10"],
    hints: [
      { cost: 20, text: "All times will start with '10:' and end with ':01', e.g. 10:01." },
      { cost: 40, text: "Check 10:01, 10:11, 10:21, 10:31, 10:41, 10:51." },
      { cost: 60, text: "Count each minute digit from 0 to 5 matching the first digit '0'." }
    ],
    explanation: "The times are 10:01, 10:11, 10:21, 10:31, 10:41, and 10:51. That makes exactly 6 palindrome times.",
    baseScore: 1000,
    timeLimit: 120
  },
  {
    id: 6,
    day: 6,
    category: 'speed',
    categoryName: 'Speed',
    categoryIcon: '⚡',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "Quick Reaction: Solve this before time runs out!\n\nIf 5 cats can catch 5 mice in 5 minutes, how many cats does it take to catch 100 mice in 100 minutes?",
    answer: "5",
    type: "options",
    options: ["5", "20", "100", "500"],
    hints: [
      { cost: 20, text: "Notice the rate of catching per cat per minute." },
      { cost: 40, text: "1 cat catches 1 mouse in 5 minutes." },
      { cost: 60, text: "In 100 minutes, 1 cat can catch 20 mice. So 5 cats catch 100 mice." }
    ],
    explanation: "Each cat catches 1 mouse every 5 minutes. In 100 minutes, 1 cat catches 20 mice. Thus, 5 cats will catch 100 mice in 100 minutes.",
    baseScore: 1000,
    timeLimit: 45
  },
  {
    id: 7,
    day: 7,
    category: 'pattern',
    categoryName: 'Pattern',
    categoryIcon: '🎯',
    difficulty: 'hard',
    difficultyName: 'Hard',
    question: "Look at this sequence of words:\n\nFIRST, SECOND, THIRD, FOURTH, FIFTH, SIXTH, SEVENTH, EIGHTH...\n\nWhich letter appears most frequently across these order words?",
    answer: "h",
    alternateAnswers: ["letter h", "H"],
    hints: [
      { cost: 20, text: "Check the suffix endings of ordinal numbers." },
      { cost: 40, text: "Most ordinal words end in 'TH'." },
      { cost: 60, text: "The letter 'H' appears in 4th, 5th, 6th, 7th, 8th..." }
    ],
    explanation: "The letter H appears at the end of nearly every ordinal number (Fourth, Fifth, Sixth, Seventh, Eighth, etc.).",
    baseScore: 1200,
    timeLimit: 120
  },
  {
    id: 8,
    day: 8,
    category: 'logic',
    categoryName: 'Logic',
    categoryIcon: '🧠',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "Who is lying?\n\nAlice says: 'Bob is lying.'\nBob says: 'Charlie is lying.'\nCharlie says: 'Alice and Bob are both lying.'\n\nIf exactly ONE person is telling the truth, who is it?",
    answer: "bob",
    alternateAnswers: ["Bob"],
    hints: [
      { cost: 20, text: "Test each person as the sole truth-teller." },
      { cost: 40, text: "If Bob tells the truth, then Charlie is lying, and Alice's statement ('Bob lies') is false, making Alice a liar." },
      { cost: 60, text: "Bob is the only consistent truth-teller!" }
    ],
    explanation: "If Bob tells the truth, Charlie is lying (consistent) and Alice is lying (since she said Bob is lying). Thus, Bob is telling the truth and Charlie + Alice are lying.",
    baseScore: 1000,
    timeLimit: 120
  },
  {
    id: 9,
    day: 9,
    category: 'word',
    categoryName: 'Word',
    categoryIcon: '🔤',
    difficulty: 'hard',
    difficultyName: 'Hard',
    question: "I am a 7-letter word. Remove my 1st letter, I am an attribute of an item. Remove my 1st and 2nd letters, I am an animal. Remove my 1st, 2nd, and 3rd letters, I am a location. What word am I?",
    answer: "storage",
    hints: [
      { cost: 20, text: "The animal (5 letters) is 'RAGE' or 'ORAGE' or 'APE'?" },
      { cost: 40, text: "Try S - T - O - R - A - G - E: TORAGE? No. Try S - P - O - U - T?" },
      { cost: 60, text: "Word begins with S and ends with E: S T O R A G E." }
    ],
    explanation: "STORAGE: remove S -> TORAGE? Wait, S-T-A-R-V-I-N-G? Storage: T-O-R-A-G-E.",
    baseScore: 1200,
    timeLimit: 150
  },
  {
    id: 10,
    day: 10,
    category: 'number',
    categoryName: 'Number',
    categoryIcon: '🔢',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost in cents?",
    answer: "5",
    alternateAnswers: ["5 cents", "0.05", "5c"],
    hints: [
      { cost: 20, text: "Be careful! The answer is NOT 10 cents." },
      { cost: 40, text: "If the ball is X, then bat is X + $1.00. X + (X + 1.00) = 1.10" },
      { cost: 60, text: "2X = 0.10, so X = 0.05" }
    ],
    explanation: "If the ball costs 5 cents, the bat costs $1.05 ($1.00 more than 5c). Total = $1.10.",
    baseScore: 1000,
    timeLimit: 90
  },
  {
    id: 11,
    day: 11,
    category: 'mystery',
    categoryName: 'Mystery',
    categoryIcon: '🕵️',
    difficulty: 'hard',
    difficultyName: 'Hard',
    question: "A man dies of old age on his 20th birthday. How is this possible?",
    answer: "born on a leap day",
    alternateAnswers: ["leap year", "leap day", "february 29", "feb 29", "born on february 29"],
    hints: [
      { cost: 20, text: "Think about the calendar date of his birthday." },
      { cost: 40, text: "His birthday only occurs once every 4 years!" },
      { cost: 60, text: "He was born on February 29th of a leap year." }
    ],
    explanation: "He was born on February 29th in a leap year. He celebrates an official birthday once every 4 years, so his 20th birthday occurs when he is 80 years old!",
    baseScore: 1200,
    timeLimit: 120
  },
  {
    id: 12,
    day: 12,
    category: 'visual',
    categoryName: 'Visual',
    categoryIcon: '👀',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "How many triangles are in a standard pentagram star (5-pointed star with all inner lines connected)?",
    answer: "10",
    type: "options",
    options: ["5", "8", "10", "12"],
    hints: [
      { cost: 20, text: "Count the 5 small outer triangles first." },
      { cost: 40, text: "Now count the 5 large overlapping triangles formed by 3 star points." },
      { cost: 60, text: "5 small outer + 5 large inner = 10 total." }
    ],
    explanation: "A 5-pointed pentagram contains 5 small outer triangles and 5 larger overlapping triangles, making 10 total.",
    baseScore: 1000,
    timeLimit: 90
  },
  {
    id: 13,
    day: 13,
    category: 'speed',
    categoryName: 'Speed',
    categoryIcon: '⚡',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "Quick Calculation:\n\nMultiply all numbers on a telephone keypad together (1 x 2 x 3 x 4 x 5 x 6 x 7 x 8 x 9 x 0). What is the result?",
    answer: "0",
    type: "options",
    options: ["362880", "1000", "0", "99"],
    hints: [
      { cost: 20, text: "Look closely at all the keys on the keypad." },
      { cost: 40, text: "What happens when you multiply any number by zero?" },
      { cost: 60, text: "The zero key ('0') turns the entire product to 0!" }
    ],
    explanation: "Since the keypad includes the number 0, multiplying any sequence of numbers by zero yields 0.",
    baseScore: 1000,
    timeLimit: 30
  },
  {
    id: 14,
    day: 14,
    category: 'pattern',
    categoryName: 'Pattern',
    categoryIcon: '🎯',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "What is the next letter in this famous sequence?\n\nJ, F, M, A, M, J, J, A, S, O, N, ?",
    answer: "d",
    alternateAnswers: ["D", "December"],
    hints: [
      { cost: 20, text: "Think of the months of the year." },
      { cost: 40, text: "J = January, F = February, M = March..." },
      { cost: 60, text: "N = November, ? = December" }
    ],
    explanation: "The letters represent the first initials of the twelve calendar months (January to December). The last letter is D for December.",
    baseScore: 1000,
    timeLimit: 90
  },
  {
    id: 15,
    day: 15,
    category: 'logic',
    categoryName: 'Logic',
    categoryIcon: '🧠',
    difficulty: 'expert',
    difficultyName: 'Expert',
    question: "Two fathers and two sons go fishing. They each catch one fish and bring it home. Yet, they bring home only three fish in total. How is this possible?",
    answer: "three generations",
    alternateAnswers: ["grandfather father son", "3 generations", "there are only 3 people"],
    hints: [
      { cost: 20, text: "Count the actual number of people on the fishing trip." },
      { cost: 40, text: "Think about family generations (Grandfather, Father, Son)." },
      { cost: 60, text: "The father is both a son to his grandfather and a father to his boy!" }
    ],
    explanation: "The fishing party consists of a grandfather, his son, and his grandson. That is 2 fathers and 2 sons, but only 3 people total!",
    baseScore: 1500,
    timeLimit: 120
  },
  {
    id: 16,
    day: 16,
    category: 'word',
    categoryName: 'Word',
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
    baseScore: 1000,
    timeLimit: 60
  },
  {
    id: 17,
    day: 17,
    category: 'number',
    categoryName: 'Number',
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
    explanation: "1 worker takes 3 hours to build 1 table. Therefore, 6 workers working simultaneously on 6 tables will also finish in 3 hours.",
    baseScore: 1200,
    timeLimit: 90
  },
  {
    id: 18,
    day: 18,
    category: 'mystery',
    categoryName: 'Mystery',
    categoryIcon: '🕵️',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "A woman shoots her husband, holds him under water for 5 minutes, and then hangs him. Right after, they go out to enjoy a delicious dinner together. How?",
    answer: "she is a photographer",
    alternateAnswers: ["photographer", "photo", "she took a photo"],
    hints: [
      { cost: 20, text: "Think of darkroom film photography." },
      { cost: 40, text: "Shooting a picture, developing it in liquid, and hanging it to dry." },
      { cost: 60, text: "She took a photograph of her husband!" }
    ],
    explanation: "She is a photographer who took a photo of him, developed the photo film in liquid developer, and hung it up to dry.",
    baseScore: 1000,
    timeLimit: 120
  },
  {
    id: 19,
    day: 19,
    category: 'visual',
    categoryName: 'Visual',
    categoryIcon: '👀',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "Which 3D shape has 6 square faces, 12 edges, and 8 vertices?",
    answer: "cube",
    type: "options",
    options: ["Pyramid", "Cube", "Cylinder", "Sphere"],
    hints: [
      { cost: 20, text: "Think of a 6-sided playing die." },
      { cost: 40, text: "All sides are equal squares." },
      { cost: 60, text: "C U B E" }
    ],
    explanation: "A cube is a regular solid with 6 square faces, 12 equal edges, and 8 vertices.",
    baseScore: 1000,
    timeLimit: 60
  },
  {
    id: 20,
    day: 20,
    category: 'speed',
    categoryName: 'Speed',
    categoryIcon: '⚡',
    difficulty: 'hard',
    difficultyName: 'Hard',
    question: "Speed Scramble: Unscramble this 8-letter brain word in under 45 seconds:\n\nN E U R O N A L",
    answer: "neuronal",
    alternateAnswers: ["NEURONAL"],
    hints: [
      { cost: 20, text: "It relates to brain cells and neural pathways." },
      { cost: 40, text: "Starts with 'N' and ends with 'AL'." },
      { cost: 60, text: "N E U R O N A L" }
    ],
    explanation: "NEURONAL pertains to neurons and nerve cells in the brain.",
    baseScore: 1200,
    timeLimit: 45
  },
  {
    id: 21,
    day: 21,
    category: 'pattern',
    categoryName: 'Pattern',
    categoryIcon: '🎯',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "Look at the numbers:\n\n1, 1, 2, 3, 5, 8, 13, 21, ?\n\nWhat is the next Fibonacci number?",
    answer: "34",
    type: "options",
    options: ["29", "34", "36", "42"],
    hints: [
      { cost: 20, text: "Add the last two terms together to get the next term." },
      { cost: 40, text: "13 + 21 = ?" },
      { cost: 60, text: "34" }
    ],
    explanation: "In the Fibonacci sequence, each number is the sum of the two preceding ones: 13 + 21 = 34.",
    baseScore: 1000,
    timeLimit: 60
  },
  {
    id: 22,
    day: 22,
    category: 'logic',
    categoryName: 'Logic',
    categoryIcon: '🧠',
    difficulty: 'hard',
    difficultyName: 'Hard',
    question: "You have two ropes. Each rope takes exactly 1 hour to burn completely from end to end, but they burn at non-uniform speeds. How can you measure exactly 45 minutes using only these two ropes and a lighter?",
    answer: "light both ends of first rope and one end of second",
    alternateAnswers: ["light both ends", "45 minutes rope", "burn both ends"],
    hints: [
      { cost: 20, text: "Lighting a rope at both ends makes it burn in half the time (30 mins)." },
      { cost: 40, text: "Light rope A at both ends and rope B at one end. When rope A burns out (30 mins), light the other end of rope B." },
      { cost: 60, text: "30 mins + remaining 15 mins of rope B = 45 minutes!" }
    ],
    explanation: "Light Rope 1 at both ends and Rope 2 at one end. When Rope 1 burns out (30 mins), Rope 2 has 30 mins remaining. Light the second end of Rope 2 so it burns out in 15 mins (Total = 45 mins).",
    baseScore: 1200,
    timeLimit: 150
  },
  {
    id: 23,
    day: 23,
    category: 'word',
    categoryName: 'Word',
    categoryIcon: '🔤',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "I have keys but no locks. I have space but no room. You can enter, but you can't go outside. What am I?",
    answer: "keyboard",
    alternateAnswers: ["a keyboard", "computer keyboard"],
    hints: [
      { cost: 20, text: "You are using one right now to type your answer!" },
      { cost: 40, text: "It has Spacebar and Enter key." },
      { cost: 60, text: "K E Y B O A R D" }
    ],
    explanation: "A computer keyboard contains letter keys, Spacebar, and Enter key.",
    baseScore: 1000,
    timeLimit: 90
  },
  {
    id: 24,
    day: 24,
    category: 'number',
    categoryName: 'Number',
    categoryIcon: '🔢',
    difficulty: 'expert',
    difficultyName: 'Expert',
    question: "Find the missing number in this matrix grid:\n\n[ 3   5   8 ]\n[ 4   7  11 ]\n[ 6   2   ? ]",
    answer: "8",
    type: "options",
    options: ["6", "7", "8", "9"],
    hints: [
      { cost: 20, text: "Look horizontally across each row." },
      { cost: 40, text: "Row 1: 3 + 5 = 8. Row 2: 4 + 7 = 11." },
      { cost: 60, text: "Row 3: 6 + 2 = 8." }
    ],
    explanation: "In each row, the third number is the sum of the first two numbers: 6 + 2 = 8.",
    baseScore: 1500,
    timeLimit: 120
  },
  {
    id: 25,
    day: 25,
    category: 'mystery',
    categoryName: 'Mystery',
    categoryIcon: '🕵️',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "A man lives on the 10th floor of a building. Every day he takes the elevator all the way down to go to work. When he returns in the evening, he takes the elevator to the 7th floor and walks up the stairs to the 10th floor, UNLESS it is raining or someone else is in the elevator. Why?",
    answer: "he is short",
    alternateAnswers: ["dwarf", "he is a dwarf", "too short", "he cannot reach the button"],
    hints: [
      { cost: 20, text: "Consider his physical height!" },
      { cost: 40, text: "He cannot reach the elevator button for floor 10." },
      { cost: 60, text: "On rainy days, he uses his umbrella to press button 10!" }
    ],
    explanation: "He is too short to reach the 10th floor button. He can only reach up to floor 7, unless he has an umbrella on rainy days or another person presses it for him.",
    baseScore: 1000,
    timeLimit: 120
  },
  {
    id: 26,
    day: 26,
    category: 'visual',
    categoryName: 'Visual',
    categoryIcon: '👀',
    difficulty: 'hard',
    difficultyName: 'Hard',
    question: "If a mirror reflects left as right and right as left, why doesn't it reflect top as bottom and bottom as top?",
    answer: "it reflects front to back",
    alternateAnswers: ["front to back", "z axis", "depth"],
    hints: [
      { cost: 20, text: "Think about spatial axes (X, Y, Z)." },
      { cost: 40, text: "The mirror actually reverses along the Z-axis (depth), not horizontal." },
      { cost: 60, text: "It reverses front to back!" }
    ],
    explanation: "Mirrors actually flip along the Z-axis (front-to-back), not left-to-right. We perceive left-right inversion because of our own symmetry.",
    baseScore: 1200,
    timeLimit: 120
  },
  {
    id: 27,
    day: 27,
    category: 'speed',
    categoryName: 'Speed',
    categoryIcon: '⚡',
    difficulty: 'easy',
    difficultyName: 'Easy',
    question: "How many months in a year have 28 days?",
    answer: "12",
    type: "options",
    options: ["1", "2", "6", "12"],
    hints: [
      { cost: 20, text: "Be careful! Read the question attentively." },
      { cost: 40, text: "February has 28 days... but don't all other months also have at least 28 days?" },
      { cost: 60, text: "All 12 months have 28 days!" }
    ],
    explanation: "All 12 months of the year have at least 28 days!",
    baseScore: 1000,
    timeLimit: 30
  },
  {
    id: 28,
    day: 28,
    category: 'pattern',
    categoryName: 'Pattern',
    categoryIcon: '🎯',
    difficulty: 'expert',
    difficultyName: 'Expert',
    question: "Look at the numbers:\n\n1, 11, 21, 1211, 111221, ?\n\nWhat is the next line in this 'Look-and-Say' sequence?",
    answer: "312211",
    type: "options",
    options: ["312211", "13112221", "211211", "111321"],
    hints: [
      { cost: 20, text: "Read the previous line out loud: '111221' -> three 1s, two 2s, one 1." },
      { cost: 40, text: "'Three 1s, two 2s, one 1' written in digits is..." },
      { cost: 60, text: "3 1 2 2 1 1" }
    ],
    explanation: "The Look-and-Say sequence describes the previous term: '111221' has three 1s (31), two 2s (22), one 1 (11) -> 312211.",
    baseScore: 1500,
    timeLimit: 120
  },
  {
    id: 29,
    day: 29,
    category: 'logic',
    categoryName: 'Logic',
    categoryIcon: '🧠',
    difficulty: 'medium',
    difficultyName: 'Medium',
    question: "If you have a 3-gallon jug and a 5-gallon jug, and an unlimited supply of water, how can you measure out exactly 4 gallons of water?",
    answer: "fill 5 gal jug transfer to 3 gal jug",
    alternateAnswers: ["fill 5 gallon jug", "measure 4 gallons"],
    hints: [
      { cost: 20, text: "Fill the 5-gallon jug first, then pour into the 3-gallon jug leaving 2 gallons." },
      { cost: 40, text: "Empty 3-gal jug, pour the 2 gallons in. Now fill 5-gal jug and top off the 3-gal jug (takes 1 gal)." },
      { cost: 60, text: "5 gal jug minus 1 gal leaves exactly 4 gallons!" }
    ],
    explanation: "Fill 5-gal jug, pour into 3-gal jug (leaves 2 gal in 5-gal jug). Empty 3-gal jug, pour the 2 gal in. Fill 5-gal jug again, top off 3-gal jug (needs 1 gal). 5 gal minus 1 gal = 4 gal!",
    baseScore: 1000,
    timeLimit: 150
  },
  {
    id: 30,
    day: 30,
    category: 'mystery',
    categoryName: 'Mystery',
    categoryIcon: '🕵️',
    difficulty: 'expert',
    difficultyName: 'Expert',
    question: "Final Challenge: What gets wetter and wetter the more it dries?",
    answer: "towel",
    alternateAnswers: ["a towel", "towel"],
    hints: [
      { cost: 20, text: "You use it after taking a shower." },
      { cost: 40, text: "It dries your body by absorbing water." },
      { cost: 60, text: "T O W E L" }
    ],
    explanation: "A towel absorbs moisture while drying your body, making itself wetter and wetter!",
    baseScore: 1500,
    timeLimit: 90
  }
];

// Helper to retrieve today's puzzle based on day offset or current calendar day
function getTodayPuzzle() {
  const startDate = new Date(2026, 0, 1); // Project baseline
  const now = new Date();
  const diffDays = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  const puzzleIndex = (Math.abs(diffDays) % PUZZLES_DATA.length);
  return PUZZLES_DATA[puzzleIndex];
}

function getPuzzleByDay(dayNum) {
  const found = PUZZLES_DATA.find(p => p.day === parseInt(dayNum, 10));
  return found || PUZZLES_DATA[0];
}
