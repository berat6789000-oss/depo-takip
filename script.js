// ---------- DEĞİŞKENLER ----------
let urunler = [];
let aktifIslem = null;
let aktifDepo = localStorage.getItem("aktifDepo");
const depolar = JSON.parse(localStorage.getItem("depolar")) || [];

// ---------- SAYFA YÜKLENDİĞİNDE ÇALIŞACAK ANA FONKSİYON ----------
function uygulamayiBaslat() {
    console.log("Uygulama başlatılıyor...");
    
    // Elementleri kontrol et
    const gerekliElementler = [
        "anaMenu", "depoEkrani", "depoBaslik", "depoListesi",
        "urunListesi", "urunEkleBtn", "urunSilBtn", "urunDuzenleBtn",
        "kaydetBtn", "yazdirBtn", "gecmisBtn", "raporlarBtn",
        "yeniDepoBtn", "depoCikisBtn"
    ];

    gerekliElementler.forEach(id => {
        const elem = document.getElementById(id);
        if (!elem) {
            console.error(`Element bulunamadı: ${id}`);
        } else {
            console.log(`Element yüklendi: ${id}`);
        }
    });

    // Event listener'ları kur
    eventListenerlariKur();
    
    // Depo listesini güncelle*ğ
    depoListesiniGuncelle();
    
    // Sayfa durumunu ayarla
    sayfaDurumunuAyarla();
    
    console.log("Uygulama başlatma tamamlandı");
}

// ---------- EVENT LISTENER'LARI KUR ----------
function eventListenerlariKur() {
    console.log("Event listener'lar kuruluyor...");

    // Depo butonları
    safeAddEventListener("yeniDepoBtn", "click", yeniDepoOlustur);
    safeAddEventListener("depoCikisBtn", "click", depoCikis);

    // Ürün işlem butonları
    safeAddEventListener("urunEkleBtn", "click", urunEkle);
    safeAddEventListener("urunSilBtn", "click", urunSil);
    safeAddEventListener("urunDuzenleBtn", "click", urunDuzenle);
    safeAddEventListener("kaydetBtn", "click", verileriKaydet);
    safeAddEventListener("yazdirBtn", "click", raporYazdir);
    safeAddEventListener("gecmisBtn", "click", gecmisGoster);
    safeAddEventListener("raporlarBtn", "click", raporlariGoster);

    // Geçmiş ekranı butonları
    safeAddEventListener("kapatBtn", "click", gecmisKapat);
    safeAddEventListener("aramaBtn", "click", gecmisAra);
    safeAddEventListener("gecmisTemizleBtn", "click", gecmisTemizle);
    safeAddEventListener("gecmisYazdirBtn", "click", gecmisYazdir);

    // Rapor ekranı butonları
    safeAddEventListener("raporKapatBtn", "click", raporlariKapat);

    // Depo silme modal butonları
    safeAddEventListener("depoSilOnay", "click", depoSilOnay);
    safeAddEventListener("depoSilIptal", "click", depoSilIptal);

    console.log("Event listener'lar kuruldu");
}

// ---------- GÜVENLİ EVENT LISTENER EKLEME ----------
function safeAddEventListener(elementId, eventType, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, handler);
        console.log(`Event listener eklendi: ${elementId}`);
    } else {
        console.error(`Event listener eklenemedi: ${elementId} bulunamadı`);
    }
}

// ---------- DEPO İŞLEMLERİ ----------
function yeniDepoOlustur() {
    console.log("Yeni depo oluştur butonu tıklandı");
    const depoAdi = prompt("Yeni depo adını girin:");
    if (!depoAdi || depoAdi.trim() === "") {
        bildirimGoster("⚠️ Depo adı boş olamaz!", "uyari");
        return;
    }
    
    const temizDepoAdi = depoAdi.trim();
    if (depolar.includes(temizDepoAdi)) {
        bildirimGoster("⚠️ Bu depo zaten mevcut!", "uyari");
        return;
    }
    
    depolar.push(temizDepoAdi);
    localStorage.setItem("depolar", JSON.stringify(depolar));
    depoListesiniGuncelle();
    bildirimGoster(`✅ ${temizDepoAdi} deposu oluşturuldu!`);
}

function depoCikis() {
    console.log("Depo çıkış butonu tıklandı");
    aktifDepo = null;
    localStorage.removeItem("aktifDepo");
    document.getElementById("anaMenu").style.display = "block";
    document.getElementById("depoEkrani").style.display = "none";
    urunler = JSON.parse(localStorage.getItem("urunListesi") || "[]");
    bildirimGoster("Çıkış yapıldı!");
}

// ---------- DEPO LİSTESİNİ GÜNCELLE ----------
function depoListesiniGuncelle() {
    const depoListesi = document.getElementById("depoListesi");
    if (!depoListesi) {
        console.error("depoListesi elementi bulunamadı");
        return;
    }
    
    depoListesi.innerHTML = '';
    
    if (depolar.length === 0) {
        depoListesi.innerHTML = '<p class="bos-liste">Henüz depo oluşturulmamış</p>';
        return;
    }
    
    depolar.forEach(depo => {
        const depoItem = document.createElement('div');
        depoItem.className = 'depo-item';
        depoItem.innerHTML = `
            <span>${depo}</span>
            <div class="depo-actions">
                <button class="ac-btn" onclick="depoAc('${depo}')">Aç</button>
                <button class="sil-btn" onclick="depoSilModalAc('${depo}')">Sil</button>
            </div>
        `;
        depoListesi.appendChild(depoItem);
    });
}

// ---------- DEPO AÇ ----------
function depoAc(depoAdi) {
    console.log(`Depo açılıyor: ${depoAdi}`);
    aktifDepo = depoAdi;
    localStorage.setItem("aktifDepo", aktifDepo);
    
    document.getElementById("anaMenu").style.display = "none";
    document.getElementById("depoEkrani").style.display = "block";
    
    const depoBaslikElem = document.getElementById("depoBaslik");
    if (depoBaslikElem) {
        depoBaslikElem.textContent = `${aktifDepo} Deposu`;
    }
    
    urunler = JSON.parse(localStorage.getItem(`urunListesi_${aktifDepo}`)) || [];
    urunleriYukle();
    butonlariNormalModaGetir();
    bildirimGoster(`${aktifDepo} deposu açıldı!`);
}

// ---------- DEPO SİL MODAL ----------
function depoSilModalAc(depoAdi) {
    console.log(`Depo sil modal açılıyor: ${depoAdi}`);
    const depoSilModal = document.getElementById("depoSilModal");
    if (depoSilModal) {
        depoSilModal.style.display = 'block';
        depoSilModal.setAttribute('data-depo', depoAdi);
        document.getElementById('silinecekDepoAdi').textContent = depoAdi;
    }
}

function depoSilOnay() {
    const depoSilModal = document.getElementById("depoSilModal");
    const depoAdi = depoSilModal.getAttribute('data-depo');
    console.log(`Depo siliniyor: ${depoAdi}`);
    
    // Aktif depo siliniyorsa ana menüye dön
    if (aktifDepo === depoAdi) {
        aktifDepo = null;
        localStorage.removeItem("aktifDepo");
        document.getElementById("anaMenu").style.display = "block";
        document.getElementById("depoEkrani").style.display = "none";
    }
    
    // Depoyu listeden kaldır
    const index = depolar.indexOf(depoAdi);
    if (index > -1) {
        depolar.splice(index, 1);
        localStorage.setItem("depolar", JSON.stringify(depolar));
    }
    
    // Depo verilerini temizle
    localStorage.removeItem(`depoVerileri_${depoAdi}`);
    localStorage.removeItem(`urunGecmisi_${depoAdi}`);
    localStorage.removeItem(`urunListesi_${depoAdi}`);
    
    depoListesiniGuncelle();
    depoSilModal.style.display = 'none';
    bildirimGoster(`✅ ${depoAdi} deposu silindi!`);
}

function depoSilIptal() {
    const depoSilModal = document.getElementById("depoSilModal");
    depoSilModal.style.display = 'none';
}

// ---------- ÜRÜN İŞLEMLERİ ----------
function urunEkle() {
    console.log("Ürün ekle butonu tıklandı");
    const yeniUrun = prompt("Yeni ürün adını girin:");
    if (!yeniUrun || yeniUrun.trim() === "") {
        bildirimGoster("⚠️ Ürün adı boş olamaz!", "uyari");
        return;
    }
    
    const ad = yeniUrun.trim();
    if (urunler.includes(ad)) {
        bildirimGoster("⚠️ Bu ürün zaten mevcut!", "uyari");
        return;
    }
    
    urunler.push(ad);
    kaydetUrunListesiAktif();
    urunleriYukle();
    bildirimGoster(`✅ ${ad} eklendi!`);
}

function urunSil() {
    console.log("Ürün sil butonu tıklandı");
    
    if (aktifIslem === 'sil') {
        const secilen = Array.from(document.querySelectorAll('.secim:checked'));
        if (secilen.length === 0) {
            bildirimGoster("⚠️ Lütfen silmek için ürün seçin!", "uyari");
            return;
        }

        if (!confirm(`Seçilen ${secilen.length} ürünü silmek istediğinize emin misiniz?`)) {
            return;
        }

        const kayitli = aktiveKayitliObj();
        const urunGecmisi = aktiveGecmisObj();

        secilen.forEach(cb => {
            const urunKarti = cb.closest('.urun-karti');
            if (!urunKarti) return;
            
            const label = urunKarti.querySelector('label');
            if (!label) return;
            
            const ad = label.textContent.trim();
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
        
        bildirimGoster("Silmek için ürünleri seçin");
    }
}

function urunDuzenle() {
    console.log("Ürün düzenle butonu tıklandı");
    
    if (aktifIslem === 'duzenle') {
        const secilen = Array.from(document.querySelectorAll('.secim:checked'));
        if (secilen.length === 0) {
            bildirimGoster("⚠️ Lütfen düzenlemek için ürün seçin!", "uyari");
            return;
        }
        if (secilen.length > 1) {
            bildirimGoster("⚠️ Lütfen sadece bir ürün seçin!", "uyari");
            return;
        }

        const urunKarti = secilen[0].closest('.urun-karti');
        if (!urunKarti) return;
        
        const label = urunKarti.querySelector('label');
        if (!label) return;
        
        const eskiAd = label.textContent.trim();
        const yeniAd = prompt(`"${eskiAd}" yeni adı:`, eskiAd);
        if (!yeniAd || yeniAd.trim() === "" || yeniAd === eskiAd) {
            butonlariNormalModaGetir();
            return;
        }
        
        const temizYeniAd = yeniAd.trim();
        if (urunler.includes(temizYeniAd)) {
            bildirimGoster("⚠️ Bu isim zaten mevcut!", "uyari");
            return;
        }

        urunler[urunler.indexOf(eskiAd)] = temizYeniAd;

        const kayitli = aktiveKayitliObj();
        kayitli[temizYeniAd] = kayitli[eskiAd];
        delete kayitli[eskiAd];
        kaydetAktifKayitliObj(kayitli);

        const urunGecmisi = aktiveGecmisObj();
        urunGecmisi[temizYeniAd] = urunGecmisi[eskiAd];
        delete urunGecmisi[eskiAd];
        kaydetAktifGecmisObj(urunGecmisi);

        kaydetUrunListesiAktif();
        urunleriYukle();
        butonlariNormalModaGetir();
        bildirimGoster("✅ Ürün adı güncellendi!");
        
    } else {
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
        
        bildirimGoster("Düzenlemek için bir ürün seçin");
    }
}

function verileriKaydet() {
    console.log("Kaydet butonu tıklandı");
    kaydetUrunListesiAktif();
    bildirimGoster("✅ Tüm değişiklikler kaydedildi!");
}

// ---------- RAPOR İŞLEMLERİ ----------
function raporYazdir() {
    console.log("Yazdır butonu tıklandı");
    try {
        const veriler = aktiveKayitliObj();
        let csv = "Ürün Adı,Miktar\n";
        Object.keys(veriler).forEach(ad => {
            csv += `"${ad}",${veriler[ad]}\n`;
        });
        
        const blob = new Blob(["\uFEFF" + csv], {type: "text/csv;charset=utf-8;"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = (aktifDepo ? `${aktifDepo}_depo_raporu.csv` : "depo_raporu.csv");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        bildirimGoster("📝 CSV dosyası indirildi!");
    } catch (error) {
        bildirimGoster("❌ CSV oluşturulurken hata!", "hata");
        console.error("CSV oluşturma hatası:", error);
    }
}

function gecmisGoster() {
    console.log("Geçmiş butonu tıklandı");
    document.getElementById("urunListesi").style.display = "none";
    document.querySelector(".butonlar").style.display = "none";
    document.getElementById("gecmisEkrani").style.display = "block";
}

function gecmisKapat() {
    document.getElementById("urunListesi").style.display = "block";
    document.querySelector(".butonlar").style.display = "flex";
    document.getElementById("gecmisEkrani").style.display = "none";
    document.getElementById("aramaInput").value = "";
    document.getElementById("gecmisListesi").innerHTML = "";
}

function raporlariGoster() {
    console.log("Raporlar butonu tıklandı");
    document.getElementById("anaMenu").style.display = "none";
    document.getElementById("depoEkrani").style.display = "none";
    document.getElementById("raporlarEkrani").style.display = "block";
}

function raporlariKapat() {
    document.getElementById("raporlarEkrani").style.display = "none";
    if (aktifDepo) {
        document.getElementById("depoEkrani").style.display = "block";
    } else {
        document.getElementById("anaMenu").style.display = "block";
    }
}

// ---------- GEÇMİŞ İŞLEMLERİ ----------
function gecmisAra() {
    const urunAdi = document.getElementById("aramaInput").value.trim();
    const urunGecmisi = aktiveGecmisObj();
    const listDiv = document.getElementById("gecmisListesi");
    
    if (!listDiv) return;
    
    listDiv.innerHTML = "";
    
    if (!urunAdi) {
        listDiv.textContent = "Lütfen ürün adı girin.";
        return;
    }
    
    if (!urunGecmisi[urunAdi] || urunGecmisi[urunAdi].length === 0) {
        listDiv.textContent = "Bu ürünün geçmişi yok.";
        return;
    }

    const kayitHareketleri = urunGecmisi[urunAdi].filter(h => h.degisim !== 0);
    
    if (kayitHareketleri.length === 0) {
        listDiv.textContent = "Bu ürünün kayıtlı değişikliği yok.";
        return;
    }

    // En yeni hareket en üstte
    kayitHareketleri.reverse().forEach(h => {
        const p = document.createElement("p");
        p.className = "gecmis-item";
        p.innerHTML = `
            <strong>${h.tarih}</strong><br>
            Değişim: <span class="${h.degisim > 0 ? 'artis' : 'azalis'}">${h.degisim > 0 ? '+' : ''}${h.degisim}</span><br>
            Yeni miktar: ${h.yeniMiktar}
        `;
        listDiv.appendChild(p);
    });
}

function gecmisTemizle() {
    const urunAdi = document.getElementById("aramaInput").value.trim();
    
    if (!urunAdi) {
        bildirimGoster("⚠️ Önce bir ürün arayın!", "uyari");
        return;
    }
    
    if (confirm(`${urunAdi} ürününün tüm geçmişini silmek istediğinize emin misiniz?`)) {
        const urunGecmisi = aktiveGecmisObj();
        delete urunGecmisi[urunAdi];
        kaydetAktifGecmisObj(urunGecmisi);
        
        document.getElementById("gecmisListesi").innerHTML = "";
        bildirimGoster("✅ Geçmiş temizlendi!");
    }
}

function gecmisYazdir() {
    const urunAdi = document.getElementById("aramaInput").value.trim();
    const urunGecmisi = aktiveGecmisObj();
    
    if (!urunAdi || !urunGecmisi[urunAdi]) {
        bildirimGoster("⚠️ Önce bir ürün arayın!", "uyari");
        return;
    }
    
    try {
        let csv = "Tarih,Değişim,Yeni Miktar\n";
        urunGecmisi[urunAdi].forEach(h => {
            csv += `"${h.tarih}",${h.degisim},${h.yeniMiktar}\n`;
        });
        
        const blob = new Blob(["\uFEFF" + csv], {type: "text/csv;charset=utf-8;"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${urunAdi.replace(/[^a-zA-Z0-9]/g, '_')}_gecmis.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        bildirimGoster("📝 Geçmiş yazdırıldı!");
    } catch (error) {
        bildirimGoster("❌ Geçmiş yazdırılırken hata!", "hata");
        console.error("Geçmiş yazdırma hatası:", error);
    }
}

// ---------- BUTONLARI NORMAL MODA GETİR ----------
function butonlariNormalModaGetir() {
    document.querySelectorAll('.butonlar button').forEach(btn => {
        btn.classList.remove('active');
    });
    aktifIslem = null;
    
    document.querySelectorAll('.secim').forEach(cb => {
        if (cb) cb.style.display = 'none';
    });
}

// ---------- ÜRÜNLERİ YÜKLE ----------
function urunleriYukle() {
    const urunListesi = document.getElementById("urunListesi");
    if (!urunListesi) {
        console.error("urunListesi elementi bulunamadı");
        return;
    }
    
    urunListesi.innerHTML = '';
    
    if (urunler.length === 0) {
        urunListesi.innerHTML = '<p class="bos-liste">Henüz ürün eklenmemiş</p>';
        return;
    }
    
    const kayitli = aktiveKayitliObj();
    
    urunler.forEach(ad => {
        const urunKarti = document.createElement('div');
        urunKarti.className = 'urun-karti';
        urunKarti.innerHTML = `
            <label for="${cssIdFromName(ad)}">${ad}</label>
            <input type="number" id="${cssIdFromName(ad)}" value="${kayitli[ad] || 0}" min="0" step="0.01">
        `;
        urunListesi.appendChild(urunKarti);
        
        const input = document.getElementById(cssIdFromName(ad));
        if (input) {
            input.addEventListener("change", () => {
                urunDegisimKaydet(ad, input);
            });
        }
    });
    
    renkleriGuncelle();
}

// ---------- CSS ID HELPER ----------
function cssIdFromName(name) {
    return "urun_" + name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-]/g, "");
}

// ---------- DEPO BAZLI KAYDETME HELPER'LARI ----------
function aktiveKayitliObj() {
    if (!aktifDepo) return JSON.parse(localStorage.getItem("depoVerileri") || "{}");
    return JSON.parse(localStorage.getItem(`depoVerileri_${aktifDepo}`) || "{}");
}

function aktiveGecmisObj() {
    if (!aktifDepo) return JSON.parse(localStorage.getItem("urunGecmisi") || "{}");
    return JSON.parse(localStorage.getItem(`urunGecmisi_${aktifDepo}`) || "{}");
}

function kaydetAktifKayitliObj(obj) {
    if (!aktifDepo) localStorage.setItem("depoVerileri", JSON.stringify(obj));
    else localStorage.setItem(`depoVerileri_${aktifDepo}`, JSON.stringify(obj));
}

function kaydetAktifGecmisObj(obj) {
    if (!aktifDepo) localStorage.setItem("urunGecmisi", JSON.stringify(obj));
    else localStorage.setItem(`urunGecmisi_${aktifDepo}`, JSON.stringify(obj));
}

function kaydetUrunListesiAktif() {
    if (!aktifDepo) localStorage.setItem("urunListesi", JSON.stringify(urunler));
    else localStorage.setItem(`urunListesi_${aktifDepo}`, JSON.stringify(urunler));
}

// ---------- SAYFA DURUMUNU AYARLA ----------
function sayfaDurumunuAyarla() {
    if (aktifDepo && depolar.includes(aktifDepo)) {
        depoAc(aktifDepo);
    } else {
        if (aktifDepo && !depolar.includes(aktifDepo)) {
            aktifDepo = null;
            localStorage.removeItem("aktifDepo");
        }
        document.getElementById("anaMenu").style.display = "block";
        document.getElementById("depoEkrani").style.display = "none";
        urunler = JSON.parse(localStorage.getItem("urunListesi") || "[]");
    }
}

// ---------- BİLDİRİM SİSTEMİ ----------
function bildirimGoster(mesaj, tur = 'bilgi') {
    const bildirim = document.createElement('div');
    bildirim.className = `bildirim ${tur}`;
    bildirim.textContent = mesaj;
    bildirim.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${tur === 'hata' ? '#dc3545' : tur === 'uyari' ? '#ffc107' : '#28a745'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(bildirim);
    
    setTimeout(() => {
        bildirim.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (bildirim.parentNode) {
                bildirim.parentNode.removeChild(bildirim);
            }
        }, 300);
    }, 3000);
}

// ---------- SAYFA YÜKLENDİĞİNDE ÇALIŞTIR ----------
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM içeriği yüklendi, uygulama başlatılıyor...");
    uygulamayiBaslat();
});
