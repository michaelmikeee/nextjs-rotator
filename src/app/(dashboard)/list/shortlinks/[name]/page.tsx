import BigCalendar from "@/components/BigCalender";
import FormContainer from "@/components/FormContainer";
import UpdatePriorityForm from "@/components/forms/UpdatePriorityForm";
import Performance from "@/components/Performance";
import { updateDomainPriority } from "@/lib/actions";
import { checkAllDomains } from "@/lib/checkAllDomains";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { ShortLink } from "@prisma/client";
import Image from "next/image";
import { notFound } from "next/navigation";

const SingleShortlinkPage = async ({
  params: { name },
}: {
  params: { name: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const shortLink = await prisma.shortLink.findUnique({
    where: { name },
    include: {
      domains: true,
      user: true,
      logs: {
        orderBy: {
          createdAt: "desc", // Sort by newest logs first
        },
        take: 50, // Limit to the 50 newest logs
      },
      _count: {
        select: {
          domains: true, // Count the associated domains
        },
      },
    },
  });

  if (!shortLink) {
    return notFound();
  }

  // Check all domains
  const domainStatuses = await checkAllDomains(
    shortLink.id,
    shortLink.domains,
    shortLink.currentDomain
  );

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-full flex flex-col justify-between gap-4 p-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{shortLink.name}</h1>
                {role === "admin" && (
                  <FormContainer
                    table="shortlink"
                    type="update"
                    data={shortLink}
                  />
                )}
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/domain2.png" alt="" width={20} height={20} />
                  <span className="text-md pl-1">
                    {shortLink.currentDomain || "-"}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={20} height={20} />
                  <span className="text-md pl-1">
                    {shortLink.createdAt?.toLocaleString() || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-8 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] items-center">
              <Image
                src="/singleAttendance.png"
                alt=""
                width={36}
                height={36}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">
                  {shortLink.user!.limit}
                </h1>
                <span className="text-sm text-gray-400">Domains Limit</span>
              </div>
            </div>
            {/* CARD */}
            <div className="bg-white p-4 rounded-md flex gap-8 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] items-center">
              <Image
                src="/singleBranch.png"
                alt=""
                width={36}
                height={36}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">
                  {shortLink._count.domains}
                </h1>
                <span className="text-sm text-gray-400">Domains</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-4 bg-white rounded-md p-4 h-[800px]">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Domain URL
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {shortLink.domains.map((domain, index) => (
                  <tr className="bg-white border-b " key={index}>
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                    >
                      {domain.url}
                    </th>
                    <td
                      className={`px-6 py-4 ${
                        domain.isBlocked ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {domain.isBlocked ? "Blocked" : "Active"}
                    </td>
                    <td className="px-6 py-4">
                      <UpdatePriorityForm
                        domainId={domain.id}
                        initialPriority={domain.priority}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <FormContainer
                        table="domain"
                        type="removeDomain"
                        id={domain.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white rounded-md shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4">Logs</h3>
          {shortLink.logs.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {shortLink.logs
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                ) // Sort by newest first
                .slice(0, 50) // Take only the newest 50 logs
                .map((log, index) => (
                  <li key={index} className="py-2 text-sm text-gray-700">
                    <span className="block font-medium">{log.message}</span>
                    <span className="block text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">
              No logs available for this shortlink.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleShortlinkPage;
