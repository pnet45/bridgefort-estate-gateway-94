import React from 'react';
const coreValues = [{
  letter: 'P',
  value: 'Purpose-Driven',
  description: 'At the heart of Bridgefort Homes Development Ltd is a deeper sense of purpose. We do not merely sell land; we ignite dreams, deliver dignity, and drive socioeconomic change through ownership and empowerment.'
}, {
  letter: 'W',
  value: 'Wealth Creation',
  description: 'Our business is a platform for generational wealth. Whether you\'re a client, investor, or realtor, Bridgefort Homes Development Ltd is your gateway to building sustainable wealth through property and partnerships.'
}, {
  letter: 'A',
  value: 'Accountability',
  description: 'We take full responsibility for our commitments. Every promise we make is backed by measurable action, transparency, and consistency. We own our outcomes—good or great.'
}, {
  letter: 'N',
  value: 'Nurturing People',
  description: 'People are our greatest asset. We invest in growth, cultivate potential, and build a culture where everyone—from staff to PBOs to clients—feels valued, heard, and empowered.'
}, {
  letter: 'B',
  value: 'Bold Innovation',
  description: 'We don\'t follow trends—we set them. With boldness, we challenge the status quo, embrace fresh thinking, and deploy creative strategies that move the real estate industry forward.'
}, {
  letter: 'R',
  value: 'Reliability',
  description: 'Trust is earned over time, and we guard it fiercely. Bridgefort Homes Development Ltd is a name you can count on—dependable, consistent, and committed to doing right by all stakeholders.'
}, {
  letter: 'I',
  value: 'Integrity',
  description: 'Integrity is the heartbeat of our operations. We do what is right, even when it\'s not convenient. Our word is bond, and we uphold truth in all our dealings.'
}, {
  letter: 'D',
  value: 'Discipline',
  description: 'We run a tight ship. Discipline drives our processes, execution, and decision-making. It ensures we deliver results that meet and surpass expectations.'
}, {
  letter: 'G',
  value: 'Growth Mindset',
  description: 'We see challenges as opportunities. Our hunger to grow—personally and professionally—is relentless. We encourage continuous learning and never settle for the bare minimum.'
}, {
  letter: 'E',
  value: 'Empathy',
  description: 'Real estate is about people first. We listen, we understand, and we serve with compassion. Our solutions are designed with real human needs at the core.'
}, {
  letter: 'F',
  value: 'Flexibility',
  description: 'We understand that one size doesn\'t fit all. Our systems, payment plans, and engagement models are designed to adapt—to the client, to the times, and to changing markets.'
}, {
  letter: 'O',
  value: 'Ownership',
  description: 'We promote the power of ownership—not just of land, but of responsibilities, roles, and results. Our team and clients alike are empowered to take ownership and lead.'
}, {
  letter: 'R',
  value: 'Results-Oriented',
  description: 'Success for us is not in the promises but in the delivery. We measure our impact not just in profits, but in the lives we transform and the legacies we help build.'
}, {
  letter: 'T',
  value: 'Team Spirit',
  description: 'We are one body, many talents. Collaboration is our culture. We win together, fail together, and rise together. Unity is our greatest strength.'
}];
const CoreValues = () => {
  return <section className="section-padding my-0">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">OUR CORE VALUES</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Each letter in BRIDGEFORT HOMES DEVELOPMENT LTD symbolizes the pillars upon which our company stands—principles that guide our actions, influence our culture, and define how we deliver value across the real estate ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreValues.map((value, index) => <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-estate-blue mr-2">{value.letter}</span>
                <h3 className="text-xl font-semibold">– {value.value}</h3>
              </div>
              <p className="text-gray-700">{value.description}</p>
            </div>)}
        </div>
      </div>
    </section>;
};
export default CoreValues;