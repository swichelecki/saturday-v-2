import { MAX_TRANSITION_SPEED, MIN_TRANSITION_SPEED } from '../constants';

export const handleTransitionSpeed = (movedBy, duration) => {
  const velocity = movedBy / duration;
  const speed = movedBy / velocity;

  return speed < MIN_TRANSITION_SPEED && speed >= MAX_TRANSITION_SPEED
    ? speed
    : speed >= MIN_TRANSITION_SPEED
    ? MIN_TRANSITION_SPEED
    : MAX_TRANSITION_SPEED;
};
