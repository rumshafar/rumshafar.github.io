// Konfigurasi Firebase Anda (tetap sama)
const firebaseConfig = {
    apiKey: "AIzaSyDxtVqi4Jt_TdQp_UXEDYJEiUof_56xsHI",
    authDomain: "smartincubator-2b0eb.firebaseapp.com",
    databaseURL: "https://smartincubator-2b0eb-default-rtdb.firebaseio.com",
    projectId: "smartincubator-2b0eb",
    storageBucket: "smartincubator-2b0eb.firebasestorage.app",
    messagingSenderId: "16543518641",
    appId: "1:16543518641:web:75eb0718d348a1ce637790",
    measurementId: "G-1TGKZ3ZQV5"
};

// Inisialisasi Firebase (tetap sama)
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- Referensi ke data di Firebase --- (tetap sama)
const suhuHistoricalRef = database.ref('Historical/Data_Sensor/Suhu');
const kelembapanHistoricalRef = database.ref('Historical/Data_Sensor/Kelembapan');
const levelPemanasHistoricalRef = database.ref('Historical/Data_Kendali/State_Pemanas');

const dataSensorRealtimeRef = database.ref('Data_Sensor');
const dataKendaliRealtimeRef = database.ref('Data_Kendali');
const lastUpdateRef = database.ref('LastUpdate');

// Fungsi untuk memproses data historis dan menginisialisasi grafik
// Tambahkan parameter min dan max untuk y-axis scale
function setupChart(chartId, labelText, dataRef, borderColor, backgroundColor, valueSuffix = '', yAxisMin = null, yAxisMax = null) {
    const ctx = document.getElementById(chartId).getContext('2d');
    let chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: labelText,
                data: [],
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1,
                fill: false,
                tension: 0.1 // Sedikit kurva untuk tampilan yang lebih halus
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false, // Mungkin tidak mulai dari nol untuk suhu
                    title: {
                        display: true,
                        text: labelText
                    },
                    min: yAxisMin, // Tambahkan nilai minimum y-axis
                    max: yAxisMax  // Tambahkan nilai maksimum y-axis
                },
                x: {
                    title: {
                        display: true,
                        text: 'Waktu'
                    },
                    ticks: {
                        // Memformat timestamp Firebase menjadi waktu yang dapat dibaca
                        callback: function(value) {
                            const timestamp = parseInt(value.substring(1));
                            if (!isNaN(timestamp)) {
                                return new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            }
                            return '';
                        },
                        maxRotation: 45, // Rotasi label agar tidak bertumpuk
                        minRotation: 45
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            if (context[0] && context[0].label) {
                                const timestamp = parseInt(context[0].label.substring(1));
                                if (!isNaN(timestamp)) {
                                    return new Date(timestamp).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                }
                            }
                            return 'Invalid Date';
                        },
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}${valueSuffix}`;
                        }
                    }
                }
            }
        }
    });

    dataRef.on('value', (snapshot) => {
        const rawData = snapshot.val();
        const labels = [];
        const values = [];

        if (rawData) {
            // Ambil hingga 100 data terbaru (atau sesuaikan sesuai kebutuhan)
            const keys = Object.keys(rawData).sort((a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1))).slice(-10);
            keys.forEach(key => {
                labels.push(key);
                values.push(rawData[key]);
            });
        }

        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = values;
        chartInstance.update();
        console.log(`Data ${labelText} Historis diperbarui!`);
    }, (error) => {
        console.error(`Error membaca data ${labelText} historis:`, error);
    });

    return chartInstance;
}

// --- Inisialisasi semua grafik dengan batas Y-axis yang disesuaikan ---
// Level Pemanas: 0-100%
setupChart('levelPemanasChart', 'Level Pemanas (%)', levelPemanasHistoricalRef, 'rgba(255, 159, 64, 0.2)', 'rgba(255, 159, 64, 1)', '%', 0, 100);

// Suhu: 20-40 derajat Celcius
setupChart('suhuChart', 'Suhu (°C)', suhuHistoricalRef, 'rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)', ' °C', 20, 40);

// Kelembapan: 0-100% RH
setupChart('kelembapanChart', 'Kelembapan (%RH)', kelembapanHistoricalRef, 'rgba(54, 162, 235, 0.2)', 'rgba(54, 162, 235, 1)', ' %RH', 0, 100);


// --- Membaca data Suhu dan Kelembapan saat ini (Data_Sensor) --- (tetap sama)
dataSensorRealtimeRef.on('value', (snapshot) => {
    const currentData = snapshot.val();
    if (currentData) {
        document.getElementById('currentSuhu').textContent = currentData.Suhu !== undefined ? currentData.Suhu : '--';
        document.getElementById('currentKelembapan').textContent = currentData.Kelembapan !== undefined ? currentData.Kelembapan : '--';
    } else {
        document.getElementById('currentSuhu').textContent = '--';
        document.getElementById('currentKelembapan').textContent = '--';
    }
}, (error) => {
    console.error("Error membaca data sensor saat ini:", error);
});

// --- Membaca data Level Pemanas dan Posisi Telur saat ini (Data_Kendali) --- (tetap sama)
dataKendaliRealtimeRef.on('value', (snapshot) => {
    const currentData = snapshot.val();
    if (currentData) {
        document.getElementById('currentLevelPemanas').textContent = currentData.State_Pemanas !== undefined ? currentData.State_Pemanas : '--';
        document.getElementById('currentPosisiTelur').textContent = currentData.Posisi_Telur !== undefined ? currentData.Posisi_Telur : '--';
    } else {
        document.getElementById('currentLevelPemanas').textContent = '--';
        document.getElementById('currentPosisiTelur').textContent = '--';
    }
}, (error) => {
    console.error("Error membaca data kendali saat ini:", error);
});


// --- Membaca data LastUpdate --- (tetap sama)
lastUpdateRef.on('value', (snapshot) => {
    const lastUpdateData = snapshot.val();
    if (lastUpdateData) {
        const { Detik, Jam, Menit } = lastUpdateData;
        const formattedTime = `${String(Jam).padStart(2, '0')}:${String(Menit).padStart(2, '0')}:${String(Detik).padStart(2, '0')}`;
        document.getElementById('lastUpdate').textContent = `Terakhir diperbarui: ${formattedTime} WIB`;
    } else {
        document.getElementById('lastUpdate').textContent = 'Terakhir diperbarui: Tidak ada data';
    }
}, (error) => {
    console.error("Error membaca data LastUpdate:", error);
});
