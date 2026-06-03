np.concatenate([a, b], axis=0) # Join along an existing axis
np.stack([a, b], axis=0)       # Join along a new axis
np.vstack([a, b])              # Stack vertically (row-wise)
np.hstack([a, b])              # Stack horizontally (col-wise)

# Slice object concatenation (MATLAB-like)
np.r_[1:5, 15, 20:50:10]       # Translates slices to concatenated 1D array
np.c_[0:10]                    # Translates slices to concatenated 2D columns
