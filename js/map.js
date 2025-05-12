/*  js/map.js ── Hide‑and‑Seek  傳統 Marker 100% 版 */

import { PLACES, RADIUS } from './config.js';
import { getProgress }    from './storage.js';

let map, userMarker;

/* 1. Google Maps callback ---------------------------------------- */
export function initMap () {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 24.1368, lng: 120.6845 },
    zoom  : 16
  });
  drawPlaces();
  trackMe();
}

/* 2. 繪製每個指定地點 -------------------------------------------- */
function drawPlaces () {
  PLACES.forEach(p => {
    p.marker = new google.maps.Marker({
      map,
      position: p,
      label   : p.name[0]      // 只放第一個字做標籤
    });

    p.infoWin = new google.maps.InfoWindow({ content: cardHTML(p) });
    p.marker.addListener('click', () => p.infoWin.open(map, p.marker));
  });
}

/* 3. 產生卡片 HTML ------------------------------------------------ */
function cardHTML (p) {
  const unlocked = getProgress()[p.id];
  return `
    <div class="card">
      <img src="${unlocked
        ? `assets/cards/${p.id}.png`
        : `assets/cards/${p.id}_blur.png`}" />
      <p>${p.name}</p>
      <p id="${p.id}-dist">距離計算中…</p>
      ${unlocked ? '' : `
        <button onclick="location.href='code.html?target=${p.id}'">
          輸入 5 碼解鎖
        </button>`}
    </div>`;
}

/* 4. 追蹤玩家位置 -------------------------------------------------- */
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
        position: { lat, lng }
      });
    } else {
      userMarker.setPosition({ lat, lng });
    }

    updateDistances(lat, lng);
  });
}

/* 5. 計算並更新距離 ---------------------------------------------- */
function updateDistances (lat, lng) {
  const here = new google.maps.LatLng(lat, lng);
  PLACES.forEach(p => {
    const d = google.maps.geometry.spherical.computeDistanceBetween(
      here, new google.maps.LatLng(p.lat, p.lng));

    const el = document.getElementById(`${p.id}-dist`);
    if (el) {
      el.textContent = d < 1000
        ? `${Math.round(d)} m`
        : `${(d / 1000).toFixed(2)} km`;
    }
  });
}