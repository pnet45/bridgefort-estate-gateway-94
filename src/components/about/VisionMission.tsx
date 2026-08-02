import React from 'react';
const VisionMission = () => {
  return <section className="section-padding">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-estate-blue">CLEAR VISION</h2>
            <p className="text-lg italic font-medium mb-4 text-foreground">
              "To be a pioneering force in African real estate—bridging people to prosperity, one property at a time."
            </p>
            <p className="text-muted-foreground">
              Each project we execute, each territory we explore, and each partnership we nurture is driven by a crystal-clear vision to democratize property ownership, foster financial empowerment, and build communities that last for generations.
            </p>
          </div>
          
          <div className="glass-card p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-estate-blue">GUIDING MISSION</h2>
            <p className="text-lg italic font-medium mb-4 text-foreground">
              "To simplify home ownership, strengthen people, and serve with purpose—while redefining what is possible in real estate across Africa and the world at large."
            </p>
            <p className="text-muted-foreground">
              Our mission is to create accessible real estate opportunities, equip and empower our network of realtors, and offer clients real solutions that go beyond land—to legacy, lifestyle, and long-term security.
            </p>
          </div>
        </div>
      </div>
    </section>;
};
export default VisionMission;