/**
 * Meme and Humor Idea Generator Frontend Script.
 * Connects UI elements to Python Flask REST endpoints.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Navigation tabs
  const navBtns = document.querySelectorAll(".nav-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      tabPanels.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const tabId = `tab-${btn.dataset.tab}`;
      const panel = document.getElementById(tabId);
      if (panel) panel.classList.add("active");

      if (btn.dataset.tab === "favorites") loadFavorites();
      if (btn.dataset.tab === "history") loadHistory();
    });
  });

  // Quick Chips
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const topicInput = document.getElementById("topicInput");
      topicInput.value = chip.dataset.topic;
      topicInput.focus();
    });
  });

  // Check backend health
  checkHealth();
  loadFavoritesCount();

  // Generator Buttons
  document.getElementById("generateBtn").addEventListener("click", () => generateMemes());
  document.getElementById("surpriseBtn").addEventListener("click", () => triggerSurpriseMe());
  document.getElementById("generateCaptionsBtn").addEventListener("click", () => generateCaptions());
  document.getElementById("generateJokesBtn").addEventListener("click", () => generateJokes());
  document.getElementById("clearHistoryBtn").addEventListener("click", () => clearHistory());
  document.getElementById("favSearchInput").addEventListener("input", (e) => loadFavorites(e.target.value));
});

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

async function checkHealth() {
  const badge = document.getElementById("healthBadge");
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    if (data.status === "healthy") {
      badge.innerHTML = `<span class="status-dot"></span> Provider: <strong>${data.provider}</strong>`;
    }
  } catch (e) {
    badge.innerHTML = `<span class="status-dot" style="background:#ef4444"></span> Offline Mode`;
  }
}

async function generateMemes() {
  const topic = document.getElementById("topicInput").value.trim();
  if (!topic) {
    showToast("Please enter a topic first!");
    return;
  }

  const btn = document.getElementById("generateBtn");
  const origText = btn.innerHTML;
  btn.innerHTML = `<span class="loading-spinner"></span> Generating Ideas...`;
  btn.disabled = true;

  const category = document.getElementById("categorySelect").value;
  const style = document.getElementById("styleSelect").value;
  const language = document.getElementById("languageSelect").value;
  const intensity = document.getElementById("intensitySelect").value;

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        category,
        style,
        language,
        intensity,
        count: 5
      })
    });

    const data = await res.json();
    if (res.ok) {
      renderMemeResults(data);
      showToast("Generated 5 meme ideas!");
      loadFavoritesCount();
    } else {
      showToast(data.error || "Generation failed");
    }
  } catch (err) {
    showToast("Error connecting to server");
  } finally {
    btn.innerHTML = origText;
    btn.disabled = false;
  }
}

function triggerSurpriseMe() {
  const topics = [
    "Attending 8 AM lecture on Monday",
    "WiFi disconnecting right during exam submission",
    "Hostel mess calling boiled potato a cutlet",
    "Writing code that works only on developer laptop",
    "Looking at bank account on 28th of the month",
    "Saying 'I am on the way' while still wearing pajamas"
  ];
  const categories = ["Relatable Humor", "College and Student Humor", "Programming and Developer Humor", "Situational Comedy"];
  const styles = ["Witty", "Sarcastic", "Playful", "Exaggerated"];
  const languages = ["English", "Tanglish"];

  document.getElementById("topicInput").value = topics[Math.floor(Math.random() * topics.length)];
  document.getElementById("categorySelect").value = categories[Math.floor(Math.random() * categories.length)];
  document.getElementById("styleSelect").value = styles[Math.floor(Math.random() * styles.length)];
  document.getElementById("languageSelect").value = languages[Math.floor(Math.random() * languages.length)];

  generateMemes();
}

function renderMemeResults(data) {
  const container = document.getElementById("resultsContainer");
  container.innerHTML = "";

  const ideas = data.ideas || [];
  const source = data.source || "ai";
  const sourceLabel = source === "ai" ? "Gemini AI" : "Fallback Engine";
  const sourceClass = source === "ai" ? "source-ai" : "source-fallback";

  ideas.forEach((idea, idx) => {
    const card = document.createElement("div");
    card.className = "meme-card";
    card.innerHTML = `
      <div>
        <div class="card-top">
          <h3 class="card-title">${idea.title || `Idea #${idx + 1}`}</h3>
          <span class="source-badge ${sourceClass}">${sourceLabel}</span>
        </div>
        <div class="meme-visual-box">
          <div class="meme-text-top">${idea.top_text || ""}</div>
          <div class="visual-scene-desc"><span style="font-weight:600;">Scene Description:</span> ${idea.visual_scene || idea.concept || ""}</div>
          <div class="meme-text-bottom">${idea.bottom_text || ""}</div>
        </div>
        <div class="caption-quote">${idea.caption || ""}</div>
        <div class="hashtags-row">
          ${(idea.hashtags || []).map(t => `<span class="tag">${t}</span>`).join(" ")}
        </div>
      </div>
      <div class="card-actions">
        <button class="action-btn" onclick="copyText('${escapeQuotes(idea.caption || "")}', 'Caption copied')">Copy Caption</button>
        <button class="action-btn" onclick="copyFullMeme(${idx})">Copy Concept</button>
        <button class="action-btn" id="save-btn-${idx}" onclick="saveIdea(${idx})">Save</button>
        <select class="refine-select" onchange="refineIdea(${idx}, this.value)">
          <option value="">Refine Concept...</option>
          <option value="make it funnier">Make Funnier</option>
          <option value="make it shorter">Make Shorter</option>
          <option value="make it more relatable">More Relatable</option>
          <option value="add tanglish punch">Convert to Tanglish</option>
        </select>
      </div>
    `;
    container.appendChild(card);
  });

  window.__CURRENT_IDEAS__ = {
    topic: data.topic,
    category: data.category,
    language: data.language,
    ideas: ideas
  };
}

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function copyText(text, msg = "Copied to clipboard") {
  navigator.clipboard.writeText(text).then(() => {
    showToast(msg);
  });
}

function copyFullMeme(idx) {
  const idea = window.__CURRENT_IDEAS__?.ideas?.[idx];
  if (!idea) return;
  const fullText = `Title: ${idea.title}\nTop Text: ${idea.top_text}\nVisual Scene: ${idea.visual_scene}\nBottom Text: ${idea.bottom_text}\nCaption: ${idea.caption}\nTags: ${(idea.hashtags || []).join(" ")}`;
  copyText(fullText, "Meme concept copied");
}

async function saveIdea(idx) {
  const store = window.__CURRENT_IDEAS__;
  const idea = store?.ideas?.[idx];
  if (!idea) return;

  const btn = document.getElementById(`save-btn-${idx}`);
  try {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: store.topic || "Meme",
        category: store.category || "General",
        language: store.language || "English",
        content: idea
      })
    });
    if (res.ok) {
      if (btn) {
        btn.classList.add("saved");
        btn.textContent = "Saved";
      }
      showToast("Saved to Favorites!");
      loadFavoritesCount();
    }
  } catch (e) {
    showToast("Error saving favorite");
  }
}

async function refineIdea(idx, instruction) {
  if (!instruction) return;
  const store = window.__CURRENT_IDEAS__;
  const idea = store?.ideas?.[idx];
  if (!idea) return;

  showToast(`Refining: ${instruction}...`);
  try {
    const res = await fetch("/api/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idea: idea,
        instruction: instruction,
        language: store.language || "English"
      })
    });
    const data = await res.json();
    if (res.ok && data.refined_idea) {
      store.ideas[idx] = data.refined_idea;
      renderMemeResults(store);
      showToast("Refinement applied!");
    }
  } catch (e) {
    showToast("Refinement failed");
  }
}

async function generateCaptions() {
  const topic = document.getElementById("captionTopicInput").value.trim();
  if (!topic) {
    showToast("Enter a topic or situation for captions!");
    return;
  }
  const tone = document.getElementById("captionToneSelect").value;
  const language = document.getElementById("captionLangSelect").value;
  const btn = document.getElementById("generateCaptionsBtn");
  btn.textContent = "Generating...";
  btn.disabled = true;

  try {
    const res = await fetch("/api/captions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, tone, language, count: 5 })
    });
    const data = await res.json();
    const container = document.getElementById("captionResults");
    container.innerHTML = "";
    (data.captions || []).forEach(c => {
      const el = document.createElement("div");
      el.className = "caption-item";
      el.innerHTML = `
        <p style="font-size:0.95rem; margin-bottom:12px;">${c.caption}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:#818cf8;">${c.tone} / ${c.platform || 'Social'}</span>
          <button class="action-btn" onclick="copyText('${escapeQuotes(c.caption)}')">Copy</button>
        </div>
      `;
      container.appendChild(el);
    });
    showToast("Generated 5 captions!");
  } catch (e) {
    showToast("Error generating captions");
  } finally {
    btn.textContent = "Generate 5 Captions";
    btn.disabled = false;
  }
}

async function generateJokes() {
  const category = document.getElementById("jokeCategorySelect").value;
  const count = parseInt(document.getElementById("jokeCountSelect").value) || 5;
  const language = document.getElementById("jokeLangSelect").value;
  const btn = document.getElementById("generateJokesBtn");
  btn.textContent = "Generating...";
  btn.disabled = true;

  try {
    const res = await fetch("/api/jokes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, style: "Witty", language, count })
    });
    const data = await res.json();
    const container = document.getElementById("jokeResults");
    container.innerHTML = "";
    (data.jokes || []).forEach(j => {
      const el = document.createElement("div");
      el.className = "joke-card";
      el.innerHTML = `
        <div>
          <div class="joke-setup">${j.setup}</div>
          <div class="joke-punchline">${j.punchline}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:#94a3b8;">${j.type || 'Joke'}</span>
          <button class="action-btn" onclick="copyText('${escapeQuotes(j.setup + ' - ' + j.punchline)}')">Copy</button>
        </div>
      `;
      container.appendChild(el);
    });
    showToast(`Generated ${data.jokes?.length || 0} jokes!`);
  } catch (e) {
    showToast("Error generating jokes");
  } finally {
    btn.textContent = "Generate Jokes";
    btn.disabled = false;
  }
}

async function loadFavorites(search = "") {
  try {
    const url = search ? `/api/favorites?search=${encodeURIComponent(search)}` : "/api/favorites";
    const res = await fetch(url);
    const data = await res.json();
    const container = document.getElementById("favoritesList");
    container.innerHTML = "";

    const favs = data.favorites || [];
    document.getElementById("favCount").textContent = favs.length;

    if (favs.length === 0) {
      container.innerHTML = `<p style="color:#94a3b8; font-style:italic; padding:20px 0;">No saved favorites found.</p>`;
      return;
    }

    favs.forEach(f => {
      const c = f.content || {};
      const el = document.createElement("div");
      el.className = "meme-card";
      el.innerHTML = `
        <div>
          <div class="card-top">
            <h3 class="card-title">${c.title || f.topic}</h3>
            <span class="source-badge source-ai">${f.category || 'General'}</span>
          </div>
          <div class="meme-visual-box">
            <div class="meme-text-top">${c.top_text || ""}</div>
            <div class="visual-scene-desc">${c.visual_scene || ""}</div>
            <div class="meme-text-bottom">${c.bottom_text || ""}</div>
          </div>
          <div class="caption-quote">${c.caption || ""}</div>
        </div>
        <div class="card-actions">
          <button class="action-btn" onclick="copyText('${escapeQuotes(c.caption || "")}')">Copy</button>
          <button class="action-btn btn-danger-outline" onclick="deleteFav(${f.id})">Delete</button>
        </div>
      `;
      container.appendChild(el);
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadFavoritesCount() {
  try {
    const res = await fetch("/api/favorites");
    const data = await res.json();
    document.getElementById("favCount").textContent = (data.favorites || []).length;
  } catch (e) {}
}

async function deleteFav(id) {
  try {
    const res = await fetch(`/api/favorites/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Removed from favorites");
      loadFavorites();
      loadFavoritesCount();
    }
  } catch (e) {
    showToast("Error deleting favorite");
  }
}

async function loadHistory() {
  try {
    const res = await fetch("/api/history");
    const data = await res.json();
    const container = document.getElementById("historyList");
    container.innerHTML = "";

    const list = data.history || [];
    if (list.length === 0) {
      container.innerHTML = `<p style="color:#94a3b8; font-style:italic; padding:20px 0;">No generation history recorded.</p>`;
      return;
    }

    list.forEach(h => {
      const el = document.createElement("div");
      el.className = "history-item";
      el.innerHTML = `
        <div>
          <strong style="color:#f8fafc; font-size:1rem;">${h.topic}</strong>
          <div style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">
            ${h.settings?.category || ''} • ${h.settings?.language || 'English'} • ${new Date(h.created_at).toLocaleString()}
          </div>
        </div>
        <div>
          <button class="action-btn" onclick="reopenHistory(${h.id})">Reopen</button>
        </div>
      `;
      container.appendChild(el);
    });
    window.__HISTORY_CACHE__ = list;
  } catch (e) {
    console.error(e);
  }
}

function reopenHistory(id) {
  const item = (window.__HISTORY_CACHE__ || []).find(h => h.id === id);
  if (!item || !item.result) return;
  document.querySelector('.nav-btn[data-tab="memes"]').click();
  document.getElementById("topicInput").value = item.topic;
  renderMemeResults(item.result);
  showToast("Reopened previous generation!");
}

async function clearHistory() {
  if (!confirm("Are you sure you want to clear your generation history?")) return;
  try {
    const res = await fetch("/api/history", { method: "DELETE" });
    if (res.ok) {
      showToast("History cleared!");
      loadHistory();
    }
  } catch (e) {
    showToast("Error clearing history");
  }
}
