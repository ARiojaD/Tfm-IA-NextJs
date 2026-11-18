"use client";

import Image from "next/image";
import { useState } from "react";
import type { CatalogImage } from "@/domain/entities/CatalogImage";
import type { TopicImage } from "@/domain/value-objects/TopicImage";
import { AuthField } from "../auth/AuthField";
import { SaveBar } from "./AdminFields";
import { type AdminFormState, INITIAL_ADMIN_FORM_STATE } from "./adminFormState";
import { useFormAction } from "./useFormAction";

const OPTION_CLASS =
  "flex cursor-pointer flex-col gap-2 rounded-2xl border border-border p-2 text-xs transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent";

// Elegir la imagen del tema en el catálogo, o ninguna (entonces su página no muestra imagen). Al elegir una
// se rellenan su texto alternativo y su pie sugeridos, que el administrador puede reescribir. No se sube nada.
export function ImageForm({
  action,
  topicId,
  options,
  selectedImageId,
  currentImage,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  topicId: string;
  options: CatalogImage[];
  selectedImageId: string | null;
  currentImage?: TopicImage;
}) {
  const [imageId, setImageId] = useState(selectedImageId ?? "");
  const [alt, setAlt] = useState(currentImage?.alt ?? "");
  const [caption, setCaption] = useState(currentImage?.caption ?? "");
  const { state, onSubmit, isPending } = useFormAction(action, INITIAL_ADMIN_FORM_STATE);
  const errors = state.fieldErrors ?? {};

  const choose = (image: CatalogImage | null) => {
    setImageId(image?.id ?? "");
    setAlt(image?.alt ?? "");
    setCaption(image?.caption ?? "");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="topicId" value={topicId} />

      <fieldset>
        <legend className="text-sm font-medium">Imagen del catálogo</legend>
        <p className="mt-1 text-xs text-muted">
          Las de la civilización del tema. Para añadir una nueva al catálogo, la incorpora el responsable del contenido.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className={OPTION_CLASS}>
            <input
              type="radio"
              name="imageId"
              value=""
              checked={imageId === ""}
              onChange={() => choose(null)}
              className="sr-only"
            />
            <span className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-border text-muted">
              Sin imagen
            </span>
            <span className="text-muted">No se muestra ninguna</span>
          </label>
          {options.map((image) => (
            <label key={image.id} className={OPTION_CLASS}>
              <input
                type="radio"
                name="imageId"
                value={image.id}
                checked={imageId === image.id}
                onChange={() => choose(image)}
                className="sr-only"
              />
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="160px"
                className="aspect-square w-full rounded-xl object-cover"
              />
              <span>
                {image.kind === "GENERAL" ? "General" : "Específica"} · {image.caption}
              </span>
            </label>
          ))}
        </div>
        {errors.imageId && <p className="mt-2 text-xs text-danger">{errors.imageId[0]}</p>}
      </fieldset>

      {imageId !== "" && (
        <div className="grid gap-4">
          <AuthField
            id="image-alt"
            name="alt"
            label="Texto alternativo"
            hint="Qué se ve en la imagen, para quien no puede verla (lectores de pantalla)."
            maxLength={200}
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            errors={errors.alt}
          />
          <AuthField
            id="image-caption"
            name="caption"
            label="Pie de foto"
            maxLength={100}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            errors={errors.caption}
          />
        </div>
      )}
      {imageId === "" && (
        <>
          <input type="hidden" name="alt" value="" />
          <input type="hidden" name="caption" value="" />
        </>
      )}

      <SaveBar state={state} isPending={isPending} />
    </form>
  );
}
