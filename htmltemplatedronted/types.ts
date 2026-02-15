
export interface Spot {
  id: string;
  name: string;
  description: string;
  cost: number;
  time?: string;
  coords?: [number, number]; // [lat, lng]
  isCompleted: boolean;
}

export interface Route {
  id: string;
  title: string;
  spots: Spot[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
