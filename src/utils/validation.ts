export const validateEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return false;
    }
    
    const parts = email.trim().split('@');
    if (parts.length !== 2) return false;
    
    const domain = parts[1];
    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipRegex.test(domain)) {
        return false;
    }
    
    return true;
};


export const validatePassword = (password: string): boolean => {
    if (!password || typeof password !== 'string') {
        return false;
    }


    if (password.length < 8) {
        return false;
    }


    if (!/[A-Z]/.test(password)) {
        return false;
    }

    if (!/[a-z]/.test(password)) {
        return false;
    }

    if (!/\d/.test(password)) {
        return false;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return false;
    }

    return true;
};

export const validateName = (name: string): boolean => {
    if (!name || typeof name !== 'string') {
        return false;
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2 || trimmedName.length > 50) {
        return false;
    }

    const nameRegex = /^[a-zA-Z\s'-]+$/;
    return nameRegex.test(trimmedName);
};
