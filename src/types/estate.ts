
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
  property_category?: string;
  bedrooms?: number;
  bathrooms?: number;
  is_for_sale?: boolean;
  is_for_rent?: boolean;
  monthly_rent?: number;
  annual_rent?: number;
  total_plots?: number;
  sold_plots?: number;
}

export interface EstateFormData extends Omit<Estate, 'id' | 'created_at'> {
  id?: string;
  media_files?: File[];
}
