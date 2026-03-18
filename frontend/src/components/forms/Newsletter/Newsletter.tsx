import { useState } from 'react';
import { Calendar, Mail, Edit2 } from 'lucide-react';

export function Newsletter() {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [sections, setSections] = useState({
    headline: '',
    mainStory: '',
    updates1: '',
    updates2: '',
    updates3: '',
    spotlight: '',
    announcement: '',
    events: '',
    tips: '',
    closing: ''
  });

  const handleSectionChange = (section: string, value: string) => {
    setSections(prev => ({ ...prev, [section]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-8 h-8" />
              <h1 className="text-3xl">Monthly Newsletter</h1>
            </div>
            <Edit2 className="w-5 h-5" />
          </div>
          
          <div className="flex gap-4 items-center">
            <Calendar className="w-5 h-5" />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-3 py-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="text"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="px-3 py-2 rounded bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 w-24"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Headline */}
          <div className="border-l-4 border-blue-600 pl-4">
            <label className="block text-sm text-gray-600 mb-2">Featured Headline</label>
            <textarea
              value={sections.headline}
              onChange={(e) => handleSectionChange('headline', e.target.value)}
              placeholder="Write your main headline here..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
            />
          </div>

          {/* Main Story */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <label className="block text-sm text-gray-600 mb-2">Main Story</label>
            <textarea
              value={sections.mainStory}
              onChange={(e) => handleSectionChange('mainStory', e.target.value)}
              placeholder="Write your main story content here..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-y"
            />
          </div>

          {/* Updates Grid */}
          <div>
            <h2 className="text-xl mb-4">Monthly Updates</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Update 1</label>
                <textarea
                  value={sections.updates1}
                  onChange={(e) => handleSectionChange('updates1', e.target.value)}
                  placeholder="First update..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Update 2</label>
                <textarea
                  value={sections.updates2}
                  onChange={(e) => handleSectionChange('updates2', e.target.value)}
                  placeholder="Second update..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Update 3</label>
                <textarea
                  value={sections.updates3}
                  onChange={(e) => handleSectionChange('updates3', e.target.value)}
                  placeholder="Third update..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
                />
              </div>
            </div>
          </div>

          {/* Spotlight Section */}
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <label className="block text-sm text-gray-600 mb-2">Spotlight</label>
            <textarea
              value={sections.spotlight}
              onChange={(e) => handleSectionChange('spotlight', e.target.value)}
              placeholder="Highlight someone or something special this month..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
            />
          </div>

          {/* Two Column Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Important Announcement</label>
              <textarea
                value={sections.announcement}
                onChange={(e) => handleSectionChange('announcement', e.target.value)}
                placeholder="Share important news..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Upcoming Events</label>
              <textarea
                value={sections.events}
                onChange={(e) => handleSectionChange('events', e.target.value)}
                placeholder="List upcoming events..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
              />
            </div>
          </div>

          {/* Tips & Tricks */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <label className="block text-sm text-gray-600 mb-2">Tips & Tricks</label>
            <textarea
              value={sections.tips}
              onChange={(e) => handleSectionChange('tips', e.target.value)}
              placeholder="Share helpful tips..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
            />
          </div>

          {/* Closing Note */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Closing Note</label>
            <textarea
              value={sections.closing}
              onChange={(e) => handleSectionChange('closing', e.target.value)}
              placeholder="Write a closing message..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-6 text-center text-gray-600">
          <p>© {year || new Date().getFullYear()} • Monthly Newsletter</p>
        </div>
      </div>
    </div>
  );
}
