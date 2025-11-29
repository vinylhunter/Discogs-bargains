// ----------------------- CONFIG -----------------------
// Mode: If you deploy a simple backend (RECOMMENDED), set USE_BACKEND = true
// and set API_BASE to your backend URL (e.g. https://your-replit-name.username.repl.co).
// If you DO NOT have a backend and want to call Discogs directly (QUICK TEST),
// set USE_BACKEND = false and put your Discogs personal token in DISCOGS_USER_TOKEN.
// WARNING: putting your token in client-side code will expose it publicly.
const USE_BACKEND = true;
const API_BASE = 'https://weathered-boat-3ab5.russellcliffe.workers.dev/'; // <-- replace with your backend URL when you have one

// If you prefer no-backend quick test, set USE_BACKEND = false and fill this:
const DISCOGS_USER_TOKEN = ''; // <-- your Discogs personal access token if USE_BACKEND=false

// -------------------- END CONFIG ----------------------

const form = document.getElementById('searchForm');
const resultsSection = document.getElementById('resultsSection');
const resultsTableBody = document.querySelector('#resultsTable tbody');
const status = document.getElementById('status');
const summary = document.getElementById('summary');

form.addEventListener('submit', onSearch);
document.getElementById('clear').addEventListener('click', () => {
  form.reset();
  resultsSection.hidden = true;
  status.textContent = '';
  resultsTableBody.innerHTML = '';
  summary.textContent = '';
});

function setStatus(msg) { status.textContent = msg; }
function showError(msg) {
  status.textContent = 'Error: ' + msg;
  console.error(msg);
}

async function onSearch(e) {
  e.preventDefault();
  resultsSection.hidden = true;
  resultsTableBody.innerHTML = '';
  summary.textContent = '';
  setStatus('Searching Discogs…');

  const q = document.getElementById('q').value.trim();
  const format = document.getElementById('format').value.trim();
  const genre = document.getElementById('genre').value.trim();
  const yearFrom = document.getElementById('year_from').value;
  const yearTo = document.getElementById('year_to').value;
  const maxResults = parseInt(document.getElementById('max_results').value || '100', 10);

  const params = {
    q, format, genre,
    year_from: yearFrom || undefined,
    year_to: yearTo || undefined,
    per_page: 100
  };

  try {
    // We'll page until we collect up to maxResults
    let page = 1;
    let totalFetched = 0;
    const allResults = [];

    while (totalFetched < maxResults) {
      params.page = page;
      const batch = await discogsSearch(params);
      if (!batch || !batch.results || batch.results.length === 0) break;

      for (const r of batch.results) {
        allResults.push(r);
        totalFetched++;
        if (totalFetched >= maxResults) break;
      }
      if (batch.results.length < params.per_page) break;
      page++;
    }

    renderResults(allResults);
    setStatus(`Found ${allResults.length} releases (showing up to ${maxResults}).`);
  } catch (err) {
    showError(err.message || err);
  }
}

async function discogsSearch(params) {
  // Build querystring
  const query = new URLSearchParams();
  if (params.q) query.append('q', params.q);
  if (params.format) query.append('format', params.format);
  if (params.genre) query.append('genre', params.genre);
  if (params.year_from) query.append('year', params.year_from);
  if (params.year_to) query.append('year', params.year_to);
  if (params.per_page) query.append('per_page', params.per_page);
  if (params.page) query.append('page', params.page);

  if (USE_BACKEND) {
    // Ask the backend to query Discogs (recommended)
    const u = `${API_BASE}/search?${query.toString()}`;
    const res = await fetch(u);
    if (!res.ok) throw new Error('Backend search failed: ' + res.statusText);
    return await res.json();
  } else {
    // Direct client-side call to Discogs (QUICK TEST only)
    if (!DISCOGS_USER_TOKEN) throw new Error('Set DISCOGS_USER_TOKEN in script.js to use direct mode.');
    const u = `https://api.discogs.com/database/search?${query.toString()}&token=${encodeURIComponent(DISCOGS_USER_TOKEN)}`;
    const res = await fetch(u, { headers: { 'User-Agent': 'Vinylhunter-discogs-bargain-finder/1.0' }});
    if (!res.ok) {
      const txt = await res.text();
      throw new Error('Discogs API error: ' + res.status + ' ' + txt);
    }
    return await res.json();
  }
}

function renderResults(items) {
  resultsTableBody.innerHTML = '';
  if (!items || items.length === 0) {
    resultsSection.hidden = true;
    summary.textContent = 'No results.';
    return;
  }

  // Show up to 200 items to avoid huge pages
  items.slice(0, 200).forEach(item => {
    const tr = document.createElement('tr');

    const coverTd = document.createElement('td');
    const img = document.createElement('img');
    img.className = 'cover';
    img.alt = 'cover';
    img.src = item.cover_image || '';
    coverTd.appendChild(img);

    const titleTd = document.createElement('td');
    titleTd.innerHTML = `<strong>${escapeHtml(item.title || '')}</strong><br/><em>${escapeHtml((item.artist || item.title).toString())}</em>`;

    const yearTd = document.createElement('td');
    yearTd.textContent = item.year || '';

    const fmtTd = document.createElement('td');
    fmtTd.textContent = (item.format || []).join(', ');

    const linkTd = document.createElement('td');
    const a = document.createElement('a');
    a.href = item.resource_url ? `https://www.discogs.com${item.resource_url.replace('https://api.discogs.com', '')}` : item.resource_url;
    a.target = '_blank';
    a.className = 'link';
    a.textContent = 'View on Discogs';
    linkTd.appendChild(a);

    const notesTd = document.createElement('td');
    // We can't reliably compute bargains without marketplace/sales data.
    // So provide some quick hints: if community.have is low and community.want is high that's interesting.
    if (item.community) {
      notesTd.innerHTML = `Have: ${item.community.have || 0} • Want: ${item.community.want || 0}`;
    } else {
      notesTd.textContent = '';
    }

    tr.appendChild(coverTd);
    tr.appendChild(titleTd);
    tr.appendChild(yearTd);
    tr.appendChild(fmtTd);
    tr.appendChild(linkTd);
    tr.appendChild(notesTd);

    resultsTableBody.appendChild(tr);
  });

  resultsSection.hidden = false;
  summary.textContent = `Showing ${Math.min(items.length, 200)} releases`;
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}
