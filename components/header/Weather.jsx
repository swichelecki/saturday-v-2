import { headers } from 'next/headers';
import { handleDayNightCheck } from '../../utilities';
import { handleServerErrorMessage } from '../../utilities';
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

async function getWeatherData() {
  try {
    const headerList = await headers();
    let ipAddress = headerList.get('x-forwarded-for')?.split(',')[0];

    if (!ipAddress || ipAddress === '::1') ipAddress = '73.111.204.162';

    const locationDataRes = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=lat,lon,city`,
    );
    const locationData = await locationDataRes.json();
    const { lat, lon, city } = locationData;

    const openMeteoApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&forecast_days=1`;
    const weatherRes = await fetch(openMeteoApiUrl);
    const weatherData = await weatherRes.json();

    const { current, daily } = weatherData;
    const { temperature_2m, weather_code } = current;
    const { temperature_2m_max, temperature_2m_min } = daily;

    return {
      temperature: Math.round(temperature_2m),
      weatherCode: handleDayNightCheck(weather_code),
      todaysHigh: Math.round(temperature_2m_max),
      todaysLow: Math.round(temperature_2m_min),
      city,
    };
  } catch (error) {
    const errorMessage = handleServerErrorMessage(error);
    console.error('Weather fetch error:', errorMessage);
    return null;
  }
}

const Weather = async () => {
  const weather = await getWeatherData();

  if (!weather) return null;

  const ICON_MAP = new Map();
  ICON_MAP.set(0, <BsFillSunFill />);
  ICON_MAP.set(1, <BsFillSunFill />);
  ICON_MAP.set(2, <BsCloudSunFill />);
  ICON_MAP.set(3, <BsFillCloudFill />);
  ICON_MAP.set(45, <BsFillCloudFogFill />);
  ICON_MAP.set(48, <BsFillCloudFogFill />);
  [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].forEach((code) =>
    ICON_MAP.set(code, <BsFillCloudRainFill />),
  );
  [71, 73, 75, 77, 85, 86].forEach((code) => ICON_MAP.set(code, <BsSnow />));
  [95, 96, 99].forEach((code) =>
    ICON_MAP.set(code, <BsFillCloudLightningRainFill />),
  );
  ICON_MAP.set(100, <BsFillMoonStarsFill />);
  ICON_MAP.set(101, <BsFillCloudMoonFill />);

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
