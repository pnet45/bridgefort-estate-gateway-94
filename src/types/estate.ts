
export interface Estate {
  id: string;
  name: string;
  location: string;
  phase?: number;
  scheme?: number;
  size?: number;
  promo_price?: number;
  prelaunch_price?: number;
  actual_price?: number;
  title?: string;
  type?: string;
  description?: string;
  sub_form?: string;
  media?: string[];
  created_at?: string;
}

export interface EstateFormData extends Omit<Estate, 'id' | 'created_at'> {
  id?: string;
  media_files?: File[];
}
