let leafletPromise = null;

export function cargarLeaflet() {
  if (window.L) {
    return Promise.resolve(window.L);
  }

  if (leafletPromise) {
    return leafletPromise;
  }

  leafletPromise = new Promise((resolve, reject) => {
    const cssId = "leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => {
      leafletPromise = null;
      reject(new Error("No se pudo cargar OpenStreetMap."));
    };
    document.head.appendChild(script);
  });

  return leafletPromise;
}

export async function geocodificarDireccion(direccion, barrio = "Chicala del Sur") {
  const params = new URLSearchParams({
    format: "jsonv2",
    q: `${direccion}, ${barrio}, Bogota, Colombia`,
    countrycodes: "co",
    limit: "1",
    addressdetails: "1",
  });

  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("No se pudo consultar OpenStreetMap.");
  }

  const data = await res.json();
  const resultado = data?.[0];

  if (!resultado) {
    return null;
  }

  return {
    lat: Number(resultado.lat),
    lng: Number(resultado.lon),
    direccion: resultado.display_name,
  };
}

export function puntoEnPoligono(punto, poligono) {
  let dentro = false;
  let j = poligono.length - 1;

  for (let i = 0; i < poligono.length; i += 1) {
    const latI = poligono[i].lat;
    const lngI = poligono[i].lng;
    const latJ = poligono[j].lat;
    const lngJ = poligono[j].lng;

    const intersecta = lngI > punto.lng !== lngJ > punto.lng
      && punto.lat < ((latJ - latI) * (punto.lng - lngI)) / ((lngJ - lngI) || 0.0000001) + latI;

    if (intersecta) {
      dentro = !dentro;
    }
    j = i;
  }

  return dentro;
}
