import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table: "user" | "shortlink" | "domain";
  type: "create" | "update" | "delete" | "removeDomain";
  data?: any;
  id?: number | string;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (type !== "delete") {
    switch (table) {
      case "shortlink":
        const shortlinkDomains = await prisma.domain.findMany({
          where: {
            userId: userId!,
            isBlocked: false,
          },
          select: { id: true, url: true },
        });
        relatedData = { domains: shortlinkDomains };
        break;
      default:
        break;
    }
  }

  // console.log("FormModal Props:", { table, type, data, id, relatedData });

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
