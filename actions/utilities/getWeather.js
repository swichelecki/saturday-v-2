'use server';

import { headers } from 'next/headers';
import { handleServerErrorMessage } from '../../utilities';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';

export default async function getWeather(userId) {
  // check that cookie user id matches param userId
  const { userId: cookieUserId, cookieError } = await getUserFromCookie();
  if (cookieError) return cookieError;

  if (!userId || userId !== cookieUserId) {
    return {
      status: 400,
      error: 'Unauthorized',
    };
  }

  try {
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    let ipv6Address = null;

    if (forwardedFor) {
      const ips = forwardedFor.split(',');
      for (const ip of ips) {
        if (ip.includes(':')) {
          ipv6Address = ip;
          break;
        }
      }
    }

    if (!ipv6Address) ipv6Address = headerList.get('x-real-ip') || 'unknown';

    // if localhost use America/Chicago ip address
    if (ipv6Address === '::1')
      ipv6Address = '2601:241:8e81:44f0:e455:242:81a7:b7f0';

    // get user location
    const locationDataRes = await fetch(
      `http://ip-api.com/json/${ipv6Address}?fields=lat,lon,city`
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
