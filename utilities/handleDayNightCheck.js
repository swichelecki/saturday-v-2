import moment from 'moment-timezone';

export const handleDayNightCheck = (weather_code, timezone) => {
  if (weather_code > 2) return weather_code;

  const FORMAT_TIME = 'HH:mm:ss';
  const MOON = 100;
  const MOON_CLOUDS = 101;

  const date = new Date();
  const today = moment(date).tz(timezone);
  const year = today.format('YYYY');

  const octoberOne = `${year}-10-01`;
  const decemberThirtyFirst = `${year}-12-31`;
  const januaryFirst = `${year}-01-01`;
  const marchThirtyFirst = `${year}-03-31`;
  const aprilFirst = `${year}-04-01`;
  const septemberThirtieth = `${year}-09-30`;

  const winterSunrise = moment('06:00:00', FORMAT_TIME);
  const winterSunSet = moment('17:00:00', FORMAT_TIME);
  const summerSunrise = moment('07:00:00', FORMAT_TIME);
  const summerSunSet = moment('20:00:00', FORMAT_TIME);

  const isFallOrWinder =
    today.isBetween(octoberOne, decemberThirtyFirst, undefined, '[]') ||
    today.isBetween(januaryFirst, marchThirtyFirst, undefined, '[]');

  const isSpringOrSummer = today.isBetween(
    aprilFirst,
    septemberThirtieth,
    undefined,
    '[]',
  );

  // check for fall/winter
  if (isFallOrWinder) {
    // check day or night
    if (today.isBetween(winterSunrise, winterSunSet, undefined, '[]')) {
      return weather_code;
    } else {
      // check weather code for night
      if (weather_code === 0 || weather_code === 1) {
        return MOON;
      } else {
        return MOON_CLOUDS;
      }
    }
  }

  // check for spring/summer
  if (isSpringOrSummer) {
    // check day or night
    if (today.isBetween(summerSunrise, summerSunSet, undefined, '[]')) {
      return weather_code;
    } else {
      // check weather code for night
      if (weather_code === 0 || weather_code === 1) {
        return MOON;
      } else {
        return MOON_CLOUDS;
      }
    }
  }
};
