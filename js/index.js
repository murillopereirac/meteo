const cityInput = document.getElementById("city");
const resultDiv = document.getElementById("result");
const apiKey = "708091cb45ab72328a12c9e4da89c430";
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?appid=${apiKey}&units=metric&lang=it&q=`;
const alertUrl = `https://api.openweathermap.org/data/2.5/onecall?appid=${apiKey}&units=metric&lang=it&exclude=current,minutely,hourly&lat={lat}&lon={lon}`;

// Adiciona um listener para obter a localização do usuário via GPS
document.addEventListener("DOMContentLoaded", function() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError);
  }
});

// Função chamada quando a localização é obtida com sucesso
function onGeoSuccess(position) {
  const { latitude, longitude } = position.coords;

  // Busca as informações de clima para a localização do usuário
  fetchWeatherData(latitude, longitude);
}

// Função chamada quando ocorre um erro ao obter a localização
function onGeoError(error) {
  console.error(error);
}

cityInput.addEventListener("input", fetchWeatherData);

let lastCity = "";

// Função que busca as informações de clima para a cidade especificada ou a localização atual do usuário
function fetchWeatherData(latitude, longitude) {
  let city = cityInput.value.trim();

  // Verifica se a cidade foi especificada e utiliza a localização atual do usuário caso contrário
  if (city === "" && latitude && longitude) {
    fetchWeatherDataByLocation(latitude, longitude);
    return;
  }

  if (city === lastCity) {
    return;
  }

  lastCity = city;

  // Esconde o resultado anterior e mostra uma mensagem de carregando
  resultDiv.style.display = "none";
  resultDiv.innerHTML = "Caricamento in corso...";

  // Se a cidade estiver vazia, mostra uma mensagem pedindo que a pessoa faça uma pesquisa
  if (city === "") {
    resultDiv.style.display = "none"; // Esconde o resultado anterior
    showErrorMessage("Effettua la tua ricerca istantanea"); // Mostra a mensagem de erro
    return;
  }

  const weatherApiUrl = weatherUrl + encodeURIComponent(city);

  fetch(weatherApiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nel recupero dei dati meteorologici. Verificare la città e riprovare.");
      }
      return response.json();
    })
    .then((weatherData) => {
      const lat = weatherData.coord.lat;
      const lon = weatherData.coord.lon;
      const temperature = weatherData.main.temp;
      const weather = weatherData.weather[0];
      const { description, icon } = weather;
      const langDescription = description;

      const weatherIcon = `https://openweathermap.org/img/w/${icon}.png`;
      const alertApiUrl = alertUrl.replace('{lat}', lat).replace('{lon}', lon);

      fetch(alertApiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Errore nel recupero dei dati meteorologici. Verificare la città e riprovare.");
          }
          return response.json();
        })
        .then((alertData) => {
          let alertMessage = "";
          let alertClass = "";

          const alerts = alertData.alerts;
          if (alerts && alerts.length > 0) {
            const { event, tags, description } = alerts[0];
            if (event === "thunderstorm" && tags.includes("danger")) {
              alertClass = "high-risk";
            } else if (event === "hail" && tags.includes("danger")) {
              alertClass = "high-risk";
            }
            alertMessage = `INFO: <p class="alert-highlight">${description}</p>`;
          }

          if (alertData.hasOwnProperty('daily') && alertData.daily[0].hasOwnProperty('tsunami') && alertData.daily[0].tsunami === 1) {
            alertMessage = alertMessage + ' Alerta di tsunami!';
          }

          // Mostra o resultado da pesquisa na tela
          resultDiv.style.display = "block";
          resultDiv.innerHTML = `
            <h2>${city}</h2>
            <h3>${temperature}°C</h3>
            <img src="${weatherIcon}" alt="${description}">
            <p class="desc-text">${langDescription}</p>
            <p>Umidità: ${weatherData.main.humidity}%</p>
            <p>Pressione: ${weatherData.main.pressure} hPa</p>
            <p>Velocità del vento: ${weatherData.wind.speed} m/s</p>
            <p class="alert-message"><i class="fas fa-exclamation-triangle"></i> ${alertMessage}</p>

          `;
        })
        .
catch(() => {
          resultDiv.textContent = "Errore nel recupero dei dati meteorologici. Verificare la città e riprovare.";
        });
    })
    .catch(() => {
      resultDiv.textContent = "Errore nel recupero dei dati meteorologici. Verificare la città e riprovare.";
    });

}

document.getElementById('city').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
  }
});