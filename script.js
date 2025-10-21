const urunler = [
  "jumbo 800","servis kağıdı","şeker","setleme","ıslak mendil",
  "1000 cc","150 cc","250 cc","750 cc","servis çatal",
  "bardak","çay","pipet","içten çekmeli","köpük",
  "kürdan","beyaz","72*95","55*60","lahmacun","pide","sünger"
];

const urunListesi = document.getElementById("urunListesi");

// Ürünleri yükle
function urunleriYukle() {
  urunListesi.innerHTML = "";
  urunler.forEach(ad => {
    const div = document.createElement("div");
    div.classList.add("urun");
    div.innerHTML = `
      <label>${ad}</label>
      <input type="number" id="${ad}" placeholder="Miktar">
    `;
    urunListesi.appendChild(div);
  });

  // Kaydedilmiş verileri yükle
  const kayitli = JSON.parse(localStorage.getItem("depoVerileri") || "{}");
  Object.keys(kayitli).forEach(ad => {
    const input = document.getElementById(ad);
    if(input) input.value = kayitli[ad];
  });

  // Renkleri güncelle
  renkleriGuncelle();
}

// Kaydet
document.getElementById("kaydetBtn").addEventListener("click", () => {
  const veriler = {};
  urunler.forEach(ad => {
    const miktar = document.getElementById(ad).value;
    veriler[ad] = miktar;
  });
  localStorage.setItem("depoVerileri", JSON.stringify(veriler));
  renkleriGuncelle();
  alert("✅ Ürünler kaydedildi!");
});

// Renkleri güncelle (0 veya 1 → koyu kırmızı, diğerleri beyaz)
function renkleriGuncelle() {
  urunler.forEach(ad => {
    const input = document.getElementById(ad);
    if(input) {
      const val = parseFloat(input.value);
      if(val === 0 || val === 1) {
        input.style.backgroundColor = "#c82333"; // koyu kırmızı
        input.style.color = "white"; // sayı görünmesi için beyaz
      } else {
        input.style.backgroundColor = "white";
        input.style.color = "black";
      }
    }
  });
}

// Excel'e aktar (.csv)
document.getElementById("excelBtn").addEventListener("click", () => {
  const veriler = JSON.parse(localStorage.getItem("depoVerileri") || "{}");
  let csv = "Ürün Adı,Miktar\n";
  Object.keys(veriler).forEach(ad => {
    csv += `${ad},${veriler[ad]}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "depo_raporu.csv";
  a.click();
});

// PDF oluştur
document.getElementById("pdfBtn").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const veriler = JSON.parse(localStorage.getItem("depoVerileri") || "{}");
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text("Depo Takip Raporu", 10, 10);

  let y = 20;
  Object.keys(veriler).forEach(ad => {
    let miktar = parseFloat(veriler[ad]) || 0;
    if(miktar === 0 || miktar === 1) {
      doc.setTextColor(200,35,51); // koyu kırmızı
    } else {
      doc.setTextColor(0,0,0); // siyah
    }
    doc.text(`${ad}: ${miktar}`, 10, y);
    y += 10;
  });

  doc.save("depo_raporu.pdf");
});

urunleriYukle();
