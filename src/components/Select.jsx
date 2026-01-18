import React from "react";

export default function SelectField({
  id,
  options = [],
  placeholder,
  onSelect,
  value
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">{placeholder}</option>

      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
