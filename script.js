// --- Configuració de les estacions ---

const stations = [
    {
        name: "Camprodon",
        lat: 42.31344,
        lon: 2.36350,
        url: "https://www.ecowitt.net/home/index?id=217651",
        type: "ecowitt"
    },
    {
        name: "Tregurà",
        lat: 42.34306,
        lon: 2.28758,
        url: "https://www.ecowitt.net/home/index?id=94800",
        type: "ecowitt"
    },
    {
        name: "Setcases",
        lat: 42.37644,
        lon: 2.30106,
        url: "https://www.ecowitt.net/index?id=134930",
        type: "ecowitt"
    },
    {
        name: "Beget",
        lat: 42.31969,
        lon: 2.48292,
        url: "https://www.ecowitt.net/home/index?id=113942",
        type: "ecowitt"
    },
    {
        name: "Sant Pau de Segúries",
        lat: 42.26356,
        lon: 2.36747,
        url: "https://www.ecowitt.net/home/index?id=228880",
        type: "ecowitt"
    },
    {
        name: "Molló",
        lat: 42.34564,
        lon: 2.40550,
        url: "https://www.weatherlink.com/map/shared/BAMwkITHMul8t4z0mAUK7NsE1wQKsHoe",
        type: "weatherlink"
    },
    {
        name: "Llanars",
        lat: 42.32206,
        lon: 2.34208,
        url: "https://www.weatherlink.com/map/shared/pM1ZHz98Yh8fWKn5kE7x2VpeymY88Ua5",
        type: "weatherlink"
    }
];


// --- Recuperar dades de cada estació ---

async function fetchEcowitt(url) {
    const proxy = "https://api.allorigins.win/get?url=" + encodeURIComponent(url);
    const html = await fetch(proxy).then(r => r.json()).then(d => d.contents);

    const tempMatch = html.match(/Temperature.*?(-?\d+\.\d+)/);
    const humMatch = html.match(/Humidity.*?(\d+)%/);
    const windMatch = html.match(/Wind Speed.*?(\d+\.\d+)/);

    return {
        temp: tempMatch ? parseFloat(tempMatch[1]) : null,
        hum: humMatch ? parseFloat(humMatch[1]) : null,
        wind: windMatch ? parseFloat(windMatch[1]) : null
    };
}

async function fetchWeatherLink(url) {
    const proxy = "https://api.allorigins.win/get?url=" + encodeURIComponent(url);
    const html = await fetch(proxy).then(r => r.json()).then(d => d.contents);

    const tempMatch = html.match(/"tempC":(-?\d+\.\d+)/);
    const humMatch = html.match(/"hum":(\d+)/);
    const windMatch = html.match(/"windKPH":(\d+\.\d+)/);

    return {
        temp: tempMatch ? parseFloat(tempMatch[1]) : null,
        hum: humMatch ? parseFloat(humMatch[1]) : null,
        wind: windMatch ? parseFloat(windMatch[1]) : null
    };
}


// --- Crear taula i mapa ---

async function loadData() {
    const tbody = document.querySelector("#stationsTable tbody");
    tbody.innerHTML = "";

    for (const st of stations) {
        let data;
        if (st.type === "ecowitt") data = await fetchEcowitt(st.url);
        else data = await fetchWeatherLink(st.url);

        // Escriure la taula
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${st.name}</td>
            <td>${data.temp ?? "-"}</td>
            <td>${data.hum ?? "-"}</td>
            <td>${data.wind ?? "-"}</td>
        `;
        tbody.appendChild(row);

        // Afegir marcador al mapa
        if (window.map) {
            L.marker([st.lat, st.lon])
                .addTo(map)
                .bindPopup(`<b>${st.name}</b><br>Temp: ${data.temp} °C`);
        }
    }
}


// --- Iniciar mapa ---

document.addEventListener("DOMContentLoaded", () => {
    window.map = L.map('map').setView([42.33, 2.36], 11);

    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", 
        { attribution: "Tiles © Esri" }
    ).addTo(map);

    loadData();
});
