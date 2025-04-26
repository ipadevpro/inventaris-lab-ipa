// Script untuk Inventaris Lab IPA
let URL = "https://script.google.com/macros/s/AKfycbzYH3x7h7CfuiuooB_Htniq2mq52bWNMtwscqc2ySKNc1YCH_T1uow2-ALFsHqOwjU1AQ/exec";
let loginData = { username: "", password: "", displayName: "" };
let inventarisData = [];
let chartInstances = {};
let currentSection = 'dashboard';
let currentTheme = localStorage.getItem('theme') || 'light';

// Fungsi untuk memperbarui URL API
function updateApiUrl() {
  const newUrl = prompt("Masukkan URL API terbaru dari deployment Google Apps Script:", URL);
  if (newUrl && newUrl !== URL && newUrl.startsWith("https://script.google.com/macros/s/")) {
    localStorage.setItem("apiUrl", newUrl);
    URL = newUrl; // Update URL langsung
    alert("URL API berhasil diperbarui ke: " + newUrl);
  } else if (newUrl) {
    alert("URL tidak valid. Harap gunakan URL dari deployment Google Apps Script.");
  }
}

// Update theme icons
function updateThemeIcons() {
  // Main theme toggle icons
  const darkIcon = document.querySelector('#theme-toggle svg.dark\\:block');
  const lightIcon = document.querySelector('#theme-toggle svg.block.dark\\:hidden');
  
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  // Update main navbar icons
  if (darkIcon && lightIcon) {
    darkIcon.classList.toggle('hidden', !isDarkMode);
    lightIcon.classList.toggle('hidden', isDarkMode);
  }
}

// Check if theme needs to be set based on system preference
function checkSystemThemePreference() {
  // If theme is not saved in localStorage, check system preference
  if (!localStorage.getItem('theme')) {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = prefersDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    return theme;
  }
  // Otherwise return saved theme
  return localStorage.getItem('theme');
}

// Apply saved theme on page load
function applyTheme() {
  const savedTheme = checkSystemThemePreference();
  
  // Apply to root HTML element
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(savedTheme);
  
  // Apply to body for compatibility
  document.body.classList.toggle('dark', savedTheme === 'dark');
  
  // Update the icons
  updateThemeIcons();
  
  // Update current theme variable
  currentTheme = savedTheme;
  
  console.log('Theme applied:', savedTheme);
}

// Theme Toggle Function
function toggleTheme() {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const newTheme = isDarkMode ? 'light' : 'dark';
  
  // Update root HTML element
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(newTheme);
  
  // Update body for compatibility
  document.body.classList.toggle('dark', newTheme === 'dark');
  
  // Save to localStorage
  localStorage.setItem('theme', newTheme);
  
  // Update icons
  updateThemeIcons();
  
  // Update current theme variable
  currentTheme = newTheme;
  
  console.log('Theme toggled to:', newTheme);
}

// Cek apakah ada URL tersimpan di localStorage
document.addEventListener('DOMContentLoaded', function() {
  const savedUrl = localStorage.getItem("apiUrl");
  if (savedUrl && savedUrl.startsWith("https://script.google.com/macros/s/")) {
    console.log("Menggunakan URL API dari localStorage:", savedUrl);
    URL = savedUrl; // Update variable URL global
  }
  
  // Apply saved theme or default to light
  applyTheme();
  
  // Listen for storage events to sync theme across tabs
  window.addEventListener('storage', function(event) {
    if (event.key === 'theme') {
      applyTheme();
    }
  });
  
  // Also listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    // Only apply if user hasn't explicitly set a preference
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      applyTheme();
    }
  });
  
  // Add event listeners for theme toggles
  const mainThemeToggle = document.getElementById('theme-toggle');
  if (mainThemeToggle) {
    mainThemeToggle.addEventListener('click', toggleTheme);
  }
  
  // Tambahkan tombol update URL di navbar
  const navbar = document.querySelector('.navbar .flex.items-center.space-x-4');
  if (navbar) {
    const updateUrlButton = document.createElement("button");
    updateUrlButton.className = "p-2 text-gray-600 dark:text-gray-300 hover:text-primary";
    updateUrlButton.title = "Update API URL";
    updateUrlButton.setAttribute("onclick", "updateApiUrl()");
    updateUrlButton.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    `;
    navbar.insertBefore(updateUrlButton, navbar.firstChild);
  }
  
  // Setup sidebar toggle button click event
  const sidebarToggleBtn = document.getElementById('sidebar-toggle');
  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', toggleSidebar);
  }
  
  // Set up event listeners for sidebar menu items
  document.querySelectorAll('.sidebar-menu-item').forEach(item => {
    item.addEventListener('click', function(e) {
      const section = this.getAttribute('href').replace('#', '');
      showSection(section);
      e.preventDefault();
    });
  });
  
  // Hide sidebar and main content when login section is visible
  const loginSection = document.getElementById('login-section');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
  
  if (loginSection && sidebar && mainContent) {
    if (!loginSection.classList.contains('hidden')) {
      // We're at the login screen, hide sidebar and main content
      sidebar.classList.add('hidden');
      mainContent.classList.add('hidden');
    } else {
      // Already logged in, show sidebar and main content
      sidebar.classList.remove('hidden');
      mainContent.classList.remove('hidden');
      mainContent.classList.add('flex');
    }
  }
});

// Fungsi untuk toggle sidebar
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (sidebar && overlay) {
    // Toggle the transform property to show/hide sidebar
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('translate-x-0');
    
    // Also toggle visibility on the overlay
    overlay.classList.toggle('overlay-visible');
  }
}

// Fungsi untuk menampilkan section
function showSection(section) {
  try {
    // Update active menu item
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeMenuItem = document.querySelector(`.sidebar-menu-item[href="#${section}"]`);
    if (activeMenuItem) {
      activeMenuItem.classList.add('active');
    }
    
    // Hide all sections
    document.getElementById('dashboard-section')?.classList.add('hidden');
    document.getElementById('inventaris-section')?.classList.add('hidden');
    document.getElementById('jurnal-section')?.classList.add('hidden');
    document.getElementById('jadwal-section')?.classList.add('hidden');
    
    // Show selected section
    const selectedSection = document.getElementById(`${section}-section`);
    if (selectedSection) {
      selectedSection.classList.remove('hidden');
    }
    
    // Update current section
    currentSection = section;
    
    // Load section specific data
    if (section === 'dashboard') {
      renderDashboardStats(inventarisData);
      renderCharts(inventarisData);
    }
    if (section === 'inventaris') renderTable(inventarisData);
    if (section === 'jurnal') loadJurnal();
    if (section === 'jadwal') loadJadwal();
    
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  } catch (error) {
    console.error("Error showing section:", error);
  }
}

// Fungsi untuk login
function login() {
  loginData.username = document.getElementById("username").value;
  loginData.password = document.getElementById("password").value;
  document.getElementById("login-message").textContent = "";
  
  // Tampilkan loading
  document.getElementById("login-button").style.display = "none";
  document.getElementById("login-loading").classList.remove("hidden");

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
    if (res.status === "ok") {
      // Simpan data inventaris
      inventarisData = res.data;
      
      // Dapatkan nama guru dari Users
      fetchUserProfile(() => {
        // Sembunyikan login, tampilkan dashboard
        document.getElementById("login-section").classList.add("hidden");
        
        // Show the sidebar and main content
        const sidebar = document.getElementById("sidebar");
        const mainContent = document.getElementById("main-content");
        if (sidebar) sidebar.classList.remove('hidden');
        if (mainContent) {
          mainContent.classList.remove("hidden");
          mainContent.classList.add("flex");
        }
        
        // Tampilkan pesan selamat datang dengan nama guru
        const welcomeMessage = loginData.displayName 
          ? `Selamat datang, ${loginData.displayName}!` 
          : `Selamat datang, ${loginData.username}!`;
          
        document.getElementById('welcome-message').textContent = welcomeMessage;
        
        // Tampilkan dashboard secara default
        showSection('dashboard');
        
        // Render data
        renderTable(res.data);
        renderDashboardStats(res.data);
        renderCharts(res.data);
      });
    } else {
      // Tampilkan pesan error
      document.getElementById("login-button").style.display = "block";
      document.getElementById("login-loading").classList.add("hidden");
      document.getElementById("login-message").textContent = "Login gagal! Periksa username dan password.";
    }
  })
  .catch(error => {
    document.getElementById("login-button").style.display = "block";
    document.getElementById("login-loading").classList.add("hidden");
    document.getElementById("login-message").textContent = "Terjadi kesalahan. Silakan coba lagi.";
    console.error("Error:", error);
  });
}

// Fungsi untuk mengambil profil user (nama guru)
function fetchUserProfile(callback) {
  fetch(URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "getUserProfile",
      username: loginData.username,
      password: loginData.password
    })
  })
  .then(res => res.json())
  .then(res => {
    if (res.status === "ok" && res.data) {
      loginData.displayName = res.data.Guru || loginData.username;
    }
  })
  .catch(error => {
    console.error("Error fetching user profile:", error);
  })
  .finally(() => {
    if (callback) callback();
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
  // Check if data exists and is an array
  if (!Array.isArray(data) || data.length === 0) {
    console.warn("No data available for dashboard stats");
    document.getElementById("total-barang").textContent = "0";
    document.getElementById("total-jumlah").textContent = "0";
    document.getElementById("kondisi-baik").textContent = "0";
    document.getElementById("kondisi-rusak-ringan").textContent = "0";
    document.getElementById("kondisi-rusak").textContent = "0";
    document.getElementById("kondisi-rusak-ringan-chart").textContent = "0";
    document.getElementById("kondisi-rusak-chart").textContent = "0";
    document.getElementById("kategori-list").innerHTML = "<li class='p-3 text-center text-gray-500'>Tidak ada data</li>";
    return;
  }

  try {
    // Total barang
    const totalBarang = data.length;
    document.getElementById("total-barang").textContent = totalBarang;
    
    // Total jumlah
    const totalJumlah = data.reduce((total, item) => {
      return total + (parseInt(item["Jumlah"]) || 0);
    }, 0);
    document.getElementById("total-jumlah").textContent = totalJumlah;
    
    // Kondisi barang
    const kondisiBaik = data.filter(item => item["Kondisi"] && item["Kondisi"].toLowerCase().includes('baik')).length;
    const kondisiRusakRingan = data.filter(item => item["Kondisi"] && item["Kondisi"].toLowerCase().includes('rusak ringan')).length;
    const kondisiRusak = data.filter(item => item["Kondisi"] && item["Kondisi"].toLowerCase().includes('rusak') && !item["Kondisi"].toLowerCase().includes('ringan')).length;
    
    document.getElementById("kondisi-baik").textContent = kondisiBaik;
    document.getElementById("kondisi-rusak-ringan").textContent = kondisiRusakRingan;
    document.getElementById("kondisi-rusak").textContent = kondisiRusak;
    document.getElementById("kondisi-rusak-ringan-chart").textContent = kondisiRusakRingan;
    document.getElementById("kondisi-rusak-chart").textContent = kondisiRusak;
    
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
    
    const sortedKategori = Object.entries(kategoriCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (sortedKategori.length === 0) {
      kategoriList.innerHTML = "<li class='p-3 text-center text-gray-500'>Tidak ada data kategori</li>";
    } else {
      sortedKategori.forEach(([kategori, count]) => {
        const li = document.createElement("li");
        li.className = "flex justify-between items-center py-2 border-b";
        li.innerHTML = `
          <span class="text-sm font-medium">${kategori}</span>
          <span class="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">${count}</span>
        `;
        kategoriList.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Error rendering dashboard stats:", error);
  }
}

// Fungsi untuk render charts
function renderCharts(data) {
  try {
    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.error("Chart.js is not loaded");
      return;
    }

    // Check if data exists and is an array
    if (!Array.isArray(data) || data.length === 0) {
      console.warn("No data available for charts");
      return;
    }

    // Initialize chartInstances if not defined
    if (typeof chartInstances === 'undefined') {
      window.chartInstances = {};
    }
    
    // Destroy existing charts to prevent duplicates
    if (chartInstances.kondisi) chartInstances.kondisi.destroy();
    if (chartInstances.kategori) chartInstances.kategori.destroy();
    
    // Chart kondisi
    const kondisiBaik = data.filter(item => item["Kondisi"] && item["Kondisi"].toLowerCase().includes('baik')).length;
    const kondisiRusakRingan = data.filter(item => item["Kondisi"] && item["Kondisi"].toLowerCase().includes('rusak ringan')).length;
    const kondisiRusak = data.filter(item => item["Kondisi"] && item["Kondisi"].toLowerCase().includes('rusak') && !item["Kondisi"].toLowerCase().includes('ringan')).length;
    
    const ctxKondisiElement = document.getElementById('chart-kondisi');
    if (ctxKondisiElement) {
      const ctxKondisi = ctxKondisiElement.getContext('2d');
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
    }
    
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
    
    const ctxKategoriElement = document.getElementById('chart-kategori');
    if (ctxKategoriElement && topKategori.length > 0) {
      const ctxKategori = ctxKategoriElement.getContext('2d');
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
  } catch (error) {
    console.error("Error rendering charts:", error);
  }
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
  // Reset data
  loginData = { username: "", password: "", displayName: "" };
  inventarisData = [];
  
  // Reset UI - hide sidebar and main content, show login
  const loginSection = document.getElementById("login-section");
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("main-content");
  
  if (loginSection) loginSection.classList.remove("hidden");
  if (sidebar) sidebar.classList.add("hidden");
  if (mainContent) {
    mainContent.classList.add("hidden");
    mainContent.classList.remove("flex");
  }
  
  // Clear input fields
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("login-message").textContent = "";
  document.getElementById("login-button").style.display = "block";
  document.getElementById("login-loading").classList.add("hidden");
  
  // Reset charts to prevent errors
  if (chartInstances.kondisi) chartInstances.kondisi.destroy();
  if (chartInstances.kategori) chartInstances.kategori.destroy();
  chartInstances = {};
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

// Jurnal and Jadwal functions
function loadJurnal() {
  fetch(URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "getJurnal",
      username: loginData.username,
      password: loginData.password
    })
  })
  .then(res => res.json())
  .then(res => {
    const list = document.getElementById("jurnal-list");
    list.innerHTML = "";
    
    if (res.status !== "ok" || !res.data || res.data.length === 0) {
      list.innerHTML = '<div class="p-4 text-center text-gray-500">Belum ada data jurnal</div>';
      return;
    }
    
    // Urutkan data berdasarkan tanggal terbaru
    res.data.sort((a, b) => {
      const dateA = new Date(a.Tanggal);
      const dateB = new Date(b.Tanggal);
      return dateB - dateA; // Descending order (newest first)
    });
    
    res.data.forEach((item, index) => {
      // Format tanggal menjadi lebih mudah dibaca
      const formattedDate = formatDate(item.Tanggal);
      
      const div = document.createElement("div");
      div.className = "p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-all mb-3";
      div.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <span class="font-medium text-primary">${formattedDate || '-'}</span>
          <div>
            <span class="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">${item.Kelas || '-'}</span>
          </div>
        </div>
        <div class="font-medium mb-2">${item.Materi || '-'}</div>
        <div class="text-sm text-gray-700 mb-2">
          <span class="font-medium">Guru:</span> ${item.Guru || '-'}
        </div>
        <div class="text-sm text-gray-700 mb-2">
          <span class="font-medium">Alat yang digunakan:</span> ${item["Alat Digunakan"] || '-'}
        </div>
        <div class="text-sm text-gray-600 italic">${item.Catatan || '-'}</div>
      `;
      list.appendChild(div);
    });
  })
  .catch(error => {
    console.error("Error loading jurnal:", error);
    document.getElementById("jurnal-list").innerHTML = 
      '<div class="p-4 text-center text-red-500">Gagal memuat data jurnal</div>';
  });
}

// Helper untuk format tanggal lebih bagus
function formatDate(dateString) {
  if (!dateString) return '-';
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('id-ID', options);
  } catch (e) {
    return dateString;
  }
}

function showJurnalForm() {
  document.getElementById("jurnal-modal").classList.remove("hidden");
  document.getElementById("jurnal-modal").classList.add("flex");
  
  // Isi dengan tanggal hari ini secara default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("jurnal-tanggal").value = today;
  
  document.getElementById("jurnal-materi").value = "";
  document.getElementById("jurnal-kelas").value = "";
  document.getElementById("jurnal-alat").value = "";
  document.getElementById("jurnal-catatan").value = "";
}

function closeJurnalForm() {
  document.getElementById("jurnal-modal").classList.add("hidden");
  document.getElementById("jurnal-modal").classList.remove("flex");
}

function submitJurnalForm() {
  // Validasi form
  const materi = document.getElementById("jurnal-materi").value;
  const kelas = document.getElementById("jurnal-kelas").value;
  
  if (!materi || !kelas) {
    alert("Materi praktikum dan kelas harus diisi!");
    return;
  }
  
  // Tampilkan loading
  document.getElementById("jurnal-save-button").disabled = true;
  document.getElementById("jurnal-save-button").innerHTML = '<svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Menyimpan...';
  
  const alat = document.getElementById("jurnal-alat").value;
  const catatan = document.getElementById("jurnal-catatan").value;
  const tanggal = document.getElementById("jurnal-tanggal").value || new Date().toISOString().split('T')[0];

  // Pastikan data dalam format yang benar dan lengkap sesuai yang diharapkan backend
  const jurnalData = { 
    Tanggal: tanggal, 
    Kelas: kelas, 
    Materi: materi, 
    "Alat Digunakan": alat || "-", 
    Catatan: catatan || "-" 
  };

  console.log("Mengirim data jurnal:", jurnalData); // Debugging

  fetch(URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "addJurnal",
      username: loginData.username,
      password: loginData.password,
      data: JSON.stringify(jurnalData)
    })
  })
  .then(res => {
    console.log("Status response:", res.status); // Debugging
    return res.json();
  })
  .then(res => {
    // Reset tombol simpan
    document.getElementById("jurnal-save-button").disabled = false;
    document.getElementById("jurnal-save-button").innerHTML = 'Simpan';
    
    console.log("Response dari server:", res); // Debugging
    
    if (res.status === "ok") {
      closeJurnalForm();
      loadJurnal();
      showNotification("Jurnal berhasil ditambahkan");
    } else {
      alert("Gagal menambahkan jurnal: " + (res.message || "Terjadi kesalahan"));
    }
  })
  .catch(error => {
    console.error("Error adding jurnal (detail):", error);
    document.getElementById("jurnal-save-button").disabled = false;
    document.getElementById("jurnal-save-button").innerHTML = 'Simpan';
    alert("Terjadi kesalahan saat menambahkan jurnal");
  });
}

function loadJadwal() {
  fetch(URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "getJadwal",
      username: loginData.username,
      password: loginData.password
    })
  })
  .then(res => res.json())
  .then(res => {
    const tbody = document.getElementById("jadwal-table");
    tbody.innerHTML = "";
    
    // Tampilkan jenis minggu (genap/ganjil)
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((today - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
    const isEvenWeek = weekNumber % 2 === 0;
    const mingguText = isEvenWeek ? "Genap" : "Ganjil";
    
    document.getElementById("jenis-minggu").textContent = mingguText;
    document.getElementById("jenis-minggu").className = 
      isEvenWeek ? "font-medium text-blue-600" : "font-medium text-green-600";
    
    if (res.status !== "ok" || !res.data || res.data.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = '<td colspan="6" class="px-4 py-2 text-center text-gray-500">Belum ada jadwal</td>';
      tbody.appendChild(tr);
      return;
    }
    
    res.data.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.draggable = true;
      tr.dataset.index = index;
      tr.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";
      tr.innerHTML = `
        <td class="px-4 py-2 border">${item.Hari || '-'}</td>
        <td class="px-4 py-2 border">${item.Jam || '-'}</td>
        <td class="px-4 py-2 border">${item.Kelas || '-'}</td>
        <td class="px-4 py-2 border">${item.Guru || '-'}</td>
        <td class="px-4 py-2 border">${item.Minggu || '-'}</td>
        <td class="px-4 py-2 border text-center">
          <button onclick="editJadwal(${index})" class="text-blue-500 hover:text-blue-700 mr-2">
            <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button onclick="deleteJadwal(${index})" class="text-red-500 hover:text-red-700">
            <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </td>`;
      addDragEvents(tr);
      tbody.appendChild(tr);
    });
  })
  .catch(error => {
    console.error("Error loading jadwal:", error);
    document.getElementById("jadwal-table").innerHTML = 
      '<tr><td colspan="6" class="px-4 py-2 text-center text-red-500">Gagal memuat jadwal</td></tr>';
  });
}

function addDragEvents(row) {
  row.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", row.dataset.index);
    row.classList.add("opacity-50");
  });

  row.addEventListener("dragover", (e) => {
    e.preventDefault();
    row.classList.add("bg-blue-50");
  });

  row.addEventListener("dragleave", () => {
    row.classList.remove("bg-blue-50");
  });

  row.addEventListener("drop", (e) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData("text/plain"));
    const targetIndex = parseInt(row.dataset.index);

    const tbody = row.parentNode;
    const rows = Array.from(tbody.children);
    const draggedRow = rows[draggedIndex];

    if (draggedRow !== row) {
      tbody.insertBefore(draggedRow, draggedIndex < targetIndex ? row.nextSibling : row);
      updateRowIndexes(tbody);
    }

    row.classList.remove("opacity-50", "bg-blue-50");
  });

  row.addEventListener("dragend", () => {
    row.classList.remove("opacity-50");
  });
}

function updateRowIndexes(tbody) {
  Array.from(tbody.children).forEach((row, idx) => {
    row.dataset.index = idx;
    // Update row background color based on even/odd index
    row.className = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
  });
}

function saveJadwal() {
  const tbody = document.getElementById("jadwal-table");
  
  if (!tbody.children.length || tbody.children[0].cells.length <= 1) {
    showNotification("Tidak ada jadwal untuk disimpan");
    return;
  }
  
  // Tampilkan loading
  const saveButton = document.querySelector('#jadwal-section button[onclick="saveJadwal()"]');
  const originalButtonText = saveButton.innerHTML;
  saveButton.disabled = true;
  saveButton.innerHTML = '<svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Menyimpan...';
  
  const newData = Array.from(tbody.children).map(row => {
    if (row.cells.length <= 1) return null; // Skip empty rows
    
    const cells = row.querySelectorAll("td");
    return {
      Hari: cells[0].textContent,
      Jam: cells[1].textContent,
      Kelas: cells[2].textContent,
      Guru: cells[3].textContent,
      Minggu: cells[4].textContent
    };
  }).filter(item => item !== null);

  if (newData.length === 0) {
    showNotification("Tidak ada jadwal valid untuk disimpan");
    saveButton.disabled = false;
    saveButton.innerHTML = originalButtonText;
    return;
  }

  console.log("Mengirim data jadwal:", newData); // Debugging

  fetch(URL, {
    method: "POST",
    body: new URLSearchParams({
      action: "updateJadwal",
      username: loginData.username,
      password: loginData.password,
      data: JSON.stringify(newData)
    })
  })
  .then(res => {
    console.log("Status response:", res.status); // Debugging
    return res.json();
  })
  .then(res => {
    // Reset tombol simpan
    saveButton.disabled = false;
    saveButton.innerHTML = originalButtonText;
    
    console.log("Response dari server:", res); // Debugging
    
    if (res.status === "ok") {
      showNotification("Jadwal berhasil disimpan");
      // Reload jadwal untuk memastikan data yang ditampilkan sesuai dengan yang tersimpan
      loadJadwal();
    } else {
      alert("Gagal menyimpan jadwal: " + (res.message || "Terjadi kesalahan"));
    }
  })
  .catch(error => {
    // Reset tombol simpan
    saveButton.disabled = false;
    saveButton.innerHTML = originalButtonText;
    
    console.error("Error saving jadwal (detail):", error);
    alert("Terjadi kesalahan saat menyimpan jadwal");
  });
}

// Tambah fungsi untuk edit jadwal
function editJadwal(index) {
  showJadwalForm(index);
}

// Tambah fungsi untuk hapus jadwal
function deleteJadwal(index) {
  if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
  
  const tbody = document.getElementById("jadwal-table");
  const rows = Array.from(tbody.children);
  
  if (index >= 0 && index < rows.length) {
    tbody.removeChild(rows[index]);
    updateRowIndexes(tbody);
    showNotification("Jadwal berhasil dihapus");
  }
}

// Tambah fungsi untuk show jadwal form yang lebih user-friendly
function showJadwalForm(editIndex = -1) {
  // Siapkan options untuk hari
  const hari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  let hariOptions = hari.map(h => `<option value="${h}">${h}</option>`).join('');
  
  // Siapkan options untuk minggu
  let mingguOptions = `
    <option value="Genap">Genap</option>
    <option value="Ganjil">Ganjil</option>
  `;
  
  // Buat modal form
  const modal = document.createElement('div');
  modal.id = 'jadwal-form-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40';
  
  // Nilai default jika edit
  const defaultHari = editIndex >= 0 ? getJadwalValue(editIndex, 0) : '';
  const defaultJam = editIndex >= 0 ? getJadwalValue(editIndex, 1) : '';
  const defaultKelas = editIndex >= 0 ? getJadwalValue(editIndex, 2) : '';
  const defaultGuru = editIndex >= 0 ? getJadwalValue(editIndex, 3) : '';
  const defaultMinggu = editIndex >= 0 ? getJadwalValue(editIndex, 4) : 'Genap';
  
  modal.innerHTML = `
    <div class="modal-content bg-white rounded-lg p-6 w-full max-w-md mx-4">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">${editIndex >= 0 ? 'Edit' : 'Tambah'} Jadwal</h3>
        <button onclick="document.getElementById('jadwal-form-modal').remove()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div class="space-y-3">
        <div>
          <label for="jadwal-hari" class="block text-sm font-medium text-gray-700 mb-1">Hari</label>
          <select id="jadwal-hari" class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary">
            ${hariOptions}
          </select>
        </div>
        <div>
          <label for="jadwal-jam" class="block text-sm font-medium text-gray-700 mb-1">Jam</label>
          <input type="text" id="jadwal-jam" placeholder="Contoh: 07:00-08:30" value="${defaultJam}" class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label for="jadwal-kelas" class="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
          <input type="text" id="jadwal-kelas" placeholder="Contoh: X IPA 1" value="${defaultKelas}" class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label for="jadwal-guru" class="block text-sm font-medium text-gray-700 mb-1">Guru</label>
          <input type="text" id="jadwal-guru" placeholder="Nama Guru" value="${defaultGuru}" class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary" />
        </div>
        <div>
          <label for="jadwal-minggu" class="block text-sm font-medium text-gray-700 mb-1">Minggu</label>
          <select id="jadwal-minggu" class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary">
            ${mingguOptions}
          </select>
        </div>
        <div class="flex justify-end space-x-2 pt-2">
          <button onclick="document.getElementById('jadwal-form-modal').remove()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
          <button onclick="submitJadwalForm(${editIndex})" class="btn-primary text-white px-4 py-2 rounded-md">Simpan</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Set default values for dropdowns
  if (defaultHari) {
    document.getElementById('jadwal-hari').value = defaultHari;
  }
  
  if (defaultMinggu) {
    document.getElementById('jadwal-minggu').value = defaultMinggu;
  }
}

function submitJadwalForm(editIndex = -1) {
  const hari = document.getElementById('jadwal-hari').value;
  const jam = document.getElementById('jadwal-jam').value;
  const kelas = document.getElementById('jadwal-kelas').value;
  const guru = document.getElementById('jadwal-guru').value;
  const minggu = document.getElementById('jadwal-minggu').value;
  
  if (!hari || !jam || !kelas || !guru) {
    alert('Mohon lengkapi semua field yang diperlukan');
    return;
  }
  
  const tbody = document.getElementById("jadwal-table");
  
  // Hapus pesan "Belum ada jadwal" jika ada
  if (tbody.children.length === 1 && tbody.children[0].cells.length === 1) {
    tbody.innerHTML = "";
  }
  
  if (editIndex >= 0) {
    // Edit mode
    const rows = Array.from(tbody.children);
    if (editIndex < rows.length) {
      const cells = rows[editIndex].querySelectorAll("td");
      cells[0].textContent = hari;
      cells[1].textContent = jam;
      cells[2].textContent = kelas;
      cells[3].textContent = guru;
      cells[4].textContent = minggu || "Genap";
    }
  } else {
    // Add mode
    const newIndex = tbody.children.length;
    const tr = document.createElement("tr");
    tr.draggable = true;
    tr.dataset.index = newIndex;
    tr.className = newIndex % 2 === 0 ? "bg-white" : "bg-gray-50";
    tr.innerHTML = `
      <td class="px-4 py-2 border">${hari}</td>
      <td class="px-4 py-2 border">${jam}</td>
      <td class="px-4 py-2 border">${kelas}</td>
      <td class="px-4 py-2 border">${guru}</td>
      <td class="px-4 py-2 border">${minggu || "Genap"}</td>
      <td class="px-4 py-2 border text-center">
        <button onclick="editJadwal(${newIndex})" class="text-blue-500 hover:text-blue-700 mr-2">
          <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
        </button>
        <button onclick="deleteJadwal(${newIndex})" class="text-red-500 hover:text-red-700">
          <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </td>`;
    addDragEvents(tr);
    tbody.appendChild(tr);
  }
  
  // Hapus modal
  document.getElementById('jadwal-form-modal').remove();
  
  showNotification(editIndex >= 0 ? "Jadwal berhasil diperbarui" : "Jadwal berhasil ditambahkan");
}

// Helper untuk mendapatkan nilai dari jadwal
function getJadwalValue(index, cellIndex) {
  const tbody = document.getElementById("jadwal-table");
  const rows = Array.from(tbody.children);
  
  if (index >= 0 && index < rows.length) {
    const cells = rows[index].querySelectorAll("td");
    if (cellIndex < cells.length) {
      return cells[cellIndex].textContent;
    }
  }
  
  return "";
}