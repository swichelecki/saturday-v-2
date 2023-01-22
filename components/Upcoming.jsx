import moment from 'moment-timezone';

const Upcoming = ({ upcomingEvents }) => {
  if (!upcomingEvents.length) {
    return null;
  }

  return (
    <section className='content-right-item'>
      <h2>Upcoming</h2>
      {upcomingEvents.map(
        (item, index) =>
          item?.date && (
            <div className='upcoming-item' key={`upcoming-item_${index}`}>
              {item?.dateAndTime ? (
                <>
                  <p className='upcoming-item__date'>
                    {moment(item?.dateAndTime)
                      .tz('America/Chicago')
                      .format('dddd, MMMM D')}{' '}
                  </p>
                  <p className='upcoming-item__time'>
                    {moment(item?.dateAndTime)
                      .tz('America/Chicago')
                      .format('h:mm A')}{' '}
                  </p>
                  <p className='upcoming-item__title'>{item?.title}</p>
                </>
              ) : (
                <>
                  <p className='upcoming-item__date'>
                    {moment(item?.date).format('dddd, MMMM D')}
                  </p>
                  <p className='upcoming-item__title'>{item?.title}</p>
                </>
              )}
              <span></span>
            </div>
          )
      )}
    </section>
  );
};

export default Upcoming;
