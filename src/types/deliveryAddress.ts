export interface deliveryAddressData {
  uuid?: string;
  address: string;
  lat: string;
  lng: string;
  tag?: string;
  // дополнительные поля для отображения информации о пункте выдачи
  title?: string;
  description?: string;
  workTime?: string;
  imageUrl?: string;
}
