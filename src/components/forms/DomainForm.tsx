"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import InputFieldFull from "../InputFieldFull";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DomainSchema, domainSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createDomain, updateDomain } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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

  const [img, setImg] = useState<any>();

  const [state, formAction] = useFormState(
    type === "create" ? createDomain : updateDomain,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    formAction({ ...data });
  });

  // const onSubmit = handleSubmit(async (formData) => {
  //   console.log("Form data submitted for update:", formData); // Debug form data
  //   try {
  //     const response = await formAction(formData); // Call formAction (updateDomain)
  //     console.log("Update response:", response); // Debug the response

  //     if (state.success) {
  //       toast("Domain has been updated!");
  //       setOpen(false);
  //       router.refresh();
  //     } else {
  //       console.error("Update failed:", response);
  //     }
  //   } catch (error) {
  //     console.error("Error in form submission:", error); // Debug any errors
  //   }
  // });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Domain has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new domain" : "Update the domain"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Do not include &apos;https://&apos;
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputFieldFull
          label="Domain Link"
          name="url"
          defaultValue={data?.url}
          register={register}
          error={errors?.url}
        />

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>

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
