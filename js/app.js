const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
const installLink = document.querySelector('#install-app');
const installHelp = document.querySelector('#install-help');
let installPrompt;

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js');
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
});

installLink.addEventListener('click', async (event) => {
  event.preventDefault();

  if (!installPrompt) {
    installHelp.hidden = false;
    return;
  }

  await installPrompt.prompt();
  installPrompt = null;
});

function selectTab(selectedTab) {
  tabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  panels.forEach((panel) => {
    panel.hidden = panel.getAttribute('aria-labelledby') !== selectedTab.id;
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => selectTab(tab));
});

function numberValue(input) {
  return Number(input.value.trim().replace(',', '.')) || 0;
}

function formatWeight(weight) {
  return String(Math.round(weight * 100) / 100);
}

function onValueCommit(input, callback) {
  input.addEventListener('change', callback);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      input.blur();
    }
  });
}

function createCalculator({ flours, ingredients, totalWeightInput, portionsInput }) {
  function totalFlourWeight() {
    return flours.reduce((total, { weightInput }) => total + numberValue(weightInput), 0);
  }

  function totalWeight() {
    return [...flours, ...ingredients].reduce(
      (total, { weightInput }) => total + numberValue(weightInput),
      0,
    );
  }

  function updateTotalWeight() {
    const portions = portionsInput ? numberValue(portionsInput) : 1;
    totalWeightInput.value = portions > 0 ? formatWeight(totalWeight() / portions) : '';
  }

  function updateIngredientWeights({ preserveTotalWeight = false } = {}) {
    const flourWeight = totalFlourWeight();

    ingredients.forEach(({ weightInput, percentageInput }) => {
      weightInput.value = formatWeight(flourWeight * (numberValue(percentageInput) / 100));
    });

    if (!preserveTotalWeight) {
      updateTotalWeight();
    }
  }

  function updateIngredientPercentage(ingredient) {
    const flourWeight = totalFlourWeight();
    const ingredientWeight = numberValue(ingredient.weightInput);

    ingredient.percentageInput.value = flourWeight > 0
      ? formatWeight((ingredientWeight / flourWeight) * 100)
      : '';
    updateTotalWeight();
  }

  function updateFlourPercentages() {
    const flourWeight = totalFlourWeight();

    flours.forEach(({ weightInput, percentageInput }) => {
      percentageInput.value = flourWeight > 0
        ? formatWeight((numberValue(weightInput) / flourWeight) * 100)
        : '0';
    });
    updateIngredientWeights();
  }

  function updateFlourWeights(changedFlour) {
    const otherFlour = flours.find((flour) => flour !== changedFlour);
    const flourWeight = totalFlourWeight();
    const percentage = Math.min(Math.max(numberValue(changedFlour.percentageInput), 0), 100);

    changedFlour.percentageInput.value = formatWeight(percentage);
    otherFlour.percentageInput.value = formatWeight(100 - percentage);

    flours.forEach(({ weightInput, percentageInput }) => {
      weightInput.value = formatWeight(flourWeight * (numberValue(percentageInput) / 100));
    });
    updateIngredientWeights();
  }

  function setFlourWeights(flourWeight) {
    if (flours.length === 1) {
      flours[0].weightInput.value = formatWeight(flourWeight);
      return;
    }

    flours.forEach(({ weightInput, percentageInput }) => {
      weightInput.value = formatWeight(flourWeight * (numberValue(percentageInput) / 100));
    });
  }

  function updateRecipeFromTotalWeight() {
    const portions = portionsInput ? numberValue(portionsInput) : 1;

    if (portions <= 0 || totalWeightInput.value === '') {
      return;
    }

    const percentageTotal = ingredients.reduce(
      (total, { percentageInput }) => total + numberValue(percentageInput) / 100,
      0,
    );
    const flourWeight = (numberValue(totalWeightInput) * portions) / (1 + percentageTotal);

    setFlourWeights(flourWeight);
    updateIngredientWeights({ preserveTotalWeight: true });
  }

  if (flours.length === 1) {
    onValueCommit(flours[0].weightInput, updateIngredientWeights);
  } else {
    flours.forEach((flour) => {
      onValueCommit(flour.weightInput, updateFlourPercentages);
      onValueCommit(flour.percentageInput, () => updateFlourWeights(flour));
    });
  }

  ingredients.forEach((ingredient) => {
    onValueCommit(ingredient.percentageInput, updateIngredientWeights);
    onValueCommit(ingredient.weightInput, () => updateIngredientPercentage(ingredient));
  });

  if (portionsInput) {
    onValueCommit(portionsInput, updateTotalWeight);
  }

  onValueCommit(totalWeightInput, updateRecipeFromTotalWeight);
  updateIngredientWeights();
}

function ingredient(weightId, percentageId) {
  return {
    weightInput: document.querySelector(weightId),
    percentageInput: document.querySelector(percentageId),
  };
}

function flour(weightId, percentageId) {
  return {
    weightInput: document.querySelector(weightId),
    percentageInput: percentageId ? document.querySelector(percentageId) : null,
  };
}

document.querySelectorAll('form').forEach((form) => {
  form.addEventListener('submit', (event) => event.preventDefault());
});

createCalculator({
  flours: [
    flour('#pizza-flour'),
  ],
  ingredients: [
    ingredient('#pizza-water', '#pizza-water-percentage'),
    ingredient('#pizza-salt', '#pizza-salt-percentage'),
    ingredient('#pizza-yeast', '#pizza-yeast-percentage'),
  ],
  totalWeightInput: document.querySelector('#pizza-pie-weight'),
  portionsInput: document.querySelector('#pizza-pies'),
});

createCalculator({
  flours: [
    flour('#bread-flour', '#bread-flour-percentage'),
    flour('#bread-wholewheat', '#bread-wholewheat-percentage'),
  ],
  ingredients: [
    ingredient('#bread-water', '#bread-water-percentage'),
    ingredient('#bread-salt', '#bread-salt-percentage'),
    ingredient('#bread-sourdough-yeast', '#bread-sourdough-yeast-percentage'),
  ],
  totalWeightInput: document.querySelector('#bread-dough-weight'),
});
