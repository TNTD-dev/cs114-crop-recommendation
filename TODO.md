# CropSmart Project - Kế Hoạch & Phân Công Nhiệm Vụ (Giai đoạn Modeling)

Giai đoạn Data Preprocessing và EDA đã hoàn tất. Bước tiếp theo là xây dựng, huấn luyện và tối ưu mô hình học máy (Machine Learning).

Mục tiêu là huấn luyện 5 thuật toán cơ bản bằng thư viện (để làm baseline), sau đó triển khai lại (code from scratch) 5 thuật toán đó, so sánh tổng hợp, tinh chỉnh tham số và lựa chọn mô hình tốt nhất để triển khai (deploy).

---

## 1. Giai Đoạn 1: Baseline Models (Đã Hoàn Thành)

- **Người thực hiện:** Hệ thống AI (Antigravity)
- **File:** `notebooks/03_model_training_lib.ipynb`
- **Mô tả:** Huấn luyện nhanh 5 mô hình bằng `scikit-learn` trên tập Train, dự đoán trên tập Validation để thiết lập kết quả Baseline.
- **5 Mô hình:**
  1. Naive Bayes (GaussianNB)
  2. K-Nearest Neighbors (KNN)
  3. Logistic Regression
  4. Random Forest
  5. Support Vector Machine (SVM)

---

## 2. Giai Đoạn 2: Xây Dựng Models From Scratch (Thực hiện song song)

Cả hai thành viên sẽ tự code lại thuật toán học máy từ đầu (bằng NumPy/Pandas) mà không dùng class mô hình có sẵn của scikit-learn. Cấu trúc class from scratch cần có hàm `fit(X, y)` và `predict(X)`. Sau khi code xong, tiến hành train/predict và so sánh với baseline thư viện trong phần 1.

### 🔴 Thành Viên 1
**File Notebook:** `notebooks/04_model_scratch_nb_knn_lr.ipynb`

**Nhiệm vụ (Code from scratch):**
1. **Naive Bayes (Gaussian Naive Bayes)**
2. **K-Nearest Neighbors (KNN)**
3. **Logistic Regression** (Multi-class: One-vs-Rest hoặc Softmax/Multinomial)

**Yêu cầu trong notebook:**
- Viết class cho từng mô hình.
- Train trên `train.csv` và evaluate trên `val.csv`.
- In ra Classification Report và Confusion Matrix.
- Tính ra bảng so sánh kết quả của model from scratch vs model thư viện tương ứng. (Gợi ý: Dùng `pd.read_csv('../data/processed/baseline_results.csv')` để load nhanh kết quả thư viện).

### 🔵 Thành Viên 2
**File Notebook:** `notebooks/05_model_scratch_rf_svm.ipynb`

**Nhiệm vụ (Code from scratch):**
1. **Random Forest** (Cần code Decision Tree trước, sau đó xây dựng tập hợp Forest)
2. **Support Vector Machine (SVM)** (Hoặc Linear SVM dùng gradient descent / kernel đơn giản)

**Yêu cầu trong notebook:**
- Tương tự thành viên 1, viết class cho từng mô hình, evaluate và so sánh với thư viện. (Gợi ý: Dùng `pd.read_csv('../data/processed/baseline_results.csv')`).
- Có thể dùng thư viện hỗ trợ tính toán ma trận tối ưu nhưng logic thuật toán chính (split node, update weight) phải tự code.

---

## 3. Giai Đoạn 3: Đánh Giá Tổng Hợp, Tuning & Retrain (Cả Nhóm)

**File Notebook:** `notebooks/06_evaluation_and_tuning.ipynb`

**Nhiệm vụ:**
1. **Tổng hợp:** Gộp tất cả kết quả của 10 mô hình (5 Library + 5 Scratch) thành một bảng DataFrame duy nhất để so sánh toàn diện về hiệu năng (Accuracy, F1-Score) và thời gian chạy.
2. **Chọn Best Model:** Chọn ra mô hình có hiệu năng cao nhất (thường ưu tiên chọn model thư viện để có độ ổn định khi deploy production).
3. **Hyperparameter Tuning:**
   - Thực hiện tuning tham số cho mô hình tốt nhất bằng `GridSearchCV` hoặc `RandomizedSearchCV` (VD: tìm K tốt nhất cho KNN, tìm C và kernel cho SVM, tìm n_estimators cho Random Forest).
4. **Retrain:**
   - Nối gộp (concat) tập Train và tập Validation lại thành một tập dữ liệu lớn.
   - Retrain lại mô hình tốt nhất (với tham số đã được tune) trên tập dữ liệu lớn này.
5. **Final Evaluation:**
   - Dự đoán và đánh giá mô hình lần cuối cùng trên tập Test (`test.csv`). Báo cáo độ chính xác cuối cùng.
6. **Lưu Model:**
   - Sử dụng `joblib` hoặc `pickle` để lưu mô hình tốt nhất vào `saved_models/best_model.pkl` chuẩn bị cho bước Backend.

---

*Lưu ý: Mọi code preprocessing không cần viết lại, chỉ cần load trực tiếp từ thư mục `data/processed/`.*


