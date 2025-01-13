export interface FormData {
  full_name: string;
  user_type: string;
  airline: string;
  address: string;
  phone_number: string;
  employee_id: string;
}

export interface AccountFormFieldsProps {
  isEditing: boolean;
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profile: any;
}