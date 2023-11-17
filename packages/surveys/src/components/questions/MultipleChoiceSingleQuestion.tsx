import { BackButton } from "@/components/buttons/BackButton";
import SubmitButton from "@/components/buttons/SubmitButton";
import Headline from "@/components/general/Headline";
import Subheader from "@/components/general/Subheader";
import { cn, shuffleQuestions, getLocalizedValue } from "@/lib/utils";
import { TResponseData } from "@formbricks/types/responses";
import type { TSurveyMultipleChoiceSingleQuestion } from "@formbricks/types/surveys";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

interface MultipleChoiceSingleProps {
  question: TSurveyMultipleChoiceSingleQuestion;
  value: string | number | string[];
  onChange: (responseData: TResponseData) => void;
  onSubmit: (data: TResponseData) => void;
  onBack: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  language: string;
}

export default function MultipleChoiceSingleQuestion({
  question,
  value,
  onChange,
  onSubmit,
  onBack,
  isFirstQuestion,
  isLastQuestion,
  language,
}: MultipleChoiceSingleProps) {
  const [otherSelected, setOtherSelected] = useState(
    !!value && !question.choices.find((c) => c.label === value)
  ); // initially set to true if value is not in choices

  const questionChoices = useMemo(() => {
    if (!question.choices) {
      return [];
    }
    const choicesWithoutOther = question.choices.filter((choice) => choice.id !== "other");
    if (question.shuffleOption) {
      return shuffleQuestions(choicesWithoutOther, question.shuffleOption);
    }
    return choicesWithoutOther;
  }, [question.choices, question.shuffleOption]);

  const otherOption = useMemo(
    () => question.choices.find((choice) => choice.id === "other"),
    [question.choices]
  );

  const otherSpecify = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (otherSelected) {
      otherSpecify.current?.focus();
    }
  }, [otherSelected]);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ [question.id]: value });
      }}
      className="w-full">
      {question.imageUrl && (
        <div className="my-4 rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={question.imageUrl} alt="question-image" className={"my-4 rounded-md"} />
        </div>
      )}
      <Headline
        headline={getLocalizedValue(question.headline, language)}
        questionId={question.id}
        required={question.required}
      />
      <Subheader
        subheader={question.subheader ? getLocalizedValue(question.subheader, language) : ""}
        questionId={question.id}
      />
      <div className="mt-4">
        <fieldset>
          <legend className="sr-only">Options</legend>

          <div
            className="bg-survey-bg relative max-h-[42vh] space-y-2 overflow-y-auto rounded-md py-0.5 pr-2"
            role="radiogroup">
            {questionChoices.map((choice, idx) => (
              <label
                key={choice.id}
                tabIndex={idx + 1}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    onChange({ [question.id]: choice.label });
                    setTimeout(() => {
                      onSubmit({ [question.id]: choice.label });
                    }, 350);
                  }
                }}
                className={cn(
                  value === choice.label
                    ? "border-border-highlight bg-accent-selected-bg z-10"
                    : "border-border",
                  "text-heading focus-within:border-border-highlight focus-within:bg-accent-bg hover:bg-accent-bg relative flex cursor-pointer flex-col rounded-md border p-4 focus:outline-none"
                )}>
                <span className="flex items-center text-sm">
                  <input
                    tabIndex={-1}
                    type="radio"
                    id={choice.id}
                    name={question.id}
                    value={choice.label}
                    className="border-brand text-brand h-4 w-4 border focus:ring-0 focus:ring-offset-0"
                    aria-labelledby={`${choice.id}-label`}
                    onChange={() => {
                      setOtherSelected(false);
                      onChange({ [question.id]: choice.label[language] });
                    }}
                    checked={value === choice.label[language]}
                    required={question.required && idx === 0}
                  />
                  <span id={`${choice.id}-label`} className="ml-3 font-medium">
                    {choice.label[language]}
                  </span>
                </span>
              </label>
            ))}
            {otherOption && (
              <label
                tabIndex={questionChoices.length + 1}
                className={cn(
                  value === otherOption.label
                    ? "border-border-highlight bg-accent-selected-bg z-10"
                    : "border-border",
                  "text-heading focus-within:border-border-highlight focus-within:bg-accent-bg hover:bg-accent-bg relative flex cursor-pointer flex-col rounded-md border p-4 focus:outline-none"
                )}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    setOtherSelected(!otherSelected);
                    if (!otherSelected) onChange({ [question.id]: "" });
                  }
                }}>
                <span className="flex items-center text-sm">
                  <input
                    type="radio"
                    id={otherOption.id}
                    tabIndex={-1}
                    name={question.id}
                    value={getLocalizedValue(otherOption.label, language)}
                    className="border-brand text-brand h-4 w-4 border focus:ring-0 focus:ring-offset-0"
                    aria-labelledby={`${otherOption.id}-label`}
                    onChange={() => {
                      setOtherSelected(!otherSelected);
                      onChange({ [question.id]: "" });
                    }}
                    checked={otherSelected}
                  />
                  <span id={`${otherOption.id}-label`} className="ml-3 font-medium">
                    {getLocalizedValue(otherOption.label, language)}
                  </span>
                </span>
                {otherSelected && (
                  <input
                    ref={otherSpecify}
                    tabIndex={questionChoices.length + 1}
                    id={`${otherOption.id}-label`}
                    name={question.id}
                    value={value}
                    onChange={(e) => {
                      onChange({ [question.id]: e.currentTarget.value });
                    }}
                    onKeyDown={(e) => {
                      if (e.key == "Enter") {
                        setTimeout(() => {
                          onSubmit({ [question.id]: value });
                        }, 100);
                      }
                    }}
                    placeholder="Please specify"
                    className="placeholder:text-placeholder border-border bg-survey-bg text-heading focus:ring-focus mt-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm  focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required={question.required}
                    aria-labelledby={`${otherOption.id}-label`}
                  />
                )}
              </label>
            )}
          </div>
        </fieldset>
      </div>
      <div className="mt-4 flex w-full justify-between">
        {!isFirstQuestion && (
          <BackButton
            backButtonLabel={question.backButtonLabel}
            tabIndex={questionChoices.length + 3}
            onClick={onBack}
          />
        )}
        <div></div>
        <SubmitButton
          tabIndex={questionChoices.length + 2}
          buttonLabel={question.buttonLabel}
          isLastQuestion={isLastQuestion}
          onClick={() => {}}
        />
      </div>
    </form>
  );
}
