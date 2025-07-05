import React from 'react';
import TrainingEventCard from './TrainingEventCard';
const UpcomingTrainingEvents = () => {
  const upcomingEvents = [{
    title: "MEGA SALES STRATEGY EVENT - Strategy for Closing Deals in Millions",
    description: "Join Dr. Dalvin Silva as he unveils game-changing strategies that have helped thousands generate millions in real estate and business deals. The Irrefutable Methods of Sales Master Exposed!",
    speaker: "Dr. Dalvin Silva – MD/CEO, PWAN BRIDGEFORT (Renowned Sales Coach | Real Estate Titan | Leadership Strategist)",
    host: "Mr. Kenneth Thompson Enyinnaya (Multiple Award Winner, Senior Manager PWAN Group, Chairman PWAN Amazon Network)",
    date: "Friday, 4th July 2025",
    time: "10:00 AM Prompt",
    venue: "PWAN AMAZON CENTRE (Golden Destiny Hotel), 7 & 8 B/Stop, Airport Road by Tetrazinni, Ajao Estate, Isolo, Lagos",
    phone: "+234 802 321 5308, +234 706 635 9619, +234 807 244 0090"
  }, {
    title: "STRATEGY MASTERCLASS - Strategies for Closing Deals in Millions",
    description: "An exclusive, high-impact sales training designed to transform the way you negotiate, present, and close high-value deals. The Irrefutable Methods of Sales Masters Exposed!",
    speaker: "Dalvin Silva, PhD - Managing Director/CEO, PWAN Bridgefort (Renowned real estate leader and deal-closer)",
    host: "Mrs. Ezinne Agnes Okonkwo - PWAN Manager / Centre Coordinator (Passionate coach and sales strategist)",
    date: "Wednesday, 2nd July 2025",
    time: "11:00 AM Prompt",
    venue: "St. Joseph Catholic Church Hall, Kirikiri Town, Apapa, Lagos",
    phone: "0809 593 3269, 0807 244 0090",
    website: "www.pwanbridgefort.ng"
  }, {
    title: "BUSINESS MASTERCLASS - Strategies for Closing Deals in Millions",
    description: "Transform your real estate and business negotiation game with Dr. Dalvin Silva. Learn practical and proven strategies for closing deals worth millions.",
    speaker: "Dr. Dalvin Silva - MD/CEO, PWAN Bridgefort (Business Leader, Wealth Strategist)",
    host: "Lolo Vivian Igwe - Senior Manager & Centre Coordinator",
    date: "Thursday, 26 June 2025",
    time: "11:00 AM",
    venue: "PWAN Group Excellence Centre, Nnokwa Hall, Opposite NNPC Petrol Station, By NNPC Bus Stop, Ejigbo, Lagos",
    email: "training@pwanbridgefort.ng",
    website: "www.pwanbridgefort.ng"
  }];
  return <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-estate-blue mb-4">Upcoming Training</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Don't miss these exclusive training opportunities designed to transform your sales and business success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event, index) => <TrainingEventCard key={index} title={event.title} description={event.description} speaker={event.speaker} host={event.host} date={event.date} time={event.time} venue={event.venue} phone={event.phone} email={event.email} website={event.website} />)}
        </div>
      </div>
    </section>;
};
export default UpcomingTrainingEvents;