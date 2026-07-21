"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CategorizedPhotoUpload, { type CategorizedPhoto } from "./CategorizedPhotoUpload";
import VideoUpload from "./VideoUpload";
import { REQUIRED_PHOTO_CATEGORIES, photoCategoryLabel } from "@/lib/photoCategories";

const BODY_TYPES = ["SEDAN", "HATCHBACK", "SUV", "PICKUP", "VAN", "MINIBUS", "WAGON", "COUPE", "TRUCK", "MOTORCYCLE"];
const FUEL_TYPES = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC"];
const CONDITIONS = ["Excellent", "Good", "Fair", "Needs work"];
const DRIVE_TYPES = [
  { value: "", label: "Not specified" },
  { value: "TWO_WD", label: "2WD" },
  { value: "FOUR_WD", label: "4WD" },
  { value: "AWD", label: "AWD" },
];
const SALE_CONDITIONS = [
  { value: "NEW", label: "Brand New" },
  { value: "FOREIGN_USED", label: "Foreign Used" },
  { value: "LOCALLY_USED", label: "Locally Used" },
  { value: "FOR_PARTS", label: "For Parts / Breaking" },
];
const OTHER_VALUE = "__other__";

export interface EditableListing {
  id: string;
  brandName: string;
  modelName: string;
  year: number;
  priceMwk: number;
  mileageKm: number;
  transmission: string;
  fuelType: string | null;
  bodyType: string | null;
  engineCc: number | null;
  seating: number | null;
  drivetrain: string | null;
  saleCondition: string;
  condition: string;
  description: string | null;
  districtId: string | null;
  status: string;
  photos: CategorizedPhoto[];
  videoUrl: string | null;
}

export default function EditListingForm({
  listing,
  districts,
}: {
  listing: EditableListing;
  districts: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [brandName, setBrandName] = useState(listing.brandName);
  const [modelName, setModelName] = useState(listing.modelName);
  const [year, setYear] = useState(String(listing.year));
  const [priceMwk, setPriceMwk] = useState(String(listing.priceMwk));
  const [mileageKm, setMileageKm] = useState(String(listing.mileageKm));
  const [transmission, setTransmission] = useState(listing.transmission);
  const [fuelType, setFuelType] = useState(listing.fuelType ?? "");
  const [isOtherFuelType, setIsOtherFuelType] = useState(Boolean(listing.fuelType) && !FUEL_TYPES.includes(listing.fuelType ?? ""));
  const [bodyType, setBodyType] = useState(listing.bodyType ?? "");
  const [isOtherBodyType, setIsOtherBodyType] = useState(Boolean(listing.bodyType) && !BODY_TYPES.includes(listing.bodyType ?? ""));
  const [engineCc, setEngineCc] = useState(listing.engineCc ? String(listing.engineCc) : "");
  const [seating, setSeating] = useState(listing.seating ? String(listing.seating) : "");
  const [drivetrain, setDrivetrain] = useState(listing.drivetrain ?? "");
  const [saleCondition, setSaleCondition] = useState(listing.saleCondition);
  const [condition, setCondition] = useState(listing.condition);
  const [description, setDescription] = useState(listing.description ?? "");
  const [districtId, setDistrictId] = useState(listing.districtId ?? "");
  const [isOtherDistrict, setIsOtherDistrict] = useState(false);
  const [districtName, setDistrictName] = useState("");
  const [photos, setPhotos] = useState<CategorizedPhoto[]>(listing.photos);
  const [videoUrl, setVideoUrl] = useState(listing.videoUrl ?? "");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canResubmit = listing.status === "DRAFT" || listing.status === "REJECTED";

  function handleSelectBodyType(value: string) {
    if (value === OTHER_VALUE) {
      setIsOtherBodyType(true);
      setBodyType("");
      return;
    }
    setBodyType(value);
  }

  function handleSelectFuelType(value: string) {
    if (value === OTHER_VALUE) {
      setIsOtherFuelType(true);
      setFuelType("");
      return;
    }
    setFuelType(value);
  }

  function handleSelectDistrict(value: string) {
    if (value === OTHER_VALUE) {
      setIsOtherDistrict(true);
      setDistrictId("");
      setDistrictName("");
      return;
    }
    setIsOtherDistrict(false);
    setDistrictId(value);
  }

  function missingRequiredCategories(): string[] {
    return REQUIRED_PHOTO_CATEGORIES.filter((cat) => !photos.some((p) => p.category === cat));
  }

  async function handleSave(resubmit: boolean) {
    if (resubmit && missingRequiredCategories().length > 0) {
      setError(`Add at least one photo for: ${missingRequiredCategories().map(photoCategoryLabel).join(", ")} before resubmitting.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/listings/${listing.id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName,
          modelName,
          year: Number(year),
          priceMwk: Number(priceMwk),
          mileageKm: Number(mileageKm),
          transmission,
          fuelType: fuelType || undefined,
          bodyType: bodyType || undefined,
          engineCc: engineCc ? Number(engineCc) : undefined,
          seating: seating ? Number(seating) : undefined,
          drivetrain: drivetrain || undefined,
          saleCondition,
          condition,
          description: description || undefined,
          districtId: districtId || undefined,
          districtName: isOtherDistrict ? districtName : undefined,
          videoUrl: videoUrl || undefined,
          photos,
          resubmit,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save changes.");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:grid-cols-2">
        <Field label="Brand">
          <input value={brandName} onChange={(e) => setBrandName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Model">
          <input value={modelName} onChange={(e) => setModelName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Year">
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Transmission">
          <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className={inputClass}>
            <option value="MANUAL">Manual</option>
            <option value="AUTOMATIC">Automatic</option>
          </select>
        </Field>
        <Field label="Body type (optional)">
          {isOtherBodyType ? (
            <input
              type="text"
              autoFocus
              placeholder="Type the body type, e.g. Convertible"
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
              className={inputClass}
            />
          ) : (
            <select value={bodyType} onChange={(e) => handleSelectBodyType(e.target.value)} className={inputClass}>
              <option value="">Not specified</option>
              {BODY_TYPES.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
              <option value={OTHER_VALUE}>Other (type my own)</option>
            </select>
          )}
        </Field>
        <Field label="Fuel type (optional)">
          {isOtherFuelType ? (
            <input
              type="text"
              autoFocus
              placeholder="Type the fuel type, e.g. LPG"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className={inputClass}
            />
          ) : (
            <select value={fuelType} onChange={(e) => handleSelectFuelType(e.target.value)} className={inputClass}>
              <option value="">Not specified</option>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
              <option value={OTHER_VALUE}>Other (type my own)</option>
            </select>
          )}
        </Field>
        <Field label="Condition rating">
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Vehicle condition">
          <select value={saleCondition} onChange={(e) => setSaleCondition(e.target.value)} className={inputClass}>
            {SALE_CONDITIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Engine size (cc, optional)">
          <input type="number" value={engineCc} onChange={(e) => setEngineCc(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Seating capacity (optional)">
          <input type="number" value={seating} onChange={(e) => setSeating(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Drive type (optional)">
          <select value={drivetrain} onChange={(e) => setDrivetrain(e.target.value)} className={inputClass}>
            {DRIVE_TYPES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Price (MWK)">
          <input type="number" value={priceMwk} onChange={(e) => setPriceMwk(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Mileage (km)">
          <input type="number" value={mileageKm} onChange={(e) => setMileageKm(e.target.value)} className={inputClass} />
        </Field>
        <Field label="District">
          {isOtherDistrict ? (
            <input
              type="text"
              autoFocus
              placeholder="Type your district or area, e.g. Nkhotakota"
              value={districtName}
              onChange={(e) => setDistrictName(e.target.value)}
              className={inputClass}
            />
          ) : (
            <select value={districtId} onChange={(e) => handleSelectDistrict(e.target.value)} className={inputClass}>
              <option value="">Select district…</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
              <option value={OTHER_VALUE}>Other (type my own)</option>
            </select>
          )}
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-ink">Photos</h2>
        <CategorizedPhotoUpload photos={photos} onChange={setPhotos} />
        <div className="mt-6 border-t border-gray-200 pt-6">
          <VideoUpload value={videoUrl} onChange={setVideoUrl} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleSave(false)}
          disabled={submitting}
          className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-ink hover:bg-gray-50 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
        {canResubmit && (
          <button
            onClick={() => handleSave(true)}
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Save & submit for approval"}
          </button>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}
