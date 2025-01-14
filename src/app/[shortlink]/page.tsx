import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";

const ShortlinkPage = async ({
  params: { shortlink },
}: {
  params: { shortlink: string };
}) => {
  // Fetch the shortlink and its associated current domain
  const shortLink = await prisma.shortLink.findUnique({
    where: { name: shortlink },
    select: { currentDomain: true },
  });

  // Handle if the shortlink is not found
  if (!shortLink) {
    return notFound(); // Redirect to 404 page
  }

  // Handle if the current domain is not set
  if (!shortLink.currentDomain) {
    return notFound(); // Redirect to 404 if no current domain is set
  }
  console.log("ShortLink Data:", shortLink);

  const redirectUrl = shortLink.currentDomain.startsWith("http")
    ? shortLink.currentDomain
    : `https://${shortLink.currentDomain}`;

  redirect(redirectUrl);
};

export default ShortlinkPage;
