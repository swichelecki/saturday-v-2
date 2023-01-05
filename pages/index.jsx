import { useState } from 'react';
import { ContentLeft, ContentRight } from '../components';
import { getTasks } from '../services';
import { TasksContext } from '../context/tasksContext';

export default function Home({ tasks }) {
  const [globalContextTasks, setGlobalContextTasks] = useState(tasks);

  return (
    <main className='content-container'>
      <TasksContext.Provider
        value={{ globalContextTasks, setGlobalContextTasks }}
      >
        <ContentLeft />
        <ContentRight />
      </TasksContext.Provider>
    </main>
  );
}

export async function getServerSideProps() {
  const tasks = (await getTasks()) || [];

  return {
    props: { tasks },
  };
}
