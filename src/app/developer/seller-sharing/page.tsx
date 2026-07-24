import { getSellerSharingSettings } from "@/lib/sellerSharingSettings";
import SellerSharingSettingsForm from "@/components/developer/SellerSharingSettingsForm";

export default async function DeveloperSellerSharingPage() {
  const settings = await getSellerSharingSettings();

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Marketplace Features</p>
      <h1 className="text-2xl font-bold text-white">Seller Inventory Sharing</h1>
      <p className="mt-1 text-sm text-gray-400">
        Configure the seller public inventory share-link feature: master switch, social sharing options, URL format, SEO,
        analytics collection, and security.
      </p>

      <div className="mt-6">
        <SellerSharingSettingsForm
          key={settings.updatedAt.toISOString()}
          settings={{
            enabled: settings.enabled,
            allowCopyLink: settings.allowCopyLink,
            allowWhatsappShare: settings.allowWhatsappShare,
            allowFacebookShare: settings.allowFacebookShare,
            allowTwitterShare: settings.allowTwitterShare,
            allowTelegramShare: settings.allowTelegramShare,
            allowEmailShare: settings.allowEmailShare,
            allowNativeShare: settings.allowNativeShare,
            urlPrefix: settings.urlPrefix,
            slugFormat: settings.slugFormat,
            fallbackUrl: settings.fallbackUrl,
            disabledMessage: settings.disabledMessage,
            seoIndexing: settings.seoIndexing,
            seoSitemap: settings.seoSitemap,
            seoStructuredData: settings.seoStructuredData,
            seoOpenGraph: settings.seoOpenGraph,
            seoTwitterCard: settings.seoTwitterCard,
            analyticsPageViews: settings.analyticsPageViews,
            analyticsListingClicks: settings.analyticsListingClicks,
            analyticsPhoneClicks: settings.analyticsPhoneClicks,
            analyticsWhatsappClicks: settings.analyticsWhatsappClicks,
            analyticsShareCounts: settings.analyticsShareCounts,
            securityRequireVerification: settings.securityRequireVerification,
            securityHideLocation: settings.securityHideLocation,
            securityHidePhone: settings.securityHidePhone,
            securityHideWhatsapp: settings.securityHideWhatsapp,
            securityRateLimitEnabled: settings.securityRateLimitEnabled,
            securityRateLimitPerMinute: settings.securityRateLimitPerMinute,
          }}
        />
      </div>
    </div>
  );
}
