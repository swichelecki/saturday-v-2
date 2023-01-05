import { DetailsForm } from '../../../components';
import { getTask } from '../../../services';

const EditDetails = ({ task }) => {
  return <DetailsForm task={task} />;
};

export async function getServerSideProps({ params }) {
  const id = params.id;
  const task = (await getTask(id)) || [];

  return {
    props: { task },
  };
}

export default EditDetails;
