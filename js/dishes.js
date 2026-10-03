// Dữ liệu món ăn. Giá là ước tính tham khảo (VND), tính cho 1 người / 1 bữa.
// pool: nhóm món dùng chung cho các bữa (xem SLOTS).
// protein: nguồn đạm chính — dùng để tránh trưa và tối trùng nhau.
// ing: nguyên liệu cần mua (gộp lại thành danh sách đi chợ).
// spice: gia vị nên có sẵn trong bếp.
// prep: việc cần làm từ hôm trước.

export const SLOTS = [
  { id: 'sang', short: 'Sáng', name: 'Bữa sáng', time: '7:00', pool: 'sang' },
  { id: 'trua', short: 'Trưa', name: 'Bữa trưa', time: '12:00', pool: 'chinh' },
  { id: 'phu', short: 'Chiều', name: 'Bữa phụ chiều', time: '15:30', pool: 'phu' },
  { id: 'toi', short: 'Tối', name: 'Bữa tối', time: '19:00', pool: 'chinh' },
  { id: 'khuya', short: 'Khuya', name: 'Trước khi ngủ', time: '21:30', pool: 'khuya' },
];

export const POOLS = {
  sang: { name: 'Bữa sáng', min: 3 },
  chinh: { name: 'Bữa chính (trưa & tối)', min: 4 },
  phu: { name: 'Bữa phụ chiều', min: 2 },
  khuya: { name: 'Trước khi ngủ', min: 2 },
};

export const DISHES = [
  // ---------- Bữa sáng ----------
  {
    id: 'yen-mach-sua-chuoi', pool: 'sang', emoji: '🥣',
    name: 'Yến mạch nấu sữa, chuối & bơ đậu phộng',
    minutes: 7, cost: 20000, protein: 'sua',
    ing: [['Yến mạch', 60, 'g'], ['Sữa tươi', 250, 'ml'], ['Chuối', 1, 'quả'], ['Bơ đậu phộng', 15, 'g']],
    spice: [],
    steps: [
      'Cho yến mạch và sữa vào nồi nhỏ, đun lửa nhỏ 3–4 phút, khuấy đều tới khi sệt.',
      'Cắt chuối thành lát, xếp lên trên.',
      'Thêm 1 muỗng bơ đậu phộng, khuấy nhẹ rồi ăn nóng.',
    ],
  },
  {
    id: 'banh-mi-op-la', pool: 'sang', emoji: '🍳',
    name: 'Bánh mì ốp la 2 trứng + ly sữa',
    minutes: 8, cost: 22000, protein: 'trung',
    ing: [['Bánh mì', 1, 'ổ'], ['Trứng gà', 2, 'quả'], ['Sữa tươi', 250, 'ml']],
    spice: ['Dầu ăn', 'Nước tương', 'Tiêu'],
    steps: [
      'Làm nóng chảo với chút dầu, đập 2 trứng vào, chiên lửa vừa tới khi lòng trắng chín.',
      'Rưới chút nước tương, rắc tiêu.',
      'Ăn kèm bánh mì và 1 ly sữa.',
    ],
  },
  {
    id: 'khoai-trung-luoc', pool: 'sang', emoji: '🍠',
    name: 'Khoai lang luộc + 2 trứng luộc + sữa',
    minutes: 20, cost: 23000, protein: 'trung',
    ing: [['Khoai lang', 300, 'g'], ['Trứng gà', 2, 'quả'], ['Sữa tươi', 250, 'ml']],
    spice: [],
    steps: [
      'Rửa khoai, cho khoai và trứng vào chung một nồi nước.',
      'Vớt trứng ra sau 9 phút; luộc khoai thêm khoảng 10 phút tới khi xiên đũa qua dễ.',
      'Ăn kèm 1 ly sữa.',
    ],
    tip: 'Luộc sẵn 3–4 củ một lần, để tủ lạnh ăn được 3 ngày, sáng chỉ cần hâm lại.',
  },
  {
    id: 'chao-yen-mach-trung', pool: 'sang', emoji: '🥚',
    name: 'Cháo yến mạch trứng hành (mặn)',
    minutes: 8, cost: 15000, protein: 'trung',
    ing: [['Yến mạch', 60, 'g'], ['Trứng gà', 2, 'quả'], ['Hành lá', 1, 'nhánh']],
    spice: ['Nước mắm', 'Tiêu'],
    steps: [
      'Nấu yến mạch với 400ml nước, lửa vừa khoảng 3 phút.',
      'Đập trứng vào, khuấy nhanh cho trứng chín thành sợi.',
      'Nêm nước mắm, rắc hành lá cắt nhỏ và tiêu.',
    ],
  },
  {
    id: 'banh-mi-bo-dau-phong', pool: 'sang', emoji: '🍌',
    name: 'Bánh mì bơ đậu phộng chuối + sữa',
    minutes: 3, cost: 22000, protein: 'sua',
    ing: [['Bánh mì', 1, 'ổ'], ['Bơ đậu phộng', 30, 'g'], ['Chuối', 1, 'quả'], ['Sữa tươi', 250, 'ml']],
    spice: [],
    steps: [
      'Nướng sơ bánh mì cho giòn (chảo không dầu hoặc nồi chiên).',
      'Phết 2 muỗng bơ đậu phộng, kẹp chuối cắt lát.',
      'Ăn kèm 1 ly sữa.',
    ],
  },
  {
    id: 'overnight-oats', pool: 'sang', emoji: '🫙',
    name: 'Yến mạch ngâm qua đêm (overnight oats)',
    minutes: 3, cost: 18000, protein: 'sua',
    ing: [['Yến mạch', 60, 'g'], ['Sữa tươi', 200, 'ml'], ['Bơ đậu phộng', 15, 'g'], ['Chuối', 1, 'quả']],
    spice: [],
    prep: 'Tối nay trộn yến mạch + sữa + bơ đậu phộng vào hũ, để tủ lạnh cho bữa sáng.',
    steps: [
      'Tối hôm trước: trộn yến mạch, sữa và bơ đậu phộng trong hũ có nắp, để tủ lạnh.',
      'Sáng: cắt chuối lên trên, ăn lạnh luôn — không cần nấu.',
    ],
  },
  {
    id: 'pancake-chuoi', pool: 'sang', emoji: '🥞',
    name: 'Bánh chuối yến mạch áp chảo + sữa',
    minutes: 15, cost: 22000, protein: 'trung',
    ing: [['Chuối', 2, 'quả'], ['Trứng gà', 2, 'quả'], ['Yến mạch', 50, 'g'], ['Sữa tươi', 250, 'ml']],
    spice: ['Dầu ăn'],
    steps: [
      'Dằm nhuyễn chuối, đập trứng vào, thêm yến mạch, trộn đều (không cần bột mì).',
      'Chảo chống dính lửa nhỏ, quét chút dầu, múc từng vá nhỏ.',
      'Chiên mỗi mặt khoảng 2 phút tới khi vàng. Ăn kèm 1 ly sữa.',
    ],
  },

  // ---------- Bữa chính (trưa & tối) ----------
  {
    id: 'uc-ga-ap-chao', pool: 'chinh', emoji: '🍗',
    name: 'Cơm ức gà áp chảo + rau luộc',
    minutes: 25, cost: 30000, protein: 'ga',
    ing: [['Ức gà', 200, 'g'], ['Gạo', 120, 'g'], ['Rau cải', 200, 'g']],
    spice: ['Muối', 'Tiêu', 'Tỏi', 'Dầu ăn'],
    prep: 'Lấy ức gà từ ngăn đá xuống ngăn mát để rã đông.',
    steps: [
      'Đập dẹt ức gà cho dày đều, ướp muối, tiêu, tỏi băm 10 phút.',
      'Áp chảo lửa vừa với chút dầu, mỗi mặt 5–6 phút. Để nghỉ 3 phút rồi cắt lát.',
      'Luộc rau cải, giữ nước luộc làm canh.',
    ],
    tip: 'Đập dẹt là mẹo để ức gà chín đều, không bị khô.',
  },
  {
    id: 'ga-kho-gung', pool: 'chinh', emoji: '🫚',
    name: 'Cơm gà kho gừng',
    minutes: 30, cost: 28000, protein: 'ga',
    ing: [['Ức gà', 200, 'g'], ['Gừng', 1, 'nhánh'], ['Gạo', 120, 'g']],
    spice: ['Nước mắm', 'Đường', 'Tiêu', 'Hành tím', 'Dầu ăn'],
    prep: 'Lấy ức gà từ ngăn đá xuống ngăn mát để rã đông.',
    steps: [
      'Cắt gà miếng vuông, ướp 1 muỗng nước mắm, ½ muỗng đường, tiêu 15 phút.',
      'Phi thơm hành tím và gừng thái sợi, cho gà vào xào săn.',
      'Thêm 3–4 muỗng nước, kho lửa nhỏ 10 phút tới khi nước sệt lại.',
    ],
    tip: 'Kho gấp đôi, phần còn lại để tủ lạnh ăn trong 2 ngày.',
  },
  {
    id: 'ga-xao-sa-ot', pool: 'chinh', emoji: '🌶️',
    name: 'Cơm gà xào sả ớt',
    minutes: 20, cost: 28000, protein: 'ga',
    ing: [['Ức gà', 200, 'g'], ['Sả', 2, 'cây'], ['Gạo', 120, 'g']],
    spice: ['Nước mắm', 'Đường', 'Ớt', 'Tỏi', 'Dầu ăn'],
    prep: 'Lấy ức gà từ ngăn đá xuống ngăn mát để rã đông.',
    steps: [
      'Thái gà miếng mỏng, ướp nước mắm, chút đường 10 phút. Băm nhỏ sả, ớt, tỏi.',
      'Phi sả tỏi tới vàng thơm, cho gà vào xào lửa lớn 5–6 phút.',
      'Nêm lại vừa ăn, thêm ớt, đảo đều rồi tắt bếp.',
    ],
  },
  {
    id: 'dau-hu-sot-ca', pool: 'chinh', emoji: '🍅',
    name: 'Cơm đậu hũ sốt cà chua + trứng chiên',
    minutes: 20, cost: 20000, protein: 'dau',
    ing: [['Đậu hũ', 2, 'miếng'], ['Cà chua', 2, 'quả'], ['Trứng gà', 1, 'quả'], ['Gạo', 120, 'g']],
    spice: ['Nước mắm', 'Đường', 'Hành lá', 'Dầu ăn'],
    steps: [
      'Cắt đậu hũ miếng vừa, chiên vàng các mặt.',
      'Xào cà chua băm với chút dầu tới nhừ, nêm nước mắm và chút đường.',
      'Cho đậu vào, rim 3–4 phút cho thấm. Chiên thêm 1 quả trứng ăn kèm.',
    ],
  },
  {
    id: 'trung-chien-canh-rau', pool: 'chinh', emoji: '🥬',
    name: 'Cơm trứng chiên hành + canh rau',
    minutes: 15, cost: 18000, protein: 'trung',
    ing: [['Trứng gà', 3, 'quả'], ['Hành lá', 1, 'nhánh'], ['Rau cải', 200, 'g'], ['Gạo', 120, 'g']],
    spice: ['Nước mắm', 'Tiêu', 'Dầu ăn'],
    steps: [
      'Đánh tan 3 trứng với hành lá cắt nhỏ, chút nước mắm, tiêu.',
      'Chiên lửa vừa, gập đôi khi mặt dưới vàng.',
      'Đun sôi nước, cho rau vào, nêm muối/nước mắm là có canh.',
    ],
  },
  {
    id: 'com-chien-trung-ga', pool: 'chinh', emoji: '🍚',
    name: 'Cơm chiên trứng ức gà',
    minutes: 20, cost: 22000, protein: 'ga',
    ing: [['Gạo', 120, 'g'], ['Trứng gà', 2, 'quả'], ['Ức gà', 100, 'g'], ['Hành lá', 1, 'nhánh']],
    spice: ['Nước mắm', 'Tiêu', 'Tỏi', 'Dầu ăn'],
    prep: 'Nấu dư cơm từ hôm trước — cơm nguội chiên mới ngon.',
    steps: [
      'Thái hạt lựu ức gà, xào chín với tỏi rồi để riêng.',
      'Phi tỏi, cho cơm nguội vào đảo tơi, đập trứng vào đảo nhanh.',
      'Cho gà vào, nêm nước mắm, tiêu, rắc hành lá.',
    ],
  },
  {
    id: 'bun-bo', pool: 'chinh', emoji: '🍜', outside: true,
    name: 'Bún bò (ăn ngoài)',
    minutes: 0, cost: 45000, protein: 'bo',
    ing: [], spice: [],
    steps: ['Ra quán gần nhà — đổi gió, không phải nấu.'],
    tip: 'Gọi tô đặc biệt hoặc thêm chả/giò để có thêm đạm.',
  },
  {
    id: 'com-tam', pool: 'chinh', emoji: '🥩', outside: true,
    name: 'Cơm tấm sườn bì chả (ăn ngoài)',
    minutes: 0, cost: 40000, protein: 'heo',
    ing: [], spice: [],
    steps: ['Ra quán cơm tấm quen.'],
    tip: 'Gọi thêm 1 trứng ốp la và xin thêm cơm — rẻ mà thêm năng lượng.',
  },
  {
    id: 'dau-hu-chien-sa', pool: 'chinh', emoji: '🧈',
    name: 'Cơm đậu hũ chiên sả + trứng luộc',
    minutes: 20, cost: 18000, protein: 'dau',
    ing: [['Đậu hũ', 2, 'miếng'], ['Sả', 2, 'cây'], ['Trứng gà', 1, 'quả'], ['Gạo', 120, 'g']],
    spice: ['Muối', 'Ớt', 'Dầu ăn'],
    steps: [
      'Cắt đậu hũ miếng vuông, thấm khô, chiên vàng giòn.',
      'Phi sả băm và ớt cho thơm, cho đậu vào đảo, nêm chút muối.',
      'Luộc thêm 1 quả trứng ăn kèm.',
    ],
  },
  {
    id: 'ga-xe-hanh-phi', pool: 'chinh', emoji: '🧅',
    name: 'Cơm gà xé trộn hành phi',
    minutes: 25, cost: 27000, protein: 'ga',
    ing: [['Ức gà', 200, 'g'], ['Gừng', 1, 'nhánh'], ['Rau răm', 1, 'bó'], ['Gạo', 120, 'g']],
    spice: ['Hành tím', 'Nước mắm', 'Đường', 'Chanh', 'Dầu ăn'],
    prep: 'Lấy ức gà từ ngăn đá xuống ngăn mát để rã đông.',
    steps: [
      'Luộc ức gà với vài lát gừng 15 phút, ngâm nước lạnh rồi xé sợi.',
      'Phi hành tím vàng giòn, giữ lại dầu hành.',
      'Trộn gà với dầu hành, nước mắm, chút đường, chanh, rau răm.',
    ],
  },
  {
    id: 'canh-dau-hu-trung', pool: 'chinh', emoji: '🍲',
    name: 'Cơm + canh đậu hũ trứng cà chua',
    minutes: 15, cost: 17000, protein: 'dau',
    ing: [['Đậu hũ', 1, 'miếng'], ['Trứng gà', 2, 'quả'], ['Cà chua', 1, 'quả'], ['Gạo', 120, 'g']],
    spice: ['Nước mắm', 'Hành lá', 'Dầu ăn'],
    steps: [
      'Xào cà chua với chút dầu, thêm 500ml nước, đun sôi.',
      'Cho đậu hũ cắt miếng vào nấu 3 phút.',
      'Đánh tan trứng, đổ từ từ vào nồi, khuấy nhẹ. Nêm nước mắm, rắc hành.',
    ],
  },
  {
    id: 'mi-xao-ga', pool: 'chinh', emoji: '🍝',
    name: 'Mì xào ức gà rau cải',
    minutes: 15, cost: 25000, protein: 'ga',
    ing: [['Mì gói', 2, 'gói'], ['Ức gà', 150, 'g'], ['Rau cải', 150, 'g']],
    spice: ['Nước tương', 'Tỏi', 'Dầu ăn'],
    prep: 'Lấy ức gà từ ngăn đá xuống ngăn mát để rã đông.',
    steps: [
      'Trụng mì cho mềm, xả nước lạnh, để ráo (bỏ gói gia vị hoặc dùng một nửa).',
      'Phi tỏi, xào gà thái mỏng tới chín, cho rau vào đảo.',
      'Cho mì vào, thêm nước tương, đảo đều lửa lớn 2 phút.',
    ],
  },
  {
    id: 'ga-sot-bo-dau-phong', pool: 'chinh', emoji: '🥜',
    name: 'Cơm gà sốt bơ đậu phộng',
    minutes: 20, cost: 32000, protein: 'ga',
    ing: [['Ức gà', 200, 'g'], ['Bơ đậu phộng', 30, 'g'], ['Rau cải', 150, 'g'], ['Gạo', 120, 'g']],
    spice: ['Nước tương', 'Đường', 'Tỏi', 'Dầu ăn'],
    prep: 'Lấy ức gà từ ngăn đá xuống ngăn mát để rã đông.',
    steps: [
      'Pha sốt: 2 muỗng bơ đậu phộng + 1 muỗng nước tương + chút đường + 3 muỗng nước ấm.',
      'Xào gà thái miếng với tỏi tới chín.',
      'Đổ sốt vào, đảo 1–2 phút cho sệt bám đều. Ăn kèm rau luộc.',
    ],
  },
  {
    id: 'trung-chung-thit', pool: 'chinh', emoji: '🥘',
    name: 'Cơm trứng chưng thịt bằm',
    minutes: 25, cost: 22000, protein: 'heo',
    ing: [['Trứng gà', 2, 'quả'], ['Thịt heo xay', 100, 'g'], ['Hành lá', 1, 'nhánh'], ['Gạo', 120, 'g']],
    spice: ['Nước mắm', 'Tiêu'],
    steps: [
      'Trộn thịt xay, trứng, hành lá, nước mắm, tiêu trong chén.',
      'Đặt chén lên xửng nồi cơm điện khi cơm vừa sôi — cơm chín là trứng cũng chín.',
      'Hoặc hấp cách thủy 15–20 phút.',
    ],
    tip: 'Món "một nồi" — tiết kiệm thời gian và chén bát.',
  },

  // ---------- Bữa phụ chiều ----------
  {
    id: 'sinh-to-chuoi', pool: 'phu', emoji: '🥤',
    name: 'Sinh tố chuối, sữa, bơ đậu phộng, yến mạch',
    minutes: 5, cost: 20000, protein: 'sua',
    ing: [['Chuối', 1, 'quả'], ['Sữa tươi', 250, 'ml'], ['Bơ đậu phộng', 20, 'g'], ['Yến mạch', 30, 'g']],
    spice: [],
    steps: [
      'Cho tất cả vào máy xay, xay 30 giây.',
      'Không có máy xay: dằm nhuyễn chuối, khuấy với bơ đậu phộng rồi lắc với sữa và yến mạch.',
    ],
    tip: 'Uống được nhiều mà không thấy no căng — rất hợp người khó ăn.',
  },
  {
    id: 'khoai-sua', pool: 'phu', emoji: '🍠',
    name: 'Khoai lang + ly sữa',
    minutes: 20, cost: 16000, protein: 'sua',
    ing: [['Khoai lang', 250, 'g'], ['Sữa tươi', 250, 'ml']],
    spice: [],
    steps: ['Luộc hoặc nướng khoai (nồi chiên 180°C, 25 phút). Ăn kèm 1 ly sữa.'],
  },
  {
    id: 'banh-mi-bdp-chieu', pool: 'phu', emoji: '🥪',
    name: 'Bánh mì bơ đậu phộng',
    minutes: 3, cost: 13000, protein: 'dau',
    ing: [['Bánh mì', 1, 'ổ'], ['Bơ đậu phộng', 30, 'g']],
    spice: [],
    steps: ['Phết 2 muỗng bơ đậu phộng lên bánh mì. Mang theo đi làm/đi học được.'],
  },
  {
    id: 'trung-luoc-chuoi', pool: 'phu', emoji: '🥚',
    name: '2 trứng luộc + 2 quả chuối',
    minutes: 10, cost: 12000, protein: 'trung',
    ing: [['Trứng gà', 2, 'quả'], ['Chuối', 2, 'quả']],
    spice: ['Muối', 'Tiêu'],
    steps: ['Luộc trứng 9 phút, chấm muối tiêu. Ăn kèm chuối.'],
    tip: 'Luộc sẵn 6 quả một lần, để tủ lạnh dùng trong 5 ngày.',
  },
  {
    id: 'tau-hu-gung', pool: 'phu', emoji: '🍮',
    name: 'Tàu hũ nước đường gừng + chuối',
    minutes: 10, cost: 14000, protein: 'dau',
    ing: [['Đậu hũ non', 1, 'hộp'], ['Gừng', 1, 'nhánh'], ['Chuối', 1, 'quả']],
    spice: ['Đường'],
    steps: [
      'Nấu nước đường với gừng đập dập khoảng 5 phút.',
      'Hấp nóng đậu hũ non (hoặc ngâm cả hộp vào nước nóng), chan nước đường gừng.',
    ],
  },
  {
    id: 'ngu-coc-yen-mach', pool: 'phu', emoji: '🥛',
    name: 'Yến mạch + sữa lạnh + chuối',
    minutes: 2, cost: 16000, protein: 'sua',
    ing: [['Yến mạch', 50, 'g'], ['Sữa tươi', 250, 'ml'], ['Chuối', 1, 'quả']],
    spice: [],
    steps: ['Đổ sữa lạnh vào yến mạch như ăn ngũ cốc, cắt chuối lên trên.'],
  },

  // ---------- Trước khi ngủ ----------
  {
    id: 'sua-am', pool: 'khuya', emoji: '🥛',
    name: 'Ly sữa ấm',
    minutes: 2, cost: 9000, protein: 'sua',
    ing: [['Sữa tươi', 250, 'ml']],
    spice: [],
    steps: ['Hâm nóng sữa (lò vi sóng 1 phút) và uống từ từ.'],
  },
  {
    id: 'sua-bdp', pool: 'khuya', emoji: '🥜',
    name: 'Sữa khuấy bơ đậu phộng',
    minutes: 3, cost: 13000, protein: 'sua',
    ing: [['Sữa tươi', 250, 'ml'], ['Bơ đậu phộng', 15, 'g']],
    spice: [],
    steps: ['Hâm ấm sữa, khuấy tan 1 muỗng bơ đậu phộng.'],
  },
  {
    id: 'chuoi-sua', pool: 'khuya', emoji: '🍌',
    name: 'Chuối + ly sữa',
    minutes: 1, cost: 12000, protein: 'sua',
    ing: [['Chuối', 1, 'quả'], ['Sữa tươi', 250, 'ml']],
    spice: [],
    steps: ['Không cần làm gì — ăn chuối, uống sữa.'],
  },
  {
    id: 'yen-mach-am', pool: 'khuya', emoji: '🥣',
    name: 'Chén nhỏ yến mạch sữa ấm',
    minutes: 4, cost: 11000, protein: 'sua',
    ing: [['Yến mạch', 30, 'g'], ['Sữa tươi', 200, 'ml']],
    spice: [],
    steps: ['Cho yến mạch và sữa vào chén, quay lò vi sóng 1,5 phút hoặc nấu nhanh 2 phút.'],
  },
];

export const DISH_BY_ID = Object.fromEntries(DISHES.map((d) => [d.id, d]));
