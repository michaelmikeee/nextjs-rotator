import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "userId";
  id: string;
}) => {
  const dataRes = await prisma.domain.findMany({
    where: {
      userId: id,
    },
  });

  const data = dataRes.map((domain) => ({
    url: domain.url,
    start: domain.createdAt,
    end: domain.createdAt,
  }));

  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div className="">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
