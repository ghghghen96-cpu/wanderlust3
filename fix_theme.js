const fs = require('fs');
let c = fs.readFileSync('src/pages/Itinerary.jsx', 'utf8');

// 헤더 네브 배경 (다크 -> 밝은)
c = c.replace(
  "bg-[#0f1117] border-b border-white/10 sticky top-[80px] z-40",
  "bg-white border-b border-gray-100 shadow-sm sticky top-[80px] z-40"
);
// 뒤로가기 버튼
c = c.replace(
  "bg-white/10 rounded-xl group-hover:bg-white/20 transition-all",
  "bg-gray-50 rounded-xl group-hover:bg-amber-50 transition-all"
);
// 뒤로가기 아이콘 색상
c = c.replace(
  'className="text-white"/>',
  'className="text-gray-600"/>'
);
// 목적지 제목
c = c.replace(
  "font-extrabold text-xl text-white",
  "font-extrabold text-xl text-gray-900"
);
// 날짜 텍스트
c = c.replace(
  "text-gray-500 flex items-center gap-1.5\">",
  "text-gray-400 flex items-center gap-1.5\">"
);
// 탭 컨테이너 배경
c = c.replace(
  "flex bg-white/10 p-1 rounded-xl",
  "flex bg-gray-100 p-1 rounded-xl"
);
// 활성 탭 - 어두운 텍스트 -> 흰색
c = c.replace(
  "activeTab===tab.id?'bg-amber-400 text-gray-900':'text-gray-400 hover:text-white'",
  "activeTab===tab.id?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-800'"
);
// Publish 버튼 텍스트
c = c.replace(
  "from-amber-400 to-orange-400 text-gray-900 font-black text-xs rounded-xl shadow-lg hover:shadow-xl",
  "from-amber-400 to-orange-400 text-white font-black text-xs rounded-xl shadow-md hover:shadow-lg"
);
// 타임라인 패널 배경 (dark -> light)
c = c.replace(
  "w-[35%] flex flex-col bg-[#13161f] border-r border-white/10 overflow-hidden",
  "w-[35%] flex flex-col bg-gray-50 border-r border-gray-100 overflow-hidden"
);
// 날짜 제목 패널 (dark -> light)
c = c.replace(
  'className="px-4 py-3 border-b border-white/5">',
  'className="px-4 py-3 border-b border-gray-100 bg-white">'
);
c = c.replace(
  'className="text-white font-black text-sm">',
  'className="text-gray-900 font-black text-sm">'
);
c = c.replace(
  'className="text-gray-500 text-xs">',
  'className="text-gray-400 text-xs">'
);

fs.writeFileSync('src/pages/Itinerary.jsx', c, 'utf8');
console.log('Done! Lines replaced.');
