const form = document.getElementById("search-form");
const resultsDiv = document.getElementById("results");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const release_id = document.getElementById("release_id").value.trim();
  const genre = document.getElementById("genre").value.trim();
  const format = document.getElementById("format").value.trim();
  const year = document.getElementById("year").value.trim();

  resultsDiv.innerHTML = "Loading...";

  try {
    // Build query URL for Worker
    const params = new URLSearchParams();
    if (release_id) params.append("release_id", release_id);
    if (genre) params.append("genre", genre);
    if (format) params.append("format", format);
    if (year) params.append("year", year);

    const workerUrl = `https://weathered-boat-3ab5.russellcliffe.workers.dev/?${params.toString()}`;
    const res = await fetch(workerUrl);
    const data = await res.json();

    if (!data.release) {
      resultsDiv.innerHTML = "<p>No results found.</p>";
      return;
    }

    const release = data.release;
    let html = `<h2>${release.title} (${release.year})</h2>`;
    html += `<p>Genres: ${release.genres.join(", ")}</p>`;

    if (release.formats.length > 0) {
      html += "<h3>Formats:</h3><ul>";
      release.formats.forEach(f => {
        html += `<li>${f.name} - ${f.descriptions.join(", ")}</li>`;
      });
      html += "</ul>";
    }

    resultsDiv.innerHTML = html;

  } catch (err) {
    resultsDiv.innerHTML = `<p>Error: ${err.message}</p>`;
  }
});
