Personal Finance Management

1. Giới thiệu
   Dự án Personal Finance Management được xây dựng nhằm hỗ trợ người dùng quản lý tình hình tài chính cá nhân một cách thuận tiện trên nền tảng web. Hệ thống cho phép người dùng:

- Quản lý tài khoản cá nhân.
- Quản lý các khoản thu nhập và chi tiêu.
- Phân loại giao dịch theo danh mục.
- Quản lý nguồn tiền.
- Thiết lập ngân sách theo tháng.
- Theo dõi mục tiêu tiết kiệm.
- Quản lý các khoản thanh toán định kỳ.
- Nhận thông báo và lời nhắc.
- Xem thống kê tình hình tài chính.
- Xuất dữ liệu giao dịch ra file Excel.
- Sử dụng AI để phân tích tình hình chi tiêu và đưa ra gợi ý.

2. Công nghệ sử dụng
   Backend:

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT
- Maven
- PostgreSQL
- Apache POI
  Frontend:
- ReactJS
- Vite
- JavaScript
- JSX
- Material UI (MUI)
- Axios
- React Router
- SweetAlert2
  Dịch vụ bên ngoài:
- AI API
- Brevo Email Service
  Deployment:
- Docker
- Docker Compose

3. Yêu cầu môi trường
   Để chạy dự án ở môi trường development, cần cài đặt:

- JDK 25
- Maven
- Node.js
- npm
- PostgreSQL
  Hoặc có thể sử dụng Docker để chạy các thành phần của hệ thống.

4. Cấu hình
   Dựa vào file .env.example, tạo file .env rồi gán giá trị cho biến môi trường.
5. Chạy Backend

- Di chuyển vào thư mục Backend: cd backend
- Cài đặt dependencies và build project: mvn clean install
- Chạy ứng dụng: mvn spring-boot:run
- Backend mặc định chạy tại: http://localhost:8080

6. Chạy Frontend

- Di chuyển vào thư mục Frontend: cd frontend
- Cài đặt dependencies: npm install
- Chạy project: npm run dev
- Frontend mặc định chạy tại địa chỉ được Vite hiển thị trong terminal, thường là: http://localhost:5173

7. Chạy bằng Docker

- Nếu sử dụng Docker Compose, có thể chạy toàn bộ hệ thống bằng: docker compose up --build
- Dừng các container: docker compose down
- Xem trạng thái container: docker compose ps
