const handleTransitionSpeed = (maxMoveDistance, movedBy, duration) => {
  const MAX_TRANSITION_SPEED = 100;
  const MIN_TRANSITION_SPEED = 500;
  const velocity = Math.abs(movedBy) / duration;

  if (maxMoveDistance) {
    const transitionSpeed = (maxMoveDistance - Math.abs(movedBy)) / velocity;
    return transitionSpeed < 500 && transitionSpeed >= 100
      ? transitionSpeed
      : transitionSpeed >= 500
      ? MIN_TRANSITION_SPEED
      : MAX_TRANSITION_SPEED;
  } else {
    return Math.abs(Math.abs(movedBy) / velocity) / 2;
  }
};

export default handleTransitionSpeed;
