
import React from 'react';

const SubscriptionGuide = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-estate-blue mb-4">How To Subscribe & Purchase</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Follow our simple step-by-step guide to purchase your dream property
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6 md:p-10 shadow-sm">
          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-estate-blue">
              Comprehensive Step-by-Step Guide to Purchasing and Making Payment for Your Preferred Estate
            </h3>
            <p className="text-gray-700 mb-6">
              Purchasing your dream property in one of our premium estates is a seamless and straightforward process. 
              To ensure a smooth transaction, please follow the detailed steps outlined below:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-estate-blue text-white rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <span className="font-bold">1</span>
              </div>
              <h4 className="text-lg font-semibold mb-3 text-estate-blue">Select Your Preferred Estate</h4>
              <p className="text-gray-600">
                Browse through our available estates to identify the one that best suits your needs and preferences. 
                Once you have made your choice, click on the "View Details" button associated with your selected estate. 
                This will provide you with more information about the property and grant you access to the necessary subscription form.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-estate-blue text-white rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <span className="font-bold">2</span>
              </div>
              <h4 className="text-lg font-semibold mb-3 text-estate-blue">Download the Subscription Form</h4>
              <p className="text-gray-600">
                After clicking "View Details," you will find an option to download the official subscription form for 
                your chosen estate. This form is a crucial document required to formalize your interest and proceed with the purchase.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-estate-blue text-white rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <span className="font-bold">3</span>
              </div>
              <h4 className="text-lg font-semibold mb-3 text-estate-blue">Complete the Subscription Form</h4>
              <p className="text-gray-600">
                You have the flexibility to fill out the subscription form in one of two ways:
                <br/><br/>
                <span className="font-medium">• Option 1 (Printed Copy):</span> Print the downloaded form and fill it out neatly in BLOCK LETTERS using a pen.
                <br/>
                <span className="font-medium">• Option 2 (Electronic Fill):</span> Open the PDF file on your device and enter the required details digitally for a faster and paperless process.
                <br/><br/>
                Ensure that all sections of the form are accurately completed to avoid delays in processing your request.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-estate-blue text-white rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <span className="font-bold">4</span>
              </div>
              <h4 className="text-lg font-semibold mb-3 text-estate-blue">Make Payment & Obtain Proof</h4>
              <p className="text-gray-600">
                Proceed to make the required payment for your selected estate through any of our approved payment channels. 
                Once payment is completed, ensure you obtain a valid proof of payment (such as a bank receipt, transaction slip, 
                or payment confirmation notification).
              </p>
            </div>
            
            {/* Step 5 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-estate-blue text-white rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <span className="font-bold">5</span>
              </div>
              <h4 className="text-lg font-semibold mb-3 text-estate-blue">Submit Your Documents</h4>
              <p className="text-gray-600">
                Send the fully completed subscription form (either scanned if handwritten or the filled PDF if done electronically) 
                along with your proof of payment as email attachments to our dedicated sales team at:
                <br/><br/>
                <span className="font-medium">📧 sales@pwanbridgefort.ng</span>
                <br/>
                Subject Line Suggestion: "Estate Subscription & Payment Confirmation – (Your Name)"
              </p>
            </div>
            
            {/* Step 6 */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-estate-blue text-white rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <span className="font-bold">6</span>
              </div>
              <h4 className="text-lg font-semibold mb-3 text-estate-blue">Receive Your Payment Receipt</h4>
              <p className="text-gray-600">
                Upon receiving your submission, our team will verify the details and process your payment. 
                Once confirmed, an official payment receipt will be generated and sent to you via email for your records.
              </p>
            </div>
          </div>
          
          <div className="mt-10 bg-estate-blue bg-opacity-10 p-6 rounded-lg">
            <h4 className="text-lg font-semibold mb-4 text-estate-blue">Need Assistance?</h4>
            <p className="text-gray-700 mb-4">
              If you encounter any challenges during this process or require further clarification, 
              our customer support team is always ready to assist you. Feel free to reach out for guidance 
              at any stage of your purchase journey.
            </p>
            <p className="text-gray-700 font-medium">
              Congratulations on taking this exciting step toward owning a property in one of our exquisite estates! 
              We look forward to welcoming you as a valued homeowner. 🏡✨
            </p>
            
            <div className="mt-6 bg-white p-4 rounded-lg">
              <h5 className="font-semibold mb-2 text-estate-blue">Contact:</h5>
              <p className="text-gray-700">📞 Sales Hotline: +234 803 062 4059</p>
              <p className="text-gray-700">📧 Email: sales@pwanbridgefort.ng</p>
            </div>
            
            <p className="mt-4 text-gray-700 font-medium">
              Thank you for choosing us as your trusted real estate partner!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionGuide;
