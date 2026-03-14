### TÊN ĐỀ TÀI: HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH GỢI Ý LOẠI CÂY TRỒNG DỰA TRÊN CÁC YẾU TỐ THỔ NHƯỠNG VÀ KHÍ HẬU

#### 1. Lý do chọn đề tài (Bối cảnh & Vấn đề thực tế)
Nông nghiệp là ngành mũi nhọn của Việt Nam, tuy nhiên, việc lựa chọn loại cây trồng vẫn còn mang tính chủ quan và dựa nhiều vào kinh nghiệm truyền thống. Nhiều nông dân gặp thất bại do trồng sai loại cây trên vùng đất không phù hợp (ví dụ: trồng cây cần khô hạn ở vùng đất ngập úng, hoặc cây ưa chua trên đất kiềm). Điều này dẫn đến lãng phí nguồn lực, thời gian và gây thiệt hại kinh tế.

**Vấn đề cần giải quyết:** Làm thế nào để sử dụng các dữ liệu khoa học (thành phần đất, khí hậu) để đề xuất chính xác loại cây trồng sẽ cho năng suất tốt nhất tại một vùng đất cụ thể?

#### 2. Mục tiêu dự án
Xây dựng một mô hình Machine Learning có khả năng học từ dữ liệu thổ nhưỡng và khí tượng để phân loại và gợi ý loại cây trồng phù hợp nhất. Mô hình này đóng vai trò là "Chuyên gia tư vấn ảo", hỗ trợ nông dân hoặc các nhà thu hoạch nông nghiệp ra quyết định trước mùa vụ.

#### 3. Định nghĩa bài toán (Problem Definition)

*   **Input (Dữ liệu đầu vào):** Mô hình nhận 7 thông số kỹ thuật đầu vào:
    1.  **N (Nitrogen):** Hàm lượng đạm trong đất (kg/ha).
    2.  **P (Phosphorus):** Hàm lượng lân trong đất (kg/ha).
    3.  **K (Potassium):** Hàm lượng kali trong đất (kg/ha).
    4.  **Temperature:** Nhiệt độ trung bình môi trường (°C).
    5.  **Humidity:** Độ ẩm tương đối của không khí (%).
    6.  **pH:** Độ chua/bazơ của đất.
    7.  **Rainfall:** Lượng mưa trung bình (mm).

*   **Output (Kết quả đầu ra):** Tên loại cây trồng (Label) được khuyến nghị cho điều kiện đầu vào trên.
    *   *Ví dụ output:* "Rice" (Lúa), "Coffee" (Cà phê), "Cotton" (Bông), "Maize" (Ngô)...

*   **Machine Learning Task (Loại tác vụ):**
    Đây là bài toán **Multi-class Classification (Phân loại đa lớp)**. Mỗi bộ input sẽ được gán vào một trong 22 loại cây trồng (class) có trong bộ dữ liệu huấn luyện.

#### 4. Nguồn dữ liệu (Dataset)
*   **Nguồn:** Kaggle - [Crop Recommendation Dataset](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset).
*   **Mô tả:** Bộ dữ liệu bao gồm khoảng 2200 dòng dữ liệu, với 22 loại cây trồng khác nhau (mỗi loại cây có khoảng 100 mẫu dữ liệu cân bằng).
*   **Tính ứng dụng:** Dữ liệu này dựa trên các phép đo thực nghiệm nông nghiệp tại Ấn Độ, tuy nhiên các chỉ số N-P-K, pH và khí hậu mang tính phổ quát sinh học, hoàn toàn có thể áp dụng tham chiếu cho điều kiện nông nghiệp tại Việt Nam (sau khi có bước xử lý và kiểm chứng phù hợp).

#### 5. Phương pháp thực hiện dự kiến (Workflow)
1.  **Data Preprocessing:** Kiểm tra missing values, xử lý ngoại lai (outliers), chuẩn hóa dữ liệu số.
2.  **Exploratory Data Analysis (EDA):** Phân tích sự phân bố của các chỉ số (ví dụ: cây Lúa cần lượng mưa cao hơn cây Bông như thế nào?).
3.  **Model Training:** Sử dụng các thuật toán phân loại phổ biến như Decision Tree, Random Forest, K-Nearest Neighbors (KNN), Support Vector Machine (SVM).
4.  **Evaluation:** So sánh hiệu suất các mô hình qua Accuracy, Precision, Recall và F1-Score.
5.  **Application:** Đề xuất đầu ra cho một mẫu đất bất kỳ do người dùng nhập vào.

#### 6. Kết quả kỳ vọng
Hoàn thiện một mô hình có độ chính xác (Accuracy) trên tập test > 90%, có khả năng đưa ra gợi ý đúng loại cây trong điều kiện môi trường lý tưởng.

---

#### 7. Hướng dẫn cài đặt & chạy

```bash
# Yêu cầu: Python 3.12+, uv (https://docs.astral.sh/uv/getting-started/installation/)

# 1. Clone repo
git clone <repo-url>
cd Project

# 2. Cài dependencies (lần đầu hoặc thêm package mới)
uv add pandas numpy matplotlib seaborn scikit-learn jupyter joblib ipykernel

# Nếu đã có uv.lock (pull code của người khác), chỉ cần sync:
uv sync

# 3. Kích hoạt môi trường ảo
source .venv/bin/activate   # Linux/macOS
# hoặc: .venv\Scripts\activate  # Windows

```