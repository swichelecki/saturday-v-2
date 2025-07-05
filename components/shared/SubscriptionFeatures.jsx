import {
  LIST_ITEM_LIMIT,
  CATEGORY_ITEM_LIMIT,
  REMINDERS_ITEM_LIMIT,
  NOTES_ITEM_LIMIT,
  UNSUBSCRIBED_LIST_ITEM_LIMIT,
  UNSUBSCRIBED_CATEGORY_ITEM_LIMIT,
  UNSUBSCRIBED_REMINDERS_ITEM_LIMIT,
  UNSUBSCRIBED_NOTES_ITEM_LIMIT,
} from '../../constants';

const SubscriptionFeatures = () => {
  return (
    <table className='subscription-features'>
      <caption>
        For just $1 a month, subscribe to Saturday's paid tier and get yourself
        organized! Powered by Stripe.
      </caption>
      <thead>
        <tr>
          <th scope='col'>Feature</th>
          <th scope='col'>Free Tier</th>
          <th scope='col'>$1 Monthly</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope='row'>Categories</th>
          <td>{UNSUBSCRIBED_CATEGORY_ITEM_LIMIT}</td>
          <td>{CATEGORY_ITEM_LIMIT}</td>
        </tr>
        <tr>
          <th scope='row'>Category Items</th>
          <td>{UNSUBSCRIBED_LIST_ITEM_LIMIT}</td>
          <td>{LIST_ITEM_LIMIT}</td>
        </tr>
        <tr>
          <th scope='row'>Reminders</th>
          <td>{UNSUBSCRIBED_REMINDERS_ITEM_LIMIT}</td>
          <td>{REMINDERS_ITEM_LIMIT}</td>
        </tr>
        <tr>
          <th scope='row'>Notes</th>
          <td>{UNSUBSCRIBED_NOTES_ITEM_LIMIT}</td>
          <td>{NOTES_ITEM_LIMIT}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default SubscriptionFeatures;
