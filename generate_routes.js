const fs = require('fs');

const BUSE_NUMBERS = [14, 51, 72, 93, 2, 8, 38, 58, 67, 24, 80, 147, 131, 11, 46, 53, 115, 129, 28, 44];
const TASHKENT_BBOX = {
  minLat: 41.20, maxLat: 41.38,
  minLng: 69.15, maxLng: 69.35
};

function getRandomPoint() {
  const lat = TASHKENT_BBOX.minLat + Math.random() * (TASHKENT_BBOX.maxLat - TASHKENT_BBOX.minLat);
  const lng = TASHKENT_BBOX.minLng + Math.random() * (TASHKENT_BBOX.maxLng - TASHKENT_BBOX.minLng);
  return { lat, lng };
}

async function fetchRoute(start, end) {
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&overview=full`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates; // Array of [lng, lat]
    }
  } catch (e) {
    console.error("OSRM Error:", e);
  }
  return null;
}

async function generate() {
  console.log("Generating routes...");
  const routes = [];
  
  for (const num of BUSE_NUMBERS) {
    let path = null;
    let attempts = 0;
    while (!path && attempts < 5) {
      const p1 = getRandomPoint();
      const p2 = getRandomPoint();
      path = await fetchRoute(p1, p2);
      attempts++;
    }
    
    if (path && path.length > 10) {
      routes.push({
        id: `bus_${num}`,
        name: `Автобус №${num}`,
        path: path // These are real road geometries!
      });
      console.log(`Generated bus ${num} with ${path.length} points.`);
    }
  }

  // Rewrite MapData.js
  const mapDataPath = 'frontend/src/pages/MapData.js';
  let content = fs.readFileSync(mapDataPath, 'utf8');
  
  // Replace the old BUS_ROUTES array
  const regex = /export const BUS_ROUTES = \[[\s\S]*?\];/;
  const newRoutesCode = `export const BUS_ROUTES = ${JSON.stringify(routes, null, 2)};`;
  
  if (regex.test(content)) {
    content = content.replace(regex, newRoutesCode);
    fs.writeFileSync(mapDataPath, content, 'utf8');
    console.log("Successfully updated MapData.js!");
  } else {
    console.log("Could not find BUS_ROUTES array in MapData.js");
  }
}

generate();
