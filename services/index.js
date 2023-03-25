export const getTask = async (id) => {
  const result = await fetch('/api/getTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(id),
  });

  return result.json();
};

export const submitTask = async (obj) => {
  const result = await fetch('/api/addTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  return result.json();
};

export const deleteTask = async (id) => {
  const result = await fetch('/api/deleteTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(id),
  });

  return result.json();
};

export const updateTask = async (obj) => {
  const result = await fetch('/api/updateTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  return result.json();
};

export const getBirthdays = async () => {
  const result = await fetch('/api/getBirthdays', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return result.json();
};

export const updateBirthdays = async (obj) => {
  const result = await fetch('/api/updateBirthdays', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  return result.json();
};
