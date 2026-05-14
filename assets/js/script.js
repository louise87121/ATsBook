const airlineFilter = document.getElementById("airlineFilter");
const modelFilter = document.getElementById("modelFilter");
const sidebarList = document.getElementById("airlineSidebar");
const detailContainer = document.getElementById("airlineDetails");

const modelOptions = [
  { value: "a350-900", label: "Airbus A350-900" },
  { value: "a350-1000", label: "Airbus A350-1000" },
  { value: "a321neo", label: "Airbus A321neo" },
  { value: "a321neo-lr", label: "Airbus A321neo LR" },
  { value: "a330neo", label: "Airbus A330neo" },
  { value: "a380-800", label: "Airbus A380-800" },
  { value: "a380-800-flying-honu", label: "Airbus A380-800 Flying Honu" },
  { value: "787-10", label: "Boeing 787-10" },
  { value: "787-9", label: "Boeing 787-9" },
  { value: "777-300er", label: "Boeing 777-300ER" },
  { value: "777-9", label: "Boeing 777-9" },
  { value: "767-300er-refit", label: "Boeing 767-300ER (Refit)" },
  { value: "747-8-intercontinental", label: "Boeing 747-8 Intercontinental" },
];

const modelMap = modelOptions.reduce((acc, model) => {
  acc[model.value] = model;
  return acc;
}, {});

const modelFamilyMap = {
  "a350-900": "a350",
  "a350-1000": "a350",
  "a321neo": "a321neo",
  "a321neo-lr": "a321neo",
  "a330neo": "a330neo",
  "a380-800": "a380",
  "a380-800-flying-honu": "a380",
  "777-300er": "b777",
  "777-9": "b777x",
  "787-10": "b787",
  "787-9": "b787",
  "767-300er-refit": "b767",
  "747-8-intercontinental": "b747",
};

const slugifyModel = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const airlineHasModel = (airline = {}, slug = "") =>
  !slug ||
  (airline.models || []).some((model = {}) => slugifyModel(model.title || "") === slug);

const cleanAirlineName = (name = "") =>
  name
    .replace(/\bAirlines?\b/gi, "")
    .replace(/\bAir\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

const getAirlineTitle = (airline = {}) => {
  const chineseName = airline.shortName || "";
  const englishName = cleanAirlineName(airline.englishName || "");
  if (chineseName && englishName) return `${chineseName} ${englishName}`;
  return chineseName || englishName || cleanAirlineName(airline.displayName || "");
};

const buildSpecList = (specs = []) =>
  (specs || [])
    .map((spec) => `<li><strong>${spec.label}</strong>${spec.value}</li>`)
    .join("");

const resolveFamilySlug = (modelTitle = "") => {
  const slug = slugifyModel(modelTitle);
  return modelFamilyMap[slug] || slug;
};

const buildModelCards = (models = []) =>
  (models || [])
    .map((model = {}) => {
      const modelSlug = slugifyModel(model.title || "");
      const familySlug = resolveFamilySlug(model.title || "");
      const href = familySlug ? `aircraft.html?family=${encodeURIComponent(familySlug)}` : "#";
      const label = familySlug ? `前往 ${model.title} 所屬家族介紹` : `${model.title}`;
      return `
        <a class="model-card model-card-link" href="${href}" aria-label="${label}" data-model="${modelSlug}">
          <h3>${model.title}</h3>
          <p class="model-role">${model.role}</p>
          <ul class="model-specs">
            ${buildSpecList(model.specs)}
          </ul>
        </a>
      `;
    })
    .join("");

const renderAirlines = (airlines = []) => {
  if (detailContainer) {
    detailContainer.innerHTML = airlines
      .map(
        (airline) => {
          const title = getAirlineTitle(airline);
          return `
          <article class="aircraft-card airline-article" id="${airline.id}">
            <header>
              <div>
                <p class="aircraft-code">${airline.code}</p>
                <h2>${title}</h2>
                <p class="family">${airline.family}</p>
              </div>
              <span class="tag">${airline.tag}</span>
            </header>
            <p class="aircraft-summary">${airline.summary}</p>
            <div class="model-grid">
              ${buildModelCards(airline.models)}
            </div>
          </article>
        `;
        },
      )
      .join("");
  }

  if (sidebarList) {
    sidebarList.innerHTML = "";
    airlines.forEach((airline) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${airline.id}`;
      link.textContent = getAirlineTitle(airline);
      li.appendChild(link);
      sidebarList.appendChild(li);
    });
  }
};

const getHashTargetId = () => {
  const hash = window.location.hash.slice(1);
  if (!hash) return "";
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
};

const scrollToHashTarget = () => {
  const targetId = getHashTargetId();
  if (!targetId) return;
  const target = document.getElementById(targetId);
  if (!target) return;
  target.scrollIntoView({ block: "start", behavior: "smooth" });
};

let airlineData = [];
let allowedModelSlugs = null;

const setModelOptions = (options = []) => {
  if (!modelFilter) return;
  modelFilter.innerHTML = '<option value="">All Aircraft</option>';
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    modelFilter.appendChild(opt);
  });
  modelFilter.disabled = !options.length;
};

const resetModelOptions = () => {
  allowedModelSlugs = null;
  setModelOptions(modelOptions);
  modelFilter.value = "";
};

const updateModelOptionsForAirline = () => {
  const airlineId = airlineFilter?.value || "";
  if (!airlineId) {
    resetModelOptions();
    return;
  }
  const airline = airlineData.find((item) => item.id === airlineId);
  if (!airline) {
    resetModelOptions();
    return;
  }
  const slugs = Array.from(
    new Set((airline.models || []).map((model = {}) => slugifyModel(model.title || ""))).values(),
  );
  allowedModelSlugs = new Set(slugs);
  const filteredOptions = slugs.map((slug) => modelMap[slug]).filter(Boolean);
  setModelOptions(filteredOptions);
  if (!filteredOptions.length) {
    modelFilter.disabled = true;
  }
};

const applyFilters = () => {
  const airlineChoice = airlineFilter?.value || "";
  const modelChoice = (modelFilter?.value || "").trim();

  const filtered = airlineData.filter((airline) => {
    if (airlineChoice && airline.id !== airlineChoice) return false;
    if (!airlineHasModel(airline, modelChoice)) return false;
    return true;
  });

  renderAirlines(filtered);
};

const handleAirlineChange = () => {
  updateModelOptionsForAirline();
  if (allowedModelSlugs && modelFilter.value && !allowedModelSlugs.has(modelFilter.value)) {
    modelFilter.value = "";
  }
  applyFilters();
};

const populateAirlineOptions = () => {
  if (!airlineFilter) return;
  airlineFilter.innerHTML = '<option value="">All Airlines</option>';
  airlineData.forEach((airline) => {
    const option = document.createElement("option");
    option.value = airline.id;
    option.textContent = getAirlineTitle(airline);
    airlineFilter.appendChild(option);
  });
};

fetch("data/airlines.json")
  .then((response) => {
    if (!response.ok) throw new Error("無法載入航空資料");
    return response.json();
  })
  .then((data) => {
    if (Array.isArray(data)) {
      airlineData = data;
      resetModelOptions();
      populateAirlineOptions();
      renderAirlines(data);
      scrollToHashTarget();
    }
  })
  .catch((error) => {
    console.error(error);
    if (detailContainer) {
      detailContainer.innerHTML =
        '<p class="aircraft-summary">資料載入失敗，請稍後再試。</p>';
    }
  });

if (modelFilter) {
  modelFilter.addEventListener("change", applyFilters);
}

if (airlineFilter) {
  airlineFilter.addEventListener("change", handleAirlineChange);
}

window.addEventListener("hashchange", scrollToHashTarget);
