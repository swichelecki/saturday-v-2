import { useState, useEffect } from 'react';

const Weather = () => {
  const [temperature, setTemperature] = useState('');

  const getWeather = async () => {
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=41.85&longitude=-87.65&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=America%2FChicago'
    );
    if (response.status >= 200 && response.status <= 299) {
      const jsonResponse = await response.json();
      setTemperature(Math.ceil(jsonResponse.current_weather.temperature));
    } else {
      console.log(response.status, response.statusText);
    }
  };

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <div className='weather'>
      <p className='weather__temp'>
        {temperature}
        <span>&deg;</span>
      </p>
      <p className='weather__location'>Chicago</p>
    </div>
  );
};

export default Weather;
