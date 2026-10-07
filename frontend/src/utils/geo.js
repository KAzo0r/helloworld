export async function reverseGeocode(lng, lat) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await res.json();
    if (data && data.address) {
      if (data.address.road) {
        return `${data.address.road}${data.address.house_number ? ', ' + data.address.house_number : ''}`;
      }
      return data.display_name.split(',')[0];
    }
  } catch (e) {
    console.error('Geo error', e);
  }
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

export async function getRoute(p1, p2) {
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${p1[0]},${p1[1]};${p2[0]},${p2[1]}?geometries=geojson`);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates; // Array of [lng, lat]
    }
  } catch(e) {
    console.error('OSRM error', e);
  }
  return [p1, p2]; // fallback to straight line
}
