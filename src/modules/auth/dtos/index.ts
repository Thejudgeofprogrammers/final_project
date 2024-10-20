export interface IRegisterUserDTO extends Document {
  email: string;
  password: string;
  name: string;
  contactPhone?: string;
  role: string;
}
