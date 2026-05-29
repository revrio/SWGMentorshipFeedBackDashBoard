import { Star } from "lucide-react";

export default function RatingInput({ label, name, value, onChange }) {
  return (
    <fieldset className="rounded-md border border-swg-line bg-white p-4">
      <legend className="px-1 text-sm font-semibold text-swg-navy">
        {label}
      </legend>
      <div className="mt-4 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((rating) => {
          const isSelected = Number(value) === rating;
          return (
            <label
              className={`swg-focus flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-md border text-sm font-bold ${
                isSelected
                  ? "border-swg-blue bg-sky-50 text-swg-blue"
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
              <Star
                className={`mb-1 h-4 w-4 ${
                  isSelected ? "fill-swg-blue" : "fill-transparent"
                }`}
              />
              {rating}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
