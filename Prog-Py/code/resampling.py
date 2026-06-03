# --- DOWNSAMPLING ---
# 1. Slicing: Take every n-th sample (Fast, but loses information)
t_down = t[::10]

# 2. Block Averaging / Mean Pooling: Averages blocks of size n (Low-pass filter)
s_mean = np.mean(s[:end].reshape(-1, 10), axis=-1)

# 3. Smoothing and Decimation: Moving average followed by slicing
kernel = np.ones(20) / 20
s_smooth = np.convolve(s, kernel, mode='same')
s_down = s_smooth[::10]

# --- UPSAMPLING ---
# 1. Zero-Order Hold (ZOH): Repeats samples
s_zoh = np.repeat(s, 4)

# 2. Interpolation: Estimates missing values (Linear or Cubic)
lin_interp = interp1d(t, s, kind='linear', fill_value="extrapolate")
s_lin = lin_interp(t_up)