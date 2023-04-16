import { DetailsForm } from '../../components';

const AddDetails = () => {
  return <DetailsForm />;
};

export async function getServerSideProps() {
  return {
    props: {},
  };
}

export default AddDetails;
