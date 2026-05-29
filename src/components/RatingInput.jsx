import React from "react";

export default function RatingInput({ index, label, name, value, onChange }) {
  return (
    <fieldset className="rounded-xl border border-swg-line bg-white p-4 shadow-soft">
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-swg-teal text-base font-bold text-white shadow-sm">
          {index}
        </span>
        <p className="text-sm font-semibold leading-6 text-swg-ink">{label}</p>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-5">
        {[1, 2, 3, 4, 5].map((rating) => {
          const isSelected = Number(value) === rating;
          return (
            <label
              className={`swg-focus flex min-h-11 cursor-pointer items-center justify-center rounded-lg border text-sm font-bold shadow-sm ${
                isSelected
                  ? "border-swg-teal bg-swg-teal text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-swg-blue"
              }`}
              key={rating}
              tabIndex={0}
            >
              <input
                checked={isSelected}
                className="sr-only"
                name={name}
                onChange={() => onChange(rating)}
                type="radio"
                value={rating}
              />
              {rating}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
