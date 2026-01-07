import { PLAN, ICONS } from "./data.js";

const $ = (sel)=>document.querySelector(sel);

function weekdayLabel(day){
  // day1 = Monday
  const names = ["Mo","Di","Mi","Do","Fr","Sa","So"];
  return names[(day-1)%7];
}

function svgToEl(svgStr){
  const tpl = document.createElement("template");
  tpl.innerHTML = svgStr.trim();
  return tpl.content.firstChild;
}

function renderList(activeIndex){
  const list = $("#dayList");
  list.innerHTML = "";
  PLAN.forEach((d, idx)=>{
    const dayNum = idx+1;
    const row = document.createElement("div");
    row.className = "day" + (idx===activeIndex ? " active" : "");
    row.innerHTML = `
      <div>
        <div style="font-weight:700">Tag ${String(dayNum).padStart(2,"0")} <small>(${weekdayLabel(dayNum)})</small></div>
        <small>${d.focus || ""}</small>
      </div>
      <div style="opacity:.8">›</div>
    `;
    row.addEventListener("click", ()=>{
      setActive(idx, true);
    });
    list.appendChild(row);
  });
}

function renderDay(idx){
  const d = PLAN[idx];
  const dayNum = idx+1;

  $("#dayTitle").textContent = d.title + ` (${weekdayLabel(dayNum)})`;
  $("#dayFocus").textContent = d.focus || "";
  $("#dayMeta").innerHTML = `
    <span class="pill">${d.sets || "3 Sätze"}</span>
    <span class="pill">${d.reps || "8–12 Wiederholungen"}</span>
    <span class="pill">Keine Bauchlage · keine Pressatmung</span>
  `;

  const box = $("#exercises");
  box.innerHTML = "";

  if (dayNum % 7 === 0){
    const ex = document.createElement("div");
    ex.className = "exercise";
    const iconWrap = document.createElement("div");
    iconWrap.className = "icon";
    iconWrap.appendChild(svgToEl(ICONS["rest"]));
    ex.appendChild(iconWrap);

    const txt = document.createElement("div");
    txt.innerHTML = `<h4>Pause</h4>
      <p>Optional: 5–10 Minuten ruhige Atmung + Fußpumpe. Ziel: Durchblutung, Ruhe, Regeneration.</p>`;
    ex.appendChild(txt);
    box.appendChild(ex);
  } else {
    d.items.forEach((it)=>{
      const [name, instr, iconKey] = it;
      const card = document.createElement("div");
      card.className = "exercise";

      const iconWrap = document.createElement("div");
      iconWrap.className = "icon";
      iconWrap.appendChild(svgToEl(ICONS[iconKey] || ICONS["breath"]));

      const txt = document.createElement("div");
      txt.innerHTML = `<h4>${name}</h4><p>${instr}</p>`;
      card.appendChild(iconWrap);
      card.appendChild(txt);
      box.appendChild(card);
    });
  }

  $("#pageHint").textContent = "Tagesseite: " + `tag-${String(dayNum).padStart(2,"0")}.html`;
}

function setActive(idx, push){
  const clamped = Math.max(0, Math.min(PLAN.length-1, idx));
  renderList(clamped);
  renderDay(clamped);
  const dayNum = clamped+1;
  document.title = `Reha-Plan – Tag ${String(dayNum).padStart(2,"0")}`;
  if(push){
    history.pushState({day: dayNum}, "", `tag-${String(dayNum).padStart(2,"0")}.html`);
  }
}

function parseDayFromPath(){
  const m = location.pathname.match(/tag-(\d{2})\.html$/);
  if(!m) return 1;
  const n = parseInt(m[1],10);
  if(Number.isFinite(n) && n>=1 && n<=30) return n;
  return 1;
}

function init(){
  const startDay = parseDayFromPath();
  const idx = startDay-1;

  $("#prevBtn").addEventListener("click", ()=>setActive(idx-1, true));
  $("#nextBtn").addEventListener("click", ()=>setActive(idx+1, true));

  $("#pdfBtn").addEventListener("click", ()=>{
    window.open("./rehaplan-30-tage.pdf", "_blank");
  });

  $("#homeBtn").addEventListener("click", ()=>{
    history.pushState({}, "", "./index.html");
    setActive(0, false);
  });

  window.addEventListener("popstate", (e)=>{
    const day = (e.state && e.state.day) ? e.state.day : parseDayFromPath();
    setActive(day-1, false);
  });

  setActive(idx, false);
}

init();