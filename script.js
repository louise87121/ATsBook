const manufacturerFilter = document.getElementById("manufacturerFilter");
const modelFilter = document.getElementById("modelFilter");
const airlineDatalist = document.getElementById("airlinesData");
const sidebarList = document.getElementById("airlineSidebar");
const detailContainer = document.getElementById("airlineDetails");

const modelOptions = {
  airbus: [
    { value: "a350-900", label: "Airbus A350-900" },
    { value: "a350-1000", label: "Airbus A350-1000" },
    { value: "a321neo", label: "Airbus A321neo" },
    { value: "a321neo-lr", label: "Airbus A321neo LR" },
    { value: "a330-900neo", label: "Airbus A330-900neo" },
    { value: "a380-800", label: "Airbus A380-800" },
    { value: "a380-800-flying-honu", label: "Airbus A380-800 Flying Honu" },
  ],
  boeing: [
    { value: "787-10", label: "Boeing 787-10" },
    { value: "787-9", label: "Boeing 787-9" },
    { value: "777-300er", label: "Boeing 777-300ER" },
    { value: "777-9", label: "Boeing 777-9" },
    { value: "767-300er-refit", label: "Boeing 767-300ER (Refit)" },
    { value: "747-8-intercontinental", label: "Boeing 747-8 Intercontinental" },
  ],
};

const manufacturerAliasMap = {
  airbus: "airbus",
  空巴: "airbus",
  空中巴士: "airbus",
  boeing: "boeing",
  波音: "boeing",
};

const getPrimaryAirlineName = (airline = {}) =>
  airline.shortName || airline.englishName || airline.displayName || airline.code;

const modelFamilyMap = {
  "a350-900": "a350",
  "a350-1000": "a350",
  "a321neo": "a321neo",
  "a321neo-lr": "a321neo",
  "a330-900neo": "a330neo",
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

const resolveFamilySlug = (modelTitle = "") => {
  const slug = slugifyModel(modelTitle);
  return modelFamilyMap[slug] || slug;
};

const normalizeManufacturerValue = (value = "") => {
  const compact = (value || "").toString().trim().toLowerCase().replace(/\s+/g, "");
  return manufacturerAliasMap[compact] || "";
};

const buildSpecList = (specs = []) =>
  (specs || [])
    .map((spec) => `<li><strong>${spec.label}</strong>${spec.value}</li>`)
    .join("");

const buildModelCards = (models = []) =>
  (models || [])
    .map(
      (model = {}) => {
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
      },
    )
    .join("");

const renderAirlines = (airlines = []) => {
  if (detailContainer) {
    detailContainer.innerHTML = airlines
      .map(
        (airline) => `
          <article class="aircraft-card airline-article" id="${airline.id}">
            <header>
              <div>
                <p class="aircraft-code">${airline.code}</p>
                <h2>${airline.displayName}</h2>
                <p class="family">${airline.family}</p>
              </div>
              <span class="tag">${airline.tag}</span>
            </header>
            <p class="aircraft-summary">${airline.summary}</p>
            <div class="model-grid">
              ${buildModelCards(airline.models)}
            </div>
          </article>
        `,
      )
      .join("");
  }

  if (sidebarList) {
    sidebarList.innerHTML = "";
    airlines.forEach((airline) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#${airline.id}`;
      link.textContent = airline.displayName;
      li.appendChild(link);
      sidebarList.appendChild(li);
    });
  }

  if (airlineDatalist) {
    const datalistValues = new Set();
    airlines.forEach((airline) => {
      const primaryName = getPrimaryAirlineName(airline);
      if (primaryName) datalistValues.add(primaryName);
    });
    airlineDatalist.innerHTML = "";
    datalistValues.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      airlineDatalist.appendChild(option);
    });
  }
};

fetch("data.json")
  .then((response) => {
    if (!response.ok) throw new Error("無法載入航空資料");
    return response.json();
  })
  .then((data) => {
    if (Array.isArray(data)) {
      renderAirlines(data);
    }
  })
  .catch((error) => {
    console.error(error);
    if (detailContainer) {
      detailContainer.innerHTML =
        '<p class="aircraft-summary">資料載入失敗，請稍後再試。</p>';
    }
  });

const handleManufacturerSelection = () => {
  const choice = normalizeManufacturerValue(manufacturerFilter.value);
  modelFilter.innerHTML = "";
  if (!choice || !modelOptions[choice]) {
    modelFilter.disabled = true;
    modelFilter.insertAdjacentHTML("beforeend", '<option value="">請先選製造商</option>');
    return;
  }
  modelFilter.disabled = false;
  modelOptions[choice].forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    modelFilter.appendChild(opt);
  });
};

manufacturerFilter.addEventListener("input", handleManufacturerSelection);
manufacturerFilter.addEventListener("change", handleManufacturerSelection);
