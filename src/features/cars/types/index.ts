export interface IFormData {
  brand_id: string;
  model_id: string;
  sub_model_id: string;
  title: string;
  description: string;
  price: string;
  year: string;
  mileage: string;
  color: string;
  engine_type: string;
  engine_volume: string;
  engine_power_hp: string;
  transmission: string;
  drive_type: string;
  fuel_consumption_city: string;
  fuel_consumption_highway: string;
  tire_size: string;
  wheel_size: string;
  is_new: boolean;
}

export interface IImagePreviews {
  main: string | null;
  gallery: string[];
}
