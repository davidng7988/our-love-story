// Default initial memories and settings
const DEFAULT_SETTINGS = {
  partnerOne: "David",
  partnerTwo: "My Love",
  togetherDate: "2024-04-27T23:34:00",
  loveQuote: "Every second with you is my favorite memory, and forever is just the beginning."
};

const DEFAULT_MEMORIES = [
  {
    id: "mem-1",
    order: 1,
    title: "Our Very First Date 🍽️✨",
    category: "First Date",
    categoryIcon: "💖",
    date: "2024-04-27",
    displayDate: "April 27, 2024 • 11:34 PM",
    location: "D'Fortune Western Restaurant, Manjalara",
    locationUrl: "https://maps.google.com/?q=D'Fortune+Western+Restaurant+Manjalara",
    tagline: "The day our beautiful story officially began 💕",
    description: "Where everything started! Having our very first dinner date at D'Fortune Western Restaurant in Manjalara. Butterflies in our stomachs, shy smiles across the table, and the moment we officially held hands and became 'us'.",
    image: "", // Empty space for image upload
    placeholderType: "restaurant",
    badge: "Official Day #1",
    pinned: true
  },
  {
    id: "mem-2",
    order: 2,
    title: "Chilly Breezes & Warm Hugs at Genting ⛰️🎡",
    category: "Date",
    categoryIcon: "🚠",
    date: "2024-05-11",
    displayDate: "May 2024",
    location: "Genting Highlands, Pahang",
    locationUrl: "https://maps.google.com/?q=Genting+Highlands",
    tagline: "Up in the clouds with you ☁️",
    description: "Escaping the city heat and driving up the misty mountain roads to Genting Highlands. Walking together in the chilly breeze, sipping warm drinks, and holding you close to keep warm.",
    image: "", // Empty space for image upload
    placeholderType: "mountain",
    badge: "Second Date",
    pinned: false
  },
  {
    id: "mem-3",
    order: 3,
    title: "Our First Vacation: Food Paradise Penang 🍜🏖️",
    category: "Trip",
    categoryIcon: "✈️",
    date: "2024-07-15",
    displayDate: "Mid 2024",
    location: "George Town & Batu Ferringhi, Penang",
    locationUrl: "https://maps.google.com/?q=Penang+Malaysia",
    tagline: "Our first road trip & food hunting getaway 🌊",
    description: "Our very first holiday trip together as a couple! Exploring the charming street art of George Town, eating Char Kway Teow and Cendol until we were so full, and listening to the ocean waves at the beach together.",
    image: "", // Empty space for image upload
    placeholderType: "beach",
    badge: "First Trip Together",
    pinned: false
  },
  {
    id: "mem-4",
    order: 4,
    title: "Splash & Relax at Lost World of Tambun 💦🌴",
    category: "Trip",
    categoryIcon: "🌊",
    date: "2024-10-05",
    displayDate: "Late 2024",
    location: "Lost World of Tambun, Ipoh, Perak",
    locationUrl: "https://maps.google.com/?q=Lost+World+of+Tambun+Ipoh",
    tagline: "Hot springs, water park thrills & wild adventures 🦁",
    description: "Our second holiday trip! Sliding down water slides, soaking our worries away in the natural hot springs under the stars, feeding the adorable petting zoo animals, and eating delicious Ipoh chicken rice.",
    image: "", // Empty space for image upload
    placeholderType: "waterpark",
    badge: "Trip #2",
    pinned: false
  },
  {
    id: "mem-5",
    order: 5,
    title: "Magical Singapore & Universal Studios 🎢🇸🇬",
    category: "Trip",
    categoryIcon: "✨",
    date: "2025-02-14",
    displayDate: "Most Recent Trip",
    location: "Sentosa & Universal Studios, Singapore",
    locationUrl: "https://maps.google.com/?q=Universal+Studios+Singapore",
    tagline: "Screaming our hearts out on roller coasters & city lights 🎡",
    description: "Our most recent getaway! Walking hand in hand into Universal Studios Singapore, riding Battlestar Galactica and Transformers, laughing our heads off, and watching the dazzling Marina Bay skyline at night. So many more trips to come with you!",
    image: "", // Empty space for image upload
    placeholderType: "themepark",
    badge: "Latest Adventure",
    pinned: true
  }
];

// Sample default Daily Markdown entries for calendar starter
const DEFAULT_DAILY_MARKDOWNS = [
  {
    id: "daily-1",
    date: "2026-11-12",
    category: "Sport",
    categoryIcon: "🏸",
    activity: "Badminton Doubles",
    content: "We played 3 intense sets of badminton doubles tonight! 🏸\n- **Match 1**: 21 - 18\n- **Match 2**: 19 - 21\n- **Match 3**: 21 - 17\nSuper fun rally rallies and drenched in sweat together! 💪",
    image: "",
    loggedBy: "David & My Love",
    createdAt: Date.now()
  },
  {
    id: "daily-2",
    date: "2026-11-10",
    category: "Date",
    categoryIcon: "🍜",
    activity: "Dinner & Post-Workout Dessert",
    content: "Rewarded our active day with delicious beef noodles and matcha shaved ice 🍨. Talked for hours about our upcoming travel plans!",
    image: "",
    loggedBy: "David",
    createdAt: Date.now() - 172800000
  },
  {
    id: "daily-3",
    date: "2026-11-08",
    category: "Sport",
    categoryIcon: "🏃",
    activity: "Sunset Jog at Lake Park",
    content: "Ran a lovely 4.5km around the lakeside as the sky turned golden pink 🌅. Cooled down walking hand-in-hand.",
    image: "",
    loggedBy: "My Love",
    createdAt: Date.now() - 345600000
  }
];
