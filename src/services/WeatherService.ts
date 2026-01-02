interface WeatherData {
  temperature: number;
  condition: string;
}

export const WeatherService = {
  getWeather: async (lat: number, lon: number): Promise<WeatherData> => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await response.json();

      if (!data.current_weather) {
        throw new Error('No weather data available');
      }

      // Map WMO Weather interpretation codes to string conditions
      // https://open-meteo.com/en/docs
      const conditionCode = data.current_weather.weathercode;
      const condition = mapWeatherCode(conditionCode);

      return {
        temperature: data.current_weather.temperature,
        condition: condition,
      };
    } catch (error) {
      console.error('Weather fetch error:', error);
      // Fallback
      return { temperature: 20, condition: 'Clear Sky' };
    }
  },
};

function mapWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code >= 1 && code <= 3) return 'Partly cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
}
