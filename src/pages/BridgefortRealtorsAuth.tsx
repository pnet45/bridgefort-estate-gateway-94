import Auth from '@/pages/Auth';

const BridgefortRealtorsAuth = () => {
  return (
    <Auth
      pageTitle="BMC Partner Network"
      redirectAfterSignIn="/bh-realtors"
      redirectAfterSignUp="/profile"
    />
  );
};

export default BridgefortRealtorsAuth;
