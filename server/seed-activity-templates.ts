// Seed script to populate default activity templates with UTBMS codes
import { db } from "./db";
import { activityTemplates } from "@shared/schema";
import { DEFAULT_ACTIVITY_TEMPLATES } from "@shared/utbmsCodes";

export async function seedActivityTemplates() {
  console.log("Seeding activity templates...");
  
  try {
    // Check if templates already exist
    const existing = await db.select().from(activityTemplates);
    
    if (existing.length > 0) {
      console.log(`Found ${existing.length} existing templates, skipping seed.`);
      return;
    }

    // Insert default templates
    const result = await db.insert(activityTemplates).values(
      DEFAULT_ACTIVITY_TEMPLATES.map(template => ({
        ...template,
        attorneyId: null // Shared templates
      }))
    ).returning();

    console.log(`✓ Successfully seeded ${result.length} activity templates`);
  } catch (error) {
    console.error("Error seeding activity templates:", error);
    throw error;
  }
}

// Auto-run when executed
seedActivityTemplates()
  .then(() => {
    console.log("Seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
