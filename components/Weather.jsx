import { useState, useEffect } from 'react';
import {
  BsFillSunFill,
  BsCloudSunFill,
  BsFillCloudFill,
  BsFillCloudFogFill,
  BsFillCloudRainFill,
  BsSnow,
  BsFillCloudLightningRainFill,
} from 'react-icons/bs';

const ICON_MAP = new Map();

const Weather = () => {
  const [temperature, setTemperature] = useState(0);
  const [weatherCode, setWeatherCode] = useState(0);
  const [todaysHigh, setTodaysHigh] = useState(0);
  const [todaysLow, setTodaysLow] = useState(0);

  const getWeather = async () => {
    const openMeteoApiUrl =
      'https://api.open-meteo.com/v1/forecast?latitude=41.9231&longitude=-87.7093&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timeformat=unixtime&timezone=America%2FChicago&forecast_days=1';
    const response = await fetch(openMeteoApiUrl);

    if (response?.status >= 200 && response?.status <= 299) {
      const jsonResponse = await response?.json();
      const { current, daily } = jsonResponse;
      const { temperature_2m, weather_code } = current;
      const { temperature_2m_max, temperature_2m_min } = daily;

      setTemperature(Math.round(temperature_2m));
      setWeatherCode(weather_code);
      setTodaysHigh(Math.round(temperature_2m_max));
      setTodaysLow(Math.round(temperature_2m_min));
    } else {
      console.log(
        `Error requesting weather. Status code: ${response?.status}`,
        response?.statusText ? `Error message: ${response?.statusText}` : ''
      );
    }
  };

  useEffect(() => {
    getWeather();
  }, []);

  useEffect(() => {
    const addMapping = (weatherCodes, icon) => {
      weatherCodes.forEach((code) => {
        ICON_MAP.set(code, icon);
      });
    };

    addMapping([0, 1], <BsFillSunFill />);
    addMapping([2], <BsCloudSunFill />);
    addMapping([3], <BsFillCloudFill />);
    addMapping([45, 48], <BsFillCloudFogFill />);
    addMapping(
      [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82],
      <BsFillCloudRainFill />
    );
    addMapping([71, 73, 75, 77, 85, 86], <BsSnow />);
    addMapping([95, 96, 99], <BsFillCloudLightningRainFill />);
  }, []);

  if (!temperature) {
    return null;
  }

  return (
    <div className='weather'>
      <div className='weather__icon-temp-location-wrapper'>
        <div className='weather__icon-temp'>
          {ICON_MAP.get(weatherCode)}
          <p>
            {temperature}
            <span>&deg;</span>
          </p>
        </div>
        <p>Chicago</p>
      </div>
      <div className='weather__high-low-wrapper'>
        <p>
          H: {todaysHigh}
          <span>&deg;</span>
        </p>
        <p>
          L: {todaysLow}
          <span>&deg;</span>
        </p>
      </div>
    </div>
  );
};

export default Weather;
