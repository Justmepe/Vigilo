import logo from 'figma:asset/1bcebbebdeca114bb54a8da607b649cd40cadd65.png';

export function CompanyHeader() {
  return (
    <div className="bg-white border-b-4 border-black mb-6">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center">
          <img src={logo} alt="Silver Bay Seafoods" className="h-20 mb-4" />
          <h1 className="text-slate-900 text-center">Silver Bay Seafoods</h1>
          <div className="bg-black text-white px-8 py-2 mt-2 w-full text-center">
            <h2 className="text-white">EMPLOYEE-Injury/Illness Report</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
