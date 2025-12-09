// ==================== DEPO TAKİP SİSTEMİ ====================
// ===========================================================

// ---------- DEĞİŞKENLER & LOCALSTORAGE ----------
let urunler = [];
let aktifDepo = localStorage.getItem("aktifDepo");
let depolar = JSON.parse(localStorage.getItem("depolar")) || [];
let secimModu = false;

// ---------- UTILITY FUNCTIONS ----------
function depoUrunKey(ad) { return `urunListesi_${ad}`; }
function depoGecmisKey(ad) { return `urunGecmisi_${ad}`; }
function depoVeriKey(ad) { return `depoVerileri_${ad}`; }

// ---------- DİJİTAL SAAT GÜNCELLEME ----------
function updateDigitalTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  const headerTime = document.getElementById('headerTime');
  if (headerTime) {
    headerTime.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

// ---------- BİLDİRİM FONKSİYONU ----------
function bildirimGoster(mesaj, sure = 3000, tur = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = mesaj;
  
  if (tur === 'error') {
    notification.style.background = '#ef4444';
  } else if (tur === 'warning') {
    notification.style.background = '#f59e0b';
  } else {
    notification.style.background = '#10b981';
  }
  
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, sure);
}

// ---------- SEÇİM MODU KONTROLÜ ----------
function secimModunuAcKapat() {
  secimModu = !secimModu;
  const fabContainer = document.getElementById('fabContainer');
  const bildirim = document.getElementById('secimModuBildirim');
  
  if (secimModu) {
    fabContainer.classList.add('open');
    bildirim.classList.add('show');
    bildirimGoster('🔘 Seçim modu açıldı. Öğeleri seçin ve sil butonuna basın.', 2000, 'warning');
  } else {
    fabContainer.classList.remove('open');
    bildirim.classList.remove('show');
    temizleSecimleri();
  }
  
  if (document.getElementById('depolarScreen').classList.contains('active')) {
    depoListesiniGuncelle();
  } else if (document.getElementById('urunlerScreen').classList.contains('active')) {
    urunleriYukle();
  }
}

// ---------- SEÇİMLERİ TEMİZLE ----------
function temizleSecimleri() {
  document.querySelectorAll('.depo-checkbox').forEach(cb => cb.checked = false);
  document.querySelectorAll('.urun-checkbox').forEach(cb => cb.checked = false);
}

// ---------- DEPO LİSTESİNİ GÖSTER ----------
function depoListesiniGuncelle() {
  const depoListesiElem = document.getElementById('depoListesi');
  const bosDepoState = document.getElementById('bosDepoState');
  
  if (!depoListesiElem) return;
  
  depoListesiElem.innerHTML = '';
  
  if (depolar.length === 0) {
    bosDepoState.style.display = 'block';
    return;
  }
  
  bosDepoState.style.display = 'none';
  
  depolar.forEach(depoAd => {
    const depoUrunleri = JSON.parse(localStorage.getItem(depoUrunKey(depoAd)) || "[]");
    const depoVerileri = JSON.parse(localStorage.getItem(depoVeriKey(depoAd)) || "{}");
    
    let kritikUrunSayisi = 0;
    depoUrunleri.forEach(urunAd => {
      const miktar = depoVerileri[urunAd] || 0;
      if (miktar === 0 || miktar === 1) {
        kritikUrunSayisi++;
      }
    });
    
    const depoCard = document.createElement('div');
    depoCard.className = 'depo-card';
    depoCard.setAttribute('data-depo-ad', depoAd);
    
    depoCard.innerHTML = `
      <input type="checkbox" class="depo-checkbox" id="depo_${depoAd.replace(/\s+/g, '_')}" ${secimModu ? '' : 'style="display: none;"'}>
      <div class="depo-checkbox-indicator"></div>
      <div class="depo-icon">
        <i class="fas fa-warehouse"></i>
      </div>
      <div class="depo-info">
        <div class="depo-name">${depoAd}</div>
        <div class="depo-stats">
          <span><i class="fas fa-box"></i> ${depoUrunleri.length} ürün</span>
          ${kritikUrunSayisi > 0 ? `<span style="color: #ef4444;"><i class="fas fa-exclamation-triangle"></i> ${kritikUrunSayisi} kritik</span>` : ''}
        </div>
      </div>
      <div style="color: #8e8e93;">
        <i class="fas fa-chevron-right"></i>
      </div>
    `;
    
    // Checkbox değiştiğinde
    const checkbox = depoCard.querySelector('.depo-checkbox');
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        depoCard.classList.add('secili');
      } else {
        depoCard.classList.remove('secili');
      }
    });
    
    // Karta tıklandığında
    depoCard.addEventListener('click', function(e) {
      if (!secimModu) {
        aktifDepo = depoAd;
        localStorage.setItem("aktifDepo", aktifDepo);
        depoAc();
      } else {
        // Seçim modunda checkbox'ı toggle et
        const cb = this.querySelector('.depo-checkbox');
        cb.checked = !cb.checked;
        cb.dispatchEvent(new Event('change'));
      }
    });
    
    depoListesiElem.appendChild(depoCard);
  });
}

// ---------- DEPO AÇMA ----------
function depoAc() {
  if (!aktifDepo) return;
  
  document.getElementById('depoBaslik').textContent = `${aktifDepo} Deposu`;
  
  ekranDegistir('urunler');
  urunleriYukle();
  secimModu = false;
  document.getElementById('fabContainer').classList.remove('open');
  document.getElementById('secimModuBildirim').classList.remove('show');
}

// ---------- ÜRÜNLERİ YÜKLE ----------
function urunleriYukle() {
  const urunListesiElem = document.getElementById('urunListesi');
  const bosUrunState = document.getElementById('bosUrunState');
  
  if (!urunListesiElem || !aktifDepo) return;
  
  urunListesiElem.innerHTML = '';
  
  urunler = JSON.parse(localStorage.getItem(depoUrunKey(aktifDepo)) || "[]");
  const kayitli = aktiveKayitliObj();
  
  if (urunler.length === 0) {
    bosUrunState.style.display = 'block';
    return;
  }
  
  bosUrunState.style.display = 'none';
  
  urunler.forEach(ad => {
    const miktar = kayitli[ad] || 0;
    const kritikSeviye = miktar === 0 || miktar === 1;
    
    const urunCard = document.createElement('div');
    urunCard.className = `urun-card ${kritikSeviye ? 'kritik-seviye' : 'normal-seviye'}`;
    urunCard.setAttribute('data-urun-ad', ad);
    
    urunCard.innerHTML = `
      <input type="checkbox" class="urun-checkbox" id="urun_${ad.replace(/\s+/g, '_')}" ${secimModu ? '' : 'style="display: none;"'}>
      <div class="urun-checkbox-indicator"></div>
      <div class="urun-header">
        <div class="urun-name">${ad}</div>
        <div class="urun-controls">
          <div class="quantity-control">
            <button class="quantity-btn minus" data-urun-ad="${ad}">
              <i class="fas fa-minus"></i>
            </button>
            <input type="number" class="quantity-input" value="${miktar}" min="0" data-urun-ad="${ad}">
            <button class="quantity-btn plus" data-urun-ad="${ad}">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <button class="urun-kaldir-btn urun-sil-btn" data-urun-ad="${ad}" title="Ürünü Kaldır">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `;
    
    // Checkbox değiştiğinde
    const checkbox = urunCard.querySelector('.urun-checkbox');
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        urunCard.classList.add('secili');
      } else {
        urunCard.classList.remove('secili');
      }
    });
    
    // Karta tıklandığında
    urunCard.addEventListener('click', function(e) {
      if (secimModu && !e.target.closest('.urun-controls')) {
        // Seçim modunda checkbox'ı toggle et
        const cb = this.querySelector('.urun-checkbox');
        if (cb) {
          cb.checked = !cb.checked;
          cb.dispatchEvent(new Event('change'));
        }
      }
    });
    
    urunListesiElem.appendChild(urunCard);
  });
  
  attachUrunEventListeners();
}

// ---------- ÜRÜN EVENT LISTENERLARI EKLE ----------
function attachUrunEventListeners() {
  document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!secimModu) {
        const urunAd = this.getAttribute('data-urun-ad');
        miktarDegistir(urunAd, -1);
      }
    });
  });
  
  document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!secimModu) {
        const urunAd = this.getAttribute('data-urun-ad');
        miktarDegistir(urunAd, 1);
      }
    });
  });
  
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', function() {
      if (!secimModu) {
        const urunAd = this.getAttribute('data-urun-ad');
        const yeniMiktar = parseInt(this.value) || 0;
        if (yeniMiktar >= 0) {
          const kayitli = aktiveKayitliObj();
          const oncekiMiktar = kayitli[urunAd] || 0;
          kayitli[urunAd] = yeniMiktar;
          kaydetAktifKayitliObj(kayitli);
          
          gecekmiseKaydet(urunAd, oncekiMiktar, yeniMiktar);
          
          if (yeniMiktar === 0 || yeniMiktar === 1) {
            bildirimGoster(`${urunAd} kritik seviyeye ulaştı!`, 3000, 'warning');
          }
          
          urunleriYukle();
        } else {
          this.value = kayitli[urunAd] || 0;
        }
      }
    });
  });
  
  document.querySelectorAll('.urun-sil-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const urunAd = this.getAttribute('data-urun-ad');
      
      if (secimModu) {
        // Seçim modunda checkbox'ı toggle et
        const card = this.closest('.urun-card');
        const cb = card.querySelector('.urun-checkbox');
        if (cb) {
          cb.checked = !cb.checked;
          cb.dispatchEvent(new Event('change'));
        }
      } else {
        if (confirm(`"${urunAd}" ürününü silmek istediğinize emin misiniz?`)) {
          urunleriSil([urunAd]);
        }
      }
    });
  });
}

// ---------- SEÇİLİ ÖĞELERİ SİL ----------
function seciliOğeleriSil() {
  if (!secimModu) {
    secimModunuAcKapat();
    return;
  }
  
  const aktifEkran = document.querySelector('.screen.active').id;
  
  if (aktifEkran === 'depolarScreen') {
    const seciliDepolar = Array.from(document.querySelectorAll('.depo-checkbox:checked'))
      .map(cb => {
        const card = cb.closest('.depo-card');
        return card ? card.getAttribute('data-depo-ad') : null;
      })
      .filter(Boolean);
    
    if (seciliDepolar.length === 0) {
      bildirimGoster('⚠️ Lütfen silmek için depo seçin!', 2000, 'warning');
      return;
    }
    
    if (confirm(`${seciliDepolar.length} depoyu silmek istediğinize emin misiniz?\n\nTüm ürünler kalıcı olarak silinecek!`)) {
      depoSil(seciliDepolar);
      secimModunuAcKapat();
    }
    
  } else if (aktifEkran === 'urunlerScreen') {
    const seciliUrunler = Array.from(document.querySelectorAll('.urun-checkbox:checked'))
      .map(cb => {
        const card = cb.closest('.urun-card');
        return card ? card.getAttribute('data-urun-ad') : null;
      })
      .filter(Boolean);
    
    if (seciliUrunler.length === 0) {
      bildirimGoster('⚠️ Lütfen silmek için ürün seçin!', 2000, 'warning');
      return;
    }
    
    if (confirm(`${seciliUrunler.length} ürünü silmek istediğinize emin misiniz?`)) {
      urunleriSil(seciliUrunler);
      secimModunuAcKapat();
    }
  }
}

// ---------- DEPO BAZLI KAYDETME HELPER'LARI ----------
function aktiveKayitliObj() {
  if (!aktifDepo) return JSON.parse(localStorage.getItem("depoVerileri") || "{}");
  return JSON.parse(localStorage.getItem(depoVeriKey(aktifDepo)) || "{}");
}

function aktiveGecmisObj() {
  if (!aktifDepo) return JSON.parse(localStorage.getItem("urunGecmisi") || "{}");
  return JSON.parse(localStorage.getItem(depoGecmisKey(aktifDepo)) || "{}");
}

function kaydetAktifKayitliObj(obj) {
  if (!aktifDepo) localStorage.setItem("depoVerileri", JSON.stringify(obj));
  else localStorage.setItem(depoVeriKey(aktifDepo), JSON.stringify(obj));
}

function kaydetAktifGecmisObj(obj) {
  if (!aktifDepo) localStorage.setItem("urunGecmisi", JSON.stringify(obj));
  else localStorage.setItem(depoGecmisKey(aktifDepo), JSON.stringify(obj));
}

function kaydetUrunListesiAktif() {
  if (!aktifDepo) localStorage.setItem("urunListesi", JSON.stringify(urunler));
  else localStorage.setItem(depoUrunKey(aktifDepo), JSON.stringify(urunler));
}

// ---------- EKRAN DEĞİŞTİR ----------
function ekranDegistir(yeniEkran) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  document.getElementById(`${yeniEkran}Screen`).classList.add('active');
  document.querySelector(`[data-screen="${yeniEkran}"]`).classList.add('active');
  
  secimModu = false;
  document.getElementById('fabContainer').classList.remove('open');
  document.getElementById('secimModuBildirim').classList.remove('show');
  
  if (yeniEkran === 'depolar') {
    depoListesiniGuncelle();
  } else if (yeniEkran === 'raporlar') {
    raporlariGuncelle();
  }
}

// ---------- MİKTAR DEĞİŞTİR ----------
function miktarDegistir(urunAd, degisim) {
  const kayitli = aktiveKayitliObj();
  const oncekiMiktar = kayitli[urunAd] || 0;
  const yeniMiktar = Math.max(0, oncekiMiktar + degisim);
  
  if (yeniMiktar === oncekiMiktar) return;
  
  kayitli[urunAd] = yeniMiktar;
  kaydetAktifKayitliObj(kayitli);
  
  gecekmiseKaydet(urunAd, oncekiMiktar, yeniMiktar);
  
  if (yeniMiktar === 0 || yeniMiktar === 1) {
    bildirimGoster(`${urunAd} kritik seviyeye ulaştı!`, 3000, 'warning');
  }
  
  urunleriYukle();
}

// ---------- GEÇMİŞE KAYDET ----------
function gecekmiseKaydet(urunAd, oncekiMiktar, yeniMiktar) {
  const degisim = yeniMiktar - oncekiMiktar;
  if (degisim === 0) return;
  
  const now = new Date();
  const tarihStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  
  const urunGecmisi = aktiveGecmisObj();
  urunGecmisi[urunAd] = urunGecmisi[urunAd] || [];
  urunGecmisi[urunAd].push({
    tarih: tarihStr,
    degisim: degisim,
    yeniMiktar: yeniMiktar,
    oncekiMiktar: oncekiMiktar
  });
  
  if (urunGecmisi[urunAd].length > 50) {
    urunGecmisi[urunAd] = urunGecmisi[urunAd].slice(-50);
  }
  
  kaydetAktifGecmisObj(urunGecmisi);
}

// ---------- ÜRÜNLERİ SİL ----------
function urunleriSil(urunAdlari) {
  if (!Array.isArray(urunAdlari)) {
    urunAdlari = [urunAdlari];
  }
  
  const kayitli = aktiveKayitliObj();
  const urunGecmisi = aktiveGecmisObj();
  
  urunAdlari.forEach(urunAd => {
    urunler = urunler.filter(u => u !== urunAd);
    delete kayitli[urunAd];
    delete urunGecmisi[urunAd];
  });
  
  kaydetAktifKayitliObj(kayitli);
  kaydetAktifGecmisObj(urunGecmisi);
  kaydetUrunListesiAktif();
  urunleriYukle();
  
  bildirimGoster(`✅ ${urunAdlari.length} ürün kaldırıldı!`);
}

// ---------- DEPO SİL ----------
function depoSil(depoAdlari) {
  if (!Array.isArray(depoAdlari)) {
    depoAdlari = [depoAdlari];
  }
  
  const silinecek = depoAdlari;
  
  silinecek.forEach(depoAd => {
    depolar = depolar.filter(d => d !== depoAd);
    
    localStorage.removeItem(depoUrunKey(depoAd));
    localStorage.removeItem(depoVeriKey(depoAd));
    localStorage.removeItem(depoGecmisKey(depoAd));
    
    if (aktifDepo === depoAd) {
      aktifDepo = null;
      localStorage.removeItem("aktifDepo");
      ekranDegistir('depolar');
    }
  });
  
  localStorage.setItem("depolar", JSON.stringify(depolar));
  depoListesiniGuncelle();
  bildirimGoster(`✅ ${silinecek.length} depo silindi!`);
}

// ---------- RAPORLARI GÜNCELLE ----------
function raporlariGuncelle() {
  let toplamUrun = 0;
  let toplamMiktar = 0;
  let kritikUrunSayisi = 0;
  
  depolar.forEach(depoAd => {
    const depoUrunleri = JSON.parse(localStorage.getItem(depoUrunKey(depoAd)) || "[]");
    const depoVerileri = JSON.parse(localStorage.getItem(depoVeriKey(depoAd)) || "{}");
    
    toplamUrun += depoUrunleri.length;
    
    depoUrunleri.forEach(urunAd => {
      const miktar = depoVerileri[urunAd] || 0;
      toplamMiktar += miktar;
      
      if (miktar === 0 || miktar === 1) {
        kritikUrunSayisi++;
      }
    });
  });
  
  document.getElementById('genelIstatistikler').innerHTML = `
    <div class="rapor-deger">${depolar.length} Depo</div>
    <div style="margin-top: 10px; font-size: 16px;">
      <div>📦 Toplam Ürün: ${toplamUrun}</div>
      <div>⚖️ Toplam Stok: ${toplamMiktar}</div>
      <div>⚠️ Kritik Ürün: ${kritikUrunSayisi}</div>
    </div>
  `;
  
  let kritikUrunlerHTML = '';
  depolar.forEach(depoAd => {
    const depoUrunleri = JSON.parse(localStorage.getItem(depoUrunKey(depoAd)) || "[]");
    const depoVerileri = JSON.parse(localStorage.getItem(depoVeriKey(depoAd)) || "{}");
    
    depoUrunleri.forEach(urunAd => {
      const miktar = depoVerileri[urunAd] || 0;
      if (miktar === 0 || miktar === 1) {
        kritikUrunlerHTML += `<li>${urunAd} (${depoAd}): ${miktar} adet</li>`;
      }
    });
  });
  
  document.getElementById('kritikUrunler').innerHTML = 
    kritikUrunlerHTML ? `<ul class="rapor-list">${kritikUrunlerHTML}</ul>` : 
    '<p style="color: #8e8e93;">Kritik seviyede ürün bulunmuyor.</p>';
  
  let tumUrunler = [];
  depolar.forEach(depoAd => {
    const depoUrunleri = JSON.parse(localStorage.getItem(depoUrunKey(depoAd)) || "[]");
    const depoVerileri = JSON.parse(localStorage.getItem(depoVeriKey(depoAd)) || "{}");
    
    depoUrunleri.forEach(urunAd => {
      const miktar = depoVerileri[urunAd] || 0;
      tumUrunler.push({ ad: urunAd, depo: depoAd, miktar: miktar });
    });
  });
  
  tumUrunler.sort((a, b) => b.miktar - a.miktar);
  
  let cokStokluHTML = '';
  const top10 = tumUrunler.slice(0, 10);
  top10.forEach((urun, index) => {
    cokStokluHTML += `<li>${index + 1}. ${urun.ad} (${urun.depo}): ${urun.miktar} adet</li>`;
  });
  
  document.getElementById('cokStokluUrunler').innerHTML = 
    cokStokluHTML ? `<ul class="rapor-list">${cokStokluHTML}</ul>` : 
    '<p style="color: #8e8e93;">Ürün bulunmuyor.</p>';
}

// ---------- EVENT LISTENER KURMA ----------
document.addEventListener('DOMContentLoaded', function() {
  updateDigitalTime();
  setInterval(updateDigitalTime, 1000);
  
  depoListesiniGuncelle();
  
  // Bottom nav tıklamaları
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const screen = this.getAttribute('data-screen');
      ekranDegistir(screen);
    });
  });
  
  // FAB butonu (Yeni Ekle)
document.getElementById('fabBtn').addEventListener('click', function() {
  if (secimModu) {
    secimModunuAcKapat();
  } else {
    const aktifEkran = document.querySelector('.screen.active').id;
    
    if (aktifEkran === 'depolarScreen') {
      document.getElementById('depoEkleModal').classList.add('active');
      document.getElementById('yeniDepoAdi').focus();
    } else if (aktifEkran === 'urunlerScreen' && aktifDepo) {
      document.getElementById('urunEkleModal').classList.add('active');
      document.getElementById('yeniUrunAdi').focus();
    }
  }
});

// FAB Remove butonu (Sil)
document.getElementById('fabRemoveBtn').addEventListener('click', function() {
  if (!secimModu) {
    // Eğer seçim modu kapalıysa, seçim modunu aç
    secimModunuAcKapat();
  } else {
    // Seçim modu açıksa, seçili öğeleri sil
    seciliOğeleriSil();
  }
});
  
  // Geri butonu
  document.getElementById('backToDepolar').addEventListener('click', function() {
    ekranDegistir('depolar');
  });
  
  // Depo ekleme modalı
  document.getElementById('depoEkleIptal').addEventListener('click', function() {
    document.getElementById('depoEkleModal').classList.remove('active');
  });
  
  document.getElementById('depoEkleKaydet').addEventListener('click', function() {
    const depoAdi = document.getElementById('yeniDepoAdi').value.trim();
    
    if (!depoAdi) {
      bildirimGoster('⚠️ Depo adı gerekli!', 3000, 'error');
      return;
    }
    
    if (depolar.includes(depoAdi)) {
      bildirimGoster('⚠️ Bu depo zaten mevcut!', 3000, 'error');
      return;
    }
    
    depolar.push(depoAdi);
    localStorage.setItem("depolar", JSON.stringify(depolar));
    
    localStorage.setItem(depoUrunKey(depoAdi), JSON.stringify([]));
    localStorage.setItem(depoVeriKey(depoAdi), JSON.stringify({}));
    localStorage.setItem(depoGecmisKey(depoAdi), JSON.stringify({}));
    
    depoListesiniGuncelle();
    document.getElementById('depoEkleModal').classList.remove('active');
    document.getElementById('yeniDepoAdi').value = '';
    
    bildirimGoster(`✅ ${depoAdi} deposu eklendi!`);
  });
  
  // Ürün ekleme modalı
  document.getElementById('urunEkleIptal').addEventListener('click', function() {
    document.getElementById('urunEkleModal').classList.remove('active');
  });
  
  document.getElementById('urunEkleKaydet').addEventListener('click', function() {
    const urunAdi = document.getElementById('yeniUrunAdi').value.trim();
    const urunMiktar = parseInt(document.getElementById('yeniUrunMiktar').value) || 0;
    
    if (!urunAdi) {
      bildirimGoster('⚠️ Ürün adı gerekli!', 3000, 'error');
      return;
    }
    
    const aktifUrunler = JSON.parse(localStorage.getItem(depoUrunKey(aktifDepo)) || "[]");
    
    if (aktifUrunler.includes(urunAdi)) {
      bildirimGoster('⚠️ Bu ürün zaten mevcut!', 3000, 'error');
      return;
    }
    
    aktifUrunler.push(urunAdi);
    localStorage.setItem(depoUrunKey(aktifDepo), JSON.stringify(aktifUrunler));
    
    const kayitli = aktiveKayitliObj();
    kayitli[urunAdi] = urunMiktar;
    kaydetAktifKayitliObj(kayitli);
    
    if (urunMiktar > 0) {
      gecekmiseKaydet(urunAdi, 0, urunMiktar);
    }
    
    document.getElementById('urunEkleModal').classList.remove('active');
    
    document.getElementById('yeniUrunAdi').value = '';
    document.getElementById('yeniUrunMiktar').value = '0';
    
    urunleriYukle();
    
    bildirimGoster(`✅ ${urunAdi} ürünü eklendi!`);
  });
  
  // ESC tuşu ile modal kapatma ve seçim modundan çıkma
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        modal.classList.remove('active');
      });
      
      if (secimModu) {
        secimModunuAcKapat();
      }
    }
  });
  
  // Modal dışına tıklama
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
      }
    });
  });
  
  // Geçmiş arama
  document.getElementById('gecmisAraBtn').addEventListener('click', function() {
    const urunAdi = document.getElementById('gecmisArama').value.trim();
    const listDiv = document.getElementById('gecmisListesi');
    
    if (!urunAdi) {
      listDiv.innerHTML = '<p style="text-align: center; color: #8e8e93;">Lütfen ürün adı girin</p>';
      return;
    }
    
    let tumGecmis = [];
    depolar.forEach(depoAd => {
      const depoGecmisi = JSON.parse(localStorage.getItem(depoGecmisKey(depoAd)) || "{}");
      if (depoGecmisi[urunAdi] && depoGecmisi[urunAdi].length > 0) {
        depoGecmisi[urunAdi].forEach(kayit => {
          tumGecmis.push({
            depo: depoAd,
            tarih: kayit.tarih,
            degisim: kayit.degisim,
            yeniMiktar: kayit.yeniMiktar
          });
        });
      }
    });
    
    if (tumGecmis.length === 0) {
      listDiv.innerHTML = `<p style="text-align: center; color: #8e8e93;">"${urunAdi}" ürününün geçmişi bulunamadı</p>`;
      return;
    }
    
    tumGecmis.sort((a, b) => new Date(b.tarih.split(' ')[0].split('/').reverse().join('-')) - 
      new Date(a.tarih.split(' ')[0].split('/').reverse().join('-')));
    
    let html = '';
    tumGecmis.forEach(kayit => {
      const degisimIcon = kayit.degisim > 0 ? '📈' : '📉';
      const degisimColor = kayit.degisim > 0 ? '#10b981' : '#ef4444';
      
      html += `
        <div class="gecmis-item">
          <div class="gecmis-tarih">${kayit.tarih} • ${kayit.depo}</div>
          <div class="gecmis-bilgi">
            <span style="color: ${degisimColor};">
              ${degisimIcon} ${kayit.degisim > 0 ? '+' : ''}${kayit.degisim}
            </span>
            → Yeni miktar: ${kayit.yeniMiktar}
          </div>
        </div>
      `;
    });
    
    listDiv.innerHTML = html;
  });
  
  // Veri yedekleme
  document.getElementById('veriYedekleBtn').addEventListener('click', function() {
    const veri = {
      depolar: depolar,
      veriler: {}
    };
    
    depolar.forEach(depoAd => {
      veri.veriler[depoAd] = {
        urunler: JSON.parse(localStorage.getItem(depoUrunKey(depoAd)) || "[]"),
        miktarlar: JSON.parse(localStorage.getItem(depoVeriKey(depoAd)) || "{}"),
        gecmis: JSON.parse(localStorage.getItem(depoGecmisKey(depoAd)) || "{}")
      };
    });
    
    const veriStr = JSON.stringify(veri, null, 2);
    const blob = new Blob([veriStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `depo-yedek-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    bildirimGoster('✅ Veriler yedeklendi!');
  });
  
  // Veri geri yükleme
  document.getElementById('veriGeriYukleBtn').addEventListener('click', function() {
    if (!confirm('⚠️ Mevcut tüm verileriniz silinecek ve yedekten geri yüklenecek. Devam etmek istiyor musunuz?')) {
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = function(e) {
        try {
          const yedek = JSON.parse(e.target.result);
          
          depolar = yedek.depolar || [];
          localStorage.setItem("depolar", JSON.stringify(depolar));
          
          localStorage.clear();
          
          if (yedek.veriler) {
            Object.keys(yedek.veriler).forEach(depoAd => {
              localStorage.setItem(depoUrunKey(depoAd), JSON.stringify(yedek.veriler[depoAd].urunler || []));
              localStorage.setItem(depoVeriKey(depoAd), JSON.stringify(yedek.veriler[depoAd].miktarlar || {}));
              localStorage.setItem(depoGecmisKey(depoAd), JSON.stringify(yedek.veriler[depoAd].gecmis || {}));
            });
          }
          
          depoListesiniGuncelle();
          ekranDegistir('depolar');
          
          bildirimGoster('✅ Veriler başarıyla geri yüklendi!');
        } catch(err) {
          bildirimGoster('❌ Geçersiz yedek dosyası!', 3000, 'error');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  });
  
  // Rapor yazdır
  document.getElementById('yazdirRaporBtn').addEventListener('click', function() {
    raporlariGuncelle();
    
    let raporHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Depo Takip - Rapor</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #3b82f6; }
          .rapor-section { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f8f9fa; }
          .kritik { background-color: #fef2f2; }
          .tarih { font-size: 12px; color: #666; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Depo Takip - Rapor</h1>
        <div class="tarih">Oluşturulma: ${new Date().toLocaleString('tr-TR')}</div>
    `;
    
    depolar.forEach(depoAd => {
      const depoUrunleri = JSON.parse(localStorage.getItem(depoUrunKey(depoAd)) || "[]");
      const depoVerileri = JSON.parse(localStorage.getItem(depoVeriKey(depoAd)) || "{}");
      
      if (depoUrunleri.length > 0) {
        raporHTML += `
          <div class="rapor-section">
            <h2>${depoAd} Deposu</h2>
            <table>
              <thead>
                <tr>
                  <th>Ürün Adı</th>
                  <th>Miktar</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        depoUrunleri.forEach(urunAd => {
          const miktar = depoVerileri[urunAd] || 0;
          const durum = miktar === 0 || miktar === 1 ? 'KRİTİK' : 'NORMAL';
          const rowClass = miktar === 0 || miktar === 1 ? 'kritik' : '';
          
          raporHTML += `
            <tr class="${rowClass}">
              <td>${urunAd}</td>
              <td>${miktar}</td>
              <td>${durum}</td>
            </tr>
          `;
        });
        
        raporHTML += `
              </tbody>
            </table>
          </div>
        `;
      }
    });
    
    raporHTML += `
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(raporHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    bildirimGoster('📝 Rapor yazdırma penceresi açıldı...');
  });
  
  // Arama fonksiyonları
  document.getElementById('depoArama').addEventListener('input', function(e) {
    const aramaKelime = e.target.value.toLowerCase();
    const depoKartlari = document.querySelectorAll('.depo-card');
    
    depoKartlari.forEach(kart => {
      const depoAdi = kart.querySelector('.depo-name').textContent.toLowerCase();
      if (depoAdi.includes(aramaKelime)) {
        kart.style.display = 'flex';
      } else {
        kart.style.display = 'none';
      }
    });
  });
  
  document.getElementById('urunArama').addEventListener('input', function(e) {
    const aramaKelime = e.target.value.toLowerCase();
    const urunKartlari = document.querySelectorAll('.urun-card');
    
    urunKartlari.forEach(kart => {
      const urunAdi = kart.querySelector('.urun-name').textContent.toLowerCase();
      if (urunAdi.includes(aramaKelime)) {
        kart.style.display = 'block';
      } else {
        kart.style.display = 'none';
      }
    });
  });
  
  // Sayfa yüklendiğinde aktif depo varsa aç
  if (aktifDepo && depolar.includes(aktifDepo)) {
    depoAc();
  }
});