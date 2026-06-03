# --- HANDLING NaNs ---
nan_mask = np.isnan(data)
data_no_nan = data[~nan_mask]                     # Remove NaNs
mean_val = np.nanmean(data)                       # Compute mean ignoring NaNs

data_filled = data.copy()
data_filled[nan_mask] = mean_val                  # Replace NaNs with mean
data_interp = pd.Series(data).interpolate()       # Interpolate missing values

# --- OUTLIERS & CLIPPING ---
clean_data = data[data < 20]                      # Keep values below threshold
clipped_data = np.clip(data, 0, 10)               # Force values into [0, 10] range

# --- FEATURE SCALING ---
# 1. Min-Max Normalization (Rescales to [0, 1])
normalized = (data - np.min(data)) / (np.max(data) - np.min(data))

# 2. Z-score Standardization (Mean = 0, Std = 1)
standardized = (data - np.mean(data)) / np.std(data)