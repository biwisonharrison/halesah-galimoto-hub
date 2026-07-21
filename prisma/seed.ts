import {
  PrismaClient,
  BodyType,
  FuelType,
  Drivetrain,
  Transmission,
  SellerType,
  SaleCondition,
  ListingStatus,
  PaymentMethodType,
} from "@prisma/client";

const prisma = new PrismaClient();
const TRIAL_DURATION_DAYS = 30;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const DISTRICTS = ["Lilongwe", "Blantyre", "Mzuzu", "Zomba", "Kasungu", "Mangochi"];

type ModelSeed = {
  name: string;
  yearStart: number;
  yearEnd?: number;
  bodyType: BodyType;
  fuelType: FuelType;
  drivetrain: Drivetrain;
  engineCc?: number;
  seating?: number;
  description: string;
  strengths?: string;
  faults?: string;
  partAvailabilityRating?: number;
  isClassic?: boolean;
  baseValueMwk?: number;
};

type BrandSeed = {
  name: string;
  originCountry: string;
  history: string;
  models: ModelSeed[];
};

const BRANDS: BrandSeed[] = [
  {
    name: "Toyota",
    originCountry: "Japan",
    history:
      "The single most common brand on Malawian roads. Toyota's reputation for durability and easy parts access via Japanese used car exporters makes it the default choice for both private buyers and dealers.",
    models: [
      {
        name: "Hilux 2.5 D-4D",
        yearStart: 2005,
        yearEnd: 2015,
        bodyType: BodyType.PICKUP,
        fuelType: FuelType.DIESEL,
        drivetrain: Drivetrain.FOUR_WD,
        engineCc: 2494,
        seating: 5,
        description: "Malawi's default workhorse pickup, used by NGOs, farms and small businesses across every district.",
        strengths: "Nearly indestructible engine, huge spare parts availability, holds resale value.",
        faults: "Cabin road noise, firm ride unladen.",
        partAvailabilityRating: 5,
        baseValueMwk: 19000000,
      },
      {
        name: "Corolla Axio 1.5",
        yearStart: 2012,
        yearEnd: 2018,
        bodyType: BodyType.SEDAN,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.TWO_WD,
        engineCc: 1496,
        seating: 5,
        description: "The most popular small sedan for private buyers and taxi operators in Lilongwe and Blantyre.",
        strengths: "Excellent fuel economy, cheap servicing, easy to resell.",
        faults: "Road clearance low for rural roads.",
        partAvailabilityRating: 5,
        baseValueMwk: 8500000,
      },
      {
        name: "Land Cruiser Prado",
        yearStart: 2009,
        yearEnd: 2020,
        bodyType: BodyType.SUV,
        fuelType: FuelType.DIESEL,
        drivetrain: Drivetrain.FOUR_WD,
        engineCc: 2982,
        seating: 7,
        description: "Premium 4WD SUV favoured by NGOs, government and well off private buyers for rough terrain.",
        strengths: "Excellent capability off paved roads, comfortable, strong resale.",
        faults: "Higher fuel and duty costs due to large engine.",
        partAvailabilityRating: 4,
        baseValueMwk: 38000000,
      },
      {
        name: "Land Cruiser 300",
        yearStart: 2022,
        bodyType: BodyType.SUV,
        fuelType: FuelType.DIESEL,
        drivetrain: Drivetrain.FOUR_WD,
        engineCc: 3346,
        seating: 8,
        description: "The current flagship Land Cruiser generation, sold new in Malawi through official Toyota dealers.",
        strengths: "Latest safety tech, very strong resale, class leading off road capability.",
        faults: "High purchase price and import duty due to large engine.",
        partAvailabilityRating: 3,
        baseValueMwk: 68000000,
      },
    ],
  },
  {
    name: "Nissan",
    originCountry: "Japan",
    history:
      "Nissan competes closely with Toyota on Malawian roads, especially in the SUV and pickup segments, with strong secondhand supply from Japan.",
    models: [
      {
        name: "X-Trail 2.0",
        yearStart: 2007,
        yearEnd: 2013,
        bodyType: BodyType.SUV,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.AWD,
        engineCc: 1997,
        seating: 5,
        description: "Practical family SUV with a large boot, popular with Lilongwe families.",
        strengths: "Spacious, comfortable ride, reasonable running costs.",
        faults: "CVT models need careful maintenance history checks.",
        partAvailabilityRating: 4,
        baseValueMwk: 12500000,
      },
      {
        name: "Hardbody NP300",
        yearStart: 2010,
        yearEnd: 2021,
        bodyType: BodyType.PICKUP,
        fuelType: FuelType.DIESEL,
        drivetrain: Drivetrain.FOUR_WD,
        engineCc: 2488,
        seating: 5,
        description: "Popular alternative to the Hilux for farm and small business use.",
        strengths: "Tough chassis, decent load capacity.",
        faults: "Slightly less parts availability than Toyota equivalents.",
        partAvailabilityRating: 4,
        baseValueMwk: 17000000,
      },
    ],
  },
  {
    name: "Mazda",
    originCountry: "Japan",
    history: "Known in Malawi mainly for compact sedans and the BT-50 pickup, a common Hilux alternative.",
    models: [
      {
        name: "Demio",
        yearStart: 2010,
        yearEnd: 2019,
        bodyType: BodyType.HATCHBACK,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.TWO_WD,
        engineCc: 1300,
        seating: 5,
        description: "Compact, cheap to run hatchback popular with first time buyers and town commuting.",
        strengths: "Very low fuel consumption, low import duty due to small engine.",
        faults: "Small boot, tight rear seats.",
        partAvailabilityRating: 3,
        baseValueMwk: 5200000,
      },
    ],
  },
  {
    name: "Honda",
    originCountry: "Japan",
    history: "A smaller but loyal following in Malawi, mostly compact and midsize sedans.",
    models: [
      {
        name: "Fit",
        yearStart: 2008,
        yearEnd: 2015,
        bodyType: BodyType.HATCHBACK,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.TWO_WD,
        engineCc: 1300,
        seating: 5,
        description: "Efficient and reliable hatchback, common in Blantyre.",
        strengths: "Reliable engine, good resale value.",
        faults: "Parts slightly harder to find outside main cities.",
        partAvailabilityRating: 3,
        baseValueMwk: 5800000,
      },
    ],
  },
  {
    name: "Mercedes-Benz",
    originCountry: "Germany",
    history:
      "A status symbol brand in Malawi with a devoted following for its older, mechanically simple models which are famously kept running for decades.",
    models: [
      {
        name: "W123 230E",
        yearStart: 1976,
        yearEnd: 1985,
        bodyType: BodyType.SEDAN,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.TWO_WD,
        engineCc: 2307,
        seating: 5,
        description:
          "A beloved classic on Malawian roads, famous for outliving newer cars thanks to a simple, rebuildable engine.",
        strengths: "Legendary durability, easy to maintain with basic tools, huge community of owners.",
        faults: "Ageing bodywork prone to rust, rare original interior parts.",
        partAvailabilityRating: 3,
        isClassic: true,
        baseValueMwk: 4500000,
      },
    ],
  },
  {
    name: "Land Rover",
    originCountry: "United Kingdom",
    history: "Old Series and Defender models remain in daily use across rural Malawi decades after import, prized for parts simplicity.",
    models: [
      {
        name: "Series III",
        yearStart: 1971,
        yearEnd: 1985,
        bodyType: BodyType.SUV,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.FOUR_WD,
        engineCc: 2286,
        seating: 5,
        description: "A rugged old 4x4 still working farms and estates across Malawi decades after it was built.",
        strengths: "Simple mechanicals, easy to repair locally, unstoppable off road.",
        faults: "Basic safety equipment by modern standards, parts increasingly rare.",
        partAvailabilityRating: 2,
        isClassic: true,
        baseValueMwk: 6000000,
      },
    ],
  },
  {
    name: "Peugeot",
    originCountry: "France",
    history: "The 404 in particular became a Malawian icon of resilience, still spotted running in rural areas.",
    models: [
      {
        name: "404",
        yearStart: 1960,
        yearEnd: 1975,
        bodyType: BodyType.SEDAN,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.TWO_WD,
        engineCc: 1618,
        seating: 5,
        description: "An enduring classic. Peugeot 404s are still spotted running on Malawian back roads today.",
        strengths: "Extremely tough suspension for rough roads, simple engine.",
        faults: "Very hard to find original spare parts now.",
        partAvailabilityRating: 1,
        isClassic: true,
        baseValueMwk: 3500000,
      },
    ],
  },
  {
    name: "Isuzu",
    originCountry: "Japan",
    history: "A strong second choice for pickups after Toyota, popular with dealers and importers.",
    models: [
      {
        name: "D-Max",
        yearStart: 2012,
        yearEnd: 2020,
        bodyType: BodyType.PICKUP,
        fuelType: FuelType.DIESEL,
        drivetrain: Drivetrain.FOUR_WD,
        engineCc: 2499,
        seating: 5,
        description: "Reliable double cab pickup used widely by businesses and NGOs.",
        strengths: "Strong torque, good payload, competitive pricing versus the Hilux.",
        faults: "Slightly lower resale value than equivalent Toyota.",
        partAvailabilityRating: 4,
        baseValueMwk: 16500000,
      },
    ],
  },
  {
    name: "Suzuki",
    originCountry: "Japan",
    history: "Popular for small, cheap to run cars, a common first car in Malawi's towns.",
    models: [
      {
        name: "Alto",
        yearStart: 2009,
        yearEnd: 2017,
        bodyType: BodyType.HATCHBACK,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.TWO_WD,
        engineCc: 1000,
        seating: 4,
        description: "The cheapest realistic car to own and run in Malawi, a common first car.",
        strengths: "Minimal fuel and duty costs, easy to park in town.",
        faults: "Small engine struggles on long inclines when loaded.",
        partAvailabilityRating: 3,
        baseValueMwk: 3800000,
      },
    ],
  },
  {
    name: "Subaru",
    originCountry: "Japan",
    history: "A niche but growing following for its all wheel drive wagons, useful on rural roads in the rainy season.",
    models: [
      {
        name: "Forester 2.0",
        yearStart: 2008,
        yearEnd: 2016,
        bodyType: BodyType.SUV,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.AWD,
        engineCc: 1994,
        seating: 5,
        description: "Capable all wheel drive wagon, good for Malawi's rainy season roads.",
        strengths: "Standard AWD, good ground clearance, comfortable.",
        faults: "Timing belt and head gasket service history worth checking.",
        partAvailabilityRating: 2,
        baseValueMwk: 11000000,
      },
    ],
  },
  {
    name: "Hyundai",
    originCountry: "South Korea",
    history: "A growing presence in Malawi thanks to competitively priced new and used crossovers sold through regional dealers.",
    models: [
      {
        name: "Tucson",
        yearStart: 2015,
        yearEnd: 2020,
        bodyType: BodyType.SUV,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.AWD,
        engineCc: 1999,
        seating: 5,
        description: "Comfortable Korean crossover, increasingly common as a Land Cruiser alternative for town driving.",
        strengths: "Modern features, comfortable ride, good warranty support from dealers.",
        faults: "Parts and servicing still catching up outside main dealer network.",
        partAvailabilityRating: 2,
        baseValueMwk: 16000000,
      },
    ],
  },
  {
    name: "Kia",
    originCountry: "South Korea",
    history: "A growing presence in Malawi thanks to affordable new models sold through regional dealers.",
    models: [
      {
        name: "Sportage",
        yearStart: 2016,
        yearEnd: 2021,
        bodyType: BodyType.SUV,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.AWD,
        engineCc: 1997,
        seating: 5,
        description: "Kia's answer to the Tucson, a stylish and well equipped mid size crossover.",
        strengths: "Long warranty when bought new, comfortable interior, competitive pricing.",
        faults: "Independent mechanics less familiar with it than Japanese rivals.",
        partAvailabilityRating: 2,
        baseValueMwk: 15500000,
      },
    ],
  },
  {
    name: "Ford",
    originCountry: "United States",
    history: "Known in Malawi almost entirely for the Ranger pickup, which competes directly with the Hilux and D-Max.",
    models: [
      {
        name: "Ranger",
        yearStart: 2015,
        yearEnd: 2020,
        bodyType: BodyType.PICKUP,
        fuelType: FuelType.DIESEL,
        drivetrain: Drivetrain.FOUR_WD,
        engineCc: 2198,
        seating: 5,
        description: "A strong Hilux alternative with a powerful diesel engine, popular with businesses and NGOs.",
        strengths: "Strong towing and payload capacity, modern cabin.",
        faults: "Parts and servicing pricier than Toyota or Nissan equivalents.",
        partAvailabilityRating: 2,
        baseValueMwk: 18500000,
      },
    ],
  },
  {
    name: "Volkswagen",
    originCountry: "Germany",
    history: "A smaller following in Malawi, mostly compact hatchbacks bought by private buyers wanting something different.",
    models: [
      {
        name: "Golf",
        yearStart: 2013,
        yearEnd: 2019,
        bodyType: BodyType.HATCHBACK,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.TWO_WD,
        engineCc: 1400,
        seating: 5,
        description: "A well built European hatchback, less common than Japanese rivals but well regarded by owners.",
        strengths: "Refined ride, solid build quality.",
        faults: "Specialist parts and servicing can be harder to find outside Lilongwe and Blantyre.",
        partAvailabilityRating: 2,
        baseValueMwk: 7500000,
      },
    ],
  },
  {
    name: "BMW",
    originCountry: "Germany",
    history: "A status symbol brand for private buyers, mostly seen in the 3 Series range on Lilongwe and Blantyre roads.",
    models: [
      {
        name: "3 Series 320i",
        yearStart: 2013,
        yearEnd: 2018,
        bodyType: BodyType.SEDAN,
        fuelType: FuelType.PETROL,
        drivetrain: Drivetrain.TWO_WD,
        engineCc: 1997,
        seating: 5,
        description: "A premium sedan bought mostly by private buyers looking for a step up from Japanese saloons.",
        strengths: "Sharp handling, upmarket interior.",
        faults: "Specialist servicing and parts costs are notably higher than Japanese equivalents.",
        partAvailabilityRating: 1,
        baseValueMwk: 15000000,
      },
    ],
  },
  {
    name: "Mitsubishi",
    originCountry: "Japan",
    history: "A respected alternative to Toyota and Nissan in the SUV and pickup segments, with a loyal following.",
    models: [
      {
        name: "Pajero",
        yearStart: 2010,
        yearEnd: 2018,
        bodyType: BodyType.SUV,
        fuelType: FuelType.DIESEL,
        drivetrain: Drivetrain.FOUR_WD,
        engineCc: 2477,
        seating: 7,
        description: "A capable and comfortable 4x4 SUV, a common alternative to the Land Cruiser Prado.",
        strengths: "Strong off road capability, spacious for a large family.",
        faults: "Fuel economy suffers with the larger engine.",
        partAvailabilityRating: 3,
        baseValueMwk: 23000000,
      },
    ],
  },
];

async function main() {
  console.log("Seeding districts...");
  for (const name of DISTRICTS) {
    await prisma.district.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log("Seeding brands, models...");
  for (const brand of BRANDS) {
    const brandLogoUrl = `/brand-logos/${slugify(brand.name)}.svg`;
    const createdBrand = await prisma.brand.upsert({
      where: { slug: slugify(brand.name) },
      update: { history: brand.history, originCountry: brand.originCountry, logoUrl: brandLogoUrl },
      create: {
        name: brand.name,
        slug: slugify(brand.name),
        originCountry: brand.originCountry,
        history: brand.history,
        logoUrl: brandLogoUrl,
      },
    });

    for (const model of brand.models) {
      await prisma.carModel.upsert({
        where: { brandId_slug: { brandId: createdBrand.id, slug: slugify(model.name) } },
        update: {
          bodyType: model.bodyType,
          fuelType: model.fuelType,
          drivetrain: model.drivetrain,
          engineCc: model.engineCc,
          seating: model.seating,
        },
        create: {
          brandId: createdBrand.id,
          name: model.name,
          slug: slugify(model.name),
          yearStart: model.yearStart,
          yearEnd: model.yearEnd,
          bodyType: model.bodyType,
          fuelType: model.fuelType,
          drivetrain: model.drivetrain,
          engineCc: model.engineCc,
          seating: model.seating,
          description: model.description,
          strengths: model.strengths,
          faults: model.faults,
          partAvailabilityRating: model.partAvailabilityRating,
          isClassic: model.isClassic ?? false,
          baseValueMwk: model.baseValueMwk,
        },
      });
    }
  }

  console.log("Seeding demo users...");
  const buyer = await prisma.user.upsert({
    where: { phone: "+265991000001" },
    update: {},
    create: { phone: "+265991000001", name: "Chikondi Phiri", role: "BUYER", phoneVerifiedAt: new Date() },
  });

  const seller = await prisma.user.upsert({
    where: { phone: "+265991000002" },
    update: {},
    create: { phone: "+265991000002", name: "Harrison Kamanga", role: "BUYER", phoneVerifiedAt: new Date() },
  });

  const dealerUser = await prisma.user.upsert({
    where: { phone: "+265991000003" },
    update: {},
    create: {
      phone: "+265991000003",
      name: "Blantyre Motors",
      role: "DEALER",
      phoneVerifiedAt: new Date(),
      sellerAccount: {
        create: {
          businessName: "Blantyre Motors Ltd",
          registrationNumber: "BN-2018-0451",
          verified: true,
          district: "Blantyre",
          description: "Registered dealer specialising in Japanese import SUVs and pickups since 2018.",
          status: "APPROVED",
          subscriptionStatus: "TRIAL",
          trialEndsAt: new Date(Date.now() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { phone: "+265991000000" },
    update: {},
    create: { phone: "+265991000000", name: "Admin", role: "ADMIN", phoneVerifiedAt: new Date() },
  });

  await prisma.user.upsert({
    where: { phone: "+265886683812" },
    update: { role: "DEVELOPER" },
    create: { phone: "+265886683812", name: "Manager", role: "DEVELOPER", phoneVerifiedAt: new Date() },
  });

  await prisma.user.upsert({
    where: { phone: "+265991000004" },
    update: {},
    create: {
      phone: "+265991000004",
      name: "Zomba Auto",
      role: "DEALER",
      phoneVerifiedAt: new Date(),
      sellerAccount: {
        create: {
          businessName: "Zomba Auto Traders",
          district: "Zomba",
          description: "Family-run car dealership, new to Galimoto Hub.",
          status: "PENDING_APPROVAL",
        },
      },
    },
  });

  console.log("Seeding payment methods and plans...");
  await prisma.paymentMethod.upsert({
    where: { id: "seed-standard-bank" },
    update: {},
    create: {
      id: "seed-standard-bank",
      type: PaymentMethodType.STANDARD_BANK,
      label: "Standard Bank",
      accountName: "Galimoto Hub Ltd",
      accountNumber: "9120004455112",
      instructions: "Use your business name as the payment reference.",
      sortOrder: 1,
    },
  });
  await prisma.paymentMethod.upsert({
    where: { id: "seed-national-bank" },
    update: {},
    create: {
      id: "seed-national-bank",
      type: PaymentMethodType.NATIONAL_BANK,
      label: "National Bank",
      accountName: "Galimoto Hub Ltd",
      accountNumber: "1005500221",
      sortOrder: 2,
    },
  });
  await prisma.paymentMethod.upsert({
    where: { id: "seed-mpamba" },
    update: {},
    create: {
      id: "seed-mpamba",
      type: PaymentMethodType.MPAMBA,
      label: "Mpamba",
      accountName: "Galimoto Hub",
      phoneNumber: "+265881234567",
      sortOrder: 3,
    },
  });
  await prisma.paymentMethod.upsert({
    where: { id: "seed-airtel-money" },
    update: {},
    create: {
      id: "seed-airtel-money",
      type: PaymentMethodType.AIRTEL_MONEY,
      label: "Airtel Money",
      accountName: "Galimoto Hub",
      phoneNumber: "+265991234567",
      sortOrder: 4,
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { id: "seed-monthly-plan" },
    update: {},
    create: { id: "seed-monthly-plan", name: "Monthly", priceMwk: 15000, durationDays: 30 },
  });

  console.log("Seeding sample listings...");
  const hilux = await prisma.carModel.findFirstOrThrow({ where: { slug: "hilux-2-5-d-4d" } });
  const axio = await prisma.carModel.findFirstOrThrow({ where: { slug: "corolla-axio-1-5" } });
  const xtrail = await prisma.carModel.findFirstOrThrow({ where: { slug: "x-trail-2-0" } });
  const prado = await prisma.carModel.findFirstOrThrow({ where: { slug: "land-cruiser-prado" } });
  const demio = await prisma.carModel.findFirstOrThrow({ where: { slug: "demio" } });
  const landCruiser300 = await prisma.carModel.findFirstOrThrow({ where: { slug: "land-cruiser-300" } });
  const ranger = await prisma.carModel.findFirstOrThrow({ where: { slug: "ranger" } });
  const golf = await prisma.carModel.findFirstOrThrow({ where: { slug: "golf" } });
  const series320i = await prisma.carModel.findFirstOrThrow({ where: { slug: "3-series-320i" } });
  const pajero = await prisma.carModel.findFirstOrThrow({ where: { slug: "pajero" } });
  const tucson = await prisma.carModel.findFirstOrThrow({ where: { slug: "tucson" } });
  const sportage = await prisma.carModel.findFirstOrThrow({ where: { slug: "sportage" } });

  const lilongwe = await prisma.district.findFirstOrThrow({ where: { name: "Lilongwe" } });
  const blantyre = await prisma.district.findFirstOrThrow({ where: { name: "Blantyre" } });
  const mzuzu = await prisma.district.findFirstOrThrow({ where: { name: "Mzuzu" } });
  const zomba = await prisma.district.findFirstOrThrow({ where: { name: "Zomba" } });
  const kasungu = await prisma.district.findFirstOrThrow({ where: { name: "Kasungu" } });

  const listingsSeed = [
    {
      sellerId: seller.id,
      sellerType: SellerType.PRIVATE,
      carModelId: hilux.id,
      title: "Toyota Hilux 2.5 D-4D, well maintained, single owner",
      brandName: "Toyota",
      modelName: "Hilux 2.5 D-4D",
      year: 2012,
      priceMwk: 19000000,
      mileageKm: 145000,
      transmission: Transmission.MANUAL,
      fuelType: FuelType.DIESEL,
      bodyType: BodyType.PICKUP,
      engineCc: 2494,
      seating: 5,
      drivetrain: Drivetrain.FOUR_WD,
      saleCondition: SaleCondition.FOREIGN_USED,
      condition: "Good",
      description: "Full service history, new tyres fitted 2025, no accidents. Based in Lilongwe.",
      districtId: lilongwe.id,
      featured: true,
    },
    {
      sellerId: dealerUser.id,
      sellerType: SellerType.DEALER,
      carModelId: axio.id,
      title: "Toyota Corolla Axio 1.5, low mileage, dealer serviced",
      brandName: "Toyota",
      modelName: "Corolla Axio 1.5",
      year: 2014,
      priceMwk: 8900000,
      mileageKm: 68000,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      bodyType: BodyType.SEDAN,
      engineCc: 1496,
      seating: 5,
      drivetrain: Drivetrain.TWO_WD,
      saleCondition: SaleCondition.FOREIGN_USED,
      condition: "Excellent",
      description: "Imported directly by Blantyre Motors, inspected and serviced before listing.",
      districtId: blantyre.id,
      featured: true,
    },
    {
      sellerId: dealerUser.id,
      sellerType: SellerType.DEALER,
      carModelId: xtrail.id,
      title: "Nissan X-Trail 2.0, spacious family SUV",
      brandName: "Nissan",
      modelName: "X-Trail 2.0",
      year: 2010,
      priceMwk: 12200000,
      mileageKm: 132000,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      bodyType: BodyType.SUV,
      engineCc: 1997,
      seating: 5,
      drivetrain: Drivetrain.AWD,
      saleCondition: SaleCondition.FOREIGN_USED,
      condition: "Good",
      description: "Great family car, AWD engaged and tested, ready for the rainy season.",
      districtId: blantyre.id,
    },
    {
      sellerId: buyer.id,
      sellerType: SellerType.PRIVATE,
      carModelId: prado.id,
      title: "Land Cruiser Prado, NGO fleet, full records",
      brandName: "Toyota",
      modelName: "Land Cruiser Prado",
      year: 2015,
      priceMwk: 41000000,
      mileageKm: 98000,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      bodyType: BodyType.SUV,
      engineCc: 2982,
      seating: 7,
      drivetrain: Drivetrain.FOUR_WD,
      saleCondition: SaleCondition.LOCALLY_USED,
      condition: "Excellent",
      description: "Former NGO vehicle, meticulously maintained with full garage records available.",
      districtId: mzuzu.id,
      featured: true,
    },
    {
      sellerId: buyer.id,
      sellerType: SellerType.PRIVATE,
      carModelId: demio.id,
      title: "Mazda Demio, economical town car",
      brandName: "Mazda",
      modelName: "Demio",
      year: 2013,
      priceMwk: 5300000,
      mileageKm: 89000,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      bodyType: BodyType.HATCHBACK,
      engineCc: 1300,
      seating: 5,
      drivetrain: Drivetrain.TWO_WD,
      saleCondition: SaleCondition.LOCALLY_USED,
      condition: "Good",
      description: "Perfect first car, sips fuel, easy to park anywhere in town.",
      districtId: zomba.id,
    },
    {
      sellerId: dealerUser.id,
      sellerType: SellerType.DEALER,
      title: "Suzuki Alto, brand new, dealer stock",
      brandName: "Suzuki",
      modelName: "Alto",
      year: 2026,
      priceMwk: 4800000,
      mileageKm: 20,
      transmission: Transmission.MANUAL,
      fuelType: FuelType.PETROL,
      bodyType: BodyType.HATCHBACK,
      engineCc: 1000,
      seating: 4,
      drivetrain: Drivetrain.TWO_WD,
      saleCondition: SaleCondition.NEW,
      condition: "Excellent",
      description: "Brand new, unregistered, straight from Blantyre Motors showroom stock.",
      districtId: blantyre.id,
      featured: true,
    },
    {
      sellerId: dealerUser.id,
      sellerType: SellerType.DEALER,
      carModelId: landCruiser300.id,
      title: "Toyota Land Cruiser 300, brand new, dealer import",
      brandName: "Toyota",
      modelName: "Land Cruiser 300",
      year: 2025,
      priceMwk: 68000000,
      mileageKm: 50,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      bodyType: BodyType.SUV,
      engineCc: 3346,
      seating: 8,
      drivetrain: Drivetrain.FOUR_WD,
      saleCondition: SaleCondition.NEW,
      condition: "Excellent",
      description: "Factory new, dealer sourced, full manufacturer warranty still active.",
      districtId: lilongwe.id,
      featured: true,
    },
    {
      sellerId: dealerUser.id,
      sellerType: SellerType.DEALER,
      carModelId: ranger.id,
      title: "Ford Ranger, strong tow capacity, fleet maintained",
      brandName: "Ford",
      modelName: "Ranger",
      year: 2018,
      priceMwk: 18500000,
      mileageKm: 91000,
      transmission: Transmission.MANUAL,
      fuelType: FuelType.DIESEL,
      bodyType: BodyType.PICKUP,
      engineCc: 2198,
      seating: 5,
      drivetrain: Drivetrain.FOUR_WD,
      saleCondition: SaleCondition.FOREIGN_USED,
      condition: "Good",
      description: "Well kept fleet pickup, service records available, strong for farm and business use.",
      districtId: blantyre.id,
    },
    {
      sellerId: seller.id,
      sellerType: SellerType.PRIVATE,
      carModelId: golf.id,
      title: "Volkswagen Golf, well cared for, private owner",
      brandName: "Volkswagen",
      modelName: "Golf",
      year: 2016,
      priceMwk: 7200000,
      mileageKm: 95000,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      bodyType: BodyType.HATCHBACK,
      engineCc: 1400,
      seating: 5,
      drivetrain: Drivetrain.TWO_WD,
      saleCondition: SaleCondition.LOCALLY_USED,
      condition: "Good",
      description: "Comfortable European hatchback, refined ride, always garaged.",
      districtId: lilongwe.id,
    },
    {
      sellerId: dealerUser.id,
      sellerType: SellerType.DEALER,
      carModelId: series320i.id,
      title: "BMW 3 Series 320i, sharp handling, dealer inspected",
      brandName: "BMW",
      modelName: "3 Series 320i",
      year: 2015,
      priceMwk: 14500000,
      mileageKm: 110000,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      bodyType: BodyType.SEDAN,
      engineCc: 1997,
      seating: 5,
      drivetrain: Drivetrain.TWO_WD,
      saleCondition: SaleCondition.FOREIGN_USED,
      condition: "Excellent",
      description: "Premium sedan for a private buyer wanting something different from the usual Japanese saloons.",
      districtId: lilongwe.id,
    },
    {
      sellerId: buyer.id,
      sellerType: SellerType.PRIVATE,
      carModelId: pajero.id,
      title: "Mitsubishi Pajero, spacious family 4x4",
      brandName: "Mitsubishi",
      modelName: "Pajero",
      year: 2014,
      priceMwk: 23000000,
      mileageKm: 120000,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.DIESEL,
      bodyType: BodyType.SUV,
      engineCc: 2477,
      seating: 7,
      drivetrain: Drivetrain.FOUR_WD,
      saleCondition: SaleCondition.FOREIGN_USED,
      condition: "Good",
      description: "Roomy 7 seat 4x4, great for a big family and rough roads alike.",
      districtId: mzuzu.id,
    },
    {
      sellerId: dealerUser.id,
      sellerType: SellerType.DEALER,
      carModelId: tucson.id,
      title: "Hyundai Tucson, modern crossover, dealer serviced",
      brandName: "Hyundai",
      modelName: "Tucson",
      year: 2018,
      priceMwk: 16000000,
      mileageKm: 75000,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      bodyType: BodyType.SUV,
      engineCc: 1999,
      seating: 5,
      drivetrain: Drivetrain.AWD,
      saleCondition: SaleCondition.FOREIGN_USED,
      condition: "Excellent",
      description: "Comfortable town crossover, dealer serviced before listing, great fuel economy for its size.",
      districtId: zomba.id,
      featured: true,
    },
    {
      sellerId: buyer.id,
      sellerType: SellerType.PRIVATE,
      carModelId: sportage.id,
      title: "Kia Sportage, stylish crossover, private sale",
      brandName: "Kia",
      modelName: "Sportage",
      year: 2019,
      priceMwk: 15500000,
      mileageKm: 88000,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      bodyType: BodyType.SUV,
      engineCc: 1997,
      seating: 5,
      drivetrain: Drivetrain.AWD,
      saleCondition: SaleCondition.FOREIGN_USED,
      condition: "Excellent",
      description: "Well equipped crossover, single owner from new import, no accidents.",
      districtId: kasungu.id,
    },
  ];

  for (const l of listingsSeed) {
    await prisma.listing.upsert({
      where: { sellerId_title: { sellerId: l.sellerId, title: l.title } },
      update: {},
      create: { ...l, status: ListingStatus.ACTIVE },
    });
  }

  console.log("Seeding demo draft and pending listings...");
  await prisma.listing.upsert({
    where: { sellerId_title: { sellerId: dealerUser.id, title: "Isuzu D-Max, draft in progress" } },
    update: {},
    create: {
      sellerId: dealerUser.id,
      sellerType: SellerType.DEALER,
      title: "Isuzu D-Max, draft in progress",
      brandName: "Isuzu",
      modelName: "D-Max",
      year: 2017,
      priceMwk: 15500000,
      mileageKm: 102000,
      transmission: Transmission.MANUAL,
      fuelType: FuelType.DIESEL,
      bodyType: BodyType.PICKUP,
      saleCondition: SaleCondition.FOREIGN_USED,
      condition: "Good",
      status: ListingStatus.DRAFT,
    },
  });

  await prisma.listing.upsert({
    where: { sellerId_title: { sellerId: dealerUser.id, title: "Honda Fit, awaiting approval" } },
    update: {},
    create: {
      sellerId: dealerUser.id,
      sellerType: SellerType.DEALER,
      title: "Honda Fit, awaiting approval",
      brandName: "Honda",
      modelName: "Fit",
      year: 2013,
      priceMwk: 6100000,
      mileageKm: 78000,
      transmission: Transmission.AUTOMATIC,
      fuelType: FuelType.PETROL,
      bodyType: BodyType.HATCHBACK,
      saleCondition: SaleCondition.FOREIGN_USED,
      condition: "Good",
      status: ListingStatus.PENDING_APPROVAL,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
