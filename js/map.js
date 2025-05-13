import { PLACES, RADIUS } from './config.js';
import { getProgress }    from './storage.js';

let map, userMarker;
let currentInfo = null;           // 🔺目前開啟的 InfoWindow

/* 1. Google Maps callback --------------------------------------- */
export function initMap () {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 24.1368, lng: 120.6845 },
    zoom  : 16,
  });
  drawPlaces();
  trackMe();
}

/* 2. 放置地點 ---------------------------------------------------- */
function drawPlaces () {
  PLACES.forEach(p => {
    p.marker = new google.maps.Marker({
      map,
      position: p,
      label   : p.name[0],
    });

    p.infoWin = new google.maps.InfoWindow({ content: cardHTML(p) });

    /* 🔺 先收起舊 InfoWindow，再開新 */
    p.marker.addListener('click', () => {
      if (currentInfo) currentInfo.close();
      p.infoWin.open(map, p.marker);
      currentInfo = p.infoWin;
    });
  });
}

/* 3. 卡片 HTML（加「導航」按鈕） ------------------------------- */
function cardHTML (p) {
  const unlocked = getProgress()[p.id];

  /* 🔺 建立 Google Maps 導航 URL
         - 若有 userMarker 位置，用 that；否則讓 Google Maps 自動抓「目前位置」 */
  const start = userMarker
    ? `${userMarker.getPosition().lat()},${userMarker.getPosition().lng()}`
    : 'Current+Location';
  const navUrl =
    `https://www.google.com/maps/dir/?api=1&origin=${start}` +
    `&destination=${p.lat},${p.lng}&travelmode=walking`;

  return `
    <div class="card">
      <img src="${unlocked
        ? `assets/cards/${p.id}.png`
        : `assets/cards/${p.id}_blur.png`}" />
      <p>${p.name}</p>
      <p id="${p.id}-dist">距離計算中…</p>
      <div style="display:flex;gap:.3rem;justify-content:center">
        ${unlocked ? '' : `
          <button onclick="location.href='code.html?target=${p.id}'">
            解鎖
          </button>`}
        <!-- 🔺 導航按鈕：target=_blank 另開 Google Maps -->
        <button onclick="window.open('${navUrl}','_blank')">
          導航
        </button>
      </div>
    </div>`;
}

/* 4. 追蹤玩家位置 ----------------------------------------------- */
function trackMe () {
  if (!navigator.geolocation) {
    alert('此瀏覽器不支援定位'); return;
  }
  navigator.geolocation.watchPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords;

    if (!userMarker) {
      userMarker = new google.maps.Marker({
        map,
        icon    : 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        position: { lat, lng },
      });
    } else {
      userMarker.setPosition({ lat, lng });
    }
    updateDistances(lat, lng);
  });
}

/* 5. 更新距離 ---------------------------------------------------- */
function updateDistances (lat, lng) {
  const here = new google.maps.LatLng(lat, lng);
  PLACES.forEach(p => {
    const d = google.maps.geometry.spherical.computeDistanceBetween(
      here, new google.maps.LatLng(p.lat, p.lng)
    );
    const el = document.getElementById(`${p.id}-dist`);
    if (el) {
      el.textContent = d < 1000
        ? `${Math.round(d)} m`
        : `${(d / 1000).toFixed(2)} km`;
    }
  });
}