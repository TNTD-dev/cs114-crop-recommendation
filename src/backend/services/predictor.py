"""
Predictor Service — Feature engineering + dự đoán từ raw input
"""
import numpy as np
import pandas as pd
from services.model_loader import model_loader

# Tên features sau khi engineered (khớp với thứ tự khi train)
FEATURE_COLS = [
    "N", "P", "K", "temperature", "humidity", "ph", "rainfall",
    "total_npk", "ratio_n_p", "ratio_n_k", "ratio_p_k",
    "temp_humidity", "log_rainfall",
]


def engineer_features(N: float, P: float, K: float,
                       temperature: float, humidity: float,
                       ph: float, rainfall: float) -> pd.DataFrame:
    """
    Tạo engineered features khớp với pipeline trong notebook 02_preprocessing.
    """
    total_npk = N + P + K
    ratio_n_p = N / (P + 1e-6)
    ratio_n_k = N / (K + 1e-6)
    ratio_p_k = P / (K + 1e-6)
    temp_humidity = temperature * humidity
    log_rainfall = np.log(rainfall + 1)

    df = pd.DataFrame([{
        "N": N, "P": P, "K": K,
        "temperature": temperature,
        "humidity": humidity,
        "ph": ph,
        "rainfall": rainfall,
        "total_npk": total_npk,
        "ratio_n_p": ratio_n_p,
        "ratio_n_k": ratio_n_k,
        "ratio_p_k": ratio_p_k,
        "temp_humidity": temp_humidity,
        "log_rainfall": log_rainfall,
    }])
    return df


def predict_with_models(
    N: float, P: float, K: float,
    temperature: float, humidity: float,
    ph: float, rainfall: float,
    selected_model_keys: list[str],
) -> list[dict]:
    """
    Chạy dự đoán trên các model được chọn.
    Trả về list kết quả cho từng model.
    """
    # 1. Feature engineering
    df = engineer_features(N, P, K, temperature, humidity, ph, rainfall)

    # 2. Apply preprocessor (scaling) nếu có
    if model_loader.preprocessor is not None:
        X_arr = model_loader.preprocessor.transform(df)
        # Lấy tên cột output từ preprocessor nếu có
        try:
            out_cols = model_loader.preprocessor.get_feature_names_out()
        except Exception:
            out_cols = FEATURE_COLS
        X = pd.DataFrame(X_arr, columns=out_cols)
    else:
        X = df[FEATURE_COLS]

    # 3. Lấy tên crop từ label encoder
    label_encoder = model_loader.label_encoder
    class_names: list[str] = list(label_encoder.classes_) if label_encoder else []

    results = []
    for key in selected_model_keys:
        model = model_loader.models.get(key)
        if model is None:
            continue

        # Dự đoán nhãn
        pred_label_idx = int(model.predict(X)[0])
        pred_crop = label_encoder.inverse_transform([pred_label_idx])[0] if label_encoder else str(pred_label_idx)

        # Lấy xác suất nếu model hỗ trợ
        probabilities: dict[str, float] = {}
        confidence: float = 1.0
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(X)[0]  # shape: (n_classes,)
            confidence = float(proba[pred_label_idx])
            # Top 5 crops by probability
            top_indices = np.argsort(proba)[::-1][:5]
            probabilities = {
                (label_encoder.inverse_transform([i])[0] if label_encoder else str(i)): round(float(proba[i]), 4)
                for i in top_indices
            }
        else:
            # SVM không có predict_proba mặc định (cần probability=True khi train)
            confidence = 1.0
            probabilities = {pred_crop: 1.0}

        results.append({
            "model_key": key,
            "crop": pred_crop,
            "confidence": round(confidence, 4),
            "probabilities": probabilities,
        })

    return results
