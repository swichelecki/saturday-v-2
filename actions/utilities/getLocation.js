'use server';

import { headers } from 'next/headers';

export default async function getLocation() {
  try {
    const headerList = headers();

    let ipAddress = headerList.get('x-forwarded-for')?.split(',')[0];

    if (!ipAddress) ipAddress = headerList.get('x-real-ip') || 'unknown';

    // if localhost use America/Chicago ip address
    if (ipAddress === '::1') ipAddress = '73.111.204.162';

    const response = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=lat,lon,city`
    );
    const locationData = await response.json();
    const { lat, lon, city } = locationData;

    return { status: 200, location: { lat, lon, city } };
  } catch (error) {
    console.log(error);
    const errorMessage = handleServerErrorMessage(error);
    return { status: 500, error: errorMessage };
  }
}
