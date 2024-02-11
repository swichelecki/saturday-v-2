export const getTask = async (id) => {
  const response = await fetch('/api/getTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(id),
  });

  const item = await response.json();

  return { status: response.status, item };
};

export const submitTask = async (obj) => {
  const response = await fetch('/api/addTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  const item = await response.json();

  return { status: response.status, item };
};

export const deleteTask = async (id) => {
  const response = await fetch('/api/deleteTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(id),
  });

  return response;
};

export const updateTask = async (obj) => {
  const response = await fetch('/api/updateTask', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  const item = await response.json();

  return { status: response.status, item };
};

export const getBirthdays = async () => {
  const response = await fetch('/api/getBirthdays', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
};

export const updateBirthdays = async (obj) => {
  const response = await fetch('/api/updateBirthdays', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  return response.json();
};

export const SignUpUser = async (obj) => {
  const response = await fetch('/api/user/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  return response;
};

export const loginUser = async (obj) => {
  const response = await fetch('/api/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  return response;
};

export const updateUserPassword = async (obj) => {
  const response = await fetch('/api/user/updatePassword', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  return response;
};

export const deleteUserAccount = async (obj) => {
  const response = await fetch('/api/user/deleteAccount', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  return response;
};

export const createCategory = async (obj) => {
  const response = await fetch('/api/settings/createCategory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  const item = await response.json();

  return { status: response.status, item };
};

export const deleteCategory = async (obj) => {
  const response = await fetch('/api/settings/deleteCategory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  return response;
};

export const updateCategory = async (obj) => {
  const response = await fetch('/api/settings/updateCategory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(obj),
  });

  return response;
};
