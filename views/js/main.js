const engines = JSON.parse(data);

function renderEngines() {
  const engineList = document.getElementById('engine-list');

  engines.forEach(engine => {
    const engineDiv = document.createElement('div');
    // Add engine details to the div here
  });
}