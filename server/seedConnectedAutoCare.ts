import { db } from "./db";
import { tenants, products } from "@shared/schema";
import { CONNECTED_AUTO_CARE_PRODUCTS } from "./services/connectedAutoCareService";

async function seedConnectedAutoCareData() {
  try {
    console.log('Seeding Connected Auto Care VSC data...');

    // Create Connected Auto Care tenant
    const [cacTenant] = await db.insert(tenants).values({
      id: 'connected-auto-care',
      name: 'Connected Auto Care',
      subdomain: 'cac',
      settings: {
        branding: {
          primaryColor: '#1e40af',
          companyName: 'Connected Auto Care',
          website: 'https://www.connectedautocare.com'
        },
        administrator: {
          name: 'Ascent Administration Services, LLC',
          address: '360 South Smith Road, Tempe, Arizona 85281',
          phone: '866-660-7003',
          roadsidePhone: '877-626-0880',
          website: 'AscentAdmin.com'
        },
        features: {
          deductible: '$0 at selling dealer, $100 elsewhere',
          laborRate: '$150.00 per hour maximum',
          roadside: '24-hour assistance and towing',
          rental: 'Rental car reimbursement available'
        }
      },
      isActive: true
    }).onConflictDoUpdate({
      target: tenants.id,
      set: {
        name: 'Connected Auto Care',
        settings: {
          branding: {
            primaryColor: '#1e40af',
            companyName: 'Connected Auto Care',
            website: 'https://www.connectedautocare.com'
          },
          administrator: {
            name: 'Ascent Administration Services, LLC',
            address: '360 South Smith Road, Tempe, Arizona 85281',
            phone: '866-660-7003',
            roadsidePhone: '877-626-0880',
            website: 'AscentAdmin.com'
          },
          features: {
            deductible: '$0 at selling dealer, $100 elsewhere',
            laborRate: '$150.00 per hour maximum',
            roadside: '24-hour assistance and towing',
            rental: 'Rental car reimbursement available'
          }
        },
        updatedAt: new Date()
      }
    }).returning();

    console.log('Connected Auto Care tenant created/updated:', cacTenant.id);

    // Create Connected Auto Care VSC products in database
    for (const [productKey, productData] of Object.entries(CONNECTED_AUTO_CARE_PRODUCTS)) {
      const product = await db.insert(products).values({
        id: productData.id,
        tenantId: cacTenant.id,
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

      console.log(`Connected Auto Care product created/updated: ${product[0].name}`);
    }

    console.log('Connected Auto Care VSC data seeding completed successfully!');
    
    return {
      tenantId: cacTenant.id,
      productCount: Object.keys(CONNECTED_AUTO_CARE_PRODUCTS).length
    };

  } catch (error) {
    console.error('Error seeding Connected Auto Care data:', error);
    throw error;
  }
}

// Run seeding if called directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedConnectedAutoCareData()
    .then((result) => {
      console.log('Seeding result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedConnectedAutoCareData };