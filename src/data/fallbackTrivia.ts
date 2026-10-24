import { TriviaQuestion, SearchSource } from '../types/trivia';

export const FALLBACK_SOURCES: Record<string, SearchSource[]> = {
  default: [
    { title: 'NASA Space Science & Discoveries', uri: 'https://science.nasa.gov/' },
    { title: 'Nature International Journal of Science', uri: 'https://www.nature.com/' },
    { title: 'MIT Technology Review', uri: 'https://www.technologyreview.com/' },
    { title: 'Encyclopaedia Britannica', uri: 'https://www.britannica.com/' },
  ],
};

export const EMERGENCY_TRIVIA_BANK: Record<string, TriviaQuestion[]> = {
  space: [
    {
      id: 'fb-sp-1',
      question: 'In 2025, NASA and ESA confirmed which ocean moon of Saturn contains hydrothermal vents ejecting phosphorus and organic molecules essential for life?',
      options: ['Enceladus', 'Titan', 'Mimas', 'Dione'],
      correctIndex: 0,
      explanation: 'Enceladus harbors a global subsurface liquid ocean. Cassini and subsequent spectrometer studies detected phosphorus salts and molecular hydrogen from hydrothermal plumes.',
      funFact: 'Enceladus is the most reflective planetary body in the solar system, reflecting nearly 100% of sunlight from its pristine ice crust.',
      hostIntro: 'Let us blast beyond the stratosphere into the icy depths of our solar system!',
      hostWinReaction: 'Stellar navigation, cadet! You know your celestial real estate!',
      hostFailReaction: 'Lost in the cosmic void! Enceladus is the geyser jewel of Saturn.'
    },
    {
      id: 'fb-sp-2',
      question: 'What is the name of the supermassive black hole at the center of the Milky Way galaxy?',
      options: ['Sagittarius A*', 'Cygnus X-1', 'Messier 87*', 'Andromeda Core'],
      correctIndex: 0,
      explanation: 'Sagittarius A* (Sgr A*) is located at the center of the Milky Way, containing approximately 4.3 million times the mass of the Sun.',
      funFact: 'The Event Horizon Telescope produced the first direct silhouette image of Sagittarius A* in May 2022.',
      hostIntro: 'Brace yourselves for gravitational collapse with this cosmic brain-bender!',
      hostWinReaction: 'Gravitational victory! You pulled those points right out of the event horizon!',
      hostFailReaction: 'Spaghettified! The answer was Sagittarius A*!'
    },
    {
      id: 'fb-sp-3',
      question: 'Which space telescope operates at the second Sun-Earth Lagrange point (L2) approximately 1.5 million kilometers from Earth?',
      options: ['James Webb Space Telescope (JWST)', 'Hubble Space Telescope', 'Chandra X-ray Observatory', 'Spitzer Space Telescope'],
      correctIndex: 0,
      explanation: 'The James Webb Space Telescope orbits the Sun-Earth L2 Lagrange point, enabling its tennis-court-sized sunshield to keep infrared instruments cryogenic.',
      funFact: 'JWST can detect the thermal heat signature of a bumblebee at the distance of the Moon.',
      hostIntro: 'Peering back to the dawn of the cosmic dark ages, lock your eyes on this!',
      hostWinReaction: 'Pinpoint precision! Webb would be proud of your optics!',
      hostFailReaction: 'Out of focus! Hubble orbited low-Earth, but JWST is all the way out at L2!'
    },
    {
      id: 'fb-sp-4',
      question: 'What is the hottest planet in our solar system, despite not being the closest to the Sun?',
      options: ['Venus', 'Mercury', 'Mars', 'Jupiter'],
      correctIndex: 0,
      explanation: 'Venus experiences a runaway greenhouse effect from a dense atmosphere of 96% carbon dioxide, producing surface temperatures of over 465°C (870°F).',
      funFact: 'A day on Venus (243 Earth days) is longer than its entire year (225 Earth days)!',
      hostIntro: 'Feel the thermal heat radiating from this scorcher of a question!',
      hostWinReaction: 'Hot streak! You did not fall for the Mercury trap!',
      hostFailReaction: 'Burned by the greenhouse effect! Mercury has no atmosphere, so Venus takes the thermal crown.'
    },
    {
      id: 'fb-sp-5',
      question: 'What is the term for the boundary around a black hole beyond which nothing, not even light, can escape?',
      options: ['Event Horizon', 'Photon Sphere', 'Singularity', 'Ergosphere'],
      correctIndex: 0,
      explanation: 'The event horizon is the theoretical threshold around a black hole where the escape velocity strictly equals or exceeds the speed of light.',
      funFact: 'Time appears to completely freeze for an observer watching an object fall toward the event horizon due to gravitational time dilation.',
      hostIntro: 'There is no turning back from this quantum threshold!',
      hostWinReaction: 'Escaped the singularity! Brilliant physics intuition!',
      hostFailReaction: 'Pulled past the point of no return! That was the Event Horizon.'
    }
  ],
  tech: [
    {
      id: 'fb-tc-1',
      question: 'In computer science, what algorithmic architecture introduced in the 2017 paper "Attention Is All You Need" underpins modern Large Language Models?',
      options: ['Transformer', 'Recurrent Neural Network (RNN)', 'Support Vector Machine', 'Convolutional Network (CNN)'],
      correctIndex: 0,
      explanation: 'The Transformer architecture uses multi-head self-attention mechanisms to process sequence data in parallel, revolutionizing NLP and generative AI.',
      funFact: 'The Transformer replaced sequential recurrent models, allowing training on trillions of tokens across thousands of GPUs simultaneously.',
      hostIntro: 'Attention, contestants! Compute cycles are spinning for this digital trial!',
      hostWinReaction: 'Synthesized with 100% attention weights! Flawless compute!',
      hostFailReaction: 'Neural network hallucination! The Transformer architecture is the bedrock of modern AI.'
    },
    {
      id: 'fb-tc-2',
      question: 'What quantum phenomenon allows quantum bits (qubits) to exist in combinations of both 0 and 1 states simultaneously?',
      options: ['Superposition', 'Quantum Tunneling', 'Spontaneous Emission', 'Photoelectric Effect'],
      correctIndex: 0,
      explanation: 'Superposition enables a quantum system to exist in a linear combination of multiple eigenstates until measured, exponentially expanding computational search spaces.',
      funFact: 'A quantum computer with just 300 perfectly entangled qubits could hold more numbers simultaneously than there are atoms in the observable universe.',
      hostIntro: 'Enter the quantum realm where classical binary logic collapses!',
      hostWinReaction: 'Coherent and uncollapsed! You collapsed the wave function into pure victory!',
      hostFailReaction: 'Decoherence detected! That fundamental principle is Superposition.'
    },
    {
      id: 'fb-tc-3',
      question: 'Who is widely recognized in computing history as the world’s first computer programmer for algorithms written for Charles Babbage’s Analytical Engine?',
      options: ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Margaret Hamilton'],
      correctIndex: 0,
      explanation: 'Ada Lovelace published the first algorithm intended to be executed by a machine (calculating Bernoulli numbers) in 1843, realizing machines could manipulate more than pure numbers.',
      funFact: 'The early computer programming language "Ada", created by the US Department of Defense, was named in her honor.',
      hostIntro: 'Traveling back to the Victorian birth of silicon dreams!',
      hostWinReaction: 'Historic knowledge! Ada Lovelace wrote the original code!',
      hostFailReaction: 'Bug in the punch cards! It was Ada Lovelace in 1843.'
    },
    {
      id: 'fb-tc-4',
      question: 'What major protocol milestone represents the cryptographic mechanism that secures the majority of modern HTTPS traffic over the internet?',
      options: ['TLS (Transport Layer Security)', 'FTP (File Transfer Protocol)', 'DNSSEC', 'BGP (Border Gateway Protocol)'],
      correctIndex: 0,
      explanation: 'TLS (the successor to SSL) provides end-to-end encryption, authentication, and data integrity for web communication.',
      funFact: 'TLS 1.3 reduced handshake latency from two round-trips to just one (0-RTT resumption), speeding up the modern web globally.',
      hostIntro: 'Encrypting communications for maximum security!',
      hostWinReaction: 'Handshake verified! Your cryptographic knowledge is 256-bit secure!',
      hostFailReaction: 'Packet intercepted! TLS is the standard protocol for HTTPS encryption.'
    },
    {
      id: 'fb-tc-5',
      question: 'Which open-source operating system kernel was initially created by Linus Torvalds and released in 1991?',
      options: ['Linux', 'UNIX', 'FreeBSD', 'Minix'],
      correctIndex: 0,
      explanation: 'Linus Torvalds announced Linux on the Minix newsgroup in August 1991 as a free operating system kernel for 386/486 AT computers.',
      funFact: 'Today, Linux runs 100% of the world’s top 500 fastest supercomputers and powers billions of Android mobile devices.',
      hostIntro: 'Penguins assemble! Boot up your open-source terminal!',
      hostWinReaction: 'Root access granted! Linux powers the entire modern cloud!',
      hostFailReaction: 'Kernel panic! Linus Torvalds created the Linux kernel!'
    }
  ],
  history: [
    {
      id: 'fb-hs-1',
      question: 'Which ancient library of the Hellenistic world, founded under the Ptolemaic dynasty in Egypt, was legendary for housing hundreds of thousands of papyrus scrolls?',
      options: ['Library of Alexandria', 'Library of Pergamum', 'House of Wisdom in Baghdad', 'Library of Celsus'],
      correctIndex: 0,
      explanation: 'The Great Library of Alexandria was part of the Mouseion research institute, attracting Archimedes, Eratosthenes, and Euclid.',
      funFact: 'Any book brought into the port of Alexandria by visiting ships had to be seized, copied, and the copy returned while the original stayed in the library!',
      hostIntro: 'Unrolling the ancient papyrus scrolls of antiquity!',
      hostWinReaction: 'Scholarly brilliance! The Great Library of Alexandria stands triumphant!',
      hostFailReaction: 'A tragic loss of knowledge! It was the Library of Alexandria.'
    },
    {
      id: 'fb-hs-2',
      question: 'In 1922, British archaeologist Howard Carter discovered the nearly intact tomb of which Egyptian pharaoh in the Valley of the Kings?',
      options: ['Tutankhamun', 'Ramesses II', 'Akhenaten', 'Thutmose III'],
      correctIndex: 0,
      explanation: 'Howard Carter discovered KV62 containing Tutankhamun’s burial chamber, unearthing over 5,000 priceless artifacts including the solid gold funerary mask.',
      funFact: 'When Lord Carnarvon asked if he could see anything through the first chisel hole, Carter famously replied: "Yes, wonderful things!"',
      hostIntro: 'Dust off the sands of the Valley of the Kings for this treasure hunt!',
      hostWinReaction: 'Golden treasure unlocked! King Tutankhamun reigns supreme!',
      hostFailReaction: 'Buried in antiquity! That was the boy king, Tutankhamun.'
    },
    {
      id: 'fb-hs-3',
      question: 'What ancient defensive fortification, stretching thousands of kilometers across northern China, was built and reinforced across multiple dynasties to protect against nomadic incursions?',
      options: ['The Great Wall of China', 'Hadrian’s Wall', 'The Antonine Wall', 'The Long Walls of Athens'],
      correctIndex: 0,
      explanation: 'The Great Wall of China was constructed over centuries, most famously during the Qin and Ming dynasties, spanning over 21,000 km across varied terrain.',
      funFact: 'Sticky rice flour mortar was used in portions of the Ming dynasty wall because amylopectin gave the brick masonry remarkable tensile strength.',
      hostIntro: 'Marching along the ancient battlements of world empires!',
      hostWinReaction: 'Impenetrable defense! The Great Wall stands unmatched!',
      hostFailReaction: 'Breached the perimeter! The answer is the Great Wall of China.'
    },
    {
      id: 'fb-hs-4',
      question: 'In 1789, the storming of which medieval fortress and prison in Paris marked a turning point in the French Revolution?',
      options: ['The Bastille', 'The Conciergerie', 'Fort Boyard', 'Château de Vincennes'],
      correctIndex: 0,
      explanation: 'On July 14, 1789, revolutionary insurgents seized the Bastille fortress, an act commemorated annually as Bastille Day in France.',
      funFact: 'At the time of its storming, the Bastille held only seven prisoners, but it contained valuable stores of gunpowder.',
      hostIntro: 'Liberty, equality, and high-stakes trivia in the streets of Paris!',
      hostWinReaction: 'Vive la victoire! The Bastille fell to your intellectual prowess!',
      hostFailReaction: 'Guillotine of truth! It was the storming of the Bastille.'
    },
    {
      id: 'fb-hs-5',
      question: 'Which legendary Norse explorer is credited with establishing the first known European settlement in North America (Vinland) around 1000 CE, centuries before Columbus?',
      options: ['Leif Erikson', 'Ragnar Lothbrok', 'Erik the Red', 'Harald Hardrada'],
      correctIndex: 0,
      explanation: 'Leif Erikson sailed west from Greenland to modern-day Newfoundland, evidenced by archaeological excavations at L’Anse aux Meadows.',
      funFact: 'The United States officially designated October 9 as Leif Erikson Day to celebrate early transatlantic exploration.',
      hostIntro: 'Board the Viking longships across the stormy North Atlantic!',
      hostWinReaction: 'Skål! You navigated straight to Leif Erikson!',
      hostFailReaction: 'Blown off course! Erik the Red founded Greenland, but his son Leif Erikson reached North America.'
    }
  ],
  popculture: [
    {
      id: 'fb-pc-1',
      question: 'In the film "Inception" (2010) directed by Christopher Nolan, what personal totem does Cobb (Leonardo DiCaprio) spin to test if he is in reality?',
      options: ['A spinning top', 'A loaded die', 'A poker chip', 'A brass chess bishop'],
      correctIndex: 0,
      explanation: 'Cobb uses a small pewter spinning top that originally belonged to his wife Mal. In a dream, it spins perpetually without tipping over.',
      funFact: 'The final shot cuts to black just as the top begins a slight wobble, leaving its ultimate state famously ambiguous.',
      hostIntro: 'We need to go deeper into your pop culture subconscious!',
      hostWinReaction: 'Reality confirmed! The spinning top never lies to a true champion!',
      hostFailReaction: 'Lost in limbo! Cobb’s famous totem was the spinning top.'
    },
    {
      id: 'fb-pc-2',
      question: 'Which fictional secret agent with the code number "007" was created by British author Ian Fleming in 1953?',
      options: ['James Bond', 'Jason Bourne', 'Ethan Hunt', 'George Smiley'],
      correctIndex: 0,
      explanation: 'Ian Fleming introduced James Bond in the 1953 novel Casino Royale, inspired by real naval intelligence operatives Fleming encountered in WWII.',
      funFact: 'Fleming chose the name "James Bond" because he wanted the dullest, most uninteresting name possible, taking it from American ornithologist James Bond.',
      hostIntro: 'Shaken, not stirred! Put on your black tuxedo for this round!',
      hostWinReaction: 'Licensed to score! Double-O-Seven accuracy!',
      hostFailReaction: 'Mission compromised! That secret agent is none other than James Bond.'
    },
    {
      id: 'fb-pc-3',
      question: 'Which blockbuster 1993 Steven Spielberg film brought photorealistic digital dinosaurs to the big screen, winning three Academy Awards?',
      options: ['Jurassic Park', 'The Lost World', 'Godzilla', 'Dinosaur'],
      correctIndex: 0,
      explanation: 'Jurassic Park revolutionized CGI effects through Industrial Light & Magic alongside Stan Winston’s full-scale animatronics.',
      funFact: 'Despite its 127-minute runtime, Jurassic Park contains only about 15 minutes of actual dinosaur footage!',
      hostIntro: 'Life finds a way, and so do trivia contestants!',
      hostWinReaction: 'Clever girl! You survived the T-Rex paddock unscathed!',
      hostFailReaction: 'Eaten by a raptor! Jurassic Park was Spielberg’s 1993 masterpiece.'
    },
    {
      id: 'fb-pc-4',
      question: 'What is the name of the fantasy realm where George R.R. Martin’s "A Song of Ice and Fire" and HBO’s "Game of Thrones" predominantly take place?',
      options: ['Westeros', 'Middle-earth', 'Narnia', 'Azeroth'],
      correctIndex: 0,
      explanation: 'Westeros is the continent containing the Seven Kingdoms, bounded by the Wall to the north and the Narrow Sea to the east.',
      funFact: 'George R.R. Martin modeled the geography of Westeros partially by flipping an upside-down map of Ireland beneath the British Isles.',
      hostIntro: 'When you play the game of trivia, you win or you get roasted!',
      hostWinReaction: 'The Iron Throne is yours! A true ruler of Westeros!',
      hostFailReaction: 'Sent to the Night’s Watch! Westeros is the heart of the Seven Kingdoms.'
    },
    {
      id: 'fb-pc-5',
      question: 'Which musician holds the record for the highest-grossing concert tour of all time with the monumental "Eras Tour"?',
      options: ['Taylor Swift', 'Elton John', 'Ed Sheeran', 'Beyoncé'],
      correctIndex: 0,
      explanation: 'The Eras Tour became the first concert tour in history to surpass $1 billion in gross revenue, spanning over 150 stadium dates worldwide.',
      funFact: 'Seismologists in Seattle recorded seismic activity equivalent to a 2.3 magnitude earthquake caused by dancing fans during the Eras Tour!',
      hostIntro: 'Crank the stadium speakers up to eleven!',
      hostWinReaction: 'Encore! Swiftly locked in with pop perfection!',
      hostFailReaction: 'Out of tune! Taylor Swift’s Eras Tour shattered all global box office records.'
    }
  ]
};

export function getEmergencyTrivia(topic: string, count: number = 5, hostName: string = 'Rex Sterling'): TriviaQuestion[] {
  const lower = topic.toLowerCase();
  let pool = EMERGENCY_TRIVIA_BANK.tech;

  if (lower.includes('space') || lower.includes('astro') || lower.includes('planet') || lower.includes('moon') || lower.includes('telescope')) {
    pool = EMERGENCY_TRIVIA_BANK.space;
  } else if (lower.includes('history') || lower.includes('ancient') || lower.includes('empire') || lower.includes('war')) {
    pool = EMERGENCY_TRIVIA_BANK.history;
  } else if (lower.includes('pop') || lower.includes('movie') || lower.includes('music') || lower.includes('cinema') || lower.includes('culture')) {
    pool = EMERGENCY_TRIVIA_BANK.popculture;
  } else if (lower.includes('game') || lower.includes('tech') || lower.includes('ai') || lower.includes('comput')) {
    pool = EMERGENCY_TRIVIA_BANK.tech;
  } else {
    // Interleave questions for rich general knowledge
    const combined = [
      ...EMERGENCY_TRIVIA_BANK.space,
      ...EMERGENCY_TRIVIA_BANK.tech,
      ...EMERGENCY_TRIVIA_BANK.history,
      ...EMERGENCY_TRIVIA_BANK.popculture
    ];
    pool = combined.sort(() => Math.random() - 0.5);
  }

  // Slice to requested count and customize with hostName
  return pool.slice(0, count).map((q, idx) => ({
    ...q,
    id: `q-${Date.now()}-${idx}`,
    hostIntro: q.hostIntro.replace('Rex', hostName),
  }));
}
