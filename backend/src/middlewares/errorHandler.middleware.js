export const errorHandler = (err, req, res, next) => {
    // 1. Status code identify karo (ApiError se ya response se)
    const statusCode = err.statusCode || res.statusCode || 500;

    // 2. Client ko exact clean package bhejo
    res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        message: err.message || "Internal Server Error",
        errors: err.errors || [], // Validation arrays ke liye
        // Security check: production me stack trace mat dikhao
        stackTrace: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};