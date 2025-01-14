import prisma from "@/lib/prisma";
// import { checkDomainStatus } from "./checkDomainStatus";

export const checkAllDomains = async (
  shortLinkId: number,
  domains: {
    id: number;
    url: string;
    priority: number;
    isBlocked: boolean;
    blockedAt: Date | null;
  }[],
  currentDomain: string | null
) => {
  console.log(`Starting domain checks for shortLinkId: ${shortLinkId}`);
  const results = [];
  const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  for (const domain of domains) {
    try {
      console.log(`Checking domain: ${domain.url}`);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/check-domain-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ domainUrl: domain.url }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch domain status for ${domain.url}`);
      }

      const status = await response.json();

      console.log(`API response for domain ${domain.url}:`, status);
      // Determine if the domain is blocked
      const isBlocked = status?.values[0]?.Status?.toLowerCase() === "ada";

      // Check if the domain status has changed
      if (isBlocked && !domain.isBlocked) {
        // Update the domain's isBlocked field and blockedAt timestamp in the database
        console.log(`Updating domain status for ${domain.url}...`);
        await prisma.domain.update({
          where: { id: domain.id },
          data: {
            isBlocked: true,
            blockedAt: new Date(),
          },
        });

        // Add a log entry for the domain being blocked
        await prisma.log.create({
          data: {
            shortLinkId,
            message: `Domain ${domain.url} was blocked.`,
          },
        });

        console.log(`Domain ${domain.url} is blocked and has been updated.`);
      } else if (!isBlocked && domain.isBlocked) {
        // Update the domain's isBlocked field and reset blockedAt if unblocked
        await prisma.domain.update({
          where: { id: domain.id },
          data: {
            isBlocked: false,
            blockedAt: null,
          },
        });

        // Add a log entry for the domain being unblocked
        await prisma.log.create({
          data: {
            shortLinkId,
            message: `Domain ${domain.url} is now unblocked.`,
          },
        });

        console.log(`Domain ${domain.url} is now unblocked.`);
      } else {
        console.log(
          `Domain ${domain.url} status unchanged (Blocked: ${domain.isBlocked}).`
        );
      }

      // Store the result
      results.push({
        domain: domain.url,
        status: status?.values[0]?.Status || "Unknown",
        isBlocked,
      });
    } catch (error) {
      // Log any errors during the API call or database update
      console.error(`Error processing domain ${domain.url}:`, error);

      // Check if the error is an instance of Error
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Add a log entry for the error
      await prisma.log.create({
        data: {
          shortLinkId,
          message: `Error processing domain ${domain.url}: ${errorMessage}`,
        },
      });
    }
  }

  const currentDomainStatus = results.find(
    (result) => result.domain === currentDomain && result.isBlocked
  );

  if (currentDomainStatus) {
    console.log(
      `Current domain ${currentDomain} is blocked. Searching for a replacement...`
    );

    // Find the next available domain with the lowest priority that is not blocked
    const replacementDomain = domains
      .filter((domain) => !domain.isBlocked)
      .sort((a, b) => a.priority - b.priority)
      .find((domain) => domain.priority >= 2 && domain.priority <= 5);

    if (replacementDomain) {
      console.log(`Switching to new domain: ${replacementDomain.url}`);

      // Update the shortlink's currentDomain to the replacement domain
      await prisma.shortLink.update({
        where: { id: shortLinkId },
        data: { currentDomain: replacementDomain.url },
      });

      // Add a log entry for the currentDomain update
      await prisma.log.create({
        data: {
          shortLinkId,
          message: `Current domain switched from ${currentDomain} to ${replacementDomain.url}.`,
        },
      });

      console.log(`Current domain updated to ${replacementDomain.url}`);
    } else {
      console.log("No suitable replacement domain found.");

      // Add a log entry for no replacement found
      await prisma.log.create({
        data: {
          shortLinkId,
          message: `No suitable replacement domain found for current domain ${currentDomain}.`,
        },
      });
    }
  } else {
    console.log(
      "Current domain is not blocked. No changes made to currentDomain."
    );
  }

  return results;
};

export const startCheckingAllShortlinks = () => {
  console.log("Starting shortlink checker...");

  const interval = setInterval(async () => {
    try {
      console.log("Fetching all shortlinks...");
      const shortlinks = await prisma.shortLink.findMany({
        include: {
          domains: true,
        },
      });

      console.log(`Found ${shortlinks.length} shortlinks to process.`);
      for (const shortlink of shortlinks) {
        console.log(`Processing shortlink: ${shortlink.name}`);

        // Call checkAllDomains for each shortlink
        const results = await checkAllDomains(
          shortlink.id,
          shortlink.domains,
          shortlink.currentDomain
        );

        console.log(`Results for shortlink ${shortlink.name}:`, results);
      }

      console.log("Finished checking all shortlinks.");
    } catch (error) {
      console.error("Error checking all shortlinks:", error);
    }
  }, 60000); // Run every 60 seconds

  console.log("Shortlink checker is running every minute.");

  // Return a stop function to clear the interval
  return () => {
    clearInterval(interval);
    console.log("Stopped shortlink checker.");
  };
};
