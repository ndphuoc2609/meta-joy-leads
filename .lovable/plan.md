# Prompt gửi GPT — Mô tả màn hình chi tiết lead theo đại lý

Copy toàn bộ phần trong khung dưới đây dán vào GPT. Đây là prompt mô tả lại màn hình "Lead theo đại lý" (trang `/dealers`) để GPT tái tạo bằng React + TypeScript + Tailwind CSS.

---

## Prompt (copy từ đây)

Bạn là một kỹ sư frontend React. Hãy xây dựng một trang web "Danh sách lead theo đại lý" cho hệ thống vận hành leads ô tô Hyundai. Yêu cầu chi tiết bên dưới. Công nghệ: React + TypeScript, Tailwind CSS, icon dùng `lucide-react`, router dùng `@tanstack/react-router`. Dữ liệu là mock (giả lập), KHÔNG gọi API thật. Viết bằng tiếng Việt cho toàn bộ UI.

### 1. Bố cục tổng thể
- Trang chia 2 cột trái–phải ngay từ màn hình ≥768px (md). Trên mobile (dưới 768px) thì xếp dọc: thanh danh sách đại lý ở trên, bảng lead ở dưới.
- Grid: `md:grid-cols-[240px_minmax(0,1fr)]`, khoảng cách `gap-3`.
- Container: `mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5`.

### 2. Header trên cùng
- Nút "Quay lại" (icon `ArrowLeft`, size sm, outline) để về trang chủ `/`.
- Tiêu đề H1: "Lead theo đại lý".
- Subtext: `{số lead} lead đã phân bổ · {số đại lý} đại lý`.

### 3. Cột trái — danh sách đại lý (sidebar)
- Một ô tìm kiếm "Lọc đại lý..." có icon `Search` bên trái, lọc theo tên đại lý (không phân biệt hoa thường).
- Bên dưới là danh sách các đại lý dạng tab dọc (desktop) / cuộn ngang (mobile).
- Mỗi đại lý là một nút có: icon `Building2`, tên đại lý (truncate), và badge số lượng lead bên phải (pill `rounded-full bg-muted`, font tabular-nums, text-[10px]).
- Đại lý đang chọn được highlight: `border-border bg-primary/10 font-semibold text-primary`.
- Khi không lọc được đại lý nào → hiện "Không tìm thấy đại lý."
- Danh sách đại lý gồm 6 tên: Hyundai Đông Đô, Hyundai Gia Định, Hyundai Long Biên, Hyundai Trường Chinh, Hyundai Bình Dương, Hyundai Ngọc An. Mặc định chọn đại lý đầu tiên.

### 4. Cột phải — bảng danh sách lead
- Header bảng: tên đại lý đang chọn (font-semibold) + dòng nhỏ "{số lead} lead · số điện thoại đã được ẩn", và một ô tìm kiếm "Tìm lead..." (icon Search) bên phải (rộng ~190px mobile, 240px desktop).
- Tìm kiếm lọc theo tên khách hàng, số điện thoại, hoặc model xe.
- Bảng có 5 cột, min-width 720px, cuộn ngang nếu hẹp:
  1. **STT** — số thứ tự (w-12, tabular-nums, text xám).
  2. **Tên khách hàng** — dòng 1 là tên (font-medium, truncate), dòng 2 nhỏ hơn: `{model} · {kết quả}` (vd "Tucson · Đủ điều kiện").
  3. **Số điện thoại** — ĐÃ ẨN dạng `*****878`: che toàn bộ trừ 3 số cuối, vd số "0987654321" → "*******321". Hàm: `"*".repeat(Math.max(0, phone.length - 3)) + phone.slice(-3)`.
  4. **Ngày xác nhận** — định dạng `dd/MM/yyyy HH:mm`, vd "17/08/2026 14:32". Màu xám, whitespace-nowrap.
  5. **File ghi âm** — một hàng ngang gồm:
     - Nút tròn phát (`Play`, size 7, `bg-primary/10 text-primary`, hover `bg-primary/20`), aria-label "Phát ghi âm {tên}".
     - Thanh progress nhỏ (w-24, h-1, `rounded-full bg-muted`) với đoạn đã phát `w-1/3 bg-primary/50` (ẩn trên mobile, chỉ hiện từ sm).
     - Thời lượng ghi âm dạng `m:ss` (vd "2:34"), tabular-nums, text-[11px].
     - Nút download (icon `Download` size 3.5, hover đổi màu), aria-label "Tải ghi âm {tên}".
- Mỗi hàng (tr) có border-bottom mảnh, hover `bg-accent/50`, transition.
- Khi không có lead nào cho đại lý đang chọn → một hàng span 5 cột, căn giữa: "Chưa có lead nào cho đại lý này."

### 5. Dữ liệu mock (yêu cầu logic)
- Tạo hàm sinh lead giả lập nhưng deterministic (dùng PRNG có seed cố định để SSR và client giống nhau).
- Mỗi lead có: id, tên (họ + tên lót + tên thật Việt Nam), phone (bắt đầu bằng "09"), model (Creta/Accent/Tucson/Santa Fe/Venue/Palisade), campaign, receivedAt, stage, callStatus, agent, outcome, completedAt, dealer, assignedAt, recordingSeconds.
- Chỉ những lead đã xử lý thành công (outcome = "qualified" hoặc "testdrive") mới được phân bổ về đại lý và hiển thị ở trang này.
- recordingSeconds: random 45–255 giây.
- Kết quả (outcome) hiển thị nhãn tiếng Việt: qualified→"Đủ điều kiện", testdrive→"Hẹn lái thử", not_interested→"Không quan tâm", unreachable→"Không liên hệ được".
- Sắp xếp bảng lead theo assignedAt giảm dần (mới nhất trước).

### 6. Responsive & chi tiết style
- Dùng token màu semantic (Tailwind): `border`, `bg-primary`, `bg-primary/10`, `bg-accent`, `bg-muted`, `text-muted-foreground`, `text-primary`, `text-foreground`. KHÔNG hardcode mã màu.
- Font size: tiêu đề H1 17px font-semibold; tên lead 13px; label bảng 11px uppercase tracking-wide; badge 10px; thời lượng 11px.
- Bảng dùng `border-collapse`, `min-w-[720px]`, ô có `py-2.5 pr-2`.
- Toàn bộ text tiếng Việt, có dấu.

### 7. Đầu ra mong muốn
- Trả về 1 file route React (`src/routes/dealers.tsx`) + 1 file data (`src/lib/leads-data.ts`) chứa các type, hằng số (DEALERS, MODELS, CAMPAIGNS, AGENTS), PRNG, hàm `buildLeads`, `buildDealerLeads`, `maskPhoneTail`, `formatDateTime`, `formatDuration`, và các label tiếng Việt.
- Dùng `createFileRoute("/dealers")` từ `@tanstack/react-router`, có `head()` với title/meta description/og tags tiếng Việt.
- Code sạch, TypeScript, có type, không dùng `any`.

## (kết thúc prompt)

---

Lưu ý: prompt trên mô tả đúng màn hình `/dealers` đã có sẵn trong dự án hiện tại. Nếu bạn muốn GPT sinh thêm tính năng khác (ví dụ phát ghi âm thật, phân trang, xuất CSV…), hãy thêm vào cuối prompt trước khi gửi.
