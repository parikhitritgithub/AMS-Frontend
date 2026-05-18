import FormField from "../../../components/common/FormField";

const STATION_OPTIONS = [
  {
    value: "Assam Agricultural University",
    label: "Assam Agricultural University",
  },
];

const YEAR_OPTIONS = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

const DISCIPLINE_OPTIONS = [
  { value: "COMPUTER_SCIENCE", label: "Computer Science" },
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "BIOTECHNOLOGY", label: "Biotechnology" },
  { value: "MECHANICAL", label: "Mechanical" },
  { value: "CIVIL", label: "Civil" },
  { value: "Soil Science", label: "Soil Science" },
  { value: "Crop Science", label: "Crop Science" },
  { value: "Forestry", label: "Forestry" },
  { value: "Food Technology", label: "Food Technology" },
];

export default function Step1({ form, update }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Basic Information
      </h2>

      <div className="flex gap-4 mb-6">
        <FormField
          className="flex-1"
          label="Unique Code"
          value={form.uniqueCode || "Auto Generated"}
          disabled
        />

        <FormField
          className="flex-1"
          label="Stations / Colleges"
          type="select"
          value={form.stationOrCollege}
          onChange={update("stationOrCollege")}
          options={STATION_OPTIONS}
        />

        <FormField
          className="w-36"
          label="Year"
          value={form.year}
          onChange={(value) => {
            // Allow only numbers and max 4 digits
            if (/^\d{0,4}$/.test(value)) {
              update("year")(value);
            }
          }}
        />
      </div>

      <FormField
        className="mb-6"
        label="Name of the Teacher / Scientist"
        value={form.teacherName}
        onChange={update("teacherName")}
        placeholder="Enter your name"
        disabled
      />

      <FormField
        className="mb-10"
        label="Discipline"
        type="select"
        value={form.discipline}
        onChange={update("discipline")}
        options={DISCIPLINE_OPTIONS}
      />
    </div>
  );
}