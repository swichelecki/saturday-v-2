import { SLOW_TRANSITION_SPEED } from '../constants';

export const handleTransitionSpeed = (movedBy, duration) => {
  const velocity = movedBy / duration;
  const speed = (movedBy / velocity) * 2;

  return speed < SLOW_TRANSITION_SPEED
    ? speed
    : speed >= SLOW_TRANSITION_SPEED
    ? SLOW_TRANSITION_SPEED
    : '';
};
