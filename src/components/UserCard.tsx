import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";

const UserCard = async ({
  type,
}: {
  type:
    | "user"
    | "shortlink"
    | "domain"
    | "userBlockedDomain"
    | "userDomain"
    | "userShortlink";
}) => {
  const modelMap: Record<typeof type, any> = {
    user: prisma.user,
    shortlink: prisma.shortLink,
    domain: prisma.domain,
    userBlockedDomain: prisma.domain,
    userDomain: prisma.domain,
    userShortlink: prisma.shortLink,
  };

  const { userId } = auth();

  const data =
    type === "userBlockedDomain"
      ? await modelMap[type].count({
          where: {
            userId,
            isBlocked: true,
          },
        })
      : type === "userDomain"
      ? await modelMap[type].count({
          where: {
            userId,
          },
        })
      : type === "userShortlink"
      ? await modelMap[type].count({
          where: {
            userId,
          },
        })
      : await modelMap[type].count();

  return (
    <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px]">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600">
          2024/25
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-semibold my-4">{data}</h1>
      <h2 className="capitalize text-sm font-medium text-gray-500">
        {type === "userDomain"
          ? "Domains"
          : type === "userShortlink"
          ? "Shortlinks"
          : type === "userBlockedDomain"
          ? "Blocked Domains"
          : type}
      </h2>
    </div>
  );
};

export default UserCard;
