"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  checkDomainAvailability,
  generateVerificationToken,
  getDnsVerificationRecord,
  getFileVerificationPath,
} from "@/lib/data/domains";

const domainSchema = z.object({
  domain: z
    .string()
    .min(3, "Domain en az 3 karakter olmalı")
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-_.]+[a-zA-Z0-9]$/,
      "Geçersiz domain formatı"
    ),
  type: z.enum(["custom", "subdomain"]).default("custom"),
  verificationMethod: z.enum(["dns", "file"]).default("dns"),
});

export type DomainFormState = {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
  messageKey?: string;
  success?: boolean;
  verificationInfo?: {
    token: string;
    method: string;
    dnsRecord?: { type: string; name: string; value: string };
    filePath?: { path: string; content: string };
  };
};

export async function addDomainAction(
  _prevState: DomainFormState,
  formData: FormData
): Promise<DomainFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  const rawData = {
    domain: (formData.get("domain") as string)?.toLowerCase().trim(),
    type: formData.get("type") as string || "custom",
    verificationMethod: formData.get("verificationMethod") as string || "dns",
  };

  const validatedFields = domainSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      messageKey: "formValidationError",
      success: false,
    };
  }

  // Check availability
  const availability = await checkDomainAvailability(
    validatedFields.data.domain,
    session.user.dealerId
  );

  if (!availability.available) {
    return {
      errors: { domain: [availability.reason || "Domain kullanılamaz"] },
      messageKey: "domainNotAvailable",
      success: false,
    };
  }

  const verificationToken = generateVerificationToken();

  try {
    await prisma.dealerDomain.create({
      data: {
        dealerId: session.user.dealerId,
        domain: validatedFields.data.domain,
        type: validatedFields.data.type,
        verificationMethod: validatedFields.data.verificationMethod,
        verificationToken,
        verified: false,
        isPrimary: false,
        isActive: true,
      },
    });

    revalidatePath("/customization/domain");

    // Prepare verification info
    const verificationInfo: DomainFormState["verificationInfo"] = {
      token: verificationToken,
      method: validatedFields.data.verificationMethod,
    };

    if (validatedFields.data.verificationMethod === "dns") {
      verificationInfo.dnsRecord = getDnsVerificationRecord(
        validatedFields.data.domain,
        verificationToken
      );
    } else {
      verificationInfo.filePath = getFileVerificationPath(verificationToken);
    }

    return {
      messageKey: "domainAdded",
      success: true,
      verificationInfo,
    };
  } catch (error) {
    console.error("Add domain error:", error);
    return {
      messageKey: "createError",
      success: false,
    };
  }
}

export async function verifyDomainAction(
  domainId: string
): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  // Get domain
  const domain = await prisma.dealerDomain.findFirst({
    where: {
      id: domainId,
      dealerId: session.user.dealerId,
    },
  });

  if (!domain) {
    return { messageKey: "domainNotFound", success: false };
  }

  if (domain.verified) {
    return { messageKey: "alreadyVerified", success: true };
  }

  // Perform verification based on method
  let verified = false;

  if (domain.verificationMethod === "dns") {
    // DNS verification - check TXT record
    try {
      const dns = await import("dns").then((m) => m.promises);
      const records = await dns.resolveTxt(`_verify.${domain.domain}`);
      const expectedValue = `futbol-okullari-verify=${domain.verificationToken}`;

      verified = records.some((record) =>
        record.some((txt) => txt === expectedValue)
      );
    } catch (error) {
      console.error("DNS verification error:", error);
      verified = false;
    }
  } else {
    // File verification - check HTTP endpoint
    try {
      const response = await fetch(
        `https://${domain.domain}/.well-known/futbol-okullari-verify.txt`
      );
      if (response.ok) {
        const content = await response.text();
        verified = content.trim() === domain.verificationToken;
      }
    } catch (error) {
      console.error("File verification error:", error);
      verified = false;
    }
  }

  if (!verified) {
    return { messageKey: "verificationFailed", success: false };
  }

  try {
    await prisma.dealerDomain.update({
      where: { id: domainId },
      data: {
        verified: true,
        verifiedAt: new Date(),
      },
    });

    revalidatePath("/customization/domain");

    return {
      messageKey: "domainVerified",
      success: true,
    };
  } catch (error) {
    console.error("Update domain error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function removeDomainAction(
  domainId: string
): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  // Verify domain belongs to this dealer
  const domain = await prisma.dealerDomain.findFirst({
    where: {
      id: domainId,
      dealerId: session.user.dealerId,
    },
  });

  if (!domain) {
    return { messageKey: "domainNotFound", success: false };
  }

  try {
    await prisma.dealerDomain.delete({
      where: { id: domainId },
    });

    revalidatePath("/customization/domain");

    return {
      messageKey: "domainRemoved",
      success: true,
    };
  } catch (error) {
    console.error("Remove domain error:", error);
    return {
      messageKey: "deleteError",
      success: false,
    };
  }
}

export async function setPrimaryDomainAction(
  domainId: string
): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  // Verify domain belongs to this dealer and is verified
  const domain = await prisma.dealerDomain.findFirst({
    where: {
      id: domainId,
      dealerId: session.user.dealerId,
      verified: true,
    },
  });

  if (!domain) {
    return { messageKey: "domainNotFound", success: false };
  }

  try {
    // Remove primary from all other domains
    await prisma.dealerDomain.updateMany({
      where: {
        dealerId: session.user.dealerId,
        isPrimary: true,
      },
      data: { isPrimary: false },
    });

    // Set this one as primary
    await prisma.dealerDomain.update({
      where: { id: domainId },
      data: { isPrimary: true },
    });

    // Also update dealer's customDomain
    await prisma.dealer.update({
      where: { id: session.user.dealerId },
      data: { customDomain: domain.domain },
    });

    revalidatePath("/customization/domain");

    return {
      messageKey: "primaryDomainSet",
      success: true,
    };
  } catch (error) {
    console.error("Set primary domain error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function toggleDomainStatusAction(
  domainId: string,
  isActive: boolean
): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  // Verify domain belongs to this dealer
  const domain = await prisma.dealerDomain.findFirst({
    where: {
      id: domainId,
      dealerId: session.user.dealerId,
    },
  });

  if (!domain) {
    return { messageKey: "domainNotFound", success: false };
  }

  try {
    await prisma.dealerDomain.update({
      where: { id: domainId },
      data: { isActive },
    });

    revalidatePath("/customization/domain");

    return {
      messageKey: isActive ? "domainActivated" : "domainDeactivated",
      success: true,
    };
  } catch (error) {
    console.error("Toggle domain status error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function updateSubdomainAction(
  subdomain: string
): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  // Validate subdomain
  const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
  if (subdomain && !subdomainRegex.test(subdomain)) {
    return { messageKey: "invalidSubdomain", success: false };
  }

  // Check availability
  if (subdomain) {
    const existing = await prisma.dealer.findFirst({
      where: {
        subdomain,
        id: { not: session.user.dealerId },
      },
    });

    if (existing) {
      return { messageKey: "subdomainTaken", success: false };
    }
  }

  try {
    await prisma.dealer.update({
      where: { id: session.user.dealerId },
      data: { subdomain: subdomain || null },
    });

    revalidatePath("/customization/domain");

    return {
      messageKey: subdomain ? "subdomainUpdated" : "subdomainRemoved",
      success: true,
    };
  } catch (error) {
    console.error("Update subdomain error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}
