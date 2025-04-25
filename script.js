// Script untuk Inventaris Lab IPA
const URL = "https://script.google.com/macros/s/AKfycbwjK8w-TE-bh7UqYSQ2OohHUoI9G6kfMaSPBBsowjUYmyfvBNG7BHRSHX0Z5fbreUbXWg/exec";
let loginData = { username: "", password: "" };
let inventarisData = [];
let chartInstances = {};
let currentSection = 'dashboard';

// Sembunyikan sidebar saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('sidebar').classList.add('hidden');
});

// Fungsi untuk toggle sidebar
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  sidebar.classList.toggle('sidebar-visible');
  overlay.classList.toggle('overlay-visible');
}

// Fungsi untuk menampilkan section
function showSection(section) {
  // Update active menu item
  document.querySelectorAll('.sidebar-menu-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`.sidebar-menu-item[href="#${section}"]`).classList.add('active');
  
  // Hide all sections
  document.getElementById('dashboard-section').classList.add('hidden');
  document.getElementById('inventaris-section').classList.add('hidden');
  
  // Show selected section
  document.getElementById(`${section}-section`).classList.remove('hidden');
  
  // Update page title
  document.getElementById('page-title').textContent = section === 'dashboard' ? 'Dashboard' : 'Daftar Inventaris';
  
  // Close sidebar on mobile
  if (window.innerWidth < 1024) {
    toggleSidebar();
  }
  
  currentSection = section;
}

// Fungsi untuk login
function login() {
  loginData.username = document.getElementById("username").value;
  loginData.password = document.getElementById("password").value;
  document.getElementById("login-message").textContent = "";
  
  // Tampilkan loading
  document.getElementById("login-button").disabled = true;
  document.getElementById("login-button").innerHTML = '<svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Loading...';

  fetch(URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "getInventaris",
      username: loginData.username,
      password: loginData.password
    })
  })
  .then(res => res.json())
  .then(res => {
    // Reset tombol login
    document.getElementById("login-button").disabled = false;
    document.getElementById("login-button").innerHTML = 'Login';
    
    if (res.status === "ok") {
      // Simpan data inventaris
      inventarisData = res.data;
      
      // Sembunyikan login, tampilkan dashboard
      document.getElementById("login-section").classList.add("hidden");
      document.getElementById("main-content").classList.remove("hidden");
      document.getElementById("main-content").classList.add("flex");
      document.getElementById('sidebar').classList.remove('hidden');
      
      // Tampilkan pesan selamat datang
      document.getElementById('welcome-message').textContent = `Selamat datang, Guru ${loginData.username}!`;
      
      // Tampilkan dashboard secara default
      showSection('dashboard');
      
      // Render data
      renderTable(res.data);
      renderDashboardStats(res.data);
      renderCharts(res.data);
    } else {
      document.getElementById("login-message").textContent = "Login gagal! Periksa username dan password.";
    }
  })
  .catch(error => {
    document.getElementById("login-button").disabled = false;
    document.getElementById("login-button").innerHTML = 'Login';
    document.getElementById("login-message").textContent = "Terjadi kesalahan. Silakan coba lagi.";
    console.error("Error:", error);
  });
}

// Fungsi untuk refresh data
function refreshData() {
  // Tampilkan loading
  document.getElementById("refresh-button").innerHTML = '<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
  
  fetch(URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "getInventaris",
      username: loginData.username,
      password: loginData.password
    })
  })
  .then(res => res.json())
  .then(res => {
    // Reset tombol refresh
    document.getElementById("refresh-button").innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>';
    
    if (res.status === "ok") {
      // Simpan data inventaris
      inventarisData = res.data;
      
      // Render data
      renderTable(res.data);
      renderDashboardStats(res.data);
      renderCharts(res.data);
    } else {
      alert("Gagal refresh data");
    }
  })
  .catch(error => {
    document.getElementById("refresh-button").innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>';
    alert("Terjadi kesalahan. Silakan coba lagi.");
    console.error("Error:", error);
  });
}

// Fungsi untuk render tabel
function renderTable(data) {
  const tbody = document.getElementById("inventaris-table");
  tbody.innerHTML = "";
  
  if (data.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" class="p-4 text-center text-gray-500">Tidak ada data</td>`;
    tbody.appendChild(tr);
    return;
  }
  
  data.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";
    tr.innerHTML = `
      <td class="p-3 border-b">${item["Nama Barang"]}</td>
      <td class="p-3 border-b">${item["Jumlah"]}</td>
      <td class="p-3 border-b">${item["Satuan"]}</td>
      <td class="p-3 border-b">
        <span class="px-2 py-1 rounded-full text-xs font-medium ${getKondisiClass(item["Kondisi"])}">  
          ${item["Kondisi"]}
        </span>
      </td>
      <td class="p-3 border-b">${item["Lokasi"]}</td>
      <td class="p-3 border-b">
        <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          ${item["Kategori"]}
        </span>
      </td>
      <td class="p-3 border-b text-center">
        <button onclick='editItem(${JSON.stringify(item)})' class="btn-warning text-white p-1 rounded mr-1" title="Edit">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        </button>
        <button onclick='deleteItem("${item.ID}")' class="btn-danger text-white p-1 rounded" title="Hapus">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// Fungsi untuk mendapatkan class berdasarkan kondisi
function getKondisiClass(kondisi) {
  kondisi = kondisi.toLowerCase();
  if (kondisi.includes('baik')) return 'bg-green-100 text-green-800';
  if (kondisi.includes('rusak ringan')) return 'bg-yellow-100 text-yellow-800';
  if (kondisi.includes('rusak')) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

// Fungsi untuk render statistik dashboard
function renderDashboardStats(data) {
  // Total barang
  const totalBarang = data.length;
  document.getElementById("total-barang").textContent = totalBarang;
  
  // Total jumlah
  const totalJumlah = data.reduce((total, item) => {
    return total + (parseInt(item["Jumlah"]) || 0);
  }, 0);
  document.getElementById("total-jumlah").textContent = totalJumlah;
  
  // Kondisi barang
  const kondisiBaik = data.filter(item => item["Kondisi"].toLowerCase().includes('baik')).length;
  const kondisiRusakRingan = data.filter(item => item["Kondisi"].toLowerCase().includes('rusak ringan')).length;
  const kondisiRusak = data.filter(item => item["Kondisi"].toLowerCase().includes('rusak') && !item["Kondisi"].toLowerCase().includes('ringan')).length;
  
  document.getElementById("kondisi-baik").textContent = kondisiBaik;
  document.getElementById("kondisi-rusak-ringan").textContent = kondisiRusakRingan;
  document.getElementById("kondisi-rusak").textContent = kondisiRusak;
  
  // Kategori
  const kategoriCount = {};
  data.forEach(item => {
    const kategori = item["Kategori"];
    if (kategori) {
      kategoriCount[kategori] = (kategoriCount[kategori] || 0) + 1;
    }
  });
  
  // Tampilkan 5 kategori teratas
  const kategoriList = document.getElementById("kategori-list");
  kategoriList.innerHTML = "";
  
  Object.entries(kategoriCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([kategori, count]) => {
      const li = document.createElement("li");
      li.className = "flex justify-between items-center py-2 border-b";
      li.innerHTML = `
        <span class="text-sm font-medium">${kategori}</span>
        <span class="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">${count}</span>
      `;
      kategoriList.appendChild(li);
    });
}

// Fungsi untuk render charts
function renderCharts(data) {
  // Destroy existing charts to prevent duplicates
  Object.values(chartInstances).forEach(chart => chart.destroy());
  chartInstances = {};
  
  // Chart kondisi
  const kondisiBaik = data.filter(item => item["Kondisi"].toLowerCase().includes('baik')).length;
  const kondisiRusakRingan = data.filter(item => item["Kondisi"].toLowerCase().includes('rusak ringan')).length;
  const kondisiRusak = data.filter(item => item["Kondisi"].toLowerCase().includes('rusak') && !item["Kondisi"].toLowerCase().includes('ringan')).length;
  
  const ctxKondisi = document.getElementById('chart-kondisi').getContext('2d');
  chartInstances.kondisi = new Chart(ctxKondisi, {
    type: 'doughnut',
    data: {
      labels: ['Baik', 'Rusak Ringan', 'Rusak Berat'],
      datasets: [{
        data: [kondisiBaik, kondisiRusakRingan, kondisiRusak],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 15
          }
        }
      },
      cutout: '70%'
    }
  });
  
  // Chart kategori
  const kategoriData = {};
  data.forEach(item => {
    const kategori = item["Kategori"];
    if (kategori) {
      kategoriData[kategori] = (kategoriData[kategori] || 0) + 1;
    }
  });
  
  // Ambil 5 kategori teratas
  const topKategori = Object.entries(kategoriData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const ctxKategori = document.getElementById('chart-kategori').getContext('2d');
  chartInstances.kategori = new Chart(ctxKategori, {
    type: 'bar',
    data: {
      labels: topKategori.map(k => k[0]),
      datasets: [{
        label: 'Jumlah Barang',
        data: topKategori.map(k => k[1]),
        backgroundColor: '#4f46e5',
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

// Fungsi untuk menampilkan form
function showForm() {
  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modal").classList.add("flex");
  document.getElementById("form-title").textContent = "Tambah Barang";
  document.getElementById("edit-id").value = "";
  document.querySelectorAll('#modal input:not([type=hidden]), #modal textarea').forEach(el => el.value = "");
  
  // Set tanggal hari ini
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("tanggal").value = today;
}

// Fungsi untuk menutup form
function closeForm() {
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("modal").classList.remove("flex");
}

// Fungsi untuk submit form
function submitForm() {
  // Validasi form
  const nama = document.getElementById("nama").value;
  const jumlah = document.getElementById("jumlah").value;
  
  if (!nama || !jumlah) {
    alert("Nama barang dan jumlah harus diisi!");
    return;
  }
  
  // Tampilkan loading
  document.getElementById("save-button").disabled = true;
  document.getElementById("save-button").innerHTML = '<svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Menyimpan...';
  
  const data = {
    "Nama Barang": nama,
    "Jumlah": jumlah,
    "Satuan": document.getElementById("satuan").value,
    "Kondisi": document.getElementById("kondisi").value,
    "Lokasi": document.getElementById("lokasi").value,
    "Kategori": document.getElementById("kategori").value,
    "Tanggal Masuk": document.getElementById("tanggal").value,
    "Catatan": document.getElementById("catatan").value
  };
  
  const id = document.getElementById("edit-id").value;
  const action = id ? "updateBarang" : "addBarang";

  fetch(URL, {
    method: "POST",
    body: new URLSearchParams({
      action,
      username: loginData.username,
      password: loginData.password,
      ...(id && { id }),
      data: JSON.stringify(data)
    })
  })
  .then(res => res.json())
  .then(res => {
    // Reset tombol simpan
    document.getElementById("save-button").disabled = false;
    document.getElementById("save-button").innerHTML = 'Simpan';
    
    if (res.status === "ok") {
      closeForm();
      refreshData();
      
      // Tampilkan notifikasi
      showNotification(id ? "Barang berhasil diperbarui" : "Barang berhasil ditambahkan");
    } else {
      alert("Gagal menyimpan data");
    }
  })
  .catch(error => {
    document.getElementById("save-button").disabled = false;
    document.getElementById("save-button").innerHTML = 'Simpan';
    alert("Terjadi kesalahan. Silakan coba lagi.");
    console.error("Error:", error);
  });
}

// Fungsi untuk edit item
function editItem(item) {
  showForm();
  document.getElementById("form-title").textContent = "Edit Barang";
  document.getElementById("edit-id").value = item.ID;
  document.getElementById("nama").value = item["Nama Barang"];
  document.getElementById("jumlah").value = item["Jumlah"];
  document.getElementById("satuan").value = item["Satuan"];
  document.getElementById("kondisi").value = item["Kondisi"];
  document.getElementById("lokasi").value = item["Lokasi"];
  document.getElementById("kategori").value = item["Kategori"];
  document.getElementById("tanggal").value = item["Tanggal Masuk"];
  document.getElementById("catatan").value = item["Catatan"];
}

// Fungsi untuk hapus item
function deleteItem(id) {
  if (!confirm("Yakin ingin menghapus barang ini?")) return;
  
  fetch(URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "deleteBarang",
      username: loginData.username,
      password: loginData.password,
      id
    })
  })
  .then(res => res.json())
  .then(res => {
    if (res.status === "ok") {
      refreshData();
      showNotification("Barang berhasil dihapus");
    } else {
      alert("Gagal menghapus");
    }
  })
  .catch(error => {
    alert("Terjadi kesalahan. Silakan coba lagi.");
    console.error("Error:", error);
  });
}

// Fungsi untuk menampilkan notifikasi
function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.remove("hidden");
  
  setTimeout(() => {
    notification.classList.add("hidden");
  }, 3000);
}

// Fungsi untuk filter tabel
function filterTable() {
  const searchTerm = document.getElementById("search-input").value.toLowerCase();
  
  if (!searchTerm) {
    renderTable(inventarisData);
    return;
  }
  
  const filteredData = inventarisData.filter(item => {
    return (
      (item["Nama Barang"] && item["Nama Barang"].toLowerCase().includes(searchTerm)) ||
      (item["Kategori"] && item["Kategori"].toLowerCase().includes(searchTerm)) ||
      (item["Lokasi"] && item["Lokasi"].toLowerCase().includes(searchTerm))
    );
  });
  
  renderTable(filteredData);
}

// Fungsi untuk logout
function logout() {
  if (confirm("Yakin ingin logout?")) {
    loginData = { username: "", password: "" };
    inventarisData = [];
    document.getElementById("login-section").classList.remove("hidden");
    document.getElementById("main-content").classList.add("hidden");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  }
}

// Event listener untuk search input
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("keyup", function(event) {
      if (event.key === "Enter") {
        filterTable();
      }
    });
  }
});