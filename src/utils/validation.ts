/**
 * Validates an email address format
 * @param email - The email address to validate
 * @returns boolean - True if email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Basic format check
    if (!emailRegex.test(email.trim())) {
        return false;
    }
    
    // Additional check for IP addresses in domain (should be invalid)
    const parts = email.trim().split('@');
    if (parts.length !== 2) return false;
    
    const domain = parts[1];
    // Check if domain is an IP address
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipRegex.test(domain)) {
        return false;
    }
    
    return true;
};

/**
 * Validates a password based on security requirements
 * Password must be at least 8 characters long and contain:
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * @param password - The password to validate
 * @returns boolean - True if password meets requirements, false otherwise
 */
export const validatePassword = (password: string): boolean => {
    if (!password || typeof password !== 'string') {
        return false;
    }

    // Minimum length of 8 characters
    if (password.length < 8) {
        return false;
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return false;
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return false;
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
        return false;
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return false;
    }

    return true;
};

/**
 * Validates a user name
 * Name must be between 2 and 50 characters and contain only letters, spaces, hyphens, and apostrophes
 * @param name - The name to validate
 * @returns boolean - True if name is valid, false otherwise
 */
export const validateName = (name: string): boolean => {
    if (!name || typeof name !== 'string') {
        return false;
    }

    const trimmedName = name.trim();

    // Length validation: between 2 and 50 characters
    if (trimmedName.length < 2 || trimmedName.length > 50) {
        return false;
    }

    // Allow only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    return nameRegex.test(trimmedName);
};
