import Auth from '@/pages/Auth';

const BridgefortRealtorsAuth = () => {
  return (
    <Auth
      pageTitle="Bridgefort Realtors"
      redirectAfterSignIn="/mlm"
      redirectAfterSignUp="/profile"
    />
  );
};

export default BridgefortRealtorsAuth;
