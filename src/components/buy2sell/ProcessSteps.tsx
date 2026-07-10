import React from 'react';
import { FileText, CreditCard, Send } from 'lucide-react';
interface ProcessStepsProps {
  isLoaded: boolean;
}
const ProcessSteps: React.FC<ProcessStepsProps> = ({
  isLoaded
}) => {
  const processSteps = [{
    title: "Client Documentation",
    description: "Understand the form by clearly reading through, after which you pick an estate then choose what subscription plan is suitable for you and then you download and fill the form.",
    icon: FileText,
    reward: "Contract of sale"
  }, {
    title: "Making Payments",
    description: "All our account numbers will be provided with the name PWAN GROUP LIMITED for Payments. You can pay through bank transfers with your mobile phone or cash deposit at the banks.",
    icon: CreditCard,
    reward: "Official Receipt"
  }, {
    title: "Submission",
    description: "Attach your evidence of payment (physical or emailed copy) and submit at the office, attaching your valid form of identity and bring to the office.",
    icon: Send,
    reward: "Post Dated Cheque"
  }];
  return <section className="py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">YOU CAN START EARNING THROUGH 3 EASY STEPS</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">How do I start trading?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {processSteps.map((step, index) => <div key={index} className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{
          animationDelay: `${index * 200}ms`
        }}>
              <div className="flex flex-col items-center text-center">
                <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <step.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <div className="bg-green-50 px-4 py-2 rounded-full">
                  <p className="text-green-700 font-semibold">Reward: {step.reward}</p>
                </div>
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default ProcessSteps;