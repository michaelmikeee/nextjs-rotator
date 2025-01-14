"use client";

import { updateDomainPriority } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const UpdatePriorityForm = ({
  domainId,
  initialPriority,
}: {
  domainId: number;
  initialPriority: number;
}) => {
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = parseInt(e.target.value, 10);

    console.log("Updating priority for domain:", domainId);
    console.log("Selected Priority:", newPriority);

    // Call your server-side action
    try {
      const result = await updateDomainPriority(domainId, newPriority);

      if (result.success) {
        router.refresh();
        if (newPriority === 1) {
          toast("Domain priority updated to 1 and set as the current domain!", {
            type: "success",
          });
        } else {
          toast(`Domain priority has been updated to ${newPriority}!`, {
            type: "success",
          });
        }
        console.log("Priority updated successfully!");
      } else {
        console.error("Failed to update priority:", result.error);
        toast("Failed to update domain priority. Please try again.", {
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      toast("An error occurred while updating the priority.", {
        type: "error",
      });
    }
  };

  return (
    <select
      name="priority"
      defaultValue={initialPriority}
      onChange={handleChange}
      className="border border-gray-300 rounded-md px-2 py-1"
    >
      {[1, 2, 3, 4, 5].map((priority) => (
        <option key={priority} value={priority}>
          {priority}
        </option>
      ))}
    </select>
  );
};

export default UpdatePriorityForm;
