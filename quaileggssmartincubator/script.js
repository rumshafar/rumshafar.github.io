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

// --- Referensi ke data di Firebase ---
const suhuHistoricalRef = database.ref('Historical/Data_Sensor/Suhu');
const kelembapanHistoricalRef = database.ref('Historical/Data_Sensor/Kelembapan');
const levelPemanasHistoricalRef = database.ref('Historical/Data_Kendali/State_Pemanas');

const dataSensorRealtimeRef = database.ref('Data_Sensor');
const dataKendaliRealtimeRef = database.ref('Data_Kendali');
const lastUpdateRef = database.ref('LastUpdate');

// Fungsi untuk memproses data historis dan menginisialisasi grafik
// Sekarang menggunakan tipe skala 'time' untuk sumbu X
function setupChart(chartId, labelText, dataRef, borderColor, backgroundColor, valueSuffix = '', yAxisMin = null, yAxisMax = null) {
    const ctx = document.getElementById(chartId).getContext('2d');
    let chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: labelText,
                data: [], // Data akan berupa objek {x: timestamp, y: value}
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: false, // Penting: Set false jika width/height diatur di CSS
            maintainAspectRatio: false, // Penting: Set false jika width/height diatur di CSS
            scales: {
                x: {
                    type: 'time', // *** PENTING: Gunakan skala waktu ***
                    time: {
                        unit: 'second', // Menampilkan unit terkecil: detik
                        displayFormats: {
                            second: 'HH:mm:ss', // Format untuk detik
                            minute: 'HH:mm',    // Format untuk menit (jika skala beralih)
                            hour: 'HH:mm'       // Format untuk jam (jika skala beralih)
                        }
                    },
                    title: {
                        display: true,
                        text: 'Waktu'
                    },
                    // Anda tidak perlu lagi maxTicksLimit atau autoSkip eksplisit di sini
                    // karena skala waktu akan menanganinya lebih cerdas.
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: labelText + valueSuffix // Label sumbu Y bisa termasuk satuan
                    },
                    min: yAxisMin,
                    max: yAxisMax
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            // Tooltip akan otomatis memformat waktu dengan baik
                            if (context[0] && context[0].parsed && context[0].parsed.x) {
                                return new Date(context[0].parsed.x).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                            }
                            return 'Invalid Date';
                        },
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.y}${valueSuffix}`; // Ambil nilai Y dari data objek
                        }
                    }
                }
            }
        }
    });

    dataRef.on('value', (snapshot) => {
        const rawData = snapshot.val();
        const chartData = []; // Ini akan menampung objek {x: timestamp, y: value}

        if (rawData) {
            // Ambil hanya 10 data terbaru
            const keys = Object.keys(rawData).sort((a, b) => parseInt(a.substring(1)) - parseInt(b.substring(1))).slice(-10);
            keys.forEach(key => {
                const timestamp = parseInt(key.substring(1));
                if (!isNaN(timestamp)) {
                    chartData.push({
                        x: timestamp, // Gunakan timestamp sebagai nilai X
                        y: rawData[key]
                    });
                }
            });
        }

        chartInstance.data.datasets[0].data = chartData; // Tetapkan data sebagai array objek
        chartInstance.update();
        console.log(`Data ${labelText} Historis diperbarui!`);
    }, (error) => {
        console.error(`Error membaca data ${labelText} historis:`, error);
    });

    return chartInstance;
}

// --- Inisialisasi semua grafik dengan batas Y-axis dan satuan yang disesuaikan ---
// LabelText tidak lagi mengandung satuan, satuan di handle oleh valueSuffix dan label sumbu Y
setupChart('levelPemanasChart', 'Level Pemanas', levelPemanasHistoricalRef, 'rgba(255, 159, 64, 0.2)', 'rgba(255, 159, 64, 1)', '%', 0, 100);
setupChart('suhuChart', 'Suhu', suhuHistoricalRef, 'rgba(255, 99, 132, 0.2)', 'rgba(255, 99, 132, 1)', ' °C', 20, 40);
setupChart('kelembapanChart', 'Kelembapan', kelembapanHistoricalRef, 'rgba(54, 162, 235, 0.2)', 'rgba(54, 162, 235, 1)', ' %RH', 0, 100);


// --- Membaca data Suhu dan Kelembapan saat ini (Data_Sensor) ---
dataSensorRealtimeRef.on('value', (snapshot) => {
    const currentData = snapshot.val();
    if (currentData) {
        document.getElementById('currentSuhu').textContent = currentData.Suhu !== undefined ? `${currentData.Suhu} °C` : '--'; // Tambahkan satuan di sini
        document.getElementById('currentKelembapan').textContent = currentData.Kelembapan !== undefined ? `${currentData.Kelembapan} %RH` : '--'; // Perbaikan
    } else {
        document.getElementById('currentSuhu').textContent = '--';
        document.getElementById('currentKelembapan').textContent = '--';
    }
}, (error) => {
    console.error("Error membaca data sensor saat ini:", error);
});

// --- Membaca data Level Pemanas dan Posisi Telur saat ini (Data_Kendali) ---
dataKendaliRealtimeRef.on('value', (snapshot) => {
    const currentData = snapshot.val();
    if (currentData) {
        document.getElementById('currentLevelPemanas').textContent = currentData.State_Pemanas !== undefined ? `${currentData.State_Pemanas} %` : '--'; // Perbaikan
        document.getElementById('currentPosisiTelur').textContent = currentData.Posisi_Telur !== undefined ? currentData.Posisi_Telur : '--';
    } else {
        document.getElementById('currentLevelPemanas').textContent = '--';
        document.getElementById('currentPosisiTelur').textContent = '--';
    }
}, (error) => {
    console.error("Error membaca data kendali saat ini:", error);
});


// --- Membaca data LastUpdate ---
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
