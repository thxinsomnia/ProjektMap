import Map from "https://cdn.skypack.dev/ol/Map.js";
import View from "https://cdn.skypack.dev/ol/View.js";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import OSM from "https://cdn.skypack.dev/ol/source/OSM.js";
import { toLonLat, fromLonLat } from "https://cdn.skypack.dev/ol/proj.js";
import Feature from "https://cdn.skypack.dev/ol/Feature.js";
import Point from "https://cdn.skypack.dev/ol/geom/Point.js";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector.js";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector.js";
import { Style, Icon } from "https://cdn.skypack.dev/ol/style.js";
import Swal from "https://cdn.skypack.dev/sweetalert2";

// Create OSM source
const source = new OSM();

// Create TileLayer with OSM source
const layer = new TileLayer({
  source: source,
});

// Create Map
const map = new Map({
  target: "map",
  layers: [layer],
  view: new View({
    center: fromLonLat([107.57634352477324, -6.87436891415509]), // Center to Sarijadi, Bandung
    zoom: 16,
  }),
});

// Sumber data marker
const markerSource = new VectorSource();
const markerLayer = new VectorLayer({
  source: markerSource,
});
map.addLayer(markerLayer);

// Variabel untuk melacak status pop-up
let popupVisible = true;
let userCoordinates = null; // Simpan koordinat pengguna

// Ambil lokasi pengguna
navigator.geolocation.getCurrentPosition(
  (pos) => {
    const { latitude, longitude } = pos.coords;
    // Pindahkan peta ke lokasi pengguna
    userCoordinates = fromLonLat([longitude, latitude]);
    map.getView().setCenter(userCoordinates);
    map.getView().setZoom(18);

    // Tambahkan marker di lokasi pengguna
    const marker = new Feature({
      geometry: new Point(userCoordinates),
    });
    marker.setStyle(
      new Style({
        image: new Icon({
          src: "assets/img/orang.png",
          scale: 0.5,
        }),
      })
    );
    markerSource.addFeature(marker);

    // Ambil informasi lokasi menggunakan API OpenStreetMap
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lon=${longitude}&lat=${latitude}`)
      .then((response) => response.json())
      .then((data) => {
        const locationName = data.display_name || "Tidak ada data lokasi";

        // Use Swal to display the location information
        Swal.fire({
          title: 'Lokasi Anda',
          html: `
            <p><strong>Alamat:</strong> ${locationName}</p>
            <p><strong>Koordinat:</strong> ${longitude.toFixed(6)}, ${latitude.toFixed(6)}</p>
          `,
          showCloseButton: true,
          focusConfirm: false,
          confirmButtonText: 'OK'
        });
      })
      .catch(() => {
        // Use Swal to display an error message
        Swal.fire({
          title: 'Lokasi Anda',
          html: `
            <p>Data lokasi tidak ditemukan.</p>
            <p><strong>Koordinat:</strong> ${longitude.toFixed(6)}, ${latitude.toFixed(6)}</p>
          `,
          showCloseButton: true,
          focusConfirm: false,
          confirmButtonText: 'OK'
        });
      });

    // Tambahkan event klik pada marker untuk menampilkan atau menyembunyikan pop-up
    map.on("click", function (event) {
      map.forEachFeatureAtPixel(event.pixel, function (feature) {
        if (feature === marker) {
          popupVisible = !popupVisible;
          overlay.setPosition(popupVisible ? userCoordinates : undefined);
        }
      });
    });
  },
  () => {
    Swal.fire({
      title: "Error",
      text: "Gagal mengambil lokasi. Pastikan Anda memberikan izin akses lokasi.",
      icon: "error",
    });
  }
);

const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');

// Toggle kontrol ketika hamburger diklik
hamburger.addEventListener('click', function() {
menu.classList.toggle('open'); // Toggle kelas open untuk menampilkan/menyembunyikan kontrol
});

// Event klik di peta untuk mendapatkan informasi lokasi
map.on("click", function (event) {
  const clickedCoordinates = toLonLat(event.coordinate); // Konversi koordinat ke lon/lat
  const [longitude, latitude] = clickedCoordinates;

  // Hapus semua marker lama sebelum menambahkan yang baru
  markerSource.clear();

  // Tambahkan marker baru di lokasi yang diklik
  const marker = new Feature({
    geometry: new Point(event.coordinate),
  });
  marker.setStyle(
    new Style({
      image: new Icon({
        src: "assets/img/pin.png",
        scale: 0.5,
      }),
    })
  );
  markerSource.addFeature(marker);

  // Ambil informasi lokasi dari API OpenStreetMap
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lon=${longitude}&lat=${latitude}`)
  .then((response) => response.json())
  .then((data) => {
    const locationName = data.display_name || "Informasi lokasi tidak ditemukan";

    // Use Swal to display the location information
    Swal.fire({
      title: 'Informasi Lokasi',
      html: `
        <p><strong>Alamat:</strong> ${locationName}</p>
        <p><strong>Koordinat:</strong> ${longitude.toFixed(6)}, ${latitude.toFixed(6)}</p>
      `,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: 'OK'
    });
  })
  .catch(() => {
    // Use Swal to display an error message
    Swal.fire({
      title: 'Informasi Lokasi',
      html: `
        <p>Data lokasi tidak ditemukan.</p>
        <p><strong>Koordinat:</strong> ${longitude.toFixed(6)}, ${latitude.toFixed(6)}</p>
      `,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: 'OK'
    });
  });
});

const backToLocationButton = document.getElementById("back-to-location");
const setSourceButton = document.getElementById("set-source");
const unsetSourceButton = document.getElementById("unset-source");

// Fungsi untuk kembali ke lokasi pengguna
backToLocationButton.onclick = function () {
  if (userCoordinates) {
    const [longitude, latitude] = toLonLat(userCoordinates);
    map.getView().setCenter(userCoordinates);
    map.getView().setZoom(18);

    // Hapus semua marker lama sebelum menambahkan yang baru
    markerSource.clear();

    // Tambahkan marker di lokasi pengguna
    const marker = new Feature({
      geometry: new Point(userCoordinates),
    });
    marker.setStyle(
      new Style({
        image: new Icon({
          src: "assets/img/pin.png",
          scale: 0.5,
        }),
      })
    );
    markerSource.addFeature(marker);

    // Ambil informasi lokasi menggunakan API OpenStreetMap
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lon=${longitude}&lat=${latitude}`)
      .then((response) => response.json())
      .then((data) => {
        const locationName = data.display_name || "Tidak ada data lokasi";

        // Use Swal to display the location information
        Swal.fire({
          title: 'Lokasi Anda',
          html: `
            <p><strong>Alamat:</strong> ${locationName}</p>
            <p><strong>Koordinat:</strong> ${longitude.toFixed(6)}, ${latitude.toFixed(6)}</p>
          `,
          showCloseButton: true,
          focusConfirm: false,
          confirmButtonText: 'OK'
        });
      })
      .catch(() => {
        // Use Swal to display an error message
        Swal.fire({
          title: 'Lokasi Anda',
          html: `
            <p>Data lokasi tidak ditemukan.</p>
            <p><strong>Koordinat:</strong> ${longitude.toFixed(6)}, ${latitude.toFixed(6)}</p>
          `,
          showCloseButton: true,
          focusConfirm: false,
          confirmButtonText: 'OK'
        });
      });
  } else {
    Swal.fire({
      title: "Error",
      text: "Lokasi Anda belum tersedia. Pastikan Anda memberikan izin akses lokasi.",
      icon: "error",
    });
  }
};

// Event listener for the "Show Layer" button
setSourceButton.onclick = function () {
  layer.setSource(source); // Set OSM source to the layer
  setSourceButton.style.display = 'none';
  unsetSourceButton.style.display = 'block';
};

// Event listener for the "Hide Layer" button
unsetSourceButton.onclick = function () {
  layer.setSource(null); // Remove source from the layer
  markerSource.clear(); // Clear all markers
  unsetSourceButton.style.display = 'none';
  setSourceButton.style.display = 'block';
};

