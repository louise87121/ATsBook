const manufacturerFilter = document.getElementById("manufacturerFilter");
const modelFilter = document.getElementById("modelFilter");
const airlineDatalist = document.getElementById("airlinesData");
const sidebarList = document.getElementById("airlineSidebar");
const detailContainer = document.getElementById("airlineDetails");

const modelOptions = {
  airbus: [
    { value: "a350", label: "Airbus A350-900" },
    { value: "a321neo", label: "Airbus A321neo LR" },
  ],
  boeing: [
    { value: "b7810", label: "Boeing 787-10" },
    { value: "b773er", label: "Boeing 777-300ER" },
  ],
};

const buildSpecList = (specs = []) =>
  (specs || [])
    .map((spec) => `<li><strong>${spec.label}</strong>${spec.value}</li>`)
    .join("");

const buildModelCards = (models = []) =>
  (models || [])
    .map(
      (model) => `
        <section class="model-card">
          <h3>${model.title}</h3>
          <p class="model-role">${model.role}</p>
          <ul class="model-specs">
            ${buildSpecList(model.specs)}
          </ul>
        </section>
      `,
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
      if (airline.shortName) datalistValues.add(airline.shortName);
      if (airline.englishName) datalistValues.add(airline.englishName);
      (airline.aliases || []).forEach((alias) => datalistValues.add(alias));
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

manufacturerFilter.addEventListener("change", () => {
  const choice = manufacturerFilter.value;
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
});
