"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import InputFieldFull from "../InputFieldFull";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { shortlinkSchema, ShortlinkSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import {
  createShortlink,
  updateShortlink,
  wrappedCreateShortlink,
  wrappedUpdateShortlink,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type FormState = {
  success: boolean;
  error: boolean;
  message: string; // Add this property
};

const ShortlinkForm = ({
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
  } = useForm<ShortlinkSchema>({
    resolver: zodResolver(shortlinkSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? wrappedCreateShortlink : wrappedUpdateShortlink,
    {
      success: false,
      error: false,
      message: "",
    }
  );

  const onSubmit = handleSubmit((data) => {
    formAction({ data });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Shortlink has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { domains } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new shortlink" : "Update the shortlink"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputFieldFull
          label="Shortlink Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
      </div>
      {type === "update" && data && (
        <input type="hidden" {...register("id")} value={data.id.toString()} />
      )}
      <div className="flex flex-col gap-2 w-full md:w-3/4">
        <label className="text-xs text-gray-500">Domains</label>
        <select
          multiple
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...register("domains")}
          defaultValue={data?.domains.map(
            (domain: { id: number; url: string }) => domain.id.toString()
          )}
        >
          {domains
            .filter(
              (domain: { id: number; url: string; isBlocked: boolean }) =>
                !domain.isBlocked
            )
            .map((domain: { id: number; url: string }) => (
              <option value={domain.id} key={domain.id}>
                {domain.url}
              </option>
            ))}
        </select>
        {errors.domains?.message && (
          <p className="text-xs text-red-400">
            {errors.domains.message.toString()}
          </p>
        )}
      </div>

      {state.error && state.message && (
        <span className="text-red-500">
          {state.message || "Something went wrong!"}
        </span>
      )}
      <button type="submit" className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ShortlinkForm;
