import Auth from '@/pages/Auth';

const BridgefortRealtorsAuth = () => {
  return (
    <Auth
      pageTitle="BMC Partner Network"
      redirectAfterSignIn="/bmc-partner-hub"
      redirectAfterSignUp="/profile"
    />
  );
};

export default BridgefortRealtorsAuth;
