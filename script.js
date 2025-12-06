// script.js - Final Versiyon (API, Müzik, Arama Dahil)
document.addEventListener('DOMContentLoaded', () => {
    
    // === 🔑 API ANAHTARI 🔑 ===
    const API_KEY = "f6725c7aa00b448a9c684345250612"; 
    const API_BASE_URL = "https://api.weatherapi.com/v1/current.json";
    
    // === DOM ÖĞELERİ ===
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const weatherDataEl = document.getElementById('weather-data');
    
    const cityInputEl = document.getElementById('city-input'); 
    const searchButtonEl = document.getElementById('search-button'); 

    const locationNameEl = document.getElementById('location-name');
    const tempValueEl = document.getElementById('temp-value');
    const descriptionEl = document.getElementById('weather-description');
    const windSpeedEl = document.getElementById('wind-speed');
    const humidityEl = document.getElementById('humidity');
    const pressureEl = document.getElementById('pressure');
    const visibilityEl = document.getElementById('visibility');
    const iconEl = document.getElementById('weather-icon');
    const bodyEl = document.body;

    // SES ÖĞELERİ
    const welcomeAudioEl = document.getElementById('welcome-audio'); 
    const backgroundMusicEl = document.getElementById('background-music');
    
    let isAudioStarted = false; 

    // === SES İŞLEYİCİ FONKSİYONLARI ===

    // Fon müziğini başlatan fonksiyon
    function startBackgroundMusic() {
        // Fon müziğinin çalmasını garanti etmeye çalışır
        backgroundMusicEl.play().catch(error => {
            console.warn("Fon müziği başlatılamadı:", error);
        });
    }

    // Karşılama sesi bittiğinde fon müziğini başlatır
    welcomeAudioEl.onended = () => {
        startBackgroundMusic();
    };

    // İlk kullanıcı etkileşiminde (tıklama/dokunma) tetiklenen ana fonksiyon
    function playAudioOnInteraction() {
        if (isAudioStarted) return; 

        // 1. Hoş geldiniz sesini başlat
        welcomeAudioEl.play()
            .then(() => {
                isAudioStarted = true;
                // Başarıyla başladıysa, dinleyicileri kaldır (sadece bir kez çalınması için)
                document.removeEventListener('click', playAudioOnInteraction);
                document.removeEventListener('touchstart', playAudioOnInteraction);
            })
            .catch(error => {
                // Eğer hoş geldiniz sesi engellenirse, direkt fon müziğini başlatmayı dene
                startBackgroundMusic(); 
                isAudioStarted = true;
                document.removeEventListener('click', playAudioOnInteraction);
                document.removeEventListener('touchstart', playAudioOnInteraction);
            });
    }
    
    // Sayfa yüklendikten hemen sonra dinlemeye başla
    document.addEventListener('click', playAudioOnInteraction);
    document.addEventListener('touchstart', playAudioOnInteraction); 

    // === OLAY DİNLEYİCİLERİ ve BAŞLANGIÇ ===
    
    searchButtonEl.addEventListener('click', handleSearch);
    
    cityInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Başlangıç yüklemesi
    loadingEl.classList.remove('hidden'); 
    errorEl.classList.add('hidden');
    weatherDataEl.classList.add('hidden');
    fetchWeatherByCity(cityInputEl.value);


    // === ANA FONKSİYONLAR ===
    
    function handleSearch() {
        const city = cityInputEl.value.trim();
        if (city) {
            // Arama yapıldığında, henüz çalmadıysa sesi tetikle (ikinci bir şans)
            playAudioOnInteraction(); 
            fetchWeatherByCity(city);
        } else {
            errorEl.textContent = "Lütfen geçerli bir şehir adı girin.";
            errorEl.classList.remove('hidden');
        }
    }

    // Şehir adı ile hava durumu çekme işlevi
    async function fetchWeatherByCity(city) {
        const apiUrl = `${API_BASE_URL}?key=${API_KEY}&q=${city}&lang=tr`;
        
        loadingEl.classList.remove('hidden'); 
        errorEl.classList.add('hidden');
        weatherDataEl.classList.add('hidden'); 

        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                 const errorJson = await response.json();
                 const errorMessage = errorJson.error ? errorJson.error.message : response.statusText;
                throw new Error(`Şehir bulunamadı veya API hatası (${response.status}): ${errorMessage}`);
            }
            
            const data = await response.json();
            displayWeather(data);
            loadingEl.classList.add('hidden'); 
            weatherDataEl.classList.remove('hidden');
            
        } catch (error) {
            loadingEl.classList.add('hidden');
            console.error('Hata oluştu:', error);
            errorEl.textContent = `Hata: ${error.message}`;
            errorEl.classList.remove('hidden'); 
        }
    }
    
    // Verileri arayüze yansıtma ve temayı ayarlama
    function displayWeather(data) {
        locationNameEl.textContent = `${data.location.name}, ${data.location.country}`;
        tempValueEl.textContent = Math.round(data.current.temp_c); 
        descriptionEl.textContent = data.current.condition.text.toUpperCase();
        
        windSpeedEl.textContent = data.current.wind_kph.toFixed(1); 
        humidityEl.textContent = data.current.humidity;
        pressureEl.textContent = data.current.pressure_mb; 
        visibilityEl.textContent = data.current.vis_km.toFixed(1); 

        const conditionCode = data.current.condition.code;
        const isDay = data.current.is_day === 1;
        let iconClass = 'fas fa-question'; 
        let themeClass = 'default';

        // Durum kodlarına göre ikon ve tema belirleme (WeatherAPI.com kodları)
        if (conditionCode === 1000) { iconClass = isDay ? 'fas fa-sun' : 'fas fa-moon'; themeClass = 'clear'; } 
        else if (conditionCode === 1003 || conditionCode === 1006 || conditionCode === 1009) { iconClass = 'fas fa-cloud'; themeClass = 'cloudy'; } 
        else if (conditionCode >= 1063 && conditionCode <= 1195) { iconClass = 'fas fa-cloud-showers-heavy'; themeClass = 'rainy'; } 
        else if (conditionCode >= 1210 && conditionCode <= 1237) { iconClass = 'fas fa-snowflake'; themeClass = 'snowy'; } 
        else if (conditionCode >= 1087) { iconClass = 'fas fa-bolt'; themeClass = 'thunder'; }
        else { iconClass = 'fas fa-smog'; themeClass = 'mist'; }
        
        iconEl.className = iconClass;
        
        bodyEl.className = ''; 
        bodyEl.classList.add(themeClass);
    }
});