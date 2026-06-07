export interface LocationItem {
  locationId: string;
  name: string;
  address: string;
  description: string;
  imageUrl: string;
  category: string;
}

export const ALL_LOCATIONS: LocationItem[] = [
  { locationId: "1",  name: "Phở Thìn",              address: "Hà Nội",        category: "F&B",                imageUrl: "https://picsum.photos/seed/phothin/800/500",    description: "Tô phở bò trứ danh hơn 50 năm tuổi, nước dùng trong vắt đậm vị, thịt bò tái mềm tan." },
  { locationId: "2",  name: "Bún Bò Huế Mụ Rựa",    address: "Huế",           category: "F&B",                imageUrl: "https://picsum.photos/seed/bunbohue/800/500",   description: "Bún bò cay nồng đặc trưng xứ Huế, nước lèo sả ớt thơm lừng, huyết heo giòn sần sật." },
  { locationId: "3",  name: "Cà Phê Trứng Giảng",   address: "Hà Nội",        category: "F&B",                imageUrl: "https://picsum.photos/seed/caphetrung/800/500", description: "Ly cà phê trứng béo ngậy sáng tạo từ 1946, uống nóng trong không gian gác xép cổ kính." },
  { locationId: "4",  name: "Sân Golf Đà Lạt",       address: "Lâm Đồng",     category: "Thể thao",           imageUrl: "https://picsum.photos/seed/golfdalat/800/500",  description: "Sân golf 18 lỗ giữa thông xanh và sương mù cao nguyên, view đẹp bậc nhất Đông Nam Á." },
  { locationId: "5",  name: "Khu Leo Núi Fansipan",  address: "Lào Cai",       category: "Thể thao",           imageUrl: "https://picsum.photos/seed/fansipan/800/500",   description: "Chinh phục nóc nhà Đông Dương 3,143m — thử thách trekking đỉnh cao cho mọi phượt thủ." },
  { locationId: "6",  name: "Lướt Sóng Mũi Né",     address: "Bình Thuận",    category: "Thể thao",           imageUrl: "https://picsum.photos/seed/surfmuine/800/500",  description: "Bãi biển lướt ván diều hàng đầu châu Á, gió lớn ổn định quanh năm, sóng đẹp cho mọi trình độ." },
  { locationId: "7",  name: "Vinpearl Land",          address: "Nha Trang",     category: "Dịch vụ giải trí",   imageUrl: "https://picsum.photos/seed/vinpearl/800/500",   description: "Khu vui chơi đảo ngọc quy mô lớn nhất Việt Nam với công viên nước, game và show diễn đỉnh cao." },
  { locationId: "8",  name: "Sun World Ba Na Hills",  address: "Đà Nẵng",      category: "Dịch vụ giải trí",   imageUrl: "https://picsum.photos/seed/banahills/800/500",  description: "Cầu Vàng nổi tiếng thế giới, làng Pháp cổ trên đỉnh mây và cáp treo kỷ lục Guinness." },
  { locationId: "9",  name: "Escape Room Hà Nội",    address: "Hà Nội",        category: "Dịch vụ giải trí",   imageUrl: "https://picsum.photos/seed/escaperoom/800/500", description: "Phòng trốn thoát kịch tính theo chủ đề kinh dị và trinh thám, thử thách trí tuệ nhóm." },
  { locationId: "10", name: "InterContinental Phú Quốc", address: "Kiên Giang", category: "Dịch vụ lưu trú",  imageUrl: "https://picsum.photos/seed/intercontinental/800/500", description: "Resort 5 sao trên bãi Kem xanh ngọc, bể bơi vô cực nhìn ra Vịnh Thái Lan, spa đẳng cấp quốc tế." },
  { locationId: "11", name: "Mia Resort Nha Trang",  address: "Khánh Hoà",     category: "Dịch vụ lưu trú",   imageUrl: "https://picsum.photos/seed/miaresort/800/500",  description: "Boutique resort ven biển thiết kế xanh mướt, bungalow riêng tư, ẩm thực fusion tươi ngon." },
  { locationId: "12", name: "Hội An Historic Hotel", address: "Quảng Nam",     category: "Dịch vụ lưu trú",   imageUrl: "https://picsum.photos/seed/hoianhotel/800/500", description: "Khách sạn 4 sao ngay trung tâm phố cổ, kiến trúc Việt truyền thống, hồ bơi và spa thư giãn." },
  { locationId: "13", name: "Bảo Tàng Điêu Khắc Chăm", address: "Đà Nẵng",   category: "Khác",               imageUrl: "https://picsum.photos/seed/chammuseum/800/500", description: "Bộ sưu tập điêu khắc Chăm Pa lớn nhất thế giới, kiến trúc Pháp thuộc độc đáo, yên tĩnh và đậm văn hoá." },
  { locationId: "14", name: "Làng Gốm Bát Tràng",   address: "Hà Nội",        category: "Khác",               imageUrl: "https://picsum.photos/seed/battrang/800/500",   description: "Làng nghề gốm sứ 700 năm tuổi, trải nghiệm tự tay nặn gốm và chọn mua đồ thủ công đặc sắc." },
  { locationId: "15", name: "Chợ Đêm Đà Lạt",       address: "Lâm Đồng",     category: "Khác",               imageUrl: "https://picsum.photos/seed/chodemlat/800/500",  description: "Khu chợ đêm sôi động nhất Đà Lạt, ẩm thực đường phố, hàng thủ công và không khí se lạnh đặc trưng." },
  { locationId: "16", name: "Bánh Mì Phượng",        address: "Quảng Nam",     category: "F&B",                imageUrl: "https://picsum.photos/seed/banhmi/800/500",     description: "Ổ bánh mì Hội An được Anthony Bourdain khen ngợi — nhân đa dạng, vỏ giòn rụm, hương vị không nơi nào sánh được." },
  { locationId: "17", name: "Công Viên Nước Đầm Sen", address: "TP. HCM",     category: "Dịch vụ giải trí",   imageUrl: "https://picsum.photos/seed/damsen/800/500",     description: "Công viên nước lớn nhất miền Nam với hơn 30 trò chơi sóng nước, lý tưởng cho gia đình và nhóm bạn." },
  { locationId: "18", name: "The Anam Resort",       address: "Khánh Hoà",     category: "Dịch vụ lưu trú",   imageUrl: "https://picsum.photos/seed/theanam/800/500",    description: "Resort phong cách Đông Dương cổ điển bên bãi biển Cam Ranh, kiến trúc thủ công tinh xảo và ẩm thực Việt sang trọng." },
];
