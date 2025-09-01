import React from 'react';
interface Buy2SellIntroProps {
  isLoaded: boolean;
}
const Buy2SellIntro = ({
  isLoaded
}: Buy2SellIntroProps) => {
  return <section className="section-padding bg-white">
      <div className="container-custom">
        <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-estate-blue">What is Buy and Resell?</h2>
          <div className="w-20 h-1 bg-estate-red mx-auto mb-8"></div>
          <p className="text-lg text-gray-900 mb-8 leading-relaxed">
            <a className="text-gray-900">Buy and Resell is PWAN Bridgefort's innovative land trading program that guarantees your profit. When you purchase land through our Buy and Resell program, we commit to buying it back from you at a predetermined higher price within 12 months. This gives you the security of guaranteed profit while benefiting from real estate appreciation.</a>
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-estate-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-estate-blue">Purchase</h3>
              <p className="text-gray-600">Buy land through our Buy and Resell program with flexible payment options</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-estate-red rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-estate-blue">Hold</h3>
              <p className="text-gray-600">Keep your investment secure for the agreed period (up to 24 months)</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-estate-blue">Profit</h3>
              <p className="text-gray-600">Sell back to us at the guaranteed higher price and enjoy your profit</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Buy2SellIntro;