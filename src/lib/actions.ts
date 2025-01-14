"use server";

import { revalidatePath } from "next/cache";
import {
  DomainSchema,
  ShortlinkSchema,
  UserSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { auth, clerkClient, getAuth } from "@clerk/nextjs/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const { userId } = auth();

type FormState = {
  currentState: CurrentStateWithMessage;
  data: ShortlinkSchema;
};

type CurrentStateWithMessage = {
  success: boolean;
  error: boolean;
  message: string;
};
type CurrentState = { success: boolean; error: boolean };

export const createUser = async (
  currentState: CurrentState,
  data: UserSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      publicMetadata: { role: "user", validUntil: data.validUntil },
    });

    await prisma.user.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name || null,
        email: data.email || "",
        limit: data.limit,
        validUntil: data.validUntil || "",
        shortLinks: {
          connect: data.shortLinks?.map((shortLinkId: string) => ({
            id: parseInt(shortLinkId),
          })),
        },
        domains: {
          connect: data.domains?.map((domainId: string) => ({
            id: parseInt(domainId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateUser = async (
  currentState: CurrentState,
  data: UserSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      publicMetadata: { validUntil: data.validUntil },
    });

    await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name || null,
        email: data.email || "",
        limit: data.limit,
        validUntil: data.validUntil || "",
        shortLinks: {
          set: data.shortLinks?.map((shortLinkId: string) => ({
            id: parseInt(shortLinkId),
          })),
        },
        domains: {
          set: data.domains?.map((domainId: string) => ({
            id: parseInt(domainId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteUser = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.user.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const wrappedCreateShortlink = async (
  state: CurrentStateWithMessage,
  { data }: { data: ShortlinkSchema }
): Promise<CurrentStateWithMessage> => {
  console.log("Creating shortlink with data:", data); // Log data before API call
  const result = await createShortlink(state, data);
  console.log("API response:", result); // Log API response
  return {
    success: result.success,
    error: result.error,
    message: result.message || "",
  };
};

export const wrappedUpdateShortlink = async (
  state: CurrentStateWithMessage,
  { data }: { data: ShortlinkSchema }
): Promise<CurrentStateWithMessage> => {
  const result = await updateShortlink(state, data);
  return {
    success: result.success,
    error: result.error,
    message: result.message || "",
  };
};

export const createShortlink = async (
  currentState: CurrentStateWithMessage,
  data: ShortlinkSchema
) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId!,
      },
      include: {
        _count: {
          select: { shortLinks: true },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: true,
        message: "User not found.",
      };
    }

    // Check if the user has reached their shortlink limit
    if (user._count.shortLinks >= user.limit) {
      return {
        success: false,
        error: true,
        message: "You have reached the limit of shortlinks you can create.",
      };
    }

    const existingShortLink = await prisma.shortLink.findUnique({
      where: {
        name: data.name,
      },
    });

    if (existingShortLink) {
      return {
        success: false,
        error: true,
        message: "Shortlink name must be unique.",
      };
    }
    await prisma.shortLink.create({
      data: {
        name: data.name,
        slug: data.name,
        userId: userId,
      },
    });

    // revalidatePath("/list/class");
    console.log("Shortlink created successfully.");
    return { success: true, error: false, message: "" };
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = error.meta?.target as string[];
      if (target && target.includes("name")) {
        return {
          success: false,
          error: true,
          message: "shortlink has been taken.",
        };
      }
    }
    console.log(error);
    return { success: false, error: true, message: "An error occurred." };
  }
};

export const updateShortlink = async (
  currentState: CurrentStateWithMessage,
  data: ShortlinkSchema
) => {
  try {
    const existingShortLink = await prisma.shortLink.findFirst({
      where: {
        name: data.name,
        id: {
          not: data.id, // Exclude the current shortlink from the check
        },
      },
    });

    if (existingShortLink) {
      return {
        success: false,
        error: true,
        message: "Shortlink name must be unique.",
      };
    }

    const shortLink = await prisma.shortLink.findUnique({
      where: {
        id: data.id,
      },
      select: {
        domains: true, // Only fetch the connected domains
      },
    });

    if (!shortLink) {
      throw new Error("ShortLink not found");
    }

    const currentDomainIds = shortLink.domains.map((domain) => domain.id);
    const selectedDomainIds = (data.domains || []).map((id) =>
      parseInt(id, 10)
    );

    const domainsToConnect = selectedDomainIds
      .filter((id) => !currentDomainIds.includes(id))
      .map((id) => ({ id }));

    const domainsToDisconnect = currentDomainIds
      .filter((id) => !selectedDomainIds.includes(id))
      .map((id) => ({ id }));

    // Step 2: Check if the maximum limit is reached

    if (
      currentDomainIds.length -
        domainsToDisconnect.length +
        domainsToConnect.length >
      5
    ) {
      return {
        success: false,
        error: true,
        message:
          "Cannot add more than 5 domains. Please remove a domain first.",
      };
    }

    await prisma.shortLink.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        domains: {
          disconnect: domainsToDisconnect,
          connect: domainsToConnect,
        },
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteShortlink = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.shortLink.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createDomain = async (
  currentState: CurrentState,
  data: DomainSchema
) => {
  try {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    await prisma.domain.create({
      data: {
        url: data.url,
        userId: userId!,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateDomain = async (
  currentState: CurrentState,
  data: DomainSchema
) => {
  try {
    await prisma.domain.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteDomain = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.domain.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateDomainPriority = async (id: number, priority: number) => {
  try {
    // Update the priority of the domain
    const updatedDomain = await prisma.domain.update({
      where: { id },
      data: { priority },
      include: { shortLink: true }, // Include the associated shortlink
    });

    // Check if the priority is set to 1
    if (priority === 1 && updatedDomain.shortLink) {
      // Update the currentDomain in the associated shortlink
      await prisma.shortLink.update({
        where: { id: updatedDomain.shortLinkId! }, // Ensure shortLinkId exists
        data: { currentDomain: updatedDomain.url }, // Set currentDomain to the domain's URL
      });
    }
    return { success: true, error: false };
  } catch (error) {
    console.error("Failed to update domain priority:", error);
    return { success: false, error };
  }
};

export const removeDomainFromShortlink = async (domainId: number) => {
  try {
    await prisma.domain.update({
      where: { id: domainId },
      data: { shortLinkId: null },
    });

    return {
      success: true,
      error: false,
      message: "Domain removed from shortlink.",
    };
  } catch (error) {
    console.error("Error removing domain:", error);
    return {
      success: false,
      error: false,
      message: "Failed to remove domain.",
    };
  }
};
