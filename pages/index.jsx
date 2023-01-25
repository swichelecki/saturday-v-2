import { useState } from 'react';
import { Content } from '../components';
import { getTasks } from '../services';
import { TasksContext } from '../context/tasksContext';

export default function Home({ tasks }) {
  const [globalContextTasks, setGlobalContextTasks] = useState(tasks);

  return (
    <div className='content-container'>
      <TasksContext.Provider
        value={{ globalContextTasks, setGlobalContextTasks }}
      >
        <Content />
      </TasksContext.Provider>
    </div>
  );
}

export async function getServerSideProps() {
  const tasks = (await getTasks()) || [];

  return {
    props: { tasks },
  };
}
