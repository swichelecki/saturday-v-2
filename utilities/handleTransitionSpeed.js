const handleTransitionSpeed = (movedBy, duration) => {
  const MAX_TRANSITION_SPEED = 100;
  const MIN_TRANSITION_SPEED = 500;

  const velocity = movedBy / duration;
  const speed = Math.round(movedBy / velocity);

  return speed < MIN_TRANSITION_SPEED && speed >= MAX_TRANSITION_SPEED
    ? speed
    : speed >= MIN_TRANSITION_SPEED
    ? MIN_TRANSITION_SPEED
    : MAX_TRANSITION_SPEED;
};

export default handleTransitionSpeed;
