import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export const LenderHelp: React.FC = () => {
  // Engagement: Interactive accordion logic
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // 10 Strictly Lender-Specific FAQs
  const faqs = [
    { q: "How do I verify my institutional status?", a: "Navigate to the dashboard and follow the KYC/AML prompts to upload your corporate charter and proof of accreditation." },
    { q: "What is the minimum deployment amount?", a: "The minimum allocation per facility is typically $50,000, depending on the specific deal terms." },
    { q: "How are target yields calculated?", a: "Yields are net of platform fees and are calculated based on the annualized interest rate of the specific facility." },
    { q: "Are the loans secured?", a: "Yes. All facilities are secured by UCC-1 filings on corporate assets, real estate, or accounts receivable." },
    { q: "How do I withdraw funds from my wallet?", a: "Un-deployed capital can be transferred back to your linked operating account with zero fees. Processing takes 1-3 business days." },
    { q: "What happens if a borrower defaults?", a: "Our dedicated asset recovery team initiates collection protocols, including liquidating collateral, to recover principal." },
    { q: "Can I automate my investments?", a: "Yes. Once verified, you can set algorithmic rules in your settings to auto-deploy capital into deals matching your yield and risk criteria." },
    { q: "How often is the deal flow updated?", a: "The marketplace is updated in real-time as underwriting approves new corporate borrowers." },
    { q: "What tax documents do you provide?", a: "We provide consolidated 1099-INT and K-1 schedules annually, available in your Document center by January 31st." },
    { q: "How do I update my accredited status?", a: "Accreditation must be renewed annually. A prompt will appear in your dashboard 30 days prior to expiration." },
  ];

  return (
    <div className="animate-in fade-in duration-500 flex flex-col md:flex-row gap-10">
      
      {/* FAQ Section */}
      <div className="flex-1">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Help & Support</h1>
          <p className="text-sm text-slate-500">Frequently asked institutional questions.</p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex justify-between items-center p-4 bg-white hover:bg-slate-50 transition-colors text-left"
              >
                <span className="text-sm font-semibold text-slate-800">{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === index ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Minimalist Contact Form (Engagement) */}
      <div className="w-full md:w-80 shrink-0">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sticky top-24">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4">Contact Support</h2>
          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Subject" className="w-full bg-white border border-slate-200 px-3 py-2 text-sm rounded-lg outline-none focus:border-slate-900" />
            <textarea placeholder="How can we assist you?" rows={4} className="w-full bg-white border border-slate-200 px-3 py-2 text-sm rounded-lg outline-none focus:border-slate-900 resize-none"></textarea>
            <button className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};