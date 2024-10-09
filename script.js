// Inicializar el mapa centrado en la Àrea Metropolitana de Barcelona
var map = L.map('map').setView([41.347, 2.035], 14);

// Capa base de OpenStreetMap
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
    opacity:0.3 //Transparencia de la capa
});

var esriWorldImageryLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>',
    opacity:0.3 //Transparencia de la capa
});

// Añadir la capa base OpenStreetMap al mapa
osmLayer.addTo(map);  // Puedes cambiar esta línea para iniciar con otra capa base

var colorMapNatu = {   //Representación colores capa naturalitat
    "Urbà":"#c1c0b7",  
    "Verd agrícola":"#ff9e00",  
    "Verd natural":"#33a02c",
    "Verd ornamental":"#c3ff00",
    "Verd ruderal": "#e8ee41",
    "Verd seminatural": "#98d927"
};

// Inicializar las variables para las capas GeoJSON
var naturalitatLayer = L.geoJSON(null, {
    style: function (feature) {
        // Usar el atributo 'categoria_' para definir el color
        var color = colorMapNatu[feature.properties.categoria_] || "#808080"; // Color por defecto si no hay coincidencia
        return {
            color: color,  
            weight: 2,
            fillOpacity: 0.8 // Aumentar la opacidad de llenado para mayor intensidad
        };
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<b>Naturalitat: " + feature.properties.categoria_ + "</b>");  // Muestra el nombre del barrio
    }
});

// Cargar el archivo naturalitat_barris_stboi.geojson usando jQuery
$.getJSON('data/naturalitat_barris_stboi.geojson', function(data) {
    naturalitatLayer.addData(data);
});

var colorMapArbrat = {   //Representación colores capa naturalitat
    1:"#26ff17",  
    2:"#b58110",  
    3:"#e31a1c"
};

// Inicializar la segunda capa GeoJSON
var arbratLayer = L.geoJSON(null, {
    pointToLayer: function (feature, latlng) {
        var color = colorMapArbrat[feature.properties.naturalita] || "#000"; // Asignar color según categoría o negro por defecto
        return L.circleMarker(latlng, {
            radius: 4,
            fillColor: color,  // Color para los puntos de árboles
            color: color,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<b>Espècie: " + feature.properties.n_especie + "</b>");  // Muestra el tipo de árbol
    }
});

// Cargar el archivo arbrat_stboi.geojson usando jQuery
$.getJSON('data/arbrat_stboi.geojson', function(data) {
    arbratLayer.addData(data);
});

// Crear el control de capas para permitir activar/desactivar capas
var baseMaps = {
    "OpenStreetMap": osmLayer,
    "Imatge aèrea": esriWorldImageryLayer,
};

var overlayMaps = {
    "Arbrat": arbratLayer,  // Capa de árboles
    "Naturalitat Barris": naturalitatLayer  // Capa de barrios
};

// Crear el control de capas y añadirlo al mapa
var layerControl = L.control.layers(baseMaps,overlayMaps, { collapsed: false }).addTo(map);

// Crear la leyenda
var legendNaturalitat = L.control({ position: 'bottomleft' });

legendNaturalitat.onAdd = function () {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<strong>Naturalitat</strong><br>'; // Título de la leyenda
    for (var category in colorMapNatu) {
        div.innerHTML += '<div><span style="background:' + colorMapNatu[category] + '"></span>' + category + '</div>';
    }
    return div;
};

// Añadir la leyenda al mapa (inicialmente no visible)
legendNaturalitat.addTo(map);
legendNaturalitat.remove(); // Ocultar la leyenda al inicio

// Crear la leyenda para Arbrat
var legendArbrat = L.control({ position: 'bottomright' });

legendArbrat.onAdd = function () {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<strong>Tipus espècie</strong><br>'; // Título de la leyenda

    // Iterar sobre el mapeo de colores para agregar cada categoría a la leyenda
    for (var category in colorMapArbrat) {
        div.innerHTML += '<div><span style="background:' + colorMapArbrat[category] + '"></span>' + category + '</div>';
    }
    
    return div;
};

// Añadir la leyenda de árboles al mapa (inicialmente no visible)
legendArbrat.addTo(map);
legendArbrat.remove(); // Ocultar la leyenda al inicio

// Función para mostrar u ocultar las leyendas
function toggleLegends() {
    // Mostrar leyenda de naturalitat si la capa está activa
    if (map.hasLayer(naturalitatLayer)) {
        legendNaturalitat.addTo(map);
    } else {
        legendNaturalitat.remove();
    }

    // Mostrar leyenda de arbrat si la capa está activa
    if (map.hasLayer(arbratLayer)) {
        legendArbrat.addTo(map);
    } else {
        legendArbrat.remove();
    }
}

// Agregar eventos para mostrar/ocultar las leyendas al cambiar las capas
map.on('overlayadd', function(e) {
    toggleLegends(); // Mostrar leyendas si las capas se activan
});

map.on('overlayremove', function(e) {
    toggleLegends(); // Ocultar leyendas si las capas se desactivan
});