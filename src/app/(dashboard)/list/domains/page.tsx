import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ShortLink, Prisma, Domain, User } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";

type DomainList = Domain & { shortLink: ShortLink | null } & {
  user: {
    name: string;
  } | null;
};

const DomainListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const currentUserId = userId;
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const columns = [
    {
      header: "Domain Url",
      accessor: "url",
    },
    {
      header: "Shortlink to",
      accessor: "shortlink",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
      className: "hidden md:table-cell",
    },
    {
      header: "Blocked At",
      accessor: "blockedAt",
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

  const renderRow = (item: DomainList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.url}</h3>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.shortLink?.name || "-"}</td>
      <td
        className={`hidden md:table-cell ${
          item.isBlocked ? "text-red-500" : "text-green-500"
        }`}
      >
        {item.isBlocked ? "Blocked" : "Active"}
      </td>
      <td className="hidden md:table-cell">
        {item.blockedAt?.toLocaleString() || "-"}
      </td>
      <td className="hidden md:table-cell">
        {item.createdAt
          ? `${new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(item.createdAt))}, ${new Intl.DateTimeFormat(
              "id-ID",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            ).format(new Date(item.createdAt))}`
          : "-"}
      </td>
      {role === "admin" && (
        <td className="hidden md:table-cell">{item.user?.name || "-"}</td>
      )}
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="domain" type="update" data={item} />
              <FormContainer table="domain" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );
  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.DomainWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.url = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const userFilter = role === "admin" ? {} : { userId: currentUserId || "" };

  const [data, count] = await prisma.$transaction([
    prisma.domain.findMany({
      where: userFilter,
      include: {
        shortLink: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.domain.count({
      where: userFilter,
    }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Domains</h1>
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
              <FormContainer table="domain" type="create" />
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

export default DomainListPage;
