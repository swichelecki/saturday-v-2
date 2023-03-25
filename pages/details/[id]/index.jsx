import connectDB from '../../../config/db';
import Task from '../../../models/Task';
import { DetailsForm } from '../../../components';

const EditDetails = ({ task }) => {
  return <DetailsForm task={task} />;
};

export async function getServerSideProps({ params }) {
  await connectDB();

  try {
    const id = params.id;
    const task = await Task.find({ _id: id });

    return {
      props: { task: JSON.parse(JSON.stringify(task[0])) } ?? {},
    };
  } catch (error) {
    console.log(error);
  }
}

export default EditDetails;
