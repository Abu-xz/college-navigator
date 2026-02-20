import { MapAnchor } from "@/types/navigation";
import { toast } from "sonner";

export const convertGeoToMapXY = (
  lat: number,
  lng: number,
  anchors: MapAnchor[],
): { x: number; y: number } => {
  const a = anchors[0];
  const b = anchors[1];

  if (
    lat < Math.min(a.lat, b.lat) ||
    lat > Math.max(a.lat, b.lat) ||
    lng < Math.min(a.lng, b.lng) ||
    lng > Math.max(a.lng, b.lng)
  ) {
    toast.warning("User outside mapped area");
  }

  const lngRatio = (lng - a.lng) / (b.lng - a.lng);
  const latRatio = (lat - a.lat) / (b.lat - a.lat);

  return {
    x: a.x + lngRatio * (b.x - a.x),
    y: a.y - latRatio * (b.y - a.y),
  };
};
