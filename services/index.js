import { request, gql } from 'graphql-request';

const graphqlAPI = process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT;

export const getTasks = async () => {
  const query = gql`
    query GetTasks {
      tasks(orderBy: priority_ASC, stage: DRAFT) {
        id
        priority
        title
        description
        date
        dateAndTime
      }
    }
  `;

  const result = await request(graphqlAPI, query);

  return result.tasks;
};

export const getTask = async (id) => {
  const query = gql`
    query GetTask($id: ID) {
      task(where: { id: $id }, stage: DRAFT) {
        id
        title
        description
        date
        dateAndTime
      }
    }
  `;

  const result = await request(graphqlAPI, query, { id });

  return result.task;
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
  const query = gql`
    mutation DeleteTask($id: ID) {
      deleteTask(where: { id: $id }) {
        id
      }
    }
  `;

  try {
    const result = await request(graphqlAPI, query, { id });
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const updateTask = async (id, task) => {
  const { priority, title, description, date, dateAndTime } = task;

  const query = gql`
    mutation UpdateTask(
      $id: ID
      $priority: Int
      $title: String!
      $description: String
      $date: Date
      $dateAndTime: DateTime
    ) {
      updateTask(
        where: { id: $id }
        data: {
          priority: $priority
          title: $title
          description: $description
          date: $date
          dateAndTime: $dateAndTime
        }
      ) {
        id
        title
      }
    }
  `;

  try {
    const result = await request(graphqlAPI, query, {
      id,
      priority,
      title,
      description,
      date,
      dateAndTime,
    });
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getBirthdays = async () => {
  const query = gql`
    query GetBirthdays() {
      birthdays(orderBy: date_ASC, stage: DRAFT) {
        id
        name
        date
      }
    }
  `;

  try {
    const result = await request(graphqlAPI, query);
    return result.birthdays;
  } catch (error) {
    return error;
  }
};

export const updateBirthdays = async (birthday) => {
  const { id, name, date } = birthday;

  const query = gql`
    mutation UpdateBirthday($id: ID, $name: String, $date: Date) {
      updateBirthday(where: { id: $id }, data: { name: $name, date: $date }) {
        id
      }
    }
  `;

  try {
    const result = await request(graphqlAPI, query, {
      id,
      name,
      date,
    });
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
};
