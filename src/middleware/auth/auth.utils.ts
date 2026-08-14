export const checkUser = (username: string, password: string): boolean => {
    return username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
};
