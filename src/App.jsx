import React, { useState, useEffect } from 'react';
import { Save, History, Eye, Trash2, Shuffle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' 或 'history'
  const [seats, setSeats] = useState(Array(30).fill(''));
  const [historyRecords, setHistoryRecords] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  // 載入歷史紀錄
  useEffect(() => {
    const saved = localStorage.getItem('seatHistory');
    if (saved) setHistoryRecords(JSON.parse(saved));
  }, []);

  // 處理座位輸入
  const handleSeatChange = (index, value) => {
    const newSeats = [...seats];
    newSeats[index] = value;
    setSeats(newSeats);
  };

  // 隨機打亂座位 (測試用功能)
  const shuffleSeats = () => {
    const currentStudents = seats.filter(s => s.trim() !== '');
    if (currentStudents.length === 0) return alert('請先輸入一些學生姓名！');
    
    let shuffled = [...currentStudents].sort(() => Math.random() - 0.5);
    const newSeats = Array(30).fill('');
    for(let i=0; i<shuffled.length; i++){
        newSeats[i] = shuffled[i];
    }
    setSeats(newSeats);
  };

  // 儲存座位並跳轉至歷史紀錄
  const handleSave = () => {
    const record = {
      id: Date.now(),
      date: new Date().toLocaleString('zh-TW'),
      layout: [...seats]
    };
    const newHistory = [record, ...historyRecords];
    setHistoryRecords(newHistory);
    localStorage.setItem('seatHistory', JSON.stringify(newHistory));
    
    // 儲存後自動切換到歷史紀錄頁籤
    setActiveTab('history');
    setPreviewData(null); 
  };

  // 刪除歷史紀錄
  const handleDelete = (id) => {
    const newHistory = historyRecords.filter(record => record.id !== id);
    setHistoryRecords(newHistory);
    localStorage.setItem('seatHistory', JSON.stringify(newHistory));
    if (previewData?.id === id) setPreviewData(null);
  };

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">班級換座位管理系統</h1>

      {/* 頁籤導覽列 */}
      <div className="flex justify-center space-x-4 mb-8">
        <button 
          onClick={() => { setActiveTab('editor'); setPreviewData(null); }}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeTab === 'editor' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow'}`}
        >
          目前的座位安排
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 shadow'}`}
        >
          <History size={18} /> 歷史座位紀錄
        </button>
      </div>

      {/* 內容區塊 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {activeTab === 'editor' ? (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">編輯座位表 (講台在此側)</h2>
              <div className="space-x-3">
                <button onClick={shuffleSeats} className="px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center gap-2 inline-flex">
                  <Shuffle size={16} /> 隨機打亂
                </button>
                <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 inline-flex">
                  <Save size={16} /> 儲存目前座位
                </button>
              </div>
            </div>
            
            {/* 座位網格 (5x6 佈局) */}
            <div className="grid grid-cols-6 gap-4 bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-200">
              {seats.map((student, index) => (
                <input
                  key={index}
                  type="text"
                  value={student}
                  onChange={(e) => handleSeatChange(index, e.target.value)}
                  placeholder={`座位 ${index + 1}`}
                  className="w-full text-center py-3 border rounded shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            {/* 左側：歷史清單 */}
            <div className="w-1/3 border-r pr-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">已儲存的紀錄</h2>
              {historyRecords.length === 0 ? (
                <p className="text-gray-500 text-sm">目前尚無歷史紀錄。</p>
              ) : (
                <ul className="space-y-3">
                  {historyRecords.map(record => (
                    <li key={record.id} className={`p-3 border rounded-lg flex justify-between items-center ${previewData?.id === record.id ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                      <span className="text-sm font-medium text-gray-700">{record.date}</span>
                      <div className="flex gap-2">
                        {/* 眼睛圖示：查看 */}
                        <button onClick={() => setPreviewData(record)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded" title="查看配置">
                          <Eye size={18} />
                        </button>
                        {/* 垃圾桶圖示：刪除 */}
                        <button onClick={() => handleDelete(record.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded" title="刪除">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 右側：預覽畫面 */}
            <div className="w-2/3 pl-2">
              {previewData ? (
                <div>
                   <h2 className="text-xl font-bold text-gray-800 mb-4">預覽：{previewData.date}</h2>
                   <div className="grid grid-cols-6 gap-3 bg-gray-50 p-6 rounded-lg border">
                    {previewData.layout.map((student, index) => (
                      <div key={index} className="w-full text-center py-3 border rounded shadow-sm bg-white text-gray-800 font-medium">
                        {student || '-'}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                  請從左側點擊「眼睛圖示」來預覽座位表
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}