// Tenta obter a localização do usuário usando a API de geolocalização da ipdata.com
fetch('https://api.ipdata.co?api-key=fb479cb43ea6ea6c02efc117d122b18dd244ff3143d15f66989cb37f')
  .then(response => response.json())
  .then(data => {
    exibirNotificacao(data.latitude, data.longitude);
  })
  .catch(error => {
    console.error('Erro ao obter a localização do usuário usando a API do ipdata:', error);
    // Se falhar, tenta obter a localização usando a API de geolocalização do navegador
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        exibirNotificacao(position.coords.latitude, position.coords.longitude);
      }, error => {
        console.error('Erro ao obter a localização do usuário usando a API de geolocalização do navegador:', error);
      });
    } else {
      console.error('A geolocalização não é suportada neste navegador.');
    }
  });

  function exibirNotificacao(latitude, longitude) {
    // Obter a previsão do tempo atual para a localização do usuário usando a API do OpenWeather
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=839acee8e810af94c151861f7f98f0ee&units=metric&lang=it`)
      .then(response => response.json())
      .then(weatherData => {
        // Criar a notificação flutuante com a previsão do tempo atual
        const notification = document.createElement('div');
        notification.classList.add('notification');
        const icon = weatherData.weather[0].icon;
        const description = weatherData.weather[0].description;
        const weatherIcon = `https://openweathermap.org/img/w/${icon}.png`;
        notification.innerHTML = `
          <div>
            <p style="display: inline-block!important;">En ${weatherData.name} lui fa ${Math.round(weatherData.main.temp)}°C e ${description} <span style="display: inline-block!important;"><img src="${weatherIcon}" alt="${description}"></span></p>
          </div>
        `;
        document.body.appendChild(notification);
  
        // Remover a notificação após 5 segundos
        setTimeout(() => {
          notification.remove();
        }, 7000);
      })
      .catch(error => {
        console.error('Erro ao obter a previsão do tempo:', error);
      });
  }