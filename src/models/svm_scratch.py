import numpy as np

class LinearSVM:
    def __init__(self, learning_rate=0.001, lambda_param=0.01, n_iters=1000):
        self.lr = learning_rate
        self.lambda_param = lambda_param
        self.n_iters = n_iters
        self.w = None
        self.b = None

    def fit(self, X, y):
        n_samples, n_features = X.shape
        self.w = np.zeros(n_features)
        self.b = 0
        
        # ensure labels are -1 or 1
        y_ = np.where(y <= 0, -1, 1)

        for _ in range(self.n_iters):
            # Calculate margins
            margins = y_ * (np.dot(X, self.w) + self.b)
            
            # Find which samples violate the margin
            misclassified = margins < 1
            
            # Gradients
            # For correctly classified samples, gradient is just the regularization term
            # For misclassified samples, gradient includes the loss term
            dw = 2 * self.lambda_param * self.w
            db = 0
            
            if np.any(misclassified):
                dw -= np.dot(X[misclassified].T, y_[misclassified]) / n_samples
                db -= np.sum(y_[misclassified]) / n_samples
            
            self.w -= self.lr * dw
            self.b -= self.lr * db

    def predict(self, X):
        approx = np.dot(X, self.w) + self.b
        return np.sign(approx)
        
    def decision_function(self, X):
        return np.dot(X, self.w) + self.b

class SVMClassifierScratch:
    """
    Multiclass SVM using One-vs-Rest strategy
    """
    def __init__(self, learning_rate=0.001, lambda_param=0.01, n_iters=1000, random_state=None):
        self.lr = learning_rate
        self.lambda_param = lambda_param
        self.n_iters = n_iters
        self.random_state = random_state
        self.models = []
        self.classes = []

    def fit(self, X, y):
        if self.random_state is not None:
            np.random.seed(self.random_state)
            
        # Convert pandas DataFrame/Series to numpy array if needed
        if hasattr(X, 'values'):
            X = X.values
        if hasattr(y, 'values'):
            y = y.values
            
        self.classes = np.unique(y)
        self.models = []
        
        for c in self.classes:
            # Create binary target: 1 for class c, -1 for others
            y_binary = np.where(y == c, 1, -1)
            
            svm = LinearSVM(learning_rate=self.lr, lambda_param=self.lambda_param, n_iters=self.n_iters)
            svm.fit(X, y_binary)
            self.models.append(svm)

    def predict(self, X):
        if hasattr(X, 'values'):
            X = X.values
            
        # Get decision function scores for all models
        # shape: (n_samples, n_classes)
        scores = np.array([svm.decision_function(X) for svm in self.models]).T
        
        # Return class with highest score
        return self.classes[np.argmax(scores, axis=1)]
