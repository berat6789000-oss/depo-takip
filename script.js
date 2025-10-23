// ------------------------------
// FALIM PİDE DEPO TAKİP SİSTEMİ
// Tüm isteklere göre güncellenmiş versiyon
// ------------------------------

// ---------- DEĞİŞKENLER & LOCALSTORAGE ----------
let urunler = JSON.parse(localStorage.getItem("urunListesi") || "[]");
let depolar = JSON.parse(localStorage.getItem("depolar") || "[]");
let aktifDepo = localStorage.getItem("aktifDepo") || null;
let aktifIslem = null; // 'sil' veya 'duzenle' - hangi işlem aktif

// HTML ELEMENTLERİ
const urunListesi = document.getElementById("urunListesi");
const anaMenu = document.getElementById("anaMenu");
const depoEkrani = document.getElementById("depoEkrani");
const depoBaslikElem = document.getElementById("depoBaslik");
const depoListesiElem = document.getElementById("depoListesi");
const bildirimElem = document.getElementById("bildirim");
const depoSilModal = document.getElementById("depoSilModal");

// ---------- TARİH & SAAT ----------
function tarihSaatGuncelle() {
  const now = new Date();
  const aylar = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  const tarihSaatElem = document.getElementById("tarihSaat");
  if (!tarihSaatElem) return;
  tarihSaatElem.textContent =
    `${now.getDate()} ${aylar[now.getMonth()]} ${now.getFullYear()}, ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
}
setInterval(tarihSaatGuncelle, 1000);

// ---------- BİLDİRİM FONKSİYONU ----------
function bildirimGoster(mesaj, sure = 3000) {
  bildirimElem.textContent = mesaj;
  bildirimElem.style.display = 'block';
  setTimeout(() => {
    bildirimElem.style.display = 'none';
  }, sure);
}

// ---------- DEPO BAZLI ANAHTARLAR ----------
function depoUrunKey(ad) { return `urunListesi_${ad}`; }
function depoGecmisKey(ad) { return `urunGecmisi_${ad}`; }
function depoVeriKey(ad) { return `depoVerileri_${ad}`; }

// ---------- DEPO LİSTESİNİ GÖSTER ----------
function depoListesiniGuncelle() {
  depoListesiElem.innerHTML = '';
  depolar.forEach(depoAd => {
    const depoItem = document.createElement('div');
    depoItem.className = 'depo-item';
    depoItem.textContent = depoAd;
    depoItem.addEventListener('click', () => {
      aktifDepo = depoAd;
      localStorage.setItem("aktifDepo", aktifDepo);
      depoAc();
    });
    depoListesiElem.appendChild(depoItem);
  });
}

// ---------- DEPO SİLME MODAL ----------
document.getElementById("depoSilBtn").addEventListener("click", () => {
  if (depolar.length === 0) {
    bildirimGoster("⚠️ Silinecek depo bulunamadı!");
    return;
  }
  
  const checkboxList = document.getElementById("depoSilCheckboxList");
  checkboxList.innerHTML = '';
  
  depolar.forEach(depoAd => {
    const checkboxItem = document.createElement('div');
    checkboxItem.className = 'checkbox-item';
    checkboxItem.innerHTML = `
      <input type="checkbox" id="depo_${depoAd}" value="${depoAd}">
      <label for="depo_${depoAd}">${depoAd}</label>
    `;
    checkboxList.appendChild(checkboxItem);
  });
  
  depoSilModal.style.display = 'flex';
});

document.getElementById("depoSilIptal").addEventListener("click", () => {
  depoSilModal.style.display = 'none';
});

document.getElementById("depoSilOnayla").addEventListener("click", () => {
  const secilenDepolar = Array.from(document.querySelectorAll('#depoSilCheckboxList input:checked'))
    .map(checkbox => checkbox.value);
  
  if (secilenDepolar.length === 0) {
    bildirimGoster("⚠️ Lütfen silmek için depo seçin!");
    return;
  }
  
  if (!confirm(`${secilenDepolar.join(', ')} depolarını silmek istediğinize emin misiniz?`)) {
    return;
  }
  
  secilenDepolar.forEach(depoAd => {
    depolar = depolar.filter(d => d !== depoAd);
    // Depo verilerini temizle
    localStorage.removeItem(depoUrunKey(depoAd));
    localStorage.removeItem(depoVeriKey(depoAd));
    localStorage.removeItem(depoGecmisKey(depoAd));
    
    // Eğer aktif depo silindiyse
    if (aktifDepo === depoAd) {
      aktifDepo = null;
      localStorage.removeItem("aktifDepo");
      depoEkrani.style.display = "none";
      anaMenu.style.display = "block";
    }
  });
  
  localStorage.setItem("depolar", JSON.stringify(depolar));
  depoListesiniGuncelle();
  depoSilModal.style.display = 'none';
  bildirimGoster(`✅ ${secilenDepolar.length} depo silindi!`);
});

// ---------- MODAL DIŞINA TIKLANINCA KAPATMA ----------
depoSilModal.addEventListener('click', (e) => {
  if (e.target === depoSilModal) {
    depoSilModal.style.display = 'none';
  }
});

// ---------- ESC TUŞU İLE MODAL KAPATMA ----------
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && depoSilModal.style.display === 'flex') {
    depoSilModal.style.display = 'none';
  }
});

// ---------- DEPO EKLE ----------
document.getElementById("depoEkleBtn").addEventListener("click", () => {
  const depoAd = prompt("Yeni depo adı girin:");
  if (!depoAd || depoAd.trim() === "") {
    bildirimGoster("⚠️ Depo adı boş olamaz!");
    return;
  }
  
  const temizAd = depoAd.trim();
  if (depolar.includes(temizAd)) {
    bildirimGoster("⚠️ Bu depo zaten mevcut!");
    return;
  }
  
  depolar.push(temizAd);
  localStorage.setItem("depolar", JSON.stringify(depolar));
  
  // Yeni depo için boş veri yapıları oluştur
  localStorage.setItem(depoUrunKey(temizAd), JSON.stringify([]));
  localStorage.setItem(depoVeriKey(temizAd), JSON.stringify({}));
  localStorage.setItem(depoGecmisKey(temizAd), JSON.stringify({}));
  
  depoListesiniGuncelle();
  bildirimGoster(`✅ ${temizAd} deposu eklendi!`);
});

// ---------- ANA MENÜYE DÖN ----------
document.getElementById("anaMenuyeDonBtn").addEventListener("click", () => {
  aktifDepo = null;
  localStorage.removeItem("aktifDepo");
  depoEkrani.style.display = "none";
  anaMenu.style.display = "block";
  aktifIslem = null;
  butonlariNormalModaGetir();
});

// ---------- ÜRÜNLERİ YÜKLE ----------
function urunleriYukle() {
  if (!urunListesi) return;
  urunListesi.innerHTML = "";

  const kayitli = aktiveKayitliObj();
  const urunGecmisi = aktiveGecmisObj();

  urunler.forEach(ad => {
    const div = document.createElement("div");
    div.classList.add("urun-karti");

    div.innerHTML = `
      <label>${ad}</label>
      <input type="number" id="${cssIdFromName(ad)}" placeholder="Miktar" value="${kayitli[ad]||0}">
    `;
    urunListesi.appendChild(div);

    const input = div.querySelector("input[type='number']");
    input.addEventListener("change", () => {
      const kayitliLocal = aktiveKayitliObj();
      const gecmisLocal = aktiveGecmisObj();

      const oncekiMiktar = parseFloat(kayitliLocal[ad]||0);
      const yeniMiktar = parseFloat(input.value||0);
      const fark = yeniMiktar - oncekiMiktar;
      
      if (fark === 0) return;

      const now = new Date();
      const tarihStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}`;

      kayitliLocal[ad] = yeniMiktar;

      const hareket = {tarih: tarihStr, degisim: fark, yeniMiktar: yeniMiktar};
      gecmisLocal[ad] = gecmisLocal[ad] || [];
      gecmisLocal[ad].push(hareket);

      kaydetAktifKayitliObj(kayitliLocal);
      kaydetAktifGecmisObj(gecmisLocal);

      renkleriGuncelle();
    });
  });

  renkleriGuncelle();
}

// ---------- CSS ID HELPER ----------
function cssIdFromName(name) {
  return "urun_" + name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-]/g, "");
}

// ---------- RENK GÜNCELLEME ----------
function renkleriGuncelle(){
  urunler.forEach(ad => {
    const input = document.getElementById(cssIdFromName(ad));
    if (input) {
      const val = parseFloat(input.value||0);
      if (val === 0 || val === 1) {
        input.style.backgroundColor = "#c82333";
        input.style.color = "white";
      } else {
        input.style.backgroundColor = "white";
        input.style.color = "black";
      }
    }
  });
}

// ---------- BUTONLARI NORMAL MODA GETİR ----------
function butonlariNormalModaGetir() {
  document.querySelectorAll('.butonlar button').forEach(btn => {
    btn.classList.remove('active');
  });
  aktifIslem = null;
  
  // Checkbox'ları gizle
  document.querySelectorAll('.secim').forEach(cb => {
    if (cb) cb.style.display = 'none';
  });
}

// ---------- ÜRÜN SİLME İŞLEMİ ----------
document.getElementById("urunSilBtn").addEventListener("click", () => {
  if (aktifIslem === 'sil') {
    // Checkbox'lar zaten görünür, silme işlemini yap
    const secilen = Array.from(document.querySelectorAll('.secim:checked'));
    if (secilen.length === 0) {
      bildirimGoster("⚠️ Lütfen silmek için ürün seçin!");
      return;
    }

    const kayitli = aktiveKayitliObj();
    const urunGecmisi = aktiveGecmisObj();

    secilen.forEach(cb => {
      const ad = cb.closest('.urun-karti').querySelector('label').textContent.trim();
      urunler = urunler.filter(u => u !== ad);
      delete kayitli[ad];
      delete urunGecmisi[ad];
    });

    kaydetAktifKayitliObj(kayitli);
    kaydetAktifGecmisObj(urunGecmisi);
    kaydetUrunListesiAktif();
    urunleriYukle();
    butonlariNormalModaGetir();
    bildirimGoster(`✅ ${secilen.length} ürün silindi!`);
    
  } else {
    // Checkbox'ları göster
    butonlariNormalModaGetir();
    aktifIslem = 'sil';
    document.getElementById("urunSilBtn").classList.add('active');
    
    document.querySelectorAll('.urun-karti').forEach(kart => {
      let checkbox = kart.querySelector('.secim');
      if (!checkbox) {
        checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'secim';
        kart.insertBefore(checkbox, kart.firstChild);
      }
      checkbox.style.display = 'inline-block';
    });
  }
});

// ---------- ÜRÜN DÜZENLEME İŞLEMİ ----------
document.getElementById("urunDuzenleBtn").addEventListener("click", () => {
  if (aktifIslem === 'duzenle') {
    // Checkbox'lar zaten görünür, düzenleme işlemini yap
    const secilen = Array.from(document.querySelectorAll('.secim:checked'));
    if (secilen.length === 0) {
      bildirimGoster("⚠️ Lütfen düzenlemek için ürün seçin!");
      return;
    }
    if (secilen.length > 1) {
      bildirimGoster("⚠️ Lütfen sadece bir ürün seçin!");
      return;
    }

    const eskiAd = secilen[0].closest('.urun-karti').querySelector('label').textContent.trim();
    const yeniAd = prompt(`"${eskiAd}" yeni adı:`, eskiAd);
    if (!yeniAd || yeniAd.trim() === "" || yeniAd === eskiAd) {
      butonlariNormalModaGetir();
      return;
    }
    if (urunler.includes(yeniAd.trim())) {
      bildirimGoster("⚠️ Bu isim zaten mevcut!");
      return;
    }

    urunler[urunler.indexOf(eskiAd)] = yeniAd.trim();

    const kayitli = aktiveKayitliObj();
    kayitli[yeniAd.trim()] = kayitli[eskiAd];
    delete kayitli[eskiAd];
    kaydetAktifKayitliObj(kayitli);

    const urunGecmisi = aktiveGecmisObj();
    urunGecmisi[yeniAd.trim()] = urunGecmisi[eskiAd];
    delete urunGecmisi[eskiAd];
    kaydetAktifGecmisObj(urunGecmisi);

    kaydetUrunListesiAktif();
    urunleriYukle();
    butonlariNormalModaGetir();
    bildirimGoster("✅ Ürün adı güncellendi!");
    
  } else {
    // Checkbox'ları göster
    butonlariNormalModaGetir();
    aktifIslem = 'duzenle';
    document.getElementById("urunDuzenleBtn").classList.add('active');
    
    document.querySelectorAll('.urun-karti').forEach(kart => {
      let checkbox = kart.querySelector('.secim');
      if (!checkbox) {
        checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'secim';
        kart.insertBefore(checkbox, kart.firstChild);
      }
      checkbox.style.display = 'inline-block';
    });
  }
});

// ---------- ÜRÜN EKLE ----------
document.getElementById("urunEkleBtn").addEventListener("click", () => {
  const yeniUrun = prompt("Yeni ürün adını girin:");
  if(!yeniUrun || yeniUrun.trim()==="") {
    bildirimGoster("⚠️ Ürün adı boş olamaz!");
    return;
  }
  const ad = yeniUrun.trim();
  if (urunler.includes(ad)) {
    bildirimGoster("⚠️ Bu ürün zaten mevcut!");
    return;
  }
  urunler.push(ad);
  kaydetUrunListesiAktif();
  urunleriYukle();
  bildirimGoster(`✅ ${ad} eklendi!`);
});

// ---------- KAYDET ----------
document.getElementById("kaydetBtn").addEventListener("click", () => {
  kaydetUrunListesiAktif();
  bildirimGoster("✅ Tüm değişiklikler kaydedildi!");
});

// ---------- YAZDIR (CSV) ----------
document.getElementById("yazdirBtn").addEventListener("click", () => {
  const veriler = aktiveKayitliObj();
  let csv = "Ürün Adı,Miktar\n";
  Object.keys(veriler).forEach(ad => {
    csv += `${ad},${veriler[ad]}\n`;
  });
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (aktifDepo ? `${aktifDepo}_depo_raporu.csv` : "depo_raporu.csv");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  bildirimGoster("📝 CSV dosyası indirildi!");
});

// ---------- GEÇMİŞ İŞLEMLERİ ----------
document.getElementById("gecmisBtn").addEventListener("click", () => {
  document.getElementById("urunListesi").style.display = "none";
  document.querySelector(".butonlar").style.display = "none";
  document.getElementById("gecmisEkrani").style.display = "block";
});

document.getElementById("kapatBtn").addEventListener("click", () => {
  document.getElementById("urunListesi").style.display = "block";
  document.querySelector(".butonlar").style.display = "flex";
  document.getElementById("gecmisEkrani").style.display = "none";
  document.getElementById("aramaInput").value = "";
  document.getElementById("gecmisListesi").innerHTML = "";
});

document.getElementById("aramaBtn").addEventListener("click", () => {
  const urunAdi = document.getElementById("aramaInput").value.trim();
  const urunGecmisi = aktiveGecmisObj();
  const listDiv = document.getElementById("gecmisListesi");
  listDiv.innerHTML = "";
  
  if (!urunAdi) {
    listDiv.textContent = "Lütfen ürün adı girin.";
    return;
  }
  
  if (!urunGecmisi[urunAdi] || urunGecmisi[urunAdi].length === 0) {
    listDiv.textContent = "Bu ürünün geçmişi yok.";
    return;
  }

  // Sadece kaydetme anındaki değişiklikleri göster (0'dan farklı değişimler)
  const kayitHareketleri = urunGecmisi[urunAdi].filter(h => h.degisim !== 0);
  
  if (kayitHareketleri.length === 0) {
    listDiv.textContent = "Bu ürünün kayıtlı değişikliği yok.";
    return;
  }

  kayitHareketleri.forEach(h => {
    const p = document.createElement("p");
    p.textContent = `${h.tarih} → ${h.degisim > 0 ? '+' : ''}${h.degisim} (Yeni miktar: ${h.yeniMiktar})`;
    listDiv.appendChild(p);
  });
});

// ---------- DEPO AÇMA ----------
function depoAc() {
  if (!aktifDepo) return;
  anaMenu.style.display = "none";
  depoEkrani.style.display = "block";
  if (depoBaslikElem) {
    depoBaslikElem.textContent = `${aktifDepo} Deposu`;
  }
  urunler = JSON.parse(localStorage.getItem(depoUrunKey(aktifDepo)) || "[]");
  urunleriYukle();
  butonlariNormalModaGetir();
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

// ---------- SAYFA YÜKLENMESİ ----------
window.addEventListener("load", () => {
  depoListesiniGuncelle();
  tarihSaatGuncelle();
  
  if (aktifDepo && depolar.includes(aktifDepo)) {
    depoAc();
  } else {
    if (aktifDepo && !depolar.includes(aktifDepo)) {
      aktifDepo = null;
      localStorage.removeItem("aktifDepo");
    }
    anaMenu.style.display = "block";
    depoEkrani.style.display = "none";
    urunler = JSON.parse(localStorage.getItem("urunListesi") || "[]");
  }
});

// ---------- SAYFA YÜKLENİRKEN TEMİZLEME ----------
function sayfaYuklendigindeTemizle() {
  // Aktif işlem varsa sıfırla
  aktifIslem = null;
  butonlariNormalModaGetir();
  
  // Modal'ı kapat
  if (depoSilModal) {
    depoSilModal.style.display = 'none';
  }
  
  // Geçmiş ekranını kapat
  const gecmisEkrani = document.getElementById("gecmisEkrani");
  if (gecmisEkrani) {
    gecmisEkrani.style.display = "none";
  }
  
  const urunListesiElem = document.getElementById("urunListesi");
  if (urunListesiElem) {
    urunListesiElem.style.display = "block";
  }
  
  const butonlar = document.querySelector(".butonlar");
  if (butonlar) {
    butonlar.style.display = "flex";
  }
}

// Sayfa yüklendiğinde temizleme fonksiyonunu çağır
sayfaYuklendigindeTemizle();