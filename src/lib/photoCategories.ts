export interface PhotoCategoryOption {
  value: string;
  label: string;
}

export const PHOTO_CATEGORIES: PhotoCategoryOption[] = [
  { value: "OUTER_VIEW", label: "Outer View" },
  { value: "SEATS", label: "Seats" },
  { value: "DASHBOARD", label: "Dashboard" },
  { value: "SUNROOF", label: "Sunroof" },
  { value: "INSTRUMENT_CLUSTER", label: "Instrument Cluster" },
  { value: "STEERING_WHEEL", label: "Steering Wheel" },
  { value: "BOOTSPACE", label: "Bootspace" },
  { value: "GEAR", label: "Gear" },
  { value: "HEAD_LIGHT_TAIL_LIGHTS", label: "Head Light and Tail Lights" },
  { value: "DOORS_AND_CONTROLS", label: "Doors and Controls" },
  { value: "AC", label: "AC" },
  { value: "AIRBAGS", label: "Airbags" },
  { value: "CHARGING_PORTS", label: "Charging Ports" },
  { value: "STORAGE", label: "Storage" },
  { value: "EXTERIOR_CLOSEUPS", label: "Exterior Closeups" },
  { value: "OTHER", label: "Other" },
];

export const PHOTO_CATEGORY_VALUES = PHOTO_CATEGORIES.map((c) => c.value) as [string, ...string[]];

export const REQUIRED_PHOTO_CATEGORIES = ["OUTER_VIEW", "SEATS", "DASHBOARD"];

export const MAX_IMAGES_PER_CATEGORY = 5;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const MAX_VIDEO_SIZE_BYTES = 75 * 1024 * 1024;
export const MAX_VIDEO_DURATION_SECONDS = 120;
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function photoCategoryLabel(value: string): string {
  return PHOTO_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
