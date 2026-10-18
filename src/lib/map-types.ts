// Plain types shared by the server content readers and the client-side map.
export interface MapProject { id: string; name: string; type: string; year: string; image: string }
export interface MapLocation {
  id: string; city: string; state: string; lat: number; lng: number;
  clients: string[]; projects: MapProject[];
}
