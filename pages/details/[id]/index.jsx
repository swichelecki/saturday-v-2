import connectDB from '../../../config/db';
import { getCookie } from 'cookies-next';
import { jwtVerify } from 'jose';
import Task from '../../../models/Task';
import { DetailsForm } from '../../../components';

const EditDetails = ({ task }) => {
  return <DetailsForm task={task} />;
};

export async function getServerSideProps(context) {
  try {
    await connectDB();

    const { params, req, res } = context;
    const jwtSecret = process.env.JWT_SECRET;
    const token = getCookie('saturday', { req, res });

    let userId;

    if (token) {
      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(jwtSecret)
        );
        if (payload?.id) {
          userId = payload?.id;
        }
      } catch (error) {
        console.log(error);
      }
    }

    const id = params.id;
    const task = await Task.find({ _id: id, userId });

    return {
      props: { task: JSON.parse(JSON.stringify(task[0])) } ?? {},
    };
  } catch (error) {
    console.log(error);
  }
}

export default EditDetails;
