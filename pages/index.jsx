import connectDB from '../config/db';
import Task from '../models/Task';
import { useState } from 'react';
import { Content } from '../components';
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

export async function getServerSideProps(context) {
  await connectDB();

  const userCookie = context.req.cookies['saturday'];

  if (!userCookie) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const tasks = await Task.find().sort({ priority: 1 });

    return {
      props: { tasks: JSON.parse(JSON.stringify(tasks)) } ?? [],
    };
  } catch (error) {
    console.log(error);
  }
}
