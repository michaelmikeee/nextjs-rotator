"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { domainSchema, DomainSchema } from "@/lib/formValidationSchemas";
import { createDomain, updateDomain } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const DomainForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DomainSchema>({
    resolver: zodResolver(domainSchema),
  });

  // AFTER REACT 19 IT'LL BE USEACTIONSTATE

  const [state, formAction] = useFormState(
    type === "create" ? createDomain : updateDomain,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit(async (formData) => {
    console.log("Form data submitted to onSubmit:", formData);

    try {
      console.log("Calling updateDomain with formData...");
      const response = await updateDomain(
        { success: false, error: false },
        formData
      );

      console.log("Response from updateDomain:", response);

      if (response.success) {
        toast("Domain updated successfully!");
        setOpen(false);
        router.refresh();
      } else {
        console.error("Update failed with response:", response);
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
    }
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Domain has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new exam" : "Update the exam"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Url"
          name="url"
          defaultValue={data?.url || ""}
          register={register}
          error={errors?.url}
        />
      </div>

      {data && (
        <InputField
          label="Id"
          name="id"
          defaultValue={data?.id || ""}
          register={register}
          error={errors?.id}
          hidden
        />
      )}
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default DomainForm;
