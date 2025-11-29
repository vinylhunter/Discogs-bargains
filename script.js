document.getElementById('searchForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form values
  const genre = document.getElementById('genre').value;
  const format = document.getElementById('format').value;
  const year = document.getElementById('year').value;
  const condition = document.getElementById('condition').value;

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<p>Loading...</p>';

  try {
    // Replace this URL with your Worker deployment URL if different
    const workerURL = 'https://weathered-boat-3ab5.russellcliffe.workers.dev/';

    const params = new URLSearchParams({ genre, format, year, condition });
    const res = await fetch(`${workerURL}?${params.toString()}`);
    const data = await res.json();

    if (!data.length) {
      resultsDiv.innerHTML = '<p>No bargains found.</p>';
      return;
    }

    // Display results
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
