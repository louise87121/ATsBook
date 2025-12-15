const titleEl = document.getElementById("aircraftName");
const subtitleEl = document.getElementById("aircraftSubtitle");
const metaEl = document.getElementById("aircraftMeta");
const descEl = document.getElementById("aircraftDescription");
const statsEl = document.getElementById("aircraftStats");
const comfortEl = document.getElementById("aircraftComfort");
const spotlightEl = document.getElementById("spotlightList");
const airlineListEl = document.getElementById("airlineList");
const routesEl = document.getElementById("aircraftRoutes");
const layoutEl = document.querySelector(".aircraft-detail-layout");
const badgeEl = document.getElementById("aircraftBadge");
const variantGridEl = document.getElementById("variantGrid");

const params = new URLSearchParams(window.location.search);
const familyParam = slugifyModel(params.get("family") || "");
const modelParam = slugifyModel(params.get("model") || "");

function slugifyModel(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const renderEmptyState = (title, message) => {
  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = message;
  if (layoutEl) {
    layoutEl.innerHTML = `
      <section class="aircraft-card empty-state">
        <p>${message}</p>
        <a href="index.html">回到機隊選單</a>
      </section>
    `;
  }
};

const renderStats = (stats = []) =>
  stats
    .map(
      (item) => `
        <div class="spec-block">
          <strong>${item.label}</strong>
          <span>${item.value}</span>
        </div>
      `,
    )
    .join("");

const renderList = (items = []) =>
  items
    .map((item) => `<li>${item}</li>`)
    .join("");

const renderVariantSpecs = (stats = []) =>
  (stats || [])
    .slice(0, 3)
    .map(
      (item) => `
        <li>
          <strong>${item.label}</strong>
          <span>${item.value}</span>
        </li>
      `,
    )
    .join("");

const fetchJSON = (url, errorMessage) =>
  fetch(url).then((response) => {
    if (!response.ok) throw new Error(errorMessage);
    return response.json();
  });

const findFamilyBySlug = (dataset = [], slug = "") =>
  dataset.find((item = {}) => {
    if (!slug) return false;
    const aliasHit = (item.aliases || []).some((alias) => slugifyModel(alias) === slug);
    return (
      slugifyModel(item.id || "") === slug ||
      slugifyModel(item.name || "") === slug ||
      aliasHit
    );
  });

const findFamilyByVariant = (dataset = [], variantSlug = "") =>
  dataset.find((item = {}) =>
    (item.variants || []).some((variant = {}) => {
      const values = [variant.id, variant.title, ...(variant.aliases || [])];
      return values.some((value) => slugifyModel(value || "") === variantSlug);
    }),
  );

const buildVariantCards = (family = {}, detailMap = {}) => {
  if (!variantGridEl) return;
  const variants = family.variants || [];
  const cards = variants
    .map((variant = {}) => {
      const lookupKey = slugifyModel(variant.id || variant.title || "");
      const detail = detailMap[lookupKey];
      if (!detail) return "";
      const summary = variant.summary || detail.description || detail.comfort || "";
      const specList = renderVariantSpecs(detail.stats || []);
      const comfort = detail.comfort ? `<p class="variant-comfort">${detail.comfort}</p>` : "";
      return `
        <article class="variant-card">
          <div class="variant-card-header">
            <span class="variant-badge">${variant.badge || detail.nickname || "Variant"}</span>
            <h3>${detail.name || variant.title || variant.id}</h3>
          </div>
          <p class="variant-summary">${summary}</p>
          ${specList ? `<ul class="variant-specs">${specList}</ul>` : ""}
          ${comfort}
        </article>
      `;
    })
    .filter(Boolean)
    .join("");

  if (cards) {
    variantGridEl.innerHTML = cards;
    variantGridEl.parentElement.style.display = "block";
  } else {
    variantGridEl.innerHTML = "";
    variantGridEl.parentElement.style.display = "none";
  }
};

const createDetailMap = (details = []) => {
  const map = {};
  details.forEach((detail = {}) => {
    const keys = [detail.id, detail.name, ...(detail.aliases || [])]
      .map((value) => slugifyModel(value || ""))
      .filter(Boolean);
    keys.forEach((key) => {
      if (!map[key]) {
        map[key] = detail;
      }
    });
  });
  return map;
};

Promise.all([
  fetchJSON("data/aircraft-families.json", "無法載入機型家族資料"),
  fetchJSON("data/aircraft-details.json", "無法載入機型資料"),
])
  .then(([familyData, detailData]) => {
    const families = Array.isArray(familyData) ? familyData : [];
    const detailMap = createDetailMap(Array.isArray(detailData) ? detailData : []);

    let targetSlug = familyParam;
    if (!targetSlug && modelParam) {
      const familyFromVariant = findFamilyByVariant(families, modelParam);
      if (familyFromVariant) targetSlug = slugifyModel(familyFromVariant.id || familyFromVariant.name);
    }

    if (!targetSlug) {
      renderEmptyState("請選擇機型家族", "請從首頁點擊想了解的機型。說明卡將帶你進入對應的家族頁面。");
      return;
    }

    const family = findFamilyBySlug(families, targetSlug);
    if (!family) {
      renderEmptyState("找不到機型家族", "目前沒有這個機型的資料，請選擇其他熱門機型。");
      return;
    }

    document.title = `${family.name} | AirTraveler's Book`;
    if (titleEl) titleEl.textContent = family.name;
    if (subtitleEl) subtitleEl.textContent = family.nickname || family.manufacturer || "";
    if (metaEl) metaEl.textContent = family.manufacturer || "";
    if (badgeEl) badgeEl.textContent = family.nickname || "Signature Type";
    if (descEl) descEl.textContent = family.description || "";
    if (statsEl) statsEl.innerHTML = renderStats(family.stats || []);
    if (comfortEl) {
      comfortEl.textContent = family.comfort || "";
      comfortEl.style.display = family.comfort ? "block" : "none";
    }
    if (spotlightEl) {
      const list = renderList(family.spotlight || []);
      spotlightEl.innerHTML = list;
      spotlightEl.parentElement.style.display = list ? "block" : "none";
    }
    if (routesEl) routesEl.textContent = family.routes || "";
    if (airlineListEl) {
      const airlines = (family.airlines || [])
        .map((name) => `<li class="airline-chip">${name}</li>`)
        .join("");
      airlineListEl.innerHTML = airlines;
      airlineListEl.style.display = airlines ? "flex" : "none";
    }

    buildVariantCards(family, detailMap);
  })
  .catch(() => {
    renderEmptyState("資料載入失敗", "暫時無法取得機型資訊，請稍後再試。");
  });
