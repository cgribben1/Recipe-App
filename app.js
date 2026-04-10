const complexities = [
  { id: "lazy", label: "Lazy", score: 1, description: "Low effort, quick payoff" },
  { id: "balanced", label: "Balanced", score: 2, description: "A little more involved" },
  { id: "challenging", label: "Challenging", score: 3, description: "Technique forward" }
];

const diets = [
  { id: "any", label: "Anything", description: "Anything on the table" },
  { id: "pescatarian", label: "Pescatarian", description: "Fish, seafood, dairy, eggs" },
  { id: "vegetarian", label: "Vegetarian", description: "No meat or fish" },
  { id: "vegan", label: "Vegan", description: "Entirely plant-based" }
];

const dietPreferenceWeights = {
  any: {
    meat: 12,
    pescatarian: 8,
    vegetarian: 4,
    vegan: 0
  },
  pescatarian: {
    pescatarian: 10,
    vegetarian: 5,
    vegan: 0
  },
  vegetarian: {
    vegetarian: 8,
    vegan: 0
  },
  vegan: {
    vegan: 0
  }
};

const recipeBlueprints = window.RECIPE_CACHE_DATA || [];
const paletteLexicon = {
  cozy: ["comfort", "warm", "warming", "hearty", "soft"],
  fresh: ["bright", "clean", "light", "herby", "zesty", "green"],
  indulgent: ["rich", "creamy", "buttery", "luxurious", "decadent"],
  spicy: ["heat", "hot", "fiery", "gochujang", "chili"],
  healthy: ["light", "fresh", "greens", "clean", "vegetable"],
  noodles: ["udon", "ramen", "pasta"],
  seafood: ["fish", "prawn", "shrimp", "sea"]
};

const cuisineIntentLexicon = {
  british: ["british", "english", "irish", "scottish", "welsh"],
  french: ["french", "bistro", "bourguignon", "cassoulet", "marbella"],
  italian: ["italian", "roman", "sicilian", "tuscan", "bolognese"],
  spanish: ["spanish", "paella", "basque", "catalan"],
  greek: ["greek", "mediterranean", "moussaka", "spanakopita"],
  hungarian: ["hungarian", "goulash", "paprika"],
  mexican: ["mexican", "mole", "enchilada", "taco", "pibil"],
  caribbean: ["caribbean", "jamaican", "jerk", "oxtail"],
  indian: ["indian", "biryani", "curry", "masala", "kofta"],
  persian: ["persian", "saffron", "tahdig"],
  japanese: ["japanese", "ramen", "katsu", "udon"],
  korean: ["korean", "gochujang", "kimchi", "bulgogi"],
  thai: ["thai", "lemongrass", "red curry", "green curry"],
  chinese: ["chinese", "sichuan", "soy-braised", "char siu"],
  vietnamese: ["vietnamese", "pho", "nuoc", "lemongrass"],
  middleeastern: ["middle eastern", "levantine", "shawarma", "harissa"],
  northafrican: ["north african", "moroccan", "tagine", "harissa"]
};

const queryIntentLexicon = {
  onePot: {
    feature: "one-pot",
    strength: "hard",
    terms: ["one-pot", "one pot", "one-pan", "one pan", "single-pot", "single pot", "single-pan", "single pan"]
  },
  creamy: {
    feature: "creamy",
    strength: "strong",
    terms: ["creamy", "silky", "velvety"]
  },
  brothy: {
    feature: "brothy",
    strength: "strong",
    terms: ["brothy", "broth", "soupy", "broth-y"]
  },
  crispy: {
    feature: "crispy",
    strength: "strong",
    terms: ["crispy", "crisp", "crunchy"]
  },
  pasta: {
    feature: "pasta",
    strength: "strong",
    terms: ["pasta", "spaghetti", "linguine", "tagliatelle", "rigatoni", "penne", "conchiglie", "ravioli", "lasagne", "lasagna", "orzo", "agnolotti"]
  },
  rice: {
    feature: "rice",
    strength: "strong",
    terms: ["rice", "risotto", "biryani", "pilaf", "paella", "fried rice", "rice bowl"]
  },
  stew: {
    feature: "stew",
    strength: "strong",
    terms: ["stew", "stewy", "braise", "braised", "goulash", "ragu", "tagine", "cassoulet"]
  },
  soup: {
    feature: "soup",
    strength: "hard",
    terms: ["soup", "ramen", "bouillabaisse"]
  },
  salad: {
    feature: "salad",
    strength: "hard",
    terms: ["salad", "slaw"]
  },
  roast: {
    feature: "roast",
    strength: "strong",
    terms: ["roast", "roasted", "traybake", "sheet-pan", "sheet pan"]
  },
  spicy: {
    feature: "spicy",
    strength: "strong",
    terms: ["spicy", "fiery", "chili", "chilli", "gochujang", "harissa"]
  }
};

const promptSuggestionsByComplexity = {
  any: [
    "open to anything delicious",
    "surprise me with something good",
    "whatever fits the mood best",
    "chef's-choice supper",
    "something I wouldn't think to make",
    "the best match for tonight",
    "a dish worth craving",
    "something beautifully satisfying",
    "a strong dinner mood",
    "whatever the app thinks fits best",
    "something memorable but not random",
    "tonight could go in any direction",
    "the kind of thing I'd order out",
    "something cozy, bright, or rich",
    "something unexpected but right",
    "a dish with real character",
    "something that feels spot on",
    "the best possible fit",
    "something a little transportive"
  ],
  lazy: [
    "glossy noodles",
    "bright lemony dinner",
    "crisp vegetable-led plate",
    "brothy and soothing",
    "silky rice bowl",
    "something herby and green",
    "Japanese home-style dinner",
    "Thai weeknight energy",
    "crispy and salty",
    "tomatoey and cozy",
    "fresh but still comforting",
    "clean and high-protein",
    "creamy but not heavy",
    "15-minute comfort",
    "one-pan and cozy",
    "toast-for-dinner energy",
    "fast but still chic",
    "silky pantry pasta",
    "cozy bowl in under 20",
    "minimal washing up",
    "crispy fridge-clear-out dinner",
    "something brothy and quick",
    "easy but still elegant",
    "salty crunchy supper",
    "green and speedy",
    "lazy-night comfort",
    "golden things on toast",
    "smart pantry dinner",
    "soft eggs and something vivid",
    "weeknight instant gratification",
    "simple but restaurant-adjacent"
  ],
  balanced: [
    "cozy cold-weather comfort",
    "French bistro feeling",
    "Italian classic",
    "British comfort food",
    "Korean spicy comfort",
    "dinner-party worthy",
    "deeply savory",
    "a little luxurious",
    "something roast-y",
    "golden and crisp",
    "weekend-but-not-all-day",
    "slow-simmered feeling",
    "wine-bar kind of dinner",
    "brothy but substantial",
    "Sunday supper mood",
    "herby roast dinner vibe",
    "crispy-edged and glossy",
    "a little bit dinner-party",
    "slow-roasted but manageable",
    "proper pasta night",
    "layered flavour, not too much work",
    "something deeply savory and green",
    "modern newspaper-cooking energy",
    "roasty and elegant",
    "market-veg but comforting",
    "shallow bowl, glossy sauce",
    "autumn dinner with a little polish",
    "sharp herbs and mellow richness",
    "candlelit weeknight dinner",
    "weekend feeling without the project",
    "bistro supper at home"
  ],
  challenging: [
    "date-night project pasta",
    "classic French weekend cooking",
    "slow braise and red wine",
    "deep browning and pan sauce",
    "layered and luxurious",
    "restaurant-style comfort",
    "a proper cooking project",
    "silky sauce and real technique",
    "special-occasion Italian",
    "British roast-table energy",
    "broth worth lingering over",
    "golden crust and deep flavour",
    "all-afternoon kind of supper",
    "precision and payoff",
    "bistro main-course feeling",
    "theatrical dinner energy",
    "long simmer, big reward",
    "something with real technique",
    "slow and luxurious",
    "impressive-but-grounded cooking",
    "old-school culinary project",
    "deep sauce, proper finish",
    "restaurant main with home warmth",
    "rich weekend braise",
    "beautifully over-the-top supper",
    "serious pasta energy",
    "special-occasion roast",
    "classic done properly",
    "a little cheffy",
    "weekend stovetop ritual",
    "showstopper but savory"
  ]
};

const promptSuggestionsByDiet = {
  any: [
    "open to anything delicious",
    "chef's-choice supper",
    "surprise me with something good",
    "tonight could go any direction",
    "whatever fits the mood best"
  ],
  pescatarian: [
    "something briny and bright",
    "seafood but still comforting",
    "salmon or prawns energy",
    "light, glossy, and coastal",
    "fish-forward but cozy",
    "brothy seafood dinner"
  ],
  vegetarian: [
    "vegetable-led comfort",
    "cheesy but meat-free",
    "greens and carbs in harmony",
    "mushroomy and satisfying",
    "a proper vegetarian supper",
    "deeply savory without meat"
  ],
  vegan: [
    "plant-based but rich",
    "vegan comfort bowl",
    "bright vegetables and depth",
    "tofu or beans but elevated",
    "cozy and entirely plant-based",
    "silky vegan dinner"
  ]
};

const promptSuggestionsByComplexityAndDiet = {
  any: {
    any: [
      "best-in-class dinner regardless of style",
      "give me the strongest match full stop",
      "something broadly craveable and excellent"
    ],
    pescatarian: [
      "seafood-led but open-minded",
      "something coastal, glossy, or brothy",
      "fish or shellfish if that's the best fit"
    ],
    vegetarian: [
      "meat-free but not restrained",
      "vegetarian dinner with real presence",
      "vegetable-led and genuinely satisfying"
    ],
    vegan: [
      "plant-based but fully craveable",
      "vegan dinner with real depth and comfort",
      "something rich, green, or smoky and vegan"
    ]
  },
  lazy: {
    any: [
      "whatever is fastest and tastiest",
      "lazy-night comfort without rules"
    ],
    pescatarian: [
      "quick salmon or prawn supper",
      "easy seafood bowl energy"
    ],
    vegetarian: [
      "fast meat-free comfort",
      "quick cheesy vegetarian dinner"
    ],
    vegan: [
      "easy vegan bowl situation",
      "plant-based and pantry-friendly"
    ]
  },
  balanced: {
    any: [
      "well-rounded dinner with some polish",
      "something considered but flexible"
    ],
    pescatarian: [
      "restaurant-ish fish supper",
      "seafood dinner with a bit of elegance"
    ],
    vegetarian: [
      "vegetarian dinner-party energy",
      "meat-free but still a proper main"
    ],
    vegan: [
      "polished vegan comfort",
      "plant-based with real depth",
      "mushroomy, glossy, and quietly elegant",
      "a balanced vegan supper with real structure",
      "deep flavor without feeling heavy"
    ]
  },
  challenging: {
    any: [
      "special-occasion cooking of any kind",
      "a proper weekend project"
    ],
    pescatarian: [
      "showpiece seafood cooking",
      "something brothy, briny, and impressive"
    ],
    vegetarian: [
      "a serious vegetarian centrepiece",
      "meat-free with restaurant ambition"
    ],
    vegan: [
      "ambitious vegan cooking",
      "plant-based but dinner-party worthy"
    ]
  }
};

const forbiddenSuggestionTermsByDiet = {
  any: [],
  pescatarian: ["chicken", "beef", "lamb", "goat", "pork", "sausage", "bacon", "meat", "roast chicken"],
  vegetarian: ["chicken", "beef", "lamb", "goat", "pork", "sausage", "bacon", "meat", "fish", "seafood", "salmon", "prawn", "prawns", "shrimp", "mussel", "mussels", "clam", "clams", "roast chicken", "skin", "skinned"],
  vegan: ["chicken", "beef", "lamb", "goat", "pork", "sausage", "bacon", "meat", "fish", "seafood", "salmon", "prawn", "prawns", "shrimp", "mussel", "mussels", "clam", "clams", "cheesy", "cheese", "buttery", "cream", "creamy", "egg", "eggs", "yogurt", "yoghurt", "roast chicken", "skin", "skinned"]
};

const suggestionNoiseWords = new Set([
  "a", "an", "and", "at", "bit", "but", "by", "dinner", "energy", "feeling", "flavour",
  "for", "from", "home", "kind", "little", "mood", "night", "not", "of", "or", "proper",
  "really", "something", "still", "style", "supper", "the", "vibe", "worthy", "without"
]);

const suggestionClusters = [
  { id: "comfort", label: "Cozy", match: ["cozy", "comfort", "warming", "brothy", "soothing", "hearty", "simmered", "cold-weather"] },
  { id: "bright", label: "Bright", match: ["bright", "lemon", "fresh", "green", "herby", "clean", "light", "zesty"] },
  { id: "rich", label: "Rich", match: ["rich", "luxurious", "glossy", "creamy", "indulgent", "silky", "golden"] },
  { id: "spicy", label: "Bold", match: ["spicy", "fiery", "gochujang", "chili", "heat", "korean", "harissa"] },
  { id: "classic", label: "Classic", match: ["french", "italian", "british", "bistro", "proper", "classic", "roast"] },
  { id: "veg", label: "Green", match: ["vegetable", "veg", "market", "tofu", "beans", "plant-based", "mushroom"] },
  { id: "project", label: "Project", match: ["project", "dinner-party", "weekend", "special-occasion", "technique", "showstopper"] },
  { id: "playful", label: "Wildcard", match: [] }
];

const exploreIslandBlueprints = [
  {
    id: "cozy-european",
    label: "Cozy Classics",
    vibe: "bistro comfort, braises, roasty things, deep savoury warmth",
    targetCount: 13,
    include: ["french", "italian", "british", "braise", "stew", "roast", "comfort", "cozy", "bistro", "pie", "gratin", "bourguignon", "ragu"],
    exclude: ["vegan", "tofu", "tempeh", "poke", "caesar wrap"]
  },
  {
    id: "glossy-noodles-rice",
    label: "Glossy Bowls",
    vibe: "slick noodles, rice bowls, quick sauces, weeknight payoff",
    targetCount: 13,
    include: ["noodle", "udon", "ramen", "rice bowl", "fried rice", "gochujang", "soy", "sesame", "sticky", "miso", "kimchi"],
    exclude: ["stew", "pie", "soup", "salad", "tart"]
  },
  {
    id: "green-bright",
    label: "Bright & Green",
    vibe: "herby, lemony, fresh, clean, vegetable-led but still desirable",
    targetCount: 13,
    include: ["green", "herb", "herby", "lemon", "bright", "fresh", "spring", "pea", "broccoli", "asparagus", "salad", "vegetable"],
    exclude: ["braise", "bourguignon", "pot roast", "carbonara"]
  },
  {
    id: "tomato-pasta",
    label: "Pasta Night",
    vibe: "proper pasta, red sauce, creamy sauce, glossy bowls of comfort",
    targetCount: 13,
    include: ["pasta", "rigatoni", "spaghetti", "linguine", "tagliatelle", "penne", "gnocchi", "vodka", "bolognese", "carbonara", "tomato", "ricotta"],
    exclude: ["soup", "salad", "flatbread", "toast"]
  },
  {
    id: "spice-market",
    label: "Spice Market",
    vibe: "harissa, shawarma, curry, chile heat, warm spice, bold comfort",
    targetCount: 13,
    include: ["harissa", "shawarma", "curry", "turmeric", "spiced", "berbere", "tikka", "jollof", "chickpea stew", "goat", "kofta"],
    exclude: ["gazpacho", "bruschetta", "carbonara"]
  },
  {
    id: "sea-coast",
    label: "From the Sea",
    vibe: "fish, prawns, mussels, briny pasta, glossy seafood comfort",
    targetCount: 13,
    include: ["salmon", "cod", "sea bass", "prawn", "shrimp", "mussel", "clam", "seafood", "fish", "tuna", "mackerel"],
    exclude: ["vegetarian", "vegan", "tofu", "bean stew"]
  },
  {
    id: "vegetarian-comfort",
    label: "Vegetarian Comfort",
    vibe: "cheesy, mushroomy, deeply savoury meat-free mains",
    targetCount: 12,
    include: ["vegetarian", "halloumi", "paneer", "ricotta", "burrata", "feta", "mushroom", "cheese", "gruyere", "goat cheese", "leek"],
    exclude: ["prawn", "shrimp", "chicken", "beef", "lamb", "pork", "vegan"]
  },
  {
    id: "plant-rich",
    label: "Plant-Rich",
    vibe: "vegan dishes with richness, texture, depth, beans, tofu, aubergine",
    targetCount: 12,
    include: ["vegan", "tofu", "tempeh", "lentil", "chickpea", "aubergine", "cauliflower", "butter bean", "beans", "plant-based", "mushroom"],
    exclude: ["feta", "ricotta", "burrata", "halloumi", "paneer", "salmon", "chicken", "beef", "lamb", "pork"]
  },
  {
    id: "weekend-showpiece",
    label: "Weekend Table",
    vibe: "the sort of thing you make when dinner matters a bit more",
    targetCount: 12,
    include: ["challenging", "project", "special", "weekend", "dinner-party", "showstopper", "slow", "roast", "coq au vin", "ramen", "risotto"],
    exclude: ["15-minute", "toast", "wrap", "cup"]
  },
  {
    id: "golden-crispy",
    label: "Golden & Crisp",
    vibe: "crispy things, cutlets, schnitzels, roast potatoes, hot-pan satisfaction",
    targetCount: 12,
    include: ["crispy", "golden", "cutlet", "schnitzel", "crisp", "fried", "roast potato", "breaded", "caesar", "hot honey"],
    exclude: ["soup", "broth", "gazpacho", "salad bowl"]
  },
  {
    id: "broths-stews",
    label: "Broths & Pots",
    vibe: "soups, stews, brothy bowls, things you eat with a spoon",
    targetCount: 12,
    include: ["soup", "stew", "broth", "brothy", "chili", "curry soup", "ramen", "lentil soup", "bean stew", "dumpling soup"],
    exclude: ["bruschetta", "flatbread", "pasta bake"]
  },
  {
    id: "sunny-mediterranean",
    label: "Sunny Mediterranean",
    vibe: "tomatoes, peppers, olives, herbs, feta, lemon, white-wine brightness",
    targetCount: 12,
    include: ["mediterranean", "tomato", "olive", "pepper", "feta", "lemon", "bruschetta", "shawarma", "sardine", "sea bass", "caper"],
    exclude: ["bourguignon", "ramen", "gochujang", "carbonara"]
  }
];

const state = {
  selectedComplexity: "balanced",
  selectedDiet: "any",
  vibe: "",
  promptTypingTimer: null,
  exploreProjection: null,
  recipeSwipePointerId: null,
  recipeSwipeStartX: 0,
  recipeSwipeStartY: 0,
  recipeSwipeDeltaX: 0,
  recipeSwipeTracking: false,
  exploreZoom: 1,
  exploreDragging: false,
  exploreDragStartX: 0,
  exploreDragStartY: 0,
  exploreScrollStartLeft: 0,
  exploreScrollStartTop: 0,
  recipes: [],
  rankedRecipes: [],
  currentCardIndex: 0,
  recipeNavDirection: 1,
  savedRecipeIds: loadSavedRecipes(),
  shoppingSelections: loadShoppingSelections(),
  cookRecipe: null,
  cookStepIndex: 0,
  cookStepDirection: 1,
  cookAnimating: false,
  alterRecipeId: null,
  alterPending: false
};

const elements = {
  appShell: document.querySelector(".app-shell"),
  screens: [...document.querySelectorAll(".screen")],
  complexityButtons: document.getElementById("complexityButtons"),
  dietButtons: document.getElementById("dietButtons"),
  vibeInput: document.getElementById("vibeInput"),
  promptSuggestionsTop: document.getElementById("promptSuggestionsTop"),
  promptSuggestionsBottom: document.getElementById("promptSuggestionsBottom"),
  generateButton: document.getElementById("generateButton"),
  exploreBackButton: document.getElementById("exploreBackButton"),
  exploreVisionGrid: document.getElementById("exploreVisionGrid"),
  exploreVisionSummary: document.getElementById("exploreVisionSummary"),
  exploreZoomInButton: document.getElementById("exploreZoomInButton"),
  exploreZoomOutButton: document.getElementById("exploreZoomOutButton"),
  exploreZoomResetButton: document.getElementById("exploreZoomResetButton"),
  resultsHeading: document.getElementById("resultsHeading"),
  resultsHomeButton: document.getElementById("resultsHomeButton"),
  recipeDeck: document.getElementById("recipeDeck"),
  recipeDots: document.getElementById("recipeDots"),
  previousRecipeButton: document.getElementById("previousRecipeButton"),
  nextRecipeButton: document.getElementById("nextRecipeButton"),
  detailModal: document.getElementById("detailModal"),
  detailContent: document.getElementById("detailContent"),
  shoppingModal: document.getElementById("shoppingModal"),
  shoppingContent: document.getElementById("shoppingContent"),
  savedModal: document.getElementById("savedModal"),
  savedContent: document.getElementById("savedContent"),
  alterModal: document.getElementById("alterModal"),
  alterRecipeHeading: document.getElementById("alterRecipeHeading"),
  alterRequestInput: document.getElementById("alterRequestInput"),
  alterSuggestionRail: document.getElementById("alterSuggestionRail"),
  alterLoader: document.getElementById("alterLoader"),
  alterStatus: document.getElementById("alterStatus"),
  submitAlterButton: document.getElementById("submitAlterButton"),
  cookIngredientsList: document.getElementById("cookIngredientsList"),
  cookRecipeTitle: document.getElementById("cookRecipeTitle"),
  cookTrack: document.getElementById("cookTrack"),
  cookPreviousButton: document.getElementById("cookPreviousButton"),
  cookNextButton: document.getElementById("cookNextButton"),
  finishSaveButton: document.getElementById("finishSaveButton"),
  finishBackButton: document.getElementById("finishBackButton"),
  cookFullscreenButton: document.getElementById("cookFullscreenButton")
};

initialize();

function initialize() {
  state.recipes = buildRecipeCache();
  state.exploreProjection = buildExploreProjection(state.recipes);
  renderComplexityButtons();
  renderDietButtons();
  renderPromptSuggestions();
  renderExploreVision();
  attachEventListeners();
  startPromptPlaceholderRotation();
}

function getActivePromptSuggestions() {
  const complexityKey = state.selectedComplexity in promptSuggestionsByComplexity ? state.selectedComplexity : "balanced";
  const diet = state.selectedDiet in promptSuggestionsByDiet ? state.selectedDiet : "any";
  const combined = [
    ...(promptSuggestionsByComplexity[complexityKey] || []),
    ...(promptSuggestionsByDiet[diet] || []),
    ...((promptSuggestionsByComplexityAndDiet[complexityKey] || {})[diet] || [])
  ];
  const forbiddenTerms = forbiddenSuggestionTermsByDiet[diet] || [];
  const sanitized = [...new Set(combined)].filter((suggestion) => {
    const lower = suggestion.toLowerCase();
    return !forbiddenTerms.some((term) => lower.includes(term));
  });
  const supported = filterPromptSuggestionsByCurrentPool(sanitized);
  return supported.length ? supported : sanitized;
}

function getSuggestionCandidateRecipes() {
  const dietConstrained = constrainRecipesByDiet(state.recipes, state.selectedDiet);
  return constrainRecipesByComplexity(dietConstrained, state.selectedComplexity);
}

function getSuggestionKeywordTokens(suggestion) {
  return expandTokens(tokenize(suggestion)).filter((token) => !suggestionNoiseWords.has(token));
}

function filterPromptSuggestionsByCurrentPool(suggestions) {
  const candidates = getSuggestionCandidateRecipes();
  if (!candidates.length) return suggestions;

  return suggestions.filter((suggestion) => {
    const queryTokens = getSuggestionKeywordTokens(suggestion);
    if (!queryTokens.length) return true;

    const minimumOverlap = queryTokens.length >= 3 ? 2 : 1;
    const bestOverlap = candidates.reduce((highest, recipe) => {
      const recipeTokens = new Set(tokenize([
        recipe.title,
        recipe.summary,
        recipe.cuisine,
        recipe.moodTags.join(" "),
        (recipe.searchFeatures || []).join(" "),
        recipe.ingredients.join(" ")
      ].join(" ")));
      const overlap = queryTokens.reduce((count, token) => count + (recipeTokens.has(token) ? 1 : 0), 0);
      return Math.max(highest, overlap);
    }, 0);

    return bestOverlap >= minimumOverlap;
  });
}

function buildRecipeCache() {
  return recipeBlueprints.map((recipe) => ({
    ...normalizeComplexity(recipe),
    diet: recipe.diet || inferRecipeDiet(recipe),
    searchFeatures: recipe.searchFeatures || inferRecipeSearchFeatures(recipe),
    id: recipe.id || slugify(recipe.title),
    title: recipe.title,
    cuisine: recipe.cuisine,
    summary: recipe.summary,
    moodTags: recipe.moodTags || [],
    ingredients: recipe.ingredients || [],
    shoppingList: recipe.shoppingList || recipe.ingredients || [],
    steps: recipe.steps || [],
    servings: recipe.servings ?? 2,
    prepTime: recipe.prepTime ?? 15,
    cookTime: recipe.cookTime ?? 25,
    estimatedCalories: recipe.estimatedCalories ?? 600,
    alterationSuggestions: buildRecipeAlterationSuggestions(recipe),
    altered: Boolean(recipe.altered),
    thumbnail: recipe.thumbnail || getRecipeThumbnailPath(recipe.id || slugify(recipe.title)),
    thumbnailPrompt: recipe.thumbnailPrompt || "",
    embedding: window.RECIPE_EMBEDDINGS?.vectors?.[recipe.id || slugify(recipe.title)] || null
  }));
}

function getRecipeThumbnailPath(recipeId) {
  return `./assets/thumbnails/${recipeId}.png`;
}

function getThumbnailFallbackAttribute() {
  return "this.onerror=null;this.src='./assets/thumbnails/recipe-placeholder.svg';";
}

function resolveApiUrl(path) {
  if (window.location.protocol === "file:") {
    return `http://127.0.0.1:8000${path}`;
  }
  return path;
}

function normalizeComplexity(recipe) {
  const raw = (recipe.complexity || "").toLowerCase();
  const baseComplexity = raw === "lazy" || raw === "easy"
    ? "lazy"
    : raw === "medium"
      ? "balanced"
    : raw === "challenging" || raw === "project"
      ? "challenging"
      : raw === "hard"
      ? "challenging"
      : "balanced";

  return {
    complexity: baseComplexity,
    complexityLabel: baseComplexity === "lazy"
      ? "Lazy"
      : baseComplexity === "challenging"
        ? "Challenging"
        : "Balanced"
  };
}

function inferRecipeDiet(recipe) {
  const haystack = [
    recipe.title || "",
    recipe.summary || "",
    recipe.cuisine || "",
    ...(recipe.moodTags || []),
    ...(recipe.ingredients || []),
    ...(recipe.steps || [])
  ]
    .join(" ")
    .toLowerCase();

  const veganSignals = [
    "vegan",
    "tofu",
    "tempeh",
    "beans",
    "bean ",
    "lentil",
    "lentils",
    "chickpea",
    "chickpeas",
    "aubergine",
    "cauliflower"
  ];
  const meatSignals = [
    "chicken",
    "beef",
    "lamb",
    "goat",
    "pork",
    "sausage",
    "bacon",
    "pancetta",
    "guanciale",
    "prosciutto",
    "ham",
    "turkey",
    "duck",
    "veal",
    "steak",
    "meatball",
    "meatballs",
    "meatloaf",
    "chorizo"
  ];
  const seafoodSignals = [
    "fish",
    "cod",
    "salmon",
    "trout",
    "sole",
    "haddock",
    "tuna",
    "clam",
    "clams",
    "mussel",
    "mussels",
    "shrimp",
    "prawn",
    "prawns",
    "anchovy",
    "anchovies",
    "oyster sauce",
    "fish sauce"
  ];
  const nonVeganSignals = [
    ...meatSignals,
    ...seafoodSignals,
    "gelatin",
    "egg",
    "eggs",
    "milk",
    "butter",
    "cream",
    "cheese",
    "parmesan",
    "pecorino",
    "gruyere",
    "comte",
    "yogurt",
    "yoghurt",
    "ricotta",
    "burrata",
    "feta",
    "mozzarella",
    "creme fraiche",
    "crème fraîche",
    "double cream"
  ];
  const vegetarianOnlySignals = [
    "egg",
    "eggs",
    "milk",
    "butter",
    "cream",
    "cheese",
    "parmesan",
    "pecorino",
    "gruyere",
    "comte",
    "yogurt",
    "yoghurt",
    "ricotta",
    "burrata",
    "feta",
    "mozzarella",
    "creme fraiche",
    "crème fraîche",
    "double cream",
    "paneer",
    "halloumi",
    "egg yolk",
    "egg yolks",
    "honey"
  ];

  if (meatSignals.some((signal) => haystack.includes(signal))) {
    return "meat";
  }

  if (seafoodSignals.some((signal) => haystack.includes(signal))) {
    return "pescatarian";
  }

  if (nonVeganSignals.some((signal) => haystack.includes(signal))) {
    return "vegetarian";
  }

  if ((recipe.moodTags || []).some((tag) => String(tag).toLowerCase() === "vegan")) return "vegan";
  if (veganSignals.some((signal) => haystack.includes(signal)) && !vegetarianOnlySignals.some((signal) => haystack.includes(signal))) {
  return "vegan";
}

function inferRecipeSearchFeatures(recipe) {
  const haystack = [
    recipe.title || "",
    recipe.summary || "",
    recipe.cuisine || "",
    ...(recipe.moodTags || []),
    ...(recipe.ingredients || []),
    ...(recipe.steps || [])
  ].join(" ").toLowerCase();

  const features = new Set();

  if (/(one-pot|one pot|one-pan|one pan|single pot|single-pan|skillet|traybake|sheet-pan|sheet pan)/.test(haystack)) {
    features.add("one-pot");
  }
  if (/(creamy|cream|silky|velvety|béchamel|bechamel|mascarpone|ricotta|burrata|parmesan cream|vodka sauce)/.test(haystack)) {
    features.add("creamy");
  }
  if (/(broth|brothy|soup|stew|bouillabaisse|ramen|moilee)/.test(haystack)) {
    features.add("brothy");
  }
  if (/(crispy|crisp|crunchy|fried|golden|katsu|crumb)/.test(haystack)) {
    features.add("crispy");
  }
  if (/(pasta|spaghetti|linguine|tagliatelle|rigatoni|penne|conchiglie|ravioli|lasagne|lasagna|orzo|agnolotti|macaroni)/.test(haystack)) {
    features.add("pasta");
  }
  if (/(rice|risotto|biryani|pilaf|paella|fried rice|rice bowl|jollof)/.test(haystack)) {
    features.add("rice");
  }
  if (/(stew|braise|braised|goulash|ragu|tagine|cassoulet|bourguignon)/.test(haystack)) {
    features.add("stew");
  }
  if (/(soup|broth|bouillabaisse|ramen)/.test(haystack)) {
    features.add("soup");
  }
  if (/(salad|slaw|niçoise|nicoise|caesar)/.test(haystack)) {
    features.add("salad");
  }
  if (/(roast|roasted|traybake|sheet-pan|sheet pan|wellington|pithivier|baked)/.test(haystack)) {
    features.add("roast");
  }
  if (/(spicy|fiery|chili|chilli|gochujang|harissa|red curry|green curry|peppery)/.test(haystack)) {
    features.add("spicy");
  }

  return [...features];
}

  return "vegetarian";
}

function buildRecipeAlterationSuggestions(recipe) {
  const cuisine = (recipe.cuisine || "").toLowerCase();
  const tags = recipe.moodTags || [];
  const suggestions = new Set();

  if (recipe.title.toLowerCase().includes("bread sauce")) {
    suggestions.add("Replace the bread sauce with a glossy chicken gravy.");
  }

  if (tags.includes("seafood")) {
    suggestions.add("Make it a little brighter with lemon, herbs, and capers.");
    suggestions.add("Give it a gentle Asian-fusion edge with ginger, scallions, and sesame.");
  }

  if (tags.includes("pasta") || cuisine.includes("italian")) {
    suggestions.add("Make it a little spicier and more weeknight-fast.");
    suggestions.add("Add more greens and a sharper lemon finish.");
  }

  if (cuisine.includes("french") || cuisine.includes("bistro")) {
    suggestions.add("Make it more bistro-like with a pan sauce or deeper winey notes.");
    suggestions.add("Lighten it a touch with more herbs and less cream.");
  }

  if (cuisine.includes("british")) {
    suggestions.add("Swap in a richer gravy and make it feel more pub-style.");
    suggestions.add("Make it a little more modern and lighter while keeping the comfort-food feel.");
  }

  if (cuisine.includes("japanese") || cuisine.includes("korean") || cuisine.includes("thai") || cuisine.includes("asian")) {
    suggestions.add("Make it a little punchier with more chili, acid, and herbs.");
    suggestions.add("Tone the heat down and make it gentler and more brothy.");
  }

  if (tags.includes("vegetarian")) {
    suggestions.add("Add more texture and protein while keeping it vegetarian.");
  }

  if (tags.includes("comfort") || tags.includes("cozy")) {
    suggestions.add("Make it feel a bit fresher and lighter without losing the comfort.");
  }

  if (recipe.complexity === "challenging") {
    suggestions.add("Simplify it into a more weeknight-friendly version.");
  } else if (recipe.complexity === "lazy") {
    suggestions.add("Make it a little more dinner-party worthy.");
  }

  suggestions.add("Add a subtle Asian-fusion element.");
  suggestions.add("Make it brighter and more lemony.");

  return [...suggestions].slice(0, 6);
}

function getComplexityScore(complexityId) {
  return complexities.find((item) => item.id === complexityId)?.score ?? 1;
}

function renderComplexityButtons() {
  elements.complexityButtons.innerHTML = complexities
    .map(
      (complexity) => `
        <button class="complexity-chip ${complexity.id === state.selectedComplexity ? "active" : ""}" data-complexity="${complexity.id}">
          <strong>${complexity.label}</strong>
          <span>${complexity.description}</span>
        </button>
      `
    )
    .join("");
}

function renderDietButtons() {
  elements.dietButtons.innerHTML = diets
    .map(
      (diet) => `
        <button class="complexity-chip ${diet.id === state.selectedDiet ? "active" : ""}" data-diet="${diet.id}">
          <strong>${diet.label}</strong><br>
          <span>${diet.description}</span>
        </button>
      `
    )
    .join("");
}

function attachEventListeners() {
  elements.complexityButtons.addEventListener("click", (event) => {
    const button = event.target.closest("[data-complexity]");
    if (!button) return;
    state.selectedComplexity = button.dataset.complexity;
    renderComplexityButtons();
    renderPromptSuggestions();
    if (getActiveScreen() === "explore") renderExploreVision();
  });

  elements.dietButtons.addEventListener("click", (event) => {
    const button = event.target.closest("[data-diet]");
    if (!button) return;
    state.selectedDiet = button.dataset.diet;
    renderDietButtons();
    renderPromptSuggestions();
    if (getActiveScreen() === "explore") renderExploreVision();
  });

  elements.generateButton.addEventListener("click", runRecipeSearch);
  elements.exploreBackButton?.addEventListener("click", () => showScreen("landing"));
  elements.exploreZoomInButton?.addEventListener("click", () => setExploreZoom(state.exploreZoom + 0.18));
  elements.exploreZoomOutButton?.addEventListener("click", () => setExploreZoom(state.exploreZoom - 0.18));
  elements.exploreZoomResetButton?.addEventListener("click", () => setExploreZoom(1));
  elements.resultsHomeButton.addEventListener("click", () => showScreen("landing"));
  elements.submitAlterButton.addEventListener("click", submitRecipeAlteration);
  elements.previousRecipeButton.addEventListener("click", () => moveRecipeIndex(-1));
  elements.nextRecipeButton.addEventListener("click", () => moveRecipeIndex(1));
  elements.cookPreviousButton.addEventListener("click", retreatCookStep);
  elements.cookNextButton.addEventListener("click", advanceCookStep);
  elements.cookFullscreenButton?.addEventListener("click", toggleCookFullscreen);
  elements.finishSaveButton.addEventListener("click", () => {
    if (!state.cookRecipe) return;
    toggleSaveRecipe(state.cookRecipe.id);
    showScreen("results");
    renderRecipeDeck();
  });
  elements.finishBackButton.addEventListener("click", () => {
    showScreen("results");
    renderRecipeDeck();
  });

  document.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]");
    if (action) handleAction(action.dataset.action, action.dataset.recipeId);

    const focusIsland = event.target.closest("[data-focus-island]");
    if (focusIsland) {
      focusExploreIsland(Number(focusIsland.dataset.focusIsland));
      return;
    }

    const screenNav = event.target.closest("[data-nav-screen]");
    if (screenNav) {
      showScreen(screenNav.dataset.navScreen);
      if (screenNav.dataset.navScreen === "explore") {
        renderExploreVision();
        window.setTimeout(centerExploreViewport, 0);
      }
    }

    const suggestion = event.target.closest("[data-prompt-suggestion]");
      if (suggestion) {
        animatePromptIntoInput(suggestion.dataset.promptSuggestion);
      }

    const alterSuggestion = event.target.closest("[data-alter-suggestion]");
    if (alterSuggestion) {
      elements.alterRequestInput.value = alterSuggestion.dataset.alterSuggestion;
      elements.alterRequestInput.focus();
      elements.alterRequestInput.setSelectionRange(elements.alterRequestInput.value.length, elements.alterRequestInput.value.length);
    }

    const dot = event.target.closest("[data-dot-index]");
    if (dot) {
      state.currentCardIndex = Number(dot.dataset.dotIndex);
      renderRecipeDeck();
    }

      const closeModal = event.target.closest("[data-close-modal]");
    if (closeModal) document.getElementById(closeModal.dataset.closeModal).classList.add("hidden");
    if (event.target.classList.contains("modal-backdrop")) event.target.classList.add("hidden");
  });

  document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
      }

    if (getActiveScreen() === "cook" && event.key === "Escape") {
      showScreen("results");
      return;
    }

    if (getActiveScreen() === "finish" && (event.key === "Escape" || event.key === "Enter" || event.key === " ")) {
      showScreen("results");
      return;
    }

    if (getActiveScreen() === "landing" && event.key === "Enter" && !event.shiftKey) {
      if (document.activeElement === elements.vibeInput) {
        event.preventDefault();
      }
      runRecipeSearch();
      return;
    }

    if (getActiveScreen() !== "results") return;
    if (event.key === "ArrowLeft") moveRecipeIndex(-1);
    if (event.key === "ArrowRight") moveRecipeIndex(1);
  });

  document.addEventListener("fullscreenchange", updateCookFullscreenButton);

  const exploreFrame = elements.exploreVisionGrid?.parentElement;
  exploreFrame?.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".explore-vision-tile")) return;
    state.exploreDragging = true;
    state.exploreDragStartX = event.clientX;
    state.exploreDragStartY = event.clientY;
    state.exploreScrollStartLeft = exploreFrame.scrollLeft;
    state.exploreScrollStartTop = exploreFrame.scrollTop;
    exploreFrame.classList.add("explore-dragging");
  });

  document.addEventListener("pointermove", (event) => {
    if (!state.exploreDragging || !exploreFrame) return;
    exploreFrame.scrollLeft = state.exploreScrollStartLeft - (event.clientX - state.exploreDragStartX);
    exploreFrame.scrollTop = state.exploreScrollStartTop - (event.clientY - state.exploreDragStartY);
  });

  document.addEventListener("pointerup", () => {
    state.exploreDragging = false;
    exploreFrame?.classList.remove("explore-dragging");
  });

  exploreFrame?.addEventListener("wheel", (event) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    setExploreZoom(state.exploreZoom + (event.deltaY < 0 ? 0.12 : -0.12));
  }, { passive: false });

  elements.recipeDeck?.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
    if (event.target.closest("button, a, input, textarea, label")) return;
    if (getActiveScreen() !== "results") return;
    state.recipeSwipePointerId = event.pointerId;
    state.recipeSwipeStartX = event.clientX;
    state.recipeSwipeStartY = event.clientY;
    state.recipeSwipeDeltaX = 0;
    state.recipeSwipeTracking = true;
  });

  elements.recipeDeck?.addEventListener("pointermove", (event) => {
    if (!state.recipeSwipeTracking || event.pointerId !== state.recipeSwipePointerId) return;
    const deltaX = event.clientX - state.recipeSwipeStartX;
    const deltaY = event.clientY - state.recipeSwipeStartY;
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 18) {
      resetRecipeSwipeState();
      return;
    }
    state.recipeSwipeDeltaX = deltaX;
    const card = elements.recipeDeck.querySelector(".recipe-card");
    if (!card) return;
    card.classList.add("recipe-card-dragging");
    card.style.transform = `translateX(${deltaX}px)`;
    card.style.opacity = `${clamp(1 - (Math.abs(deltaX) / 900), 0.9, 1)}`;
  });

  const finishRecipeSwipe = (event) => {
    if (!state.recipeSwipeTracking || event.pointerId !== state.recipeSwipePointerId) return;
    const deltaX = state.recipeSwipeDeltaX;
    const shouldSwipe = Math.abs(deltaX) > 72;
    const card = elements.recipeDeck.querySelector(".recipe-card");
    if (card) {
      card.classList.remove("recipe-card-dragging");
      card.style.transform = "";
      card.style.opacity = "";
    }
    resetRecipeSwipeState();
    if (shouldSwipe) {
      moveRecipeIndex(deltaX < 0 ? 1 : -1);
    }
  };

  elements.recipeDeck?.addEventListener("pointerup", finishRecipeSwipe);
  elements.recipeDeck?.addEventListener("pointercancel", finishRecipeSwipe);
}

function renderPromptSuggestions() {
  if (!elements.promptSuggestionsTop || !elements.promptSuggestionsBottom) return;
  const promptSuggestions = getActivePromptSuggestions();
  const startIndex = Math.floor(Math.random() * Math.max(promptSuggestions.length, 1));
  const orderedSuggestions = [...promptSuggestions.slice(startIndex), ...promptSuggestions.slice(0, startIndex)];
  const firstRow = buildStableSuggestionRow(orderedSuggestions.filter((_, index) => index % 2 === 0));
  const secondRow = buildStableSuggestionRow(orderedSuggestions.filter((_, index) => index % 2 === 1));
  const renderRow = (suggestions, directionClass) => {
    const markup = suggestions
      .map(
        (suggestion) => `<button class="prompt-suggestion-chip" data-prompt-suggestion="${suggestion}" aria-label="Use suggestion ${suggestion}" type="button">${suggestion}</button>`
      )
      .join("");
    return `
      <div class="treadmill-row ${directionClass}">
        <div class="treadmill-rail">
          <div class="treadmill-track">${markup}</div>
          <div class="treadmill-track" aria-hidden="true">${markup}</div>
        </div>
      </div>
    `;
  };

  elements.promptSuggestionsTop.innerHTML = renderRow(firstRow.length ? firstRow : orderedSuggestions, "treadmill-left");
  elements.promptSuggestionsBottom.innerHTML = renderRow(secondRow.length ? secondRow : orderedSuggestions, "treadmill-right");
}

function buildStableSuggestionRow(suggestions) {
  const base = suggestions.filter(Boolean);
  if (!base.length) return [];

  const minItems = 16;
  const targetChars = 360;
  const expanded = [];
  let charCount = 0;
  let index = 0;

  while (expanded.length < minItems || charCount < targetChars) {
    const suggestion = base[index % base.length];
    expanded.push(suggestion);
    charCount += suggestion.length;
    index += 1;
    if (base.length === 1 && expanded.length >= minItems && charCount >= targetChars) break;
  }

  return expanded;
}

function startPromptPlaceholderRotation() {
  elements.vibeInput.placeholder = "Enter any vibe you have in mind...";
}

function renderExploreVision() {
  if (!elements.exploreVisionGrid) return;
  const recipes = pickExploreRecipes(state.recipes);
  const projectionById = state.exploreProjection || {};
  const complexityMatchScore = new Map(
    recipes.map((recipe) => {
      const requestedScore = getComplexityScore(state.selectedComplexity);
      const recipeScore = getComplexityScore(recipe.complexity);
      return [recipe.id, Math.abs(recipeScore - requestedScore)];
    })
  );

  if (elements.exploreVisionSummary) {
    const complexityLabel = complexities.find((item) => item.id === state.selectedComplexity)?.label || "Balanced";
    const dietLabel = diets.find((item) => item.id === state.selectedDiet)?.label || "Anything";
    elements.exploreVisionSummary.textContent = `${recipes.length} dishes · ${complexityLabel} · ${dietLabel}`;
  }

  elements.exploreVisionGrid.innerHTML = recipes
    .map((recipe) => {
      const point = projectionById[recipe.id] || { x: 0.5, y: 0.5 };
      const difference = complexityMatchScore.get(recipe.id) ?? 0;
      const size = difference === 0 ? 84 : difference === 1 ? 72 : 64;
      const tilt = hashToRange(recipe.id, -3.5, 3.5);
      const zIndex = Math.round(100 + ((1 - point.y) * 40) + (difference === 0 ? 12 : 0));
      return `
      <button
        class="explore-vision-tile"
        type="button"
        data-action="details"
        data-recipe-id="${recipe.id}"
        aria-label="View ${escapeHtml(recipe.title)}"
        title="${escapeHtml(recipe.title)}"
        style="left:${(point.x * 100).toFixed(2)}%;top:${(point.y * 100).toFixed(2)}%;width:${size}px;height:${size}px;transform:translate(-50%,-50%) rotate(${tilt.toFixed(2)}deg);z-index:${zIndex};"
      >
        <img
          class="explore-vision-thumb"
          src="${recipe.thumbnail}"
          alt="${escapeHtml(recipe.title)}"
          onerror="${getThumbnailFallbackAttribute()}"
        />
        <span class="explore-vision-overlay">
          <span class="explore-vision-title">${escapeHtml(recipe.title)}</span>
          <span class="explore-vision-sub">${escapeHtml(recipe.cuisine || recipe.complexityLabel)}</span>
        </span>
      </button>
    `;
    })
    .join("");
}

function pickExploreRecipes(recipes) {
  const dietConstrained = constrainRecipesByDiet(recipes, state.selectedDiet);
  if (state.selectedComplexity) {
    return [...dietConstrained].sort((a, b) => {
      const requestedScore = getComplexityScore(state.selectedComplexity);
      const deltaA = Math.abs(getComplexityScore(a.complexity) - requestedScore);
      const deltaB = Math.abs(getComplexityScore(b.complexity) - requestedScore);
      if (deltaA !== deltaB) return deltaA - deltaB;
      return a.title.localeCompare(b.title);
    });
  }
  return dietConstrained;
}

function buildExploreProjection(recipes) {
  const embeddedRecipes = recipes.filter((recipe) => Array.isArray(recipe.embedding) && recipe.embedding.length);
  if (embeddedRecipes.length < 3) {
    return Object.fromEntries(recipes.map((recipe, index) => [recipe.id, {
      x: ((index % 12) + 1) / 13,
      y: (Math.floor(index / 12) + 1) / (Math.ceil(recipes.length / 12) + 1)
    }]));
  }

  const dimensions = embeddedRecipes[0].embedding.length;
  const mean = new Array(dimensions).fill(0);
  embeddedRecipes.forEach((recipe) => {
    recipe.embedding.forEach((value, index) => {
      mean[index] += value;
    });
  });
  for (let index = 0; index < dimensions; index += 1) {
    mean[index] /= embeddedRecipes.length;
  }

  const centeredVectors = embeddedRecipes.map((recipe) => recipe.embedding.map((value, index) => value - mean[index]));
  const covarianceMultiply = (vector) => {
    const projected = centeredVectors.map((row) => dotProduct(row, vector));
    const result = new Array(dimensions).fill(0);
    for (let rowIndex = 0; rowIndex < centeredVectors.length; rowIndex += 1) {
      const row = centeredVectors[rowIndex];
      const scale = projected[rowIndex];
      for (let columnIndex = 0; columnIndex < dimensions; columnIndex += 1) {
        result[columnIndex] += row[columnIndex] * scale;
      }
    }
    return result;
  };

  const firstAxis = powerIterate(covarianceMultiply, dimensions);
  const secondAxis = powerIterate(covarianceMultiply, dimensions, [firstAxis]);

  const rawPoints = embeddedRecipes.map((recipe, index) => {
    const x = dotProduct(centeredVectors[index], firstAxis);
    const y = dotProduct(centeredVectors[index], secondAxis);
    return { id: recipe.id, x, y };
  });

  const xs = rawPoints.map((point) => point.x);
  const ys = rawPoints.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spreadX = maxX - minX || 1;
  const spreadY = maxY - minY || 1;

  return Object.fromEntries(
    rawPoints.map((point) => {
      const jitterX = hashToRange(`${point.id}-x`, -0.016, 0.016);
      const jitterY = hashToRange(`${point.id}-y`, -0.016, 0.016);
      return [
        point.id,
        {
          x: clamp(0.05 + (((point.x - minX) / spreadX) * 0.9) + jitterX, 0.04, 0.96),
          y: clamp(0.06 + (((point.y - minY) / spreadY) * 0.88) + jitterY, 0.05, 0.95)
        }
      ];
    })
  );
}

function powerIterate(multiply, dimensions, orthogonalAxes = []) {
  let vector = new Array(dimensions).fill(0).map((_, index) => Math.sin(index + 1));
  vector = normalizeVector(vector);

  for (let iteration = 0; iteration < 18; iteration += 1) {
    let nextVector = multiply(vector);
    orthogonalAxes.forEach((axis) => {
      const projection = dotProduct(nextVector, axis);
      for (let index = 0; index < dimensions; index += 1) {
        nextVector[index] -= projection * axis[index];
      }
    });
    vector = normalizeVector(nextVector);
  }

  return vector;
}

function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + (value * value), 0)) || 1;
  return vector.map((value) => value / magnitude);
}

function dotProduct(left, right) {
  let total = 0;
  for (let index = 0; index < left.length; index += 1) {
    total += left[index] * right[index];
  }
  return total;
}

function hashToRange(value, min, max) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  const normalized = ((hash >>> 0) % 10000) / 10000;
  return min + ((max - min) * normalized);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function renderExploreVision() {
  if (!elements.exploreVisionGrid) return;
  const islands = buildExploreIslands(state.recipes);
  const totalRecipes = islands.reduce((sum, island) => sum + island.recipes.length, 0);

  if (elements.exploreVisionSummary) {
    const complexityLabel = complexities.find((item) => item.id === state.selectedComplexity)?.label || "Balanced";
    const dietLabel = diets.find((item) => item.id === state.selectedDiet)?.label || "Anything";
    elements.exploreVisionSummary.textContent = `${totalRecipes} dishes | ${islands.length} hubs | ${complexityLabel} | ${dietLabel}`;
  }

  const graphIslands = islands.map((island, islandIndex) => {
    const hubX = island.cx;
    const hubY = island.cy;
    return {
      ...island,
      hubX,
      hubY,
      recipes: island.recipes.map((recipe, recipeIndex) => {
        const difference = Math.abs(getComplexityScore(recipe.complexity) - getComplexityScore(state.selectedComplexity));
        const size = difference === 0 ? 72 : difference === 1 ? 64 : 58;
        const localPosition = computeIslandTilePosition(recipeIndex, island.recipes.length, island.width, island.height);
        const x = island.cx - (island.width / 2) + localPosition.x;
        const y = island.cy - (island.height / 2) + localPosition.y;
        return {
          ...recipe,
          x,
          y,
          size,
          tilt: hashToRange(recipe.id, -4.2, 4.2),
          zIndex: 80 + recipeIndex
        };
      }),
      index: islandIndex
    };
  });

  const graphLinks = buildExploreIslandGraphLinks(graphIslands);

  elements.exploreVisionGrid.innerHTML = `
    <svg class="explore-graph-svg" viewBox="0 0 2480 1680" preserveAspectRatio="none" aria-hidden="true">
      ${graphLinks.map((link) => `
        <line
          class="explore-graph-link"
          x1="${link.x1}"
          y1="${link.y1}"
          x2="${link.x2}"
          y2="${link.y2}"
        ></line>
      `).join("")}
      ${graphIslands.map((island) => island.recipes.map((recipe) => `
        <line
          class="explore-graph-spoke"
          x1="${island.hubX}"
          y1="${island.hubY}"
          x2="${recipe.x}"
          y2="${recipe.y}"
        ></line>
      `).join("")).join("")}
    </svg>
    ${graphIslands.map((island) => `
      <div
        class="explore-island-backdrop"
        style="left:${island.hubX}px;top:${island.hubY}px;width:${island.width}px;height:${island.height}px;"
      ></div>
      <button
        class="explore-island-hub"
        type="button"
        data-focus-island="${island.index}"
        aria-label="Focus ${escapeHtml(island.label)}"
        style="left:${island.hubX}px;top:${island.hubY}px;"
      >
        <span class="explore-island-kicker">Hub ${island.index + 1}</span>
        <strong>${escapeHtml(island.label)}</strong>
        <span class="explore-island-count">${island.recipes.length} dishes</span>
      </button>
      ${island.recipes.map((recipe) => `
        <button
          class="explore-vision-tile"
          type="button"
          data-action="details"
          data-recipe-id="${recipe.id}"
          aria-label="View ${escapeHtml(recipe.title)}"
          title="${escapeHtml(recipe.title)}"
          style="left:${recipe.x}px;top:${recipe.y}px;width:${recipe.size}px;height:${recipe.size}px;--tile-rotate:${recipe.tilt.toFixed(2)}deg;z-index:${recipe.zIndex};"
        >
          <img
            class="explore-vision-thumb"
            src="${recipe.thumbnail}"
            alt="${escapeHtml(recipe.title)}"
            onerror="${getThumbnailFallbackAttribute()}"
          />
        </button>
      `).join("")}
    `).join("")}
  `;

  updateExploreSurfaceScale();
}

function buildExploreIslandGraphLinks(islands) {
  const links = [];
  const seen = new Set();

  islands.forEach((island, index) => {
    const nearest = islands
      .filter((candidate, candidateIndex) => candidateIndex !== index)
      .map((candidate, candidateIndex) => ({
        candidate,
        distance: Math.hypot(candidate.hubX - island.hubX, candidate.hubY - island.hubY)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);

    nearest.forEach(({ candidate }) => {
      const key = [island.id, candidate.id].sort().join("::");
      if (seen.has(key)) return;
      seen.add(key);
      links.push({
        x1: island.hubX,
        y1: island.hubY,
        x2: candidate.hubX,
        y2: candidate.hubY
      });
    });
  });

  return links;
}

function pickExploreRecipes(recipes) {
  const dietConstrained = constrainRecipesByDiet(recipes, state.selectedDiet);
  const ranked = [...dietConstrained].sort((a, b) => {
    const requestedScore = getComplexityScore(state.selectedComplexity);
    const deltaA = Math.abs(getComplexityScore(a.complexity) - requestedScore);
    const deltaB = Math.abs(getComplexityScore(b.complexity) - requestedScore);
    if (deltaA !== deltaB) return deltaA - deltaB;
    const qualityDelta = scoreExploreRecipe(b) - scoreExploreRecipe(a);
    if (qualityDelta !== 0) return qualityDelta;
    return a.title.localeCompare(b.title);
  });
  return curateExploreRecipes(ranked, 75);
}

function scoreExploreRecipe(recipe) {
  const complexityWeight = {
    balanced: 10,
    challenging: 8,
    lazy: 6
  }[recipe.complexity] || 0;

  const tagWeight = Math.min(6, (recipe.moodTags || []).length);
  const stepWeight = Math.min(6, (recipe.steps || []).length);
  const summaryWeight = Math.min(6, Math.round((recipe.summary || "").length / 28));

  return complexityWeight + tagWeight + stepWeight + summaryWeight;
}

function curateExploreRecipes(recipes, limit = 75) {
  const byCuisine = new Map();
  recipes.forEach((recipe) => {
    const cuisineKey = ((recipe.cuisine || "Other").split(/[,/-]/)[0] || "Other").trim();
    if (!byCuisine.has(cuisineKey)) byCuisine.set(cuisineKey, []);
    byCuisine.get(cuisineKey).push(recipe);
  });

  const cuisinePools = [...byCuisine.values()];
  const curated = [];
  let cursor = 0;

  while (curated.length < limit && cuisinePools.some((pool) => pool.length)) {
    const pool = cuisinePools[cursor % cuisinePools.length];
    const recipe = pool.shift();
    if (recipe) curated.push(recipe);
    cursor += 1;
  }

  return curated;
}

function buildExploreIslands(recipes) {
  const curatedRecipes = pickExploreRecipes(recipes);
  const clustered = buildIslandAssignments(curatedRecipes);
  const anchors = [
    { x: 300, y: 250 },
    { x: 740, y: 210 },
    { x: 1180, y: 250 },
    { x: 1620, y: 220 },
    { x: 440, y: 650 },
    { x: 900, y: 690 },
    { x: 1360, y: 650 },
    { x: 1820, y: 690 },
    { x: 320, y: 1060 },
    { x: 800, y: 1100 },
    { x: 1280, y: 1060 },
    { x: 1760, y: 1100 }
  ];

  return clustered.map((cluster, index) => {
    const rows = Math.ceil(cluster.recipes.length / 5);
    const width = 330 + Math.min(180, cluster.recipes.length * 10);
    const height = 240 + (rows * 78);
    return {
      ...cluster,
      cx: anchors[index % anchors.length].x,
      cy: anchors[index % anchors.length].y,
      width,
      height
    };
  });
}

function buildIslandAssignments(recipes) {
  const usedIds = new Set();
  const islands = exploreIslandBlueprints.map((blueprint) => {
    const scoredRecipes = recipes
      .map((recipe) => ({ recipe, score: scoreRecipeForIsland(recipe, blueprint) }))
      .filter(({ score }) => score >= 2)
      .sort((a, b) => b.score - a.score || scoreExploreRecipe(b.recipe) - scoreExploreRecipe(a.recipe));

    const selected = [];
    for (const entry of scoredRecipes) {
      if (selected.length >= blueprint.targetCount) break;
      if (usedIds.has(entry.recipe.id)) continue;
      selected.push(entry.recipe);
      usedIds.add(entry.recipe.id);
    }

    return {
      id: blueprint.id,
      label: blueprint.label,
      vibe: blueprint.vibe,
      recipes: selected
    };
  });

  islands.forEach((island, index) => {
    if (island.recipes.length >= exploreIslandBlueprints[index].targetCount) return;
    const blueprint = exploreIslandBlueprints[index];
    const fallbackPool = recipes
      .filter((recipe) => !usedIds.has(recipe.id))
      .map((recipe) => ({ recipe, score: scoreRecipeForIsland(recipe, blueprint) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || scoreExploreRecipe(b.recipe) - scoreExploreRecipe(a.recipe));

    for (const entry of fallbackPool) {
      if (island.recipes.length >= blueprint.targetCount) break;
      island.recipes.push(entry.recipe);
      usedIds.add(entry.recipe.id);
    }
  });

  return islands.filter((island) => island.recipes.length).map((island) => ({
    ...island,
    recipes: island.recipes.sort((a, b) => a.title.localeCompare(b.title))
  }));
}

function scoreRecipeForIsland(recipe, blueprint) {
  const haystack = [
    recipe.title || "",
    recipe.summary || "",
    recipe.cuisine || "",
    recipe.complexity || "",
    recipe.complexityLabel || "",
    ...(recipe.moodTags || []),
    ...(recipe.ingredients || [])
  ].join(" ").toLowerCase();

  if ((blueprint.exclude || []).some((term) => haystack.includes(term))) {
    return -999;
  }

  let score = 0;
  (blueprint.include || []).forEach((term) => {
    if (haystack.includes(term)) score += 1;
  });

  if (recipe.diet === "vegan" && blueprint.id === "plant-rich") score += 3;
  if (recipe.diet === "vegetarian" && blueprint.id === "vegetarian-comfort") score += 2;
  if (recipe.diet === "pescatarian" && blueprint.id === "sea-coast") score += 3;
  if (recipe.complexity === "challenging" && blueprint.id === "weekend-showpiece") score += 2;

  return score;
}

function computeIslandTilePosition(index, total, width, height) {
  const centerX = width / 2;
  const centerY = (height / 2) + 20;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const maxRadius = Math.min(width, height) * 0.37;
  const radius = maxRadius * Math.sqrt((index + 0.42) / Math.max(total, 1));
  const angle = (index * goldenAngle) + hashToRange(`ia-${index}`, -0.08, 0.08);
  return {
    x: centerX + (Math.cos(angle) * radius),
    y: centerY + (Math.sin(angle) * radius)
  };
}

function setExploreZoom(nextZoom) {
  state.exploreZoom = clamp(nextZoom, 0.7, 1.8);
  updateExploreSurfaceScale();
}

function updateExploreSurfaceScale() {
  if (!elements.exploreVisionGrid) return;
  const baseWidth = 2480;
  const baseHeight = 1680;
  elements.exploreVisionGrid.style.width = `${Math.round(baseWidth * state.exploreZoom)}px`;
  elements.exploreVisionGrid.style.height = `${Math.round(baseHeight * state.exploreZoom)}px`;
  if (elements.exploreZoomResetButton) {
    elements.exploreZoomResetButton.textContent = `${Math.round(state.exploreZoom * 100)}%`;
  }
}

function centerExploreViewport() {
  const frame = elements.exploreVisionGrid?.parentElement;
  if (!frame) return;
  frame.scrollLeft = Math.max(0, (frame.scrollWidth - frame.clientWidth) / 2);
  frame.scrollTop = Math.max(0, (frame.scrollHeight - frame.clientHeight) / 2 - 60);
}

function focusExploreIsland(index) {
  const frame = elements.exploreVisionGrid?.parentElement;
  const hub = elements.exploreVisionGrid?.querySelector(`[data-focus-island="${index}"]`);
  if (!frame || !hub) return;

  const hubRect = hub.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();
  const targetLeft = frame.scrollLeft + (hubRect.left - frameRect.left) - (frame.clientWidth / 2) + (hubRect.width / 2);
  const targetTop = frame.scrollTop + (hubRect.top - frameRect.top) - (frame.clientHeight / 2) + (hubRect.height / 2);

  frame.scrollTo({
    left: Math.max(0, targetLeft),
    top: Math.max(0, targetTop),
    behavior: "smooth"
  });
}

function resetRecipeSwipeState() {
  state.recipeSwipePointerId = null;
  state.recipeSwipeStartX = 0;
  state.recipeSwipeStartY = 0;
  state.recipeSwipeDeltaX = 0;
  state.recipeSwipeTracking = false;
}

async function runRecipeSearch() {
  state.vibe = elements.vibeInput.value.trim();
  resetAppScrollPosition();
  showScreen("loading");

  window.setTimeout(async () => {
    const profile = buildSearchProfile();
    const recipes = await rankRecipesSmart(state.recipes, profile);
    state.rankedRecipes = recipes.slice(0, 50);
    state.currentCardIndex = 0;
    state.recipeNavDirection = 1;
    resetAppScrollPosition();
    renderRecipeDeck();
    showScreen("results");
    resetAppScrollPosition();
  }, 1400);
}

function buildSearchProfile() {
  const queryTokens = expandTokens(tokenize(state.vibe));
  const queryIntents = parseQueryIntents(state.vibe);
  return {
    queryText: state.vibe,
    semanticQuery: state.vibe,
    filters: {
      complexity: state.selectedComplexity,
      diet: state.selectedDiet,
      queryTokens,
      queryIntents
    }
  };
}

function parseQueryIntents(queryText) {
  const lower = (queryText || "").toLowerCase();
  if (!lower.trim()) return [];

  return Object.entries(queryIntentLexicon)
    .filter(([, config]) => config.terms.some((term) => lower.includes(term)))
    .map(([intentId, config]) => ({
      id: intentId,
      feature: config.feature,
      strength: config.strength
    }));
}

async function rankRecipesSmart(recipes, profile) {
  const constrainedRecipes = constrainRecipesByDiet(recipes, profile.filters.diet);
  const embeddingRanked = await rankRecipesWithEmbeddings(constrainedRecipes, profile);
  if (embeddingRanked) return embeddingRanked;
  return rankRecipesLexically(constrainedRecipes, profile);
}

function constrainRecipesByDiet(recipes, selectedDiet) {
  if (selectedDiet === "any") return recipes;
  if (selectedDiet === "pescatarian") return recipes.filter((recipe) => recipe.diet === "pescatarian" || recipe.diet === "vegetarian" || recipe.diet === "vegan");
  if (selectedDiet === "vegetarian") return recipes.filter((recipe) => recipe.diet === "vegetarian" || recipe.diet === "vegan");
  if (selectedDiet === "vegan") return recipes.filter((recipe) => recipe.diet === "vegan");
  return recipes;
}

function constrainRecipesByComplexity(recipes, selectedComplexity) {
  const targetScore = getComplexityScore(selectedComplexity);
  const exactMatches = recipes.filter((recipe) => getComplexityScore(recipe.complexity) === targetScore);
  if (exactMatches.length >= 18) return exactMatches;

  const nearbyMatches = recipes.filter((recipe) => Math.abs(getComplexityScore(recipe.complexity) - targetScore) <= 1);
  if (nearbyMatches.length) return nearbyMatches;

  return recipes;
}

async function rankRecipesWithEmbeddings(recipes, profile) {
  if (!window.RECIPE_EMBEDDINGS?.vectors) return null;
  if (!profile.semanticQuery.trim()) return null;

  try {
    const queryEmbedding = await fetchQueryEmbedding(profile.semanticQuery);
    if (!queryEmbedding) return null;

    return [...recipes]
      .map((recipe) => ({
        ...recipe,
        difficultyContextBadge: getDifficultyContextBadge(profile.filters.complexity, recipe.complexity),
        rankScore: rankRecipeScore(recipe, profile.filters, cosineSimilarityFromArrays(queryEmbedding, recipe.embedding || []))
      }))
      .sort((a, b) => b.rankScore - a.rankScore);
  } catch (error) {
    console.warn("Embedding search unavailable, falling back to lexical ranking.", error);
    return null;
  }
}

async function fetchQueryEmbedding(queryText) {
  const response = await fetch(resolveApiUrl("/api/embed"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      input: queryText
    })
  });

  if (!response.ok) {
    throw new Error(`Embedding request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload.embedding;
}

function rankRecipesLexically(recipes, profile) {
  const queryTokens = profile.queryTokens || expandTokens(tokenize(profile.semanticQuery));

  return [...recipes]
    .map((recipe) => {
      const textTokens = tokenize([
        recipe.title,
        recipe.summary,
        recipe.cuisine,
        recipe.moodTags.join(" "),
        (recipe.searchFeatures || []).join(" "),
        recipe.ingredients.join(" ")
      ].join(" "));
      const lexicalScore = queryTokens.length ? cosineSimilarity(vectorize(queryTokens), vectorize(textTokens)) : 0;
      return {
        ...recipe,
        difficultyContextBadge: getDifficultyContextBadge(profile.filters.complexity, recipe.complexity),
        rankScore: rankRecipeScore(recipe, profile.filters, lexicalScore)
      };
    })
    .sort((a, b) => b.rankScore - a.rankScore);
}

function rankRecipeScore(recipe, filters, semanticScore) {
  const dietPreferenceBonus = getDietPreferenceBonus(filters.diet, recipe.diet);
  const complexityDistance = Math.abs(getComplexityScore(filters.complexity) - getComplexityScore(recipe.complexity));
  const complexityBonus = complexityDistance === 0 ? 16 : complexityDistance === 1 ? -3 : -9;
  const cuisineIntentBonus = getCuisineIntentBonus(filters.queryTokens || [], recipe);
  const queryIntentBonus = getQueryIntentBonus(filters.queryIntents || [], recipe);
  let score = semanticScore * 100 + complexityBonus + dietPreferenceBonus + cuisineIntentBonus + queryIntentBonus;
  score += Math.random() * 0.6;
  return score;
}

function getCuisineIntentBonus(queryTokens, recipe) {
  if (!queryTokens.length) return 0;

  const haystack = [
    recipe.title || "",
    recipe.summary || "",
    recipe.cuisine || "",
    ...(recipe.moodTags || [])
  ].join(" ").toLowerCase();

  let bonus = 0;
  Object.values(cuisineIntentLexicon).forEach((terms) => {
    const queryMatched = terms.some((term) => queryTokens.includes(term) || queryTokens.join(" ").includes(term));
    if (!queryMatched) return;
    const recipeMatched = terms.some((term) => haystack.includes(term));
    if (recipeMatched) bonus += 14;
  });

  if (queryTokens.includes("comfort") && /(british|french|irish|scottish|welsh)/.test(haystack)) {
    bonus += 4;
  }

  return bonus;
}

function getQueryIntentBonus(queryIntents, recipe) {
  if (!queryIntents.length) return 0;
  const features = new Set(recipe.searchFeatures || []);
  let bonus = 0;

  queryIntents.forEach((intent) => {
    const matched = features.has(intent.feature);
    if (intent.strength === "hard") {
      bonus += matched ? 18 : -16;
      return;
    }
    if (intent.strength === "strong") {
      bonus += matched ? 11 : -9;
      return;
    }
    bonus += matched ? 4 : 0;
  });

  return bonus;
}

function getDietPreferenceBonus(selectedDiet, recipeDiet) {
  return dietPreferenceWeights[selectedDiet]?.[recipeDiet] ?? 0;
}

function getDifficultyContextBadge(selectedComplexity, recipeComplexity) {
  const selectedScore = getComplexityScore(selectedComplexity);
  const recipeScore = getComplexityScore(recipeComplexity);
  const difference = recipeScore - selectedScore;

  if (difference === 1) return "Pushing your boundaries";
  if (difference >= 2) return "A stretch pick";
  if (difference === -1) return "Keeping it easy";
  if (difference <= -2) return "Very approachable";
  return "";
}

function vectorize(tokens) {
  return tokens.reduce((accumulator, token) => {
    accumulator[token] = (accumulator[token] || 0) + 1;
    return accumulator;
  }, {});
}

function cosineSimilarityFromArrays(vectorA, vectorB) {
  if (!vectorA.length || !vectorB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < vectorA.length; index += 1) {
    const a = vectorA[index] || 0;
    const b = vectorB[index] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function cosineSimilarity(vectorA, vectorB) {
  const terms = new Set([...Object.keys(vectorA), ...Object.keys(vectorB)]);
  let dot = 0;
  let normA = 0;
  let normB = 0;

  terms.forEach((term) => {
    const a = vectorA[term] || 0;
    const b = vectorB[term] || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  });

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function tokenize(input) {
  return input.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
}

function expandTokens(tokens) {
  const expanded = new Set(tokens);
  tokens.forEach((token) => {
    Object.entries(paletteLexicon).forEach(([anchor, synonyms]) => {
      if (token === anchor || synonyms.includes(token)) {
        expanded.add(anchor);
        synonyms.forEach((item) => expanded.add(item));
      }
    });
  });
  return [...expanded];
}


function renderRecipeDeck() {
  renderResultsHeading();
  if (!state.rankedRecipes.length) {
    elements.recipeDeck.innerHTML = `<div class="recipe-card"><h3>No matches yet</h3><p class="recipe-summary">Try loosening one or two filters, or keep the filters and change the vibe text.</p></div>`;
    elements.recipeDots.innerHTML = "";
    return;
  }

  const recipe = state.rankedRecipes[state.currentCardIndex];
  elements.recipeDeck.innerHTML = createRecipeCardMarkup(recipe, state.recipeNavDirection);
  renderRecipeDots();
}

function renderResultsHeading() {
  if (!elements.resultsHeading) return;
  const vibe = state.vibe.trim();
  if (vibe) {
    elements.resultsHeading.innerHTML = `Best matches for <span class="results-heading-emphasis">‘${escapeHtml(vibe)}’</span>`;
    return;
  }

  const complexityLabel = complexities.find((item) => item.id === state.selectedComplexity)?.label || "Balanced";
  const dietLabel = diets.find((item) => item.id === state.selectedDiet)?.label || "Anything";
  elements.resultsHeading.textContent = `Best matches for ${complexityLabel} + ${dietLabel}`;
}

function animatePromptIntoInput(promptText) {
  if (!elements.vibeInput) return;
  if (state.promptTypingTimer) {
    window.clearTimeout(state.promptTypingTimer);
    state.promptTypingTimer = null;
  }

  elements.vibeInput.value = "";

  let index = 0;
  const typeNext = () => {
    elements.vibeInput.value = promptText.slice(0, index);
    if (document.activeElement === elements.vibeInput) {
      elements.vibeInput.setSelectionRange(index, index);
    }

    if (index >= promptText.length) {
      state.promptTypingTimer = null;
      return;
    }

    index += 1;
    const character = promptText[index - 1];
    const delay = character === " " ? 12 : 16 + Math.floor(Math.random() * 12);
    state.promptTypingTimer = window.setTimeout(typeNext, delay);
  };

  typeNext();
}

function renderRecipeDots() {
  const maxDots = Math.min(state.rankedRecipes.length, 12);
  const activeGroup = state.rankedRecipes.length <= maxDots
    ? 0
    : Math.min(
        Math.max(state.currentCardIndex - Math.floor(maxDots / 2), 0),
        state.rankedRecipes.length - maxDots
      );

  const indices = Array.from({ length: maxDots }, (_, offset) => activeGroup + offset);

  elements.recipeDots.innerHTML = indices
    .map((index) => {
      const active = index === state.currentCardIndex ? "active" : "";
      return `<button class="deck-dot ${active}" data-dot-index="${index}" aria-label="Go to recipe ${index + 1}"></button>`;
    })
    .join("");
}

function createRecipeCardMarkup(recipe, direction) {
  const directionClass = direction < 0 ? "card-enter-left" : "card-enter-right";
  return `
    <article class="recipe-card ${directionClass} ${recipe.thumbnail ? "has-thumbnail" : ""}" data-recipe-id="${recipe.id}">
      <div class="card-header">
        <div class="card-meta">
          <span class="tag">${recipe.cuisine}</span>
          <span class="tag">${recipe.complexityLabel}</span>
          <span class="tag">${state.currentCardIndex + 1} / ${state.rankedRecipes.length}</span>
          ${recipe.altered ? `<span class="recipe-altered-badge">Recipe altered</span>` : ""}
          ${recipe.difficultyContextBadge ? `<span class="recipe-context-badge">${recipe.difficultyContextBadge}</span>` : ""}
        </div>
        <div class="card-actions-quiet">
          <button class="mini-button mobile-only-action" data-action="details" data-recipe-id="${recipe.id}">View</button>
          <button class="mini-button" data-action="save" data-recipe-id="${recipe.id}">${state.savedRecipeIds.includes(recipe.id) ? "Unsave" : "Save"}</button>
        </div>
      </div>
      <div class="card-main">
        <div class="card-copy">
          <p class="eyebrow">Curated recipe</p>
          <h3>${recipe.title}</h3>
          <p class="recipe-summary">${recipe.summary}</p>
          <div class="facts-grid">
            <div class="fact"><span class="fact-label">Prep</span>${recipe.prepTime} mins</div>
            <div class="fact"><span class="fact-label">Cook</span>${recipe.cookTime} mins</div>
            <div class="fact"><span class="fact-label">Serves</span>${recipe.servings}</div>
          </div>
        </div>
        <div class="card-side">
          ${
            recipe.thumbnail
              ? `
                <div class="recipe-thumb-wrap">
                  <img class="recipe-thumb" src="${recipe.thumbnail}" alt="${recipe.title}" onerror="${getThumbnailFallbackAttribute()}">
                </div>
              `
              : ""
          }
        </div>
      </div>
      <div class="recipe-actions recipe-actions-primary-split">
        <button class="mini-button desktop-only-action" data-action="details" data-recipe-id="${recipe.id}">View</button>
        <button class="mini-button desktop-only-action" data-action="shopping" data-recipe-id="${recipe.id}">Shopping list</button>
        <button class="mini-button" data-action="alter" data-recipe-id="${recipe.id}">✦ Alter recipe ✦</button>
        <button class="primary-button" data-action="cook" data-recipe-id="${recipe.id}">Cook.</button>
      </div>
    </article>
  `;
}

function moveRecipeIndex(direction) {
  if (!state.rankedRecipes.length) return;
  state.recipeNavDirection = direction;
  const nextIndex = state.currentCardIndex + direction;
  const lastIndex = state.rankedRecipes.length - 1;
  state.currentCardIndex = nextIndex < 0 ? lastIndex : nextIndex > lastIndex ? 0 : nextIndex;
  renderRecipeDeck();
}

function resetAppScrollPosition() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  elements.screens.forEach((screen) => {
    screen.scrollTop = 0;
  });
}

async function toggleCookFullscreen() {
  const cookScreen = elements.screens.find((screen) => screen.dataset.screen === "cook");
  if (!cookScreen) return;

  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (cookScreen.requestFullscreen) {
      await cookScreen.requestFullscreen({ navigationUI: "hide" });
      if (screen.orientation?.lock) {
        try {
          await screen.orientation.lock("landscape");
        } catch {}
      }
    }
  } catch {}

  updateCookFullscreenButton();
}

function updateCookFullscreenButton() {
  if (!elements.cookFullscreenButton) return;
  elements.cookFullscreenButton.textContent = document.fullscreenElement ? "Exit full screen" : "Full screen";
}

function handleAction(action, recipeId) {
  const recipe = state.recipes.find((item) => item.id === recipeId);
  if (!recipe) return;

  if (action === "details") renderDetailModal(recipe);
  if (action === "shopping") renderShoppingModal(recipe);
  if (action === "alter") openAlterModal(recipe);
  if (action === "save") {
    toggleSaveRecipe(recipe.id);
    renderRecipeDeck();
  }
  if (action === "saved") renderSavedRecipesModal();
  if (action === "cook" || action === "saved-cook") startCooking(recipe);
  if (action === "saved-details") renderDetailModal(recipe);
  if (action === "saved-shopping") renderShoppingModal(recipe);
}

function renderDetailModal(recipe) {
  elements.detailContent.innerHTML = `
    <p class="eyebrow">Recipe details</p>
    <h2>${recipe.title}</h2>
    ${
      recipe.thumbnail
        ? `
          <div class="detail-thumb-wrap">
            <img class="detail-thumb" src="${recipe.thumbnail}" alt="${recipe.title}" onerror="${getThumbnailFallbackAttribute()}">
          </div>
        `
        : ""
    }
    <p class="detail-summary">${recipe.summary}</p>
    <div class="detail-meta">
      <span class="tag">${recipe.cuisine}</span>
      <span class="tag">${recipe.complexityLabel}</span>
      <span class="tag">${recipe.prepTime + recipe.cookTime} mins total</span>
    </div>
    ${
      recipe.thumbnailPrompt
        ? `<p class="detail-summary">Thumbnail prompt saved at <code>${recipe.thumbnailPrompt}</code>.</p>`
        : ""
    }
    <h3>Ingredients</h3>
    <ul class="ingredients-list">${recipe.ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("")}</ul>
    <h3>Steps</h3>
    <ol class="steps-list">${recipe.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
    <div class="detail-actions">
      <button class="mini-button" data-action="alter" data-recipe-id="${recipe.id}">✦ Alter recipe ✦</button>
      <button class="primary-button" data-action="cook" data-recipe-id="${recipe.id}">Cook.</button>
    </div>
  `;
  elements.detailModal.classList.remove("hidden");
}

function renderShoppingModal(recipe) {
  const selected = state.shoppingSelections[recipe.id] || [];
  const neededItems = recipe.shoppingList.filter((item) => !selected.includes(item));

  elements.shoppingContent.innerHTML = `
    <p class="eyebrow">Shopping list</p>
    <h2>${recipe.title}</h2>
    <p class="detail-summary">Tick anything you already have at home. The list below narrows to only what you still need to buy.</p>
    <ul class="shopping-list">
      ${recipe.shoppingList.map((item) => `
        <li>
          <label class="shopping-item">
            <input type="checkbox" data-shopping-toggle="${recipe.id}" value="${item}" ${selected.includes(item) ? "checked" : ""}>
            <span>${item}</span>
          </label>
        </li>
      `).join("")}
    </ul>
    <div class="summary-card">
      <p><strong>Still needed:</strong></p>
      <p>${neededItems.length ? neededItems.join(", ") : "Nothing else to buy."}</p>
    </div>
  `;

  elements.shoppingContent.querySelectorAll("[data-shopping-toggle]").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      updateShoppingSelection(recipe.id, event.target.value, event.target.checked);
      renderShoppingModal(recipe);
    });
  });

  elements.shoppingModal.classList.remove("hidden");
}

function renderSavedRecipesModal() {
  const savedRecipes = state.recipes.filter((recipe) => state.savedRecipeIds.includes(recipe.id));

  elements.savedContent.innerHTML = `
    <p class="eyebrow">Saved recipes</p>
    <h2>Your shortlist</h2>
    <div class="saved-list">
      ${
        savedRecipes.length
          ? savedRecipes.map((recipe) => `
            <article class="saved-item">
              <div class="card-meta">
                <span class="tag">${recipe.cuisine}</span>
                <span class="tag">${recipe.complexityLabel}</span>
                ${recipe.altered ? `<span class="recipe-altered-badge">Recipe altered</span>` : ""}
              </div>
              <h3>${recipe.title}</h3>
              <p class="detail-summary">${recipe.summary}</p>
              <div class="detail-actions">
                <button class="mini-button" data-action="saved-details" data-recipe-id="${recipe.id}">View</button>
                <button class="mini-button" data-action="saved-shopping" data-recipe-id="${recipe.id}">Shopping list</button>
                <button class="mini-button" data-action="alter" data-recipe-id="${recipe.id}">✦ Alter recipe ✦</button>
                <button class="primary-button" data-action="saved-cook" data-recipe-id="${recipe.id}">Cook.</button>
              </div>
            </article>
          `).join("")
          : `<div class="saved-item"><p class="detail-summary">You have not saved any recipes yet. Use Save on a card to build your shortlist.</p></div>`
      }
    </div>
  `;

  elements.savedModal.classList.remove("hidden");
}

function toggleSaveRecipe(recipeId) {
  const isSaved = state.savedRecipeIds.includes(recipeId);
  if (isSaved) state.savedRecipeIds = state.savedRecipeIds.filter((id) => id !== recipeId);
  else state.savedRecipeIds = [...state.savedRecipeIds, recipeId];

  localStorage.setItem("palette-saved-recipes", JSON.stringify(state.savedRecipeIds));
}

function openAlterModal(recipe) {
  state.alterRecipeId = recipe.id;
  state.alterPending = false;
  elements.alterRecipeHeading.textContent = `Alter ${recipe.title}`;
  elements.alterRequestInput.value = "";
  elements.alterRequestInput.placeholder = recipe.alterationSuggestions?.[0] || "Make it brighter, richer, spicier, lighter, or otherwise more tailored to what you want.";
  elements.alterSuggestionRail.innerHTML = (recipe.alterationSuggestions || [])
    .map((suggestion) => `<button class="prompt-suggestion-chip" data-alter-suggestion="${escapeHtml(suggestion)}" type="button">${escapeHtml(suggestion)}</button>`)
    .join("");
  elements.alterLoader.classList.add("hidden");
  elements.alterStatus.textContent = "";
  elements.alterStatus.classList.remove("error");
  elements.submitAlterButton.disabled = false;
  elements.submitAlterButton.textContent = "Apply alteration";
  elements.alterModal.classList.remove("hidden");
  window.setTimeout(() => elements.alterRequestInput.focus(), 40);
}

async function submitRecipeAlteration() {
  if (!state.alterRecipeId || state.alterPending) return;

  const instruction = elements.alterRequestInput.value.trim();
  if (!instruction) {
    elements.alterStatus.textContent = "Add a brief alteration request first.";
    elements.alterStatus.classList.add("error");
    return;
  }

  const recipe = state.recipes.find((item) => item.id === state.alterRecipeId);
  if (!recipe) return;

  state.alterPending = true;
  elements.alterStatus.textContent = "Rewriting the recipe...";
  elements.alterStatus.classList.remove("error");
  elements.alterLoader.classList.remove("hidden");
  elements.submitAlterButton.disabled = true;
  elements.submitAlterButton.textContent = "Altering...";

  try {
    const alteredPayload = await requestRecipeAlteration(recipe, instruction);
    const updatedRecipe = mergeAlteredRecipe(recipe, alteredPayload);
    replaceRecipeAcrossState(updatedRecipe);

    if (state.cookRecipe?.id === updatedRecipe.id) {
      state.cookRecipe = updatedRecipe;
      updateCookScreen();
    }

    elements.alterModal.classList.add("hidden");
    elements.detailModal.classList.add("hidden");
    elements.savedModal.classList.add("hidden");
    renderRecipeDeck();
  } catch (error) {
    const message = error?.message === "Failed to fetch"
      ? "Could not reach the local recipe server. Make sure server.py is running at http://127.0.0.1:8000."
      : (error.message || "Recipe alteration failed.");
    elements.alterStatus.textContent = message;
    elements.alterStatus.classList.add("error");
  } finally {
    state.alterPending = false;
    elements.alterLoader.classList.add("hidden");
    elements.submitAlterButton.disabled = false;
    elements.submitAlterButton.textContent = "Apply alteration";
  }
}

async function requestRecipeAlteration(recipe, instruction) {
  const response = await fetch(resolveApiUrl("/api/alter-recipe"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      recipe,
      instruction
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Recipe alteration failed with status ${response.status}.`);
  }
  return payload.recipe;
}

function mergeAlteredRecipe(originalRecipe, alteredPayload) {
  return {
    ...originalRecipe,
    ...normalizeComplexity({ complexity: alteredPayload.complexity || originalRecipe.complexity }),
    altered: true,
    title: alteredPayload.title || originalRecipe.title,
    cuisine: alteredPayload.cuisine || originalRecipe.cuisine,
    summary: alteredPayload.summary || originalRecipe.summary,
    moodTags: Array.isArray(alteredPayload.moodTags) && alteredPayload.moodTags.length ? alteredPayload.moodTags : originalRecipe.moodTags,
    ingredients: Array.isArray(alteredPayload.ingredients) && alteredPayload.ingredients.length ? alteredPayload.ingredients : originalRecipe.ingredients,
    shoppingList: Array.isArray(alteredPayload.shoppingList) && alteredPayload.shoppingList.length
      ? alteredPayload.shoppingList
      : (Array.isArray(alteredPayload.ingredients) && alteredPayload.ingredients.length ? alteredPayload.ingredients : originalRecipe.shoppingList),
    steps: Array.isArray(alteredPayload.steps) && alteredPayload.steps.length ? alteredPayload.steps : originalRecipe.steps,
    servings: Number.isFinite(alteredPayload.servings) ? alteredPayload.servings : originalRecipe.servings,
    prepTime: Number.isFinite(alteredPayload.prepTime) ? alteredPayload.prepTime : originalRecipe.prepTime,
    cookTime: Number.isFinite(alteredPayload.cookTime) ? alteredPayload.cookTime : originalRecipe.cookTime,
    estimatedCalories: Number.isFinite(alteredPayload.estimatedCalories) ? alteredPayload.estimatedCalories : originalRecipe.estimatedCalories,
    thumbnail: originalRecipe.thumbnail,
    thumbnailPrompt: originalRecipe.thumbnailPrompt,
    embedding: originalRecipe.embedding
  };
}

function replaceRecipeAcrossState(updatedRecipe) {
  state.recipes = state.recipes.map((recipe) => (recipe.id === updatedRecipe.id ? updatedRecipe : recipe));
  state.rankedRecipes = state.rankedRecipes.map((recipe) => (recipe.id === updatedRecipe.id ? { ...updatedRecipe, rankScore: recipe.rankScore } : recipe));
}

function updateShoppingSelection(recipeId, item, checked) {
  const current = new Set(state.shoppingSelections[recipeId] || []);
  if (checked) current.add(item);
  else current.delete(item);
  state.shoppingSelections[recipeId] = [...current];
  localStorage.setItem("palette-shopping-selections", JSON.stringify(state.shoppingSelections));
}

function startCooking(recipe) {
  state.cookRecipe = recipe;
  state.cookStepIndex = 0;
  state.cookStepDirection = 1;
  state.cookAnimating = false;
  updateCookScreen();
  transitionToCookScreen();
  elements.alterModal.classList.add("hidden");
  elements.detailModal.classList.add("hidden");
  elements.shoppingModal.classList.add("hidden");
  elements.savedModal.classList.add("hidden");
}

function transitionToCookScreen() {
  const activeScreen = elements.screens.find((screen) => screen.classList.contains("screen-active"));
  const cookScreen = elements.screens.find((screen) => screen.dataset.screen === "cook");

  if (!cookScreen) {
    showScreen("cook");
    return;
  }

  if (!activeScreen || activeScreen === cookScreen || activeScreen.dataset.screen !== "results") {
    showScreen("cook");
    return;
  }

  elements.appShell?.classList.add("screen-transitioning", "screen-transitioning-cook");
  cookScreen.classList.add("screen-active", "cook-screen-enter");
  activeScreen.classList.add("cook-screen-exit");

  window.setTimeout(() => {
    elements.appShell?.classList.remove("screen-transitioning", "screen-transitioning-cook");
    activeScreen.classList.remove("cook-screen-exit", "screen-active");
    cookScreen.classList.remove("cook-screen-enter");
    cookScreen.classList.add("screen-active");
  }, 560);
}

function retreatCookStep() {
  if (!state.cookRecipe) return;
  if (state.cookAnimating) return;
  if (state.cookStepIndex > 0) return animateCookStep(-1);
  showScreen("results");
}

function advanceCookStep() {
  if (!state.cookRecipe) return;
  if (state.cookAnimating) return;
  if (state.cookStepIndex < state.cookRecipe.steps.length - 1) return animateCookStep(1);
  showScreen("finish");
}

function updateCookScreen() {
  const recipe = state.cookRecipe;
  if (!recipe) return;
  const currentStep = recipe.steps[state.cookStepIndex];
  const stepIngredients = getIngredientsForStep(recipe, currentStep);
  elements.cookRecipeTitle.textContent = recipe.title;
  elements.cookIngredientsList.innerHTML = stepIngredients.length
    ? stepIngredients.map((ingredient) => `<p class="cook-ingredient-item">${ingredient}</p>`).join("")
    : `<p class="cook-ingredient-item cook-ingredient-item-muted">No specific ingredients mentioned in this step.</p>`;
  renderCookTrack(state.cookStepIndex);
  elements.cookPreviousButton.innerHTML = "&#8593;";
  elements.cookPreviousButton.disabled = state.cookStepIndex === 0;
  elements.cookPreviousButton.setAttribute("aria-label", "Previous step");
  elements.cookNextButton.innerHTML = state.cookStepIndex === recipe.steps.length - 1 ? "&#10003;" : "&#8595;";
  elements.cookNextButton.setAttribute("aria-label", state.cookStepIndex === recipe.steps.length - 1 ? "Finish recipe" : "Next step");
}

function animateCookStep(direction) {
  const recipe = state.cookRecipe;
  if (!recipe) return;

  state.cookAnimating = true;
  state.cookStepDirection = direction;
  renderCookTrack(state.cookStepIndex);
  const track = elements.cookTrack;
  const stepGap = getComputedStyle(track.parentElement).getPropertyValue("--step-gap").trim() || "170px";
  const translateValue = direction > 0 ? `calc(${stepGap} * -1)` : stepGap;

  track.style.transition = "transform 520ms cubic-bezier(.22,1,.36,1)";
  track.style.transform = "translateY(0)";
  void track.offsetWidth;

  const finishAnimation = () => {
    track.removeEventListener("transitionend", finishAnimation);
    track.style.transition = "none";
    track.style.transform = "translateY(0)";
    void track.offsetWidth;
    state.cookStepIndex += direction;
    updateCookScreen();
    requestAnimationFrame(() => {
      track.style.transition = "";
      state.cookAnimating = false;
    });
  };

  track.addEventListener("transitionend", finishAnimation, { once: true });
  track.style.transform = `translateY(${translateValue})`;
}

function renderCookTrack(centerIndex) {
  const recipe = state.cookRecipe;
  if (!recipe) return;

  const offsets = [-2, -1, 0, 1, 2];
  ensureCookTrackSlots();

  offsets.forEach((offset, slotIndex) => {
    const line = elements.cookTrack.children[slotIndex];
    updateCookLine(line, recipe, centerIndex + offset, offset, slotIndex);
  });
}

function ensureCookTrackSlots() {
  if (elements.cookTrack.children.length === 5) return;

  elements.cookTrack.innerHTML = Array.from({ length: 5 }, (_, slotIndex) =>
    `<p class="cook-line slot-${slotIndex}"></p>`
  ).join("");
}

function updateCookLine(line, recipe, stepIndex, offset, slotIndex) {
  if (stepIndex < 0 || stepIndex >= recipe.steps.length) {
    line.className = `cook-line cook-line-empty slot-${slotIndex}`;
    line.innerHTML = "";
    return;
  }

  const formattedStep = formatStepText(stepIndex, recipe.steps[stepIndex]);
  const content = offset === 0
    ? highlightIngredientsInStep(formattedStep, getIngredientsForStep(recipe, recipe.steps[stepIndex]))
    : escapeHtml(formattedStep);

  const roleClass = offset === 0
    ? "current"
    : Math.abs(offset) === 1
      ? "ghost-near"
      : "ghost-far";

  line.className = `cook-line ${roleClass} slot-${slotIndex}`;
  line.innerHTML = content;
}

function formatStepText(index, stepText) {
  return `${index + 1}. ${stepText}`;
}

function getIngredientsForStep(recipe, stepText) {
  const step = stepText.toLowerCase();
  const stopwords = new Set(["fresh", "extra", "soft", "mixed", "white", "red", "green", "new", "neutral", "toasted"]);
  const matches = recipe.ingredients.filter((ingredient) => {
    const ingredientLower = ingredient.toLowerCase();
    if (step.includes(ingredientLower)) return true;

    const tokens = ingredientLower
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !stopwords.has(token));

    return tokens.some((token) => step.includes(token));
  });

  return [...new Set(matches)];
}

function highlightIngredientsInStep(stepText, stepIngredients) {
  const ranges = [];

  stepIngredients.forEach((ingredientLine) => {
    const candidates = ingredientLine
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !/^\d/.test(token));

    candidates.forEach((token) => {
      const regex = new RegExp(`\\b${escapeRegExp(token)}\\b`, "gi");
      let match;
      while ((match = regex.exec(stepText)) !== null) {
        ranges.push({ start: match.index, end: match.index + match[0].length });
      }
    });
  });

  const merged = ranges
    .sort((a, b) => a.start - b.start || b.end - a.end)
    .reduce((accumulator, range) => {
      const last = accumulator[accumulator.length - 1];
      if (!last || range.start > last.end) {
        accumulator.push({ ...range });
      } else if (range.end > last.end) {
        last.end = range.end;
      }
      return accumulator;
    }, []);

  if (!merged.length) {
    return escapeHtml(stepText);
  }

  let cursor = 0;
  let result = "";

  merged.forEach((range) => {
    result += escapeHtml(stepText.slice(cursor, range.start));
    result += `<span class="cook-ingredient-inline">${escapeHtml(stepText.slice(range.start, range.end))}</span>`;
    cursor = range.end;
  });

  result += escapeHtml(stepText.slice(cursor));
  return result;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function showScreen(target) {
  if (target !== "cook" && document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  elements.screens.forEach((screen) => {
    screen.classList.toggle("screen-active", screen.dataset.screen === target);
  });
  updateCookFullscreenButton();
}

function toTitleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getActiveScreen() {
  return elements.screens.find((screen) => screen.classList.contains("screen-active"))?.dataset.screen;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function loadSavedRecipes() {
  try {
    return JSON.parse(localStorage.getItem("palette-saved-recipes")) || [];
  } catch {
    return [];
  }
}

function loadShoppingSelections() {
  try {
    return JSON.parse(localStorage.getItem("palette-shopping-selections")) || {};
  } catch {
    return {};
  }
}
