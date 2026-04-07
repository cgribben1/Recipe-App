const complexities = [
  { id: "lazy", label: "Lazy", score: 1, description: "Low effort, quick payoff" },
  { id: "balanced", label: "Balanced", score: 2, description: "A little more involved" },
  { id: "challenging", label: "Challenging", score: 3, description: "Technique forward" }
];

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

const promptSuggestionsByComplexity = {
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
    "toast-for-dinner energy"
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
    "herby roast chicken vibe"
  ],
  challenging: [
    "date-night project pasta",
    "classic French weekend cooking",
    "slow braise and red wine",
    "crispy skin and pan sauce",
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
    "theatrical dinner energy"
  ]
};

const state = {
  selectedComplexity: "balanced",
  vibe: "",
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
  screens: [...document.querySelectorAll(".screen")],
  complexityButtons: document.getElementById("complexityButtons"),
  vibeInput: document.getElementById("vibeInput"),
  promptSuggestions: document.getElementById("promptSuggestions"),
  generateButton: document.getElementById("generateButton"),
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
  finishBackButton: document.getElementById("finishBackButton")
};

initialize();

function initialize() {
  state.recipes = buildRecipeCache();
  renderComplexityButtons();
  renderPromptSuggestions();
  attachEventListeners();
  startPromptPlaceholderRotation();
}

function getActivePromptSuggestions() {
  return promptSuggestionsByComplexity[state.selectedComplexity] || promptSuggestionsByComplexity.balanced;
}

function buildRecipeCache() {
  return recipeBlueprints.map((recipe) => ({
    ...normalizeComplexity(recipe),
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
  if (raw === "lazy" || raw === "easy") return { complexity: "lazy", complexityLabel: "Lazy" };
  if (raw === "challenging" || raw === "project") return { complexity: "challenging", complexityLabel: "Challenging" };
  return { complexity: "balanced", complexityLabel: "Balanced" };
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
          <strong>${complexity.label}</strong><br>
          <span>${complexity.description}</span>
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
  });

  elements.generateButton.addEventListener("click", runRecipeSearch);
  elements.submitAlterButton.addEventListener("click", submitRecipeAlteration);
  elements.previousRecipeButton.addEventListener("click", () => moveRecipeIndex(-1));
  elements.nextRecipeButton.addEventListener("click", () => moveRecipeIndex(1));
  elements.cookPreviousButton.addEventListener("click", retreatCookStep);
  elements.cookNextButton.addEventListener("click", advanceCookStep);
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

    const suggestion = event.target.closest("[data-prompt-suggestion]");
    if (suggestion) {
      elements.vibeInput.value = suggestion.dataset.promptSuggestion;
      elements.vibeInput.focus();
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
}

function renderPromptSuggestions() {
  const promptSuggestions = getActivePromptSuggestions();
  const marqueeSuggestions = [...promptSuggestions, ...promptSuggestions];
  elements.promptSuggestions.innerHTML = marqueeSuggestions
    .map(
      (suggestion, index) => `<button class="prompt-suggestion-chip" data-prompt-suggestion="${suggestion}" aria-label="Use suggestion ${suggestion}" ${index >= promptSuggestions.length ? 'tabindex="-1" aria-hidden="true"' : ""}>${suggestion}</button>`
    )
    .join("");
}

function startPromptPlaceholderRotation() {
  let suggestionIndex = 0;
  let lastComplexity = state.selectedComplexity;

  const updatePlaceholder = () => {
    const promptSuggestions = getActivePromptSuggestions();
    if (lastComplexity !== state.selectedComplexity) {
      suggestionIndex = 0;
      lastComplexity = state.selectedComplexity;
    }
    if (!elements.vibeInput.value.trim()) {
      elements.vibeInput.placeholder = `Examples: ${promptSuggestions[suggestionIndex]}...`;
      suggestionIndex = (suggestionIndex + 1) % promptSuggestions.length;
    }
  };

  updatePlaceholder();
  window.setInterval(updatePlaceholder, 2600);
}

async function runRecipeSearch() {
  state.vibe = elements.vibeInput.value.trim();
  showScreen("loading");

  window.setTimeout(async () => {
    const profile = buildSearchProfile();
    const recipes = await rankRecipesSmart(state.recipes, profile);
    state.rankedRecipes = recipes.slice(0, 50);
    state.currentCardIndex = 0;
    state.recipeNavDirection = 1;
    renderRecipeDeck();
    showScreen("results");
  }, 1400);
}

function buildSearchProfile() {
  return {
    queryText: state.vibe,
    semanticQuery: state.vibe,
    filters: {
      complexity: state.selectedComplexity
    }
  };
}

async function rankRecipesSmart(recipes, profile) {
  const constrainedRecipes = constrainRecipesByComplexity(recipes, profile.filters.complexity);
  const embeddingRanked = await rankRecipesWithEmbeddings(constrainedRecipes, profile);
  if (embeddingRanked) return embeddingRanked;
  return rankRecipesLexically(constrainedRecipes, profile);
}

function constrainRecipesByComplexity(recipes, selectedComplexity) {
  const targetScore = getComplexityScore(selectedComplexity);
  const exactMatches = recipes.filter((recipe) => getComplexityScore(recipe.complexity) === targetScore);
  if (exactMatches.length >= 18 || exactMatches.length === recipes.length) return exactMatches;

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
  const queryTokens = expandTokens(tokenize(profile.semanticQuery));

  return [...recipes]
    .map((recipe) => {
      const textTokens = tokenize([
        recipe.title,
        recipe.summary,
        recipe.cuisine,
        recipe.moodTags.join(" "),
        recipe.ingredients.join(" ")
      ].join(" "));
      const lexicalScore = queryTokens.length ? cosineSimilarity(vectorize(queryTokens), vectorize(textTokens)) : 0;
      return {
        ...recipe,
        rankScore: rankRecipeScore(recipe, profile.filters, lexicalScore)
      };
    })
    .sort((a, b) => b.rankScore - a.rankScore);
}

function rankRecipeScore(recipe, filters, semanticScore) {
  const complexityPenalty = Math.abs(getComplexityScore(filters.complexity) - getComplexityScore(recipe.complexity));
  const exactMatchBonus = complexityPenalty === 0 ? 18 : 0;
  let score = semanticScore * 100 + exactMatchBonus - complexityPenalty * 42;
  score += Math.random() * 0.6;
  return score;
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
  if (!state.rankedRecipes.length) {
    elements.recipeDeck.innerHTML = `<div class="recipe-card"><h3>No matches yet</h3><p class="recipe-summary">Try loosening one or two filters, or keep the filters and change the vibe text.</p></div>`;
    elements.recipeDots.innerHTML = "";
    return;
  }

  const recipe = state.rankedRecipes[state.currentCardIndex];
  elements.recipeDeck.innerHTML = createRecipeCardMarkup(recipe, state.recipeNavDirection);
  renderRecipeDots();
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
        </div>
        <div class="card-actions-quiet">
          <button class="mini-button" data-action="save" data-recipe-id="${recipe.id}">${state.savedRecipeIds.includes(recipe.id) ? "Unsave" : "Save"}</button>
        </div>
      </div>
      <div class="card-main">
        <div class="card-copy">
          <p class="eyebrow">Curated recipe</p>
          <h3>${recipe.title}</h3>
          <p class="recipe-summary">${recipe.summary}</p>
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
          <div class="facts-grid">
            <div class="fact"><span class="fact-label">Prep</span>${recipe.prepTime} mins</div>
            <div class="fact"><span class="fact-label">Cook</span>${recipe.cookTime} mins</div>
            <div class="fact"><span class="fact-label">Serves</span>${recipe.servings}</div>
            <div class="fact"><span class="fact-label">Energy</span>${recipe.estimatedCalories} kcal</div>
          </div>
        </div>
      </div>
      <div class="recipe-actions">
        <button class="mini-button" data-action="details" data-recipe-id="${recipe.id}">View</button>
        <button class="mini-button" data-action="shopping" data-recipe-id="${recipe.id}">Shopping list</button>
        <button class="mini-button" data-action="alter" data-recipe-id="${recipe.id}">✦ Alter recipe ✦</button>
        <button class="mini-button" data-action="saved" data-recipe-id="${recipe.id}">Saved</button>
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
      <button class="mini-button" data-action="shopping" data-recipe-id="${recipe.id}">Shopping list</button>
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
  showScreen("cook");
  elements.alterModal.classList.add("hidden");
  elements.detailModal.classList.add("hidden");
  elements.shoppingModal.classList.add("hidden");
  elements.savedModal.classList.add("hidden");
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
  elements.screens.forEach((screen) => {
    screen.classList.toggle("screen-active", screen.dataset.screen === target);
  });
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
