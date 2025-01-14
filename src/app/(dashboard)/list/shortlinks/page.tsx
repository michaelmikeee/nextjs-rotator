import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ShortLink, Prisma, User, Domain } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";

type ShortlinksList = ShortLink & {
  user: {
    name: string;
  } | null;
} & { domain: Domain[] };

const ShortlinkListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const columns = [
    {
      header: "Info",
      accessor: "info",
    },
    {
      header: "Total Domain",
      accessor: "domainCount",
      className: "hidden md:table-cell",
    },
    {
      header: "Current Domain",
      accessor: "currentDomain",
      className: "hidden md:table-cell",
    },
    {
      header: "Created at",
      accessor: "createdAt ",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "User",
            accessor: "user",
          },
        ]
      : []),
    {
      header: "Actions",
      accessor: "action ",
      className: "hidden lg:table-cell",
    },
  ];

  const renderRow = (item: ShortlinksList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.slug}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">
        {domainCounts.find((count) => count.shortlinkId === item.id)
          ?.domainCount || 0}
      </td>
      <td className="hidden md:table-cell">{item.currentDomain || ""}</td>
      <td className="hidden md:table-cell">
        {item.createdAt.toLocaleString()}
      </td>
      {role === "admin" && (
        <td className="hidden md:table-cell">{item.user?.name || ""}</td>
      )}
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/shortlinks/${item.name} `}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {(role === "admin" || role === "user") && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            //   <Image src="/delete.png" alt="" width={16} height={16} />
            // </button>
            <FormContainer table="shortlink" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ShortLinkWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.shortLink.findMany({
      where:
        role === "admin"
          ? {} //
          : { userId },
      include: {
        domains: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.shortLink.count({
      where: role === "admin" ? {} : { userId },
    }),
  ]);

  const domainCounts = data.map((d) => ({
    shortlinkId: d.id,
    domainCount: d.domains.length,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Shortlinks
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {/* <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button> */}
            {(role === "admin" || role === "user") && (
              <FormContainer table="shortlink" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ShortlinkListPage;
