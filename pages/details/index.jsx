import { DetailsForm } from '../../components';

const AddDetails = () => {
  return <DetailsForm />;
};

export async function getServerSideProps(context) {
  const userCookie = context.req.cookies['saturday'];

  if (!userCookie) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default AddDetails;
