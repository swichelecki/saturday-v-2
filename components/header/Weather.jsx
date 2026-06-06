'use client';

import { useState, useEffect, startTransition } from 'react';
import { getWeather } from '../../actions';
import { handleDayNightCheck } from '../../utilities';
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

const Weather = ({ userId }) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let ignore = false;

    getWeather(userId).then((res) => {
      if (ignore) return;
      if (res.status === 200) {
        startTransition(() => {
          const { data } = res;
          const { weatherData, city } = data;
          const { current, daily } = weatherData;
          const { temperature_2m, weather_code } = current;
          const { temperature_2m_max, temperature_2m_min } = daily;

          setWeather({
            temperature: Math.round(temperature_2m),
            weatherCode: handleDayNightCheck(weather_code),
            todaysHigh: Math.round(temperature_2m_max),
            todaysLow: Math.round(temperature_2m_min),
            city,
          });
        });
      } else {
        console.error(`Weather API error: ${res.error}`);
      }
    });

    return () => {
      ignore = true;
    };
  }, [userId]);

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
      <BsFillCloudRainFill />,
    );
    addMapping([71, 73, 75, 77, 85, 86], <BsSnow />);
    addMapping([95, 96, 99], <BsFillCloudLightningRainFill />);
    addMapping([100], <BsFillMoonStarsFill />);
    addMapping([101], <BsFillCloudMoonFill />);
  }, []);

  if (!weather) {
    return <></>;
  }

  return (
    <div className='weather'>
      <div className='weather__icon-temp-location-wrapper'>
        <div className='weather__icon-temp'>
          {ICON_MAP.get(weather.weatherCode)}
          <p>
            {weather.temperature}
            <span>&deg;</span>
          </p>
        </div>
        <p className='weather__location'>{weather.city}</p>
      </div>
      <div className='weather__high-low-wrapper'>
        <p>
          H: {weather.todaysHigh}
          <span>&deg;</span>
        </p>
        <p>
          L: {weather.todaysLow}
          <span>&deg;</span>
        </p>
      </div>
    </div>
  );
};

export default Weather;
