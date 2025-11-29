document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const genre = document.getElementById('genre').value;
  const format = document.getElementById('format').value;
  const year = document.getElementById('year').value;
  const condition = document.getElementById('condition').value;

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<p>Loading...</p>';

  try {
    const params = new URLSearchParams({ genre, format, year, condition });
    const res = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();

    if (!data.length) {
      resultsDiv.innerHTML = '<p>No bargains found.</p>';
      return;
    }

    resultsDiv.innerHTML = '';
    data.forEach(item => {
      const div = document.createElement('div');
      div.classList.add('result-item');
      div.innerHTML = `
        <strong>${item.title}</strong> (${item.year})<br>
        Format: ${item.format} | Condition: ${item.condition} | Price: $${item.price.value}<br>
        <a href="${item.marketplace_url}" target="_blank">View on Discogs</a>
      `;
      resultsDiv.appendChild(div);
    });
  } catch (err) {
    resultsDiv.innerHTML = `<p>Error: ${err.message}</p>`;
  }
});
