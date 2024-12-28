'use client';

import { useState, useEffect } from 'react';
import { getWeather } from '../../actions';
import { useAppContext } from '../../context';
import { handleDayNightCheck } from '../../utilities';
import { Toast } from '../../components';
import {
  BsFillSunFill,
  BsCloudSunFill,
  BsFillCloudFill,
  BsFillCloudFogFill,
  BsFillCloudRainFill,
  BsSnow,
  BsFillCloudLightningRainFill,
  BsFillMoonStarsFill,
  BsFillCloudMoonFill,
} from 'react-icons/bs';

const ICON_MAP = new Map();

const Weather = () => {
  const { setShowToast, userId } = useAppContext();

  const [temperature, setTemperature] = useState(0);
  const [weatherCode, setWeatherCode] = useState(0);
  const [todaysHigh, setTodaysHigh] = useState(0);
  const [todaysLow, setTodaysLow] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [city, setCity] = useState('');

  const getWeatherData = async () => {
    const res = await getWeather(userId);
    if (res.status === 200) {
      const { data } = res;
      const { weatherData, city } = data;
      const { current, daily } = weatherData;
      const { temperature_2m, weather_code } = current;
      const { temperature_2m_max, temperature_2m_min } = daily;

      setTemperature(Math.round(temperature_2m));
      setWeatherCode(handleDayNightCheck(weather_code));
      setTodaysHigh(Math.round(temperature_2m_max));
      setTodaysLow(Math.round(temperature_2m_min));
      setCity(city);
      setIsLoading(false);
    } else {
      setShowToast(<Toast serverError={res} />);
    }
  };

  useEffect(() => {
    getWeatherData();
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
    addMapping([100], <BsFillMoonStarsFill />);
    addMapping([101], <BsFillCloudMoonFill />);
  }, []);

  if (isLoading) {
    return <></>;
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
        <p className='weather__location'>{city}</p>
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
