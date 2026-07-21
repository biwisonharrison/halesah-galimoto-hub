"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CategorizedPhotoUpload, { type CategorizedPhoto } from "./CategorizedPhotoUpload";
import VideoUpload from "./VideoUpload";
import { REQUIRED_PHOTO_CATEGORIES, photoCategoryLabel } from "@/lib/photoCategories";

type Brand = { id: string; slug: string; name: string };
type Model = {
  id: string;
  name: string;
  slug: string;
  yearStart: number;
  yearEnd: number | null;
  bodyType: string;
  fuelType: string;
  engineCc: number | null;
  seating: number | null;
  drivetrain: string | null;
};
type District = { id: string; name: string };

const BODY_TYPES = ["SEDAN", "HATCHBACK", "SUV", "PICKUP", "VAN", "MINIBUS", "WAGON", "COUPE", "TRUCK", "MOTORCYCLE"];
const FUEL_TYPES = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC"];
const CONDITIONS = ["Excellent", "Good", "Fair", "Needs work"];
const DRIVE_TYPES = [
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

const STEPS = ["Car details", "Photos", "Price & location", "Review & publish"] as const;
const OTHER_VALUE = "__other__";

export default function SellWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const [brandSlug, setBrandSlug] = useState("");
  const [brandName, setBrandName] = useState("");
  const [isOtherBrand, setIsOtherBrand] = useState(false);
  const [modelSlug, setModelSlug] = useState("");
  const [carModelId, setCarModelId] = useState<string | undefined>(undefined);
  const [modelName, setModelName] = useState("");
  const [isOtherModel, setIsOtherModel] = useState(false);
  const [year, setYear] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [isOtherBodyType, setIsOtherBodyType] = useState(false);
  const [fuelType, setFuelType] = useState("");
  const [isOtherFuelType, setIsOtherFuelType] = useState(false);
  const [transmission, setTransmission] = useState("MANUAL");
  const [condition, setCondition] = useState("Good");
  const [engineCc, setEngineCc] = useState("");
  const [seating, setSeating] = useState("");
  const [drivetrain, setDrivetrain] = useState("");
  const [saleCondition, setSaleCondition] = useState("FOREIGN_USED");

  const [photos, setPhotos] = useState<CategorizedPhoto[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  const [priceMwk, setPriceMwk] = useState("");
  const [mileageKm, setMileageKm] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [isOtherDistrict, setIsOtherDistrict] = useState(false);
  const [districtName, setDistrictName] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ listingId: string; submitted: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands ?? []));
    fetch("/api/districts")
      .then((r) => r.json())
      .then((d) => setDistricts(d.districts ?? []));
  }, []);

  useEffect(() => {
    if (!brandSlug) {
      setModels([]);
      return;
    }
    fetch(`/api/brands/${brandSlug}/models`)
      .then((r) => r.json())
      .then((d) => setModels(d.models ?? []));
  }, [brandSlug]);

  function handleSelectBrand(value: string) {
    if (value === OTHER_VALUE) {
      setIsOtherBrand(true);
      setBrandSlug("");
      setBrandName("");
      setModelSlug("");
      setCarModelId(undefined);
      setModelName("");
      setIsOtherModel(true);
      return;
    }
    setIsOtherBrand(false);
    setBrandSlug(value);
    setBrandName(brands.find((b) => b.slug === value)?.name ?? "");
    setModelSlug("");
    setCarModelId(undefined);
    setModelName("");
    setIsOtherModel(false);
  }

  function handleSelectModel(value: string) {
    if (value === OTHER_VALUE) {
      setIsOtherModel(true);
      setModelSlug("");
      setCarModelId(undefined);
      setModelName("");
      return;
    }
    setIsOtherModel(false);
    const model = models.find((m) => m.slug === value);
    setModelSlug(value);
    setCarModelId(model?.id);
    setModelName(model?.name ?? "");
    if (model) {
      setIsOtherBodyType(false);
      setBodyType(model.bodyType);
      setIsOtherFuelType(false);
      setFuelType(model.fuelType);
      setYear(String(model.yearEnd ?? model.yearStart));
      setEngineCc(model.engineCc ? String(model.engineCc) : "");
      setSeating(model.seating ? String(model.seating) : "");
      setDrivetrain(model.drivetrain ?? "");
    }
  }

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

  function canProceed(): boolean {
    if (step === 0) return Boolean(brandName && modelName && year);
    if (step === 2) return Boolean(priceMwk && mileageKm && (districtId || districtName));
    return true;
  }

  async function submitListing(submitForApproval: boolean) {
    if (submitForApproval && missingRequiredCategories().length > 0) {
      setError(`Add at least one photo for: ${missingRequiredCategories().map(photoCategoryLabel).join(", ")} before submitting for approval.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carModelId,
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
          submitForApproval,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save your listing.");
      setDone({ listingId: data.listingId, submitted: submitForApproval });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your listing.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
        <h2 className="text-xl font-bold text-ink">{done.submitted ? "Submitted for approval!" : "Saved as draft"}</h2>
        <p className="mt-2 text-gray-700">
          {done.submitted
            ? "Our team will review it shortly. You'll be notified once it's approved and live."
            : "It's saved to your dashboard. Come back anytime to finish it and submit for approval."}
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700">
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ol className="mb-8 flex flex-wrap gap-2 text-sm">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 ${
              i === step ? "bg-ink text-white" : i < step ? "bg-brand-100 text-brand-800" : "bg-gray-100 text-gray-400"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {step === 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand">
            <select
              value={isOtherBrand ? OTHER_VALUE : brandSlug}
              onChange={(e) => handleSelectBrand(e.target.value)}
              className={selectClass}
            >
              <option value="">Select brand…</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
              <option value={OTHER_VALUE}>Other (my brand isn&apos;t listed)</option>
            </select>
            {isOtherBrand && (
              <input
                type="text"
                autoFocus
                placeholder="Type the brand name, e.g. Chevrolet"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className={`${inputClass} mt-2`}
              />
            )}
          </Field>
          <Field label="Model">
            {isOtherModel ? (
              <input
                type="text"
                autoFocus={isOtherBrand}
                placeholder="Type the model name, e.g. Spark"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className={inputClass}
              />
            ) : (
              <select value={modelSlug} onChange={(e) => handleSelectModel(e.target.value)} disabled={!brandSlug} className={selectClass}>
                <option value="">Select model…</option>
                {models.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.name}
                  </option>
                ))}
                <option value={OTHER_VALUE}>Other (my model isn&apos;t listed)</option>
              </select>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {isOtherModel
                ? "No worries, just describe the specs below."
                : "Don't see your model? Choose \"Other\" to type it in."}
            </p>
          </Field>
          <Field label="Year">
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Transmission">
            <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className={selectClass}>
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
              <select value={bodyType} onChange={(e) => handleSelectBodyType(e.target.value)} className={selectClass}>
                <option value="">Not specified</option>
                {BODY_TYPES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
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
              <select value={fuelType} onChange={(e) => handleSelectFuelType(e.target.value)} className={selectClass}>
                <option value="">Not specified</option>
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
                <option value={OTHER_VALUE}>Other (type my own)</option>
              </select>
            )}
          </Field>
          <Field label="Condition rating">
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className={selectClass}>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vehicle condition">
            <select value={saleCondition} onChange={(e) => setSaleCondition(e.target.value)} className={selectClass}>
              {SALE_CONDITIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
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
            <select value={drivetrain} onChange={(e) => setDrivetrain(e.target.value)} className={selectClass}>
              <option value="">Not specified</option>
              {DRIVE_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-8">
          <CategorizedPhotoUpload photos={photos} onChange={setPhotos} />
          <div className="border-t border-gray-200 pt-6">
            <VideoUpload value={videoUrl} onChange={setVideoUrl} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4 sm:grid-cols-2">
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
              <select value={districtId} onChange={(e) => handleSelectDistrict(e.target.value)} className={selectClass}>
                <option value="">Select district…</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
                <option value={OTHER_VALUE}>Other (type my own)</option>
              </select>
            )}
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description (optional)">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputClass} placeholder="Service history, any issues, why you're selling…" />
            </Field>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-ink">
            {brandName} {modelName} {year}
          </h3>
          <p className="mt-1 text-2xl font-bold text-brand-700">MWK {Number(priceMwk || 0).toLocaleString()}</p>
          <p className="mt-1 text-sm text-gray-500">
            {[mileageKm && `${mileageKm} km`, transmission, fuelType, SALE_CONDITIONS.find((c) => c.value === saleCondition)?.label, isOtherDistrict ? districtName : districts.find((d) => d.id === districtId)?.name]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-3 text-sm text-gray-700">{description || "No description added."}</p>
          <p className="mt-3 text-sm text-gray-500">
            {photos.length} photo(s) attached{videoUrl ? " · video attached" : ""}
          </p>
          {missingRequiredCategories().length > 0 && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              You can save this as a draft, but submitting for approval needs at least one photo for:{" "}
              {missingRequiredCategories().map(photoCategoryLabel).join(", ")}.
            </p>
          )}
          <p className="mt-4 text-xs text-gray-400">Free for 30 days once approved. You can boost or renew it anytime from your dashboard.</p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-ink disabled:opacity-40"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={!canProceed()}
            className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => submitListing(false)}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-ink hover:bg-gray-50 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Save as draft"}
            </button>
            <button
              onClick={() => submitListing(true)}
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit for approval"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
const selectClass = inputClass + " disabled:bg-gray-50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}
