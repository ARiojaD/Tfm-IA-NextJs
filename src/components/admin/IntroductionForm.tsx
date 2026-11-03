"use client";

import { useActionState, useState } from "react";
import { TOPIC_INTRODUCTION_MAX_LENGTH } from "@/application/dto/TopicEditorInputs";
import { SaveBar, TextAreaField } from "./AdminFields";
import { type AdminFormState, INITIAL_ADMIN_FORM_STATE } from "./adminFormState";

// The topic's main text. Paragraphs are separated by a blank line, as the server splits them.
export function IntroductionForm({
  action,
  topicId,
  paragraphs,
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  topicId: string;
  paragraphs: string[];
}) {
  const [text, setText] = useState(paragraphs.join("\n\n"));
  const [state, formAction, isPending] = useActionState(action, INITIAL_ADMIN_FORM_STATE);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="topicId" value={topicId} />
      <TextAreaField
        id="topic-introduction"
        name="introduction"
        label="Introducción"
        hint={`Deja una línea en blanco entre párrafos. ${text.length.toLocaleString("es")}/${TOPIC_INTRODUCTION_MAX_LENGTH.toLocaleString("es")} caracteres.`}
        rows={12}
        maxLength={TOPIC_INTRODUCTION_MAX_LENGTH}
        value={text}
        onChange={(event) => setText(event.target.value)}
        errors={state.fieldErrors?.introduction}
      />
      <SaveBar state={state} isPending={isPending} />
    </form>
  );
}
