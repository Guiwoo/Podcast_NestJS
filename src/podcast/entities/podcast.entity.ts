export class Episode {
  id: number;
  title: string;
  description: string;
}

export class Podcast {
  id: number;
  title: string;
  category: string;
  rating: number;
  episodes: Episode[];
}
