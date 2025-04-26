function doPost(e) {
  try {
    const action = e.parameter.action;
    const username = e.parameter.username;
    const password = e.parameter.password;

    if (!action) {
      return output({ status: "fail", message: "Parameter action diperlukan" });
    }

    if (!username || !password) {
      return output({ status: "fail", message: "Username dan password diperlukan" });
    }

    if (!checkLogin(username, password)) {
      return output({ status: "fail", message: "Login gagal" });
    }

    switch (action) {
      case "getInventaris":
        return output({ status: "ok", data: getInventaris() });

      case "addBarang":
        if (!e.parameter.data) {
          return output({ status: "fail", message: "Data barang diperlukan" });
        }
        try {
          const data = JSON.parse(e.parameter.data);
          return output(addBarang(data, username));
        } catch (error) {
          return output({ status: "fail", message: "Format data tidak valid: " + error.message });
        }

      case "updateBarang":
        if (!e.parameter.id || !e.parameter.data) {
          return output({ status: "fail", message: "ID dan data barang diperlukan" });
        }
        try {
          const data = JSON.parse(e.parameter.data);
          return output(updateBarang(e.parameter.id, data, username));
        } catch (error) {
          return output({ status: "fail", message: "Format data tidak valid: " + error.message });
        }

      case "deleteBarang":
        if (!e.parameter.id) {
          return output({ status: "fail", message: "ID barang diperlukan" });
        }
        return output(deleteBarang(e.parameter.id, username));

      case "getJurnal":
        return output({ status: "ok", data: getJurnal() });

      case "addJurnal":
        if (!e.parameter.data) {
          return output({ status: "fail", message: "Data jurnal diperlukan" });
        }
        try {
          const data = JSON.parse(e.parameter.data);
          return output(addJurnal(data, username));
        } catch (error) {
          return output({ status: "fail", message: "Format data tidak valid: " + error.message });
        }

      case "getJadwal":
        return output({ status: "ok", data: getJadwal() });
      
      case "updateJadwal":
        if (!e.parameter.data) {
          return output({ status: "fail", message: "Data jadwal diperlukan" });
        }
        try {
          const data = JSON.parse(e.parameter.data);
          return output(updateJadwal(data));
        } catch (error) {
          return output({ status: "fail", message: "Format data tidak valid: " + error.message });
        }

      default:
        return output({ status: "fail", message: "Aksi tidak dikenal" });
    }
  } catch (err) {
    return output({ status: "fail", error: err.message, stack: err.stack });
  }
}

function output(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function checkLogin(username, password) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const [u, p] = data[i];
    if (u === username && p === password) return true;
  }
  return false;
}

function getInventaris() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventaris");
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  return data.slice(1).map(row => {
    let item = {};
    for (let i = 0; i < header.length; i++) {
      item[header[i]] = row[i];
    }
    return item;
  });
}

function validateBarangData(data) {
  const requiredFields = ["Nama Barang", "Jumlah", "Satuan", "Kondisi", "Lokasi", "Kategori", "Tanggal Masuk"];
  for (const field of requiredFields) {
    if (!data[field] && data[field] !== 0) {
      throw new Error(`Field ${field} diperlukan`);
    }
  }
  
  // Validasi jumlah harus angka
  if (isNaN(Number(data["Jumlah"]))) {
    throw new Error("Jumlah harus berupa angka");
  }
  
  return true;
}

function addBarang(data, user) {
  try {
    validateBarangData(data);
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventaris");
    const newId = new Date().getTime().toString(); // ID unik pakai timestamp
    const row = [
      newId,
      data["Nama Barang"],
      Number(data["Jumlah"]),
      data["Satuan"],
      data["Kondisi"],
      data["Lokasi"],
      data["Kategori"],
      data["Tanggal Masuk"],
      data["Catatan"] || ""
    ];
    sheet.appendRow(row);
    logAktivitas("Tambah Barang", user, data["Nama Barang"]);
    return { status: "ok", message: "Barang ditambahkan", id: newId };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
}

function updateBarang(id, newData, user) {
  try {
    validateBarangData(newData);
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventaris");
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == id) {
        sheet.getRange(i + 1, 2, 1, 8).setValues([[
          newData["Nama Barang"],
          Number(newData["Jumlah"]),
          newData["Satuan"],
          newData["Kondisi"],
          newData["Lokasi"],
          newData["Kategori"],
          newData["Tanggal Masuk"],
          newData["Catatan"] || ""
        ]]);
        logAktivitas("Edit Barang", user, newData["Nama Barang"]);
        return { status: "ok", message: "Barang diperbarui" };
      }
    }
    return { status: "fail", message: "ID tidak ditemukan" };
  } catch (error) {
    return { status: "fail", message: error.message };
  }
}

function deleteBarang(id, user) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventaris");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      const nama = data[i][1];
      sheet.deleteRow(i + 1);
      logAktivitas("Hapus Barang", user, nama);
      return { status: "ok", message: "Barang dihapus" };
    }
  }
  return { status: "fail", message: "ID tidak ditemukan" };
}

function logAktivitas(aksi, user, detail) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
    sheet.appendRow([new Date(), aksi, user, detail]);
  } catch (error) {
    console.error("Gagal mencatat aktivitas:", error);
  }
}

function validateJurnalData(data) {
  try {
    const requiredFields = ["Tanggal", "Kelas", "Materi", "Alat Digunakan"];
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        throw new Error(`Field ${field} diperlukan`);
      }
    }
    
    // Validasi format tanggal
    if (data["Tanggal"]) {
      try {
        // Coba parse tanggal
        const dateObj = new Date(data["Tanggal"]);
        if (isNaN(dateObj.getTime())) {
          throw new Error("Format tanggal tidak valid");
        }
      } catch (e) {
        throw new Error("Format tanggal tidak valid");
      }
    }
    
    return true;
  } catch (error) {
    throw error; // Re-throw untuk ditangkap oleh caller
  }
}

function getJurnal() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Jurnal");
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  return data.slice(1).map(row => {
    let obj = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = row[i];
    }
    return obj;
  });
}

function addJurnal(data, user) {
  try {
    console.log("Data jurnal yang diterima:", JSON.stringify(data));
    validateJurnalData(data);
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Jurnal");
    if (!sheet) {
      return { status: "fail", message: "Sheet 'Jurnal' tidak ditemukan" };
    }
    
    // Format tanggal jika perlu
    let tanggal = data["Tanggal"];
    try {
      // Pastikan tanggal dalam format yang konsisten yyyy-MM-dd
      const dateObj = new Date(tanggal);
      if (!isNaN(dateObj.getTime())) {
        tanggal = Utilities.formatDate(dateObj, "GMT+7", "yyyy-MM-dd");
      }
    } catch (e) {
      console.error("Error formatting date:", e);
    }
    
    const row = [
      tanggal,
      data["Kelas"],
      user,
      data["Materi"],
      data["Alat Digunakan"],
      data["Catatan"] || ""
    ];
    
    console.log("Row data yang akan ditambahkan:", JSON.stringify(row));
    sheet.appendRow(row);
    logAktivitas("Isi Jurnal", user, `Kelas ${data["Kelas"]} - ${data["Materi"]}`);
    return { status: "ok", message: "Jurnal berhasil ditambahkan" };
  } catch (error) {
    console.error("Error dalam addJurnal:", error);
    return { status: "fail", message: error.message };
  }
}

function getJadwal() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Jadwal");
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  
  // Metode perbaikan perhitungan minggu genap/ganjil
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((today - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
  const isEvenWeek = weekNumber % 2 === 0;
  const filter = isEvenWeek ? "Genap" : "Ganjil";

  return data.slice(1).filter(row => row[4] === filter).map(row => {
    let obj = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = row[i];
    }
    return obj;
  });
}

function validateJadwalData(data) {
  try {
    if (!Array.isArray(data)) {
      throw new Error("Data jadwal harus berupa array");
    }
    
    if (data.length === 0) {
      throw new Error("Data jadwal tidak boleh kosong");
    }
    
    for (const item of data) {
      if (!item.Hari || !item.Jam || !item.Kelas || !item.Guru) {
        throw new Error("Setiap item jadwal harus memiliki Hari, Jam, Kelas, dan Guru");
      }
      
      if (item.Minggu !== "Genap" && item.Minggu !== "Ganjil") {
        throw new Error("Nilai Minggu harus 'Genap' atau 'Ganjil'");
      }
    }
    
    return true;
  } catch (error) {
    throw error; // Re-throw untuk ditangkap oleh caller
  }
}

function updateJadwal(newData) {
  try {
    console.log("Data jadwal yang diterima:", JSON.stringify(newData));
    validateJadwalData(newData);
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Jadwal");
    if (!sheet) {
      return { status: "fail", message: "Sheet 'Jadwal' tidak ditemukan" };
    }
    
    const headers = sheet.getDataRange().getValues()[0];

    // Clear isi jadwal lama
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clearContent();
    }

    console.log("Jumlah data jadwal yang akan ditambahkan:", newData.length);
    
    // Masukkan jadwal baru satu per satu untuk menghindari masalah
    newData.forEach(row => {
      sheet.appendRow([row.Hari, row.Jam, row.Kelas, row.Guru, row.Minggu]);
    });

    return { status: "ok", message: "Jadwal berhasil diperbarui" };
  } catch (error) {
    console.error("Error dalam updateJadwal:", error);
    return { status: "fail", message: error.message };
  }
}

// Fungsi untuk mengakses API dari client
function doGet(e) {
  return HtmlService.createHtmlOutput(
    "<h1>API Inventaris Lab IPA</h1>" +
    "<p>Ini adalah API untuk sistem inventaris laboratorium IPA.</p>" +
    "<p>Gunakan metode POST untuk mengakses layanan ini.</p>"
  ).setTitle("API Inventaris Lab IPA");
} 