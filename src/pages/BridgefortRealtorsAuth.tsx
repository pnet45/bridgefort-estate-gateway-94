import Auth from '@/pages/Auth';

const BridgefortRealtorsAuth = () => {
  return (
    <Auth
      pageTitle="Bridgefort Realtors"
      redirectAfterSignIn="/bh-realtors"
      redirectAfterSignUp="/profile"
    />
  );
};

export default BridgefortRealtorsAuth;
