try {
    if (errorCondition) {
        throw MyExceptionClass{"Error string"}
    }
} catch (const MyExceptionClass& exc) { // Always const ref.
    // Error handling.
}
// normal execution continues here