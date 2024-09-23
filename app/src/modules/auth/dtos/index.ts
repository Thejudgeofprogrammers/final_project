export interface IRegisterUserDTO {
    email: string;
    passwordHash: string;
    name: string;
    contactPhone: string;
    role?: string;
};