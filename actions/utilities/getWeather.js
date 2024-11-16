'use server';

import { headers } from 'next/headers';
import { handleServerErrorMessage } from '../../utilities';

export default async function getWeather() {
  try {
    const headerList = await headers();

    let ipAddress = headerList.get('x-forwarded-for')?.split(',')[0];

    if (!ipAddress) ipAddress = headerList.get('x-real-ip') || 'unknown';

    // if localhost use America/Chicago ip address
    if (ipAddress === '::1') ipAddress = '73.111.204.162';

    // get user location
    const locationDataRes = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=lat,lon,city`
    );
    const locationData = await locationDataRes.json();
    const { lat, lon, city } = locationData;

    // get user weather
    const openMeteoApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&forecast_days=1`;
    const weatherRes = await fetch(openMeteoApiUrl);
    const weatherData = await weatherRes?.json();

    return { status: 200, data: { weatherData, city } };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}