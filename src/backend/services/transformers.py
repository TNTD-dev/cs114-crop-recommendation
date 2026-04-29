"""
Custom Sklearn Transformers — khớp với định nghĩa trong notebook 02_preprocessing.ipynb
Phải import file này TRƯỚC khi joblib.load() preprocessor.pkl
"""
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

# Các cột gốc cần có trong input
REQUIRED_COLUMNS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]


class ColumnSchemaEnforcer(BaseEstimator, TransformerMixin):
    """Kiểm tra và sắp xếp lại các cột theo đúng schema yêu cầu."""
    def __init__(self, required_columns, drop_extra=True):
        self.required_columns = list(required_columns)
        self.drop_extra = drop_extra

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        missing = [c for c in self.required_columns if c not in X.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")
        if self.drop_extra:
            X = X[self.required_columns]
        return X


class TypeCaster(BaseEstimator, TransformerMixin):
    """Ép kiểu: N, P, K → int; temperature, humidity, ph, rainfall → float."""
    def __init__(self, int_cols=None, float_cols=None):
        self.int_cols = int_cols or []
        self.float_cols = float_cols or []

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        for col in self.int_cols:
            if col in X.columns:
                X[col] = X[col].astype(float).round().astype(int)
        for col in self.float_cols:
            if col in X.columns:
                X[col] = X[col].astype(float)
        return X


class QuantileClipper(BaseEstimator, TransformerMixin):
    """
    Clip giá trị về [lower_quantile, upper_quantile].
    Thống kê quantile được fit trên Train — không có data leakage.
    """
    def __init__(self, lower=0.01, upper=0.99):
        self.lower = lower
        self.upper = upper

    def fit(self, X, y=None):
        if isinstance(X, pd.DataFrame):
            self.lower_ = X.quantile(self.lower)
            self.upper_ = X.quantile(self.upper)
        else:
            arr = np.array(X)
            self.lower_ = np.percentile(arr, self.lower * 100, axis=0)
            self.upper_ = np.percentile(arr, self.upper * 100, axis=0)
        return self

    def transform(self, X):
        if isinstance(X, pd.DataFrame):
            return X.clip(lower=self.lower_, upper=self.upper_, axis=1)
        else:
            arr = np.array(X, dtype=float)
            return np.clip(arr, self.lower_, self.upper_)


class FeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Tạo 6 derived features từ kết luận EDA:
    - total_npk     = N + P + K
    - ratio_n_p     = N / (P + eps)
    - ratio_n_k     = N / (K + eps)
    - ratio_p_k     = P / (K + eps)
    - temp_humidity = temperature * humidity / 100
    - log_rainfall  = log(1 + rainfall)
    """
    def __init__(self, eps=1e-6):
        self.eps = eps

    def fit(self, X, y=None):
        return self  # stateless

    def transform(self, X):
        if isinstance(X, pd.DataFrame):
            out = X.copy()
        else:
            out = pd.DataFrame(X, columns=REQUIRED_COLUMNS)

        eps = self.eps
        out["total_npk"] = out["N"] + out["P"] + out["K"]
        out["ratio_n_p"] = out["N"] / (out["P"] + eps)
        out["ratio_n_k"] = out["N"] / (out["K"] + eps)
        out["ratio_p_k"] = out["P"] / (out["K"] + eps)
        out["temp_humidity"] = out["temperature"] * out["humidity"] / 100.0
        out["log_rainfall"] = np.log1p(out["rainfall"])
        return out
