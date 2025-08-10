import { db } from "./db";
import { tenants, products } from "@shared/schema";
import { HERO_VSC_PRODUCTS } from "./services/heroVscService";

async function seedHeroVscData() {
  try {
    console.log('Seeding Hero VSC data...');

    // Create Hero VSC tenant
    const [heroTenant] = await db.insert(tenants).values({
      id: 'hero-vsc',
      name: 'Hero VSC',
      subdomain: 'hero',
      settings: {
        branding: {
          primaryColor: '#0066cc',
          companyName: 'Hero VSC',
          website: 'https://www.herovsc.com'
        },
        features: {
          claimsHotline: '1-877-296-4892',
          onlineClaims: 'www.assuranceplus.com/claims',
          supportEmail: 'support@herovsc.com'
        }
      },
      isActive: true
    }).onConflictDoUpdate({
      target: tenants.id,
      set: {
        name: 'Hero VSC',
        settings: {
          branding: {
            primaryColor: '#0066cc',
            companyName: 'Hero VSC',
            website: 'https://www.herovsc.com'
          },
          features: {
            claimsHotline: '1-877-296-4892',
            onlineClaims: 'www.assuranceplus.com/claims',
            supportEmail: 'support@herovsc.com'
          }
        },
        updatedAt: new Date()
      }
    }).returning();

    console.log('Hero VSC tenant created/updated:', heroTenant.id);

    // Create Hero VSC products in database
    for (const [productKey, productData] of Object.entries(HERO_VSC_PRODUCTS)) {
      const product = await db.insert(products).values({
        id: productData.id,
        tenantId: heroTenant.id,
        name: productData.name,
        category: productData.category as any,
        description: productData.description,
        coverageOptions: productData.coverageOptions || [],
        isActive: true
      }).onConflictDoUpdate({
        target: products.id,
        set: {
          name: productData.name,
          description: productData.description,
          coverageOptions: productData.coverageOptions || [],
          updatedAt: new Date()
        }
      }).returning();

      console.log(`Hero VSC product created/updated: ${product[0].name}`);
    }

    console.log('Hero VSC data seeding completed successfully!');
    
    return {
      tenantId: heroTenant.id,
      productCount: Object.keys(HERO_VSC_PRODUCTS).length
    };

  } catch (error) {
    console.error('Error seeding Hero VSC data:', error);
    throw error;
  }
}

// Run seeding if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedHeroVscData()
    .then((result) => {
      console.log('Seeding result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedHeroVscData };