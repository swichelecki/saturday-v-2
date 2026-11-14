import moment from 'moment-timezone';

export const handleDayNightCheck = (weather_code, timezone) => {
  if (weather_code > 2) return weather_code;

  const MOON = 100;
  const MOON_CLOUDS = 101;

  const today = moment.tz(timezone);

  // Use today.clone() so dates always stay in the user's timezone & current year
  const octoberOne = today.clone().month(9).date(1).startOf('day'); // Oct 1, 00:00:00
  const decemberThirtyFirst = today.clone().month(11).date(31).endOf('day'); // Dec 31, 23:59:59
  const januaryFirst = today.clone().month(0).date(1).startOf('day'); // Jan 1, 00:00:00
  const marchThirtyFirst = today.clone().month(2).date(31).endOf('day'); // Mar 31, 23:59:59
  const aprilFirst = today.clone().month(3).date(1).startOf('day'); // Apr 1, 00:00:00
  const septemberThirtieth = today.clone().month(8).date(30).endOf('day'); // Sep 30, 23:59:59

  // Anchor sunrise/sunset to "today" in the user's timezone (avoids UTC date drift)
  const winterSunrise = today
    .clone()
    .set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
  const winterSunset = today
    .clone()
    .set({ hour: 17, minute: 0, second: 0, millisecond: 0 });
  const summerSunrise = today
    .clone()
    .set({ hour: 7, minute: 0, second: 0, millisecond: 0 });
  const summerSunset = today
    .clone()
    .set({ hour: 20, minute: 0, second: 0, millisecond: 0 });

  const isFallOrWinter =
    today.isBetween(octoberOne, decemberThirtyFirst, undefined, '[]') ||
    today.isBetween(januaryFirst, marchThirtyFirst, undefined, '[]');

  const isSpringOrSummer = today.isBetween(
    aprilFirst,
    septemberThirtieth,
    undefined,
    '[]',
  );

  // Check for fall/winter
  if (isFallOrWinter) {
    if (today.isBetween(winterSunrise, winterSunset, undefined, '[]')) {
      return weather_code;
    }
    return weather_code === 0 || weather_code === 1 ? MOON : MOON_CLOUDS;
  }

  // Check for spring/summer
  if (isSpringOrSummer) {
    if (today.isBetween(summerSunrise, summerSunset, undefined, '[]')) {
      return weather_code;
    }
    return weather_code === 0 || weather_code === 1 ? MOON : MOON_CLOUDS;
  }
};
