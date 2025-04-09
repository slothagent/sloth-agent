import WebSocket from 'ws';

// Interface for token data
interface PumpFunToken {
  address: string;
  name?: string;
  symbol?: string;
  image?: string;
  created_at?: string;
  price?: number;
  price_change_24h?: number;
  volume_24h?: number;
  market_cap?: number;
  holders?: number;
  transactions?: number;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
}

// Cấu hình
const WS_URL = 'ws://localhost:3333/pumpfun';

// Tạo kết nối WebSocket
console.log(`Đang kết nối đến ${WS_URL}...`);
const ws = new WebSocket(WS_URL);

// Xử lý khi kết nối mở
ws.on('open', () => {
  console.log('Đã kết nối đến máy chủ WebSocket Pump.fun');
  
  // Đăng ký nhận thông tin về token mới (chỉ tập trung vào các token mới)
  console.log('Đang đăng ký nhận token mới...');
  ws.send(JSON.stringify({
    type: 'subscribe',
    dataType: 'newTokens',
    filters: {
      minHolders: 5,       // Giảm xuống để nhận nhiều token mới hơn
      minTransactions: 3,  // Giảm xuống để nhận nhiều token mới hơn
      minVolume: 100       // Giảm xuống để nhận nhiều token mới hơn
    }
  }));
  
  // Thông báo thành công
  console.log('Đã gửi yêu cầu đăng ký nhận token mới. Đang chờ dữ liệu...');
  console.log('Client sẽ hiển thị tất cả các token mới khi Pump.fun gửi thông báo');
  console.log('------------------------------------------------------------');
});

// Xử lý tin nhắn đến
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    
    switch (message.type) {
      case 'data':
        if (message.dataType === 'newTokens') {
          console.log(`\n[TOKEN MỚI] Đã nhận ${message.data.length} token mới:`);
          
          // Hiển thị chi tiết về mỗi token mới
          if (Array.isArray(message.data) && message.data.length > 0) {
            message.data.forEach((token: PumpFunToken, index: number) => {
              console.log(`\n--- Token mới #${index + 1} ---`);
              console.log(`Địa chỉ: ${token.address}`);
              console.log(`Tên: ${token.name || 'Không có tên'}`);
              console.log(`Ký hiệu: ${token.symbol || 'Không có ký hiệu'}`);
              console.log(`Thời gian tạo: ${token.created_at || 'Không rõ'}`);
              console.log(`Số người nắm giữ: ${token.holders || 'Không rõ'}`);
              console.log(`Số giao dịch: ${token.transactions || 'Không rõ'}`);
              console.log(`Giá: ${token.price ? token.price + ' SOL' : 'Không rõ'}`);
              console.log(`Khối lượng 24h: ${token.volume_24h ? token.volume_24h + ' SOL' : 'Không rõ'}`);
              
              if (token.website || token.twitter || token.telegram || token.discord) {
                console.log('Liên kết:');
                if (token.website) console.log(`- Website: ${token.website}`);
                if (token.twitter) console.log(`- Twitter: ${token.twitter}`);
                if (token.telegram) console.log(`- Telegram: ${token.telegram}`);
                if (token.discord) console.log(`- Discord: ${token.discord}`);
              }
              
              if (token.description) {
                console.log(`Mô tả: ${token.description}`);
              }
            });
          } else {
            console.log('Không có dữ liệu token nào được nhận');
          }
        } else {
          console.log(`\n[DỮ LIỆU] Đã nhận dữ liệu ${message.dataType}`);
        }
        break;
        
      case 'subscribed':
        console.log(`\n[ĐĂNG KÝ] Đã đăng ký thành công ${message.dataType}`);
        if (message.filters) {
          console.log('Với bộ lọc:', JSON.stringify(message.filters, null, 2));
        }
        break;
        
      case 'error':
        console.error(`\n[LỖI] ${message.message}`);
        break;
        
      case 'info':
        console.info(`\n[THÔNG TIN] ${message.message}`);
        if (message.availableDataTypes) {
          console.info('Các loại dữ liệu có sẵn:', message.availableDataTypes);
        }
        break;
        
      case 'update':
        if (message.dataType === 'newTokens') {
          console.log(`\n[TOKEN MỚI - CẬP NHẬT] Đã nhận token mới:`);
          const token: PumpFunToken = message.data;
          
          console.log(`Địa chỉ: ${token.address}`);
          console.log(`Tên: ${token.name || 'Không có tên'}`);
          console.log(`Ký hiệu: ${token.symbol || 'Không có ký hiệu'}`);
          console.log(`Thời gian tạo: ${token.created_at || 'Không rõ'}`);
          console.log(`Số người nắm giữ: ${token.holders || 'Không rõ'}`);
          console.log(`Số giao dịch: ${token.transactions || 'Không rõ'}`);
        } else {
          console.log(`\n[CẬP NHẬT] Đã nhận cập nhật cho ${message.dataType}`);
        }
        break;
        
      default:
        console.log(`\n[KHÔNG XÁC ĐỊNH] Đã nhận loại tin nhắn không xác định: ${message.type}`);
        console.log(JSON.stringify(message, null, 2));
    }
  } catch (error) {
    console.error('Lỗi khi phân tích tin nhắn:', error);
    console.error('Tin nhắn gốc:', data.toString());
  }
});

// Xử lý lỗi
ws.on('error', (error) => {
  console.error('Lỗi WebSocket:', error);
});

// Xử lý khi kết nối đóng
ws.on('close', (code, reason) => {
  console.log(`Đã ngắt kết nối từ máy chủ WebSocket Pump.fun: ${code} - ${reason.toString()}`);
});

// Xử lý khi tiến trình kết thúc
process.on('SIGINT', () => {
  console.log('Đang đóng kết nối WebSocket...');
  ws.close();
  process.exit(0);
});

console.log('Client kiểm tra đang chạy. Đang lắng nghe các token mới từ Pump.fun...');
console.log('Nhấn Ctrl+C để thoát.'); 