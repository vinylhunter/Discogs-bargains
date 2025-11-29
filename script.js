// Replace this with the URL of your Cloudflare Worker
const API_BASE = "https://weathered-boat-3ab5.russellcliffe.workers.dev/";

async function searchBargains() {
    const format = document.getElementById("format").value;
    const genre = document.getElementById("genre").value;
    const year = document.getElementById("year").value;
    const condition = document.getElementById("condition").value;

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Searching Discogs…</p>";

    let url = `${API_BASE}/search?format=${encodeURIComponent(format)}&genre=${encodeURIComponent(genre)}&year=${encodeURIComponent(year)}&condition=${encodeURIComponent(condition)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            resultsDiv.innerHTML = "<p>No results found.</p>";
            return;
        }

        // Display results
        let html = "<h2>Results:</h2>";
        html += "<ul>";

        data.results.forEach(item => {
            html += `
                <li>
                    <strong>${item.title}</strong><br>
                    Artist: ${item.artist || "Unknown"}<br>
                    Year: ${item.year || "Unknown"}<br>
                    Format: ${item.format ? item.format.join(", ") : "N/A"}<br>
                    <a href="https://discogs.com${item.uri}" target="_blank">View on Discogs</a>
                </li>
                <br>
            `;
        });

        html += "</ul>";
        resultsDiv.innerHTML = html;

    } catch (err) {
        resultsDiv.innerHTML = "<p>Error loading data.</p>";
        console.error(err);
    }
}
