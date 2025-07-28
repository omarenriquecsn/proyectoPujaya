import { IUser } from "../types";

export const Users = async (): Promise<IUser[]> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}   

export const getUserById = async (id: string): Promise<IUser> => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}
